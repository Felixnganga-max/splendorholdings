/**
 * server.js — Slendor Real Estate API
 *
 * Entry point. Responsibilities:
 *   1. Load environment and validate required variables exist
 *   2. Connect to MongoDB — abort if it fails
 *   3. Create the Node.js HTTP server wrapping the Express app
 *   4. Attach Socket.IO to that same HTTP server (shared port)
 *   5. Start listening
 *   6. Handle all process signals for graceful shutdown:
 *        SIGTERM  — sent by process managers (PM2, Kubernetes, Docker)
 *        SIGINT   — Ctrl+C in terminal
 *        uncaughtException  — synchronous throw with no try/catch
 *        unhandledRejection — rejected Promise with no .catch()
 *
 * Graceful shutdown order:
 *   a. Stop accepting new HTTP connections
 *   b. Wait for in-flight requests to finish (up to SHUTDOWN_TIMEOUT ms)
 *   c. Drain Socket.IO connections (emit system:shutdown, then close)
 *   d. Close MongoDB connection pool
 *   e. Exit cleanly with code 0
 *
 * If anything in the shutdown sequence stalls past SHUTDOWN_TIMEOUT,
 * we force-exit with code 1 so the process manager can restart us.
 */

"use strict";

// ── Environment ───────────────────────────────────────────────────────────────
require("dotenv").config();

const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];

const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  // Use process.stderr directly — logger may not be initialized yet
  process.stderr.write(
    `[server] Missing required environment variables: ${missing.join(", ")}\n`,
  );
  process.stderr.write(
    "[server] Copy .env.example to .env and fill in all values.\n",
  );
  process.exit(1);
}

// ── Imports ───────────────────────────────────────────────────────────────────
const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/database");
const { initSockets, getIO } = require("./sockets/sockets");
const logger = require("./utils/logger");

// ── Configuration ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = process.env.HOST || "0.0.0.0";
const SHUTDOWN_TIMEOUT =
  parseInt(process.env.SHUTDOWN_TIMEOUT_MS, 10) || 15_000;

// ── Shutdown state ────────────────────────────────────────────────────────────
// Track whether a shutdown is already in progress to prevent double-execution
// when multiple signals fire at the same time (common in container environments).
let isShuttingDown = false;

// ── Graceful shutdown ─────────────────────────────────────────────────────────
/**
 * Cleanly shut down the server.
 *
 * @param {string}          signal  Signal or event name that triggered shutdown
 * @param {http.Server}     server  The HTTP server instance
 * @param {number}          [code]  Exit code (default 0 = clean, 1 = error)
 */
const gracefulShutdown = async (signal, server, code = 0) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.warn(`[server] ${signal} received — initiating graceful shutdown`);

  // Force-kill timeout — if we haven't exited cleanly by this deadline, hard-exit.
  const forceExitTimer = setTimeout(() => {
    logger.error(
      "[server] Graceful shutdown timed out — forcing exit with code 1",
    );
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  // Don't let this timer keep the event loop alive
  forceExitTimer.unref();

  try {
    // ── Step 1: Stop accepting new HTTP connections ───────────────────────────
    // Existing in-flight requests continue to be served until they finish.
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          logger.error(`[server] HTTP server close error: ${err.message}`);
          return reject(err);
        }
        logger.info(
          "[server] HTTP server closed — no longer accepting connections",
        );
        resolve();
      });
    });

    // ── Step 2: Drain Socket.IO ───────────────────────────────────────────────
    // Notify all connected clients so they can display a "server is restarting"
    // message and attempt to reconnect, then close the Socket.IO server.
    try {
      const io = getIO();
      io.emit("system:shutdown", {
        message: "Server is restarting. Reconnecting shortly…",
        reconnectDelay: 3000,
      });
      // Give clients a moment to receive the event before we cut the connections
      await new Promise((resolve) => setTimeout(resolve, 500));
      await io.close();
      logger.info("[server] Socket.IO server closed");
    } catch (err) {
      // Socket.IO may not have been initialized if startup failed early
      logger.warn(`[server] Socket.IO close skipped: ${err.message}`);
    }

    // ── Step 3: Close MongoDB connection pool ─────────────────────────────────
    await mongoose.connection.close(false); // false = don't force-kill in-flight ops
    logger.info("[server] MongoDB connection closed");

    // ── Done ──────────────────────────────────────────────────────────────────
    logger.info(`[server] Shutdown complete — exiting with code ${code}`);
    clearTimeout(forceExitTimer);
    process.exit(code);
  } catch (err) {
    logger.error(`[server] Error during shutdown: ${err.message}`);
    logger.error(err.stack);
    process.exit(1);
  }
};

// ── Startup ───────────────────────────────────────────────────────────────────
const start = async () => {
  logger.info("[server] Starting Slendor API…");

  // ── 1. Database ───────────────────────────────────────────────────────────
  try {
    await connectDB();
  } catch (err) {
    logger.error(
      `[server] Database connection failed on startup: ${err.message}`,
    );
    process.exit(1);
  }

  // ── 2. HTTP server ─────────────────────────────────────────────────────────
  // We wrap Express in a raw http.Server so Socket.IO can share the same
  // TCP port — Socket.IO intercepts the upgrade requests before Express sees them.
  const server = http.createServer(app);

  // Increase the number of simultaneous keep-alive connections allowed.
  // Default is 5 in Node.js which is far too low for production.
  server.maxConnections = 1000;

  // How long to keep idle keep-alive connections open.
  // Set slightly lower than any upstream load-balancer / proxy timeout.
  server.keepAliveTimeout = 65_000; // 65 s
  server.headersTimeout = 66_000; // must be > keepAliveTimeout

  // ── 3. Socket.IO ───────────────────────────────────────────────────────────
  initSockets(server);

  // ── 4. Process signal handlers ─────────────────────────────────────────────
  // Register BEFORE server.listen() so we catch signals even during startup.

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM", server, 0));
  process.on("SIGINT", () => gracefulShutdown("SIGINT", server, 0));

  // SIGUSR2 is used by nodemon for restarts — drain cleanly then let nodemon restart us
  process.once("SIGUSR2", () => {
    gracefulShutdown("SIGUSR2 (nodemon restart)", server, 0).then(() => {
      process.kill(process.pid, "SIGUSR2");
    });
  });

  // ── 5. Unhandled rejection / exception handlers ────────────────────────────
  // These are last-resort catches. In a well-written app they should never fire.
  // When they do, log thoroughly, attempt graceful shutdown, then exit with 1.

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("[server] Unhandled Promise Rejection");
    logger.error(
      `  Reason: ${reason instanceof Error ? reason.stack : String(reason)}`,
    );
    logger.error(`  Promise: ${promise}`);
    // Don't shut down in development — makes debugging easier
    if (process.env.NODE_ENV === "production") {
      gracefulShutdown("unhandledRejection", server, 1);
    }
  });

  process.on("uncaughtException", (err, origin) => {
    logger.error("[server] Uncaught Exception — this is a bug, fix it!");
    logger.error(`  Error:  ${err.message}`);
    logger.error(`  Stack:  ${err.stack}`);
    logger.error(`  Origin: ${origin}`);
    // Always shut down on uncaughtException — the process is in an unknown state
    gracefulShutdown("uncaughtException", server, 1);
  });

  // ── 6. Listen ──────────────────────────────────────────────────────────────
  await new Promise((resolve, reject) => {
    server.listen(PORT, HOST, resolve);
    server.once("error", reject);
  });

  // ── 7. Startup banner ──────────────────────────────────────────────────────
  const env = process.env.NODE_ENV || "development";
  const dbName = mongoose.connection.name;
  const dbHost = mongoose.connection.host;
  const nodeVer = process.version;
  const pid = process.pid;

  logger.info("");
  logger.info("╔══════════════════════════════════════════════════════════╗");
  logger.info("║           Slendor Real Estate API  —  Online            ║");
  logger.info("╠══════════════════════════════════════════════════════════╣");
  logger.info(`║  Environment : ${env.padEnd(42)}║`);
  logger.info(`║  Node.js     : ${nodeVer.padEnd(42)}║`);
  logger.info(`║  PID         : ${String(pid).padEnd(42)}║`);
  logger.info(
    `║  HTTP        : http://${HOST}:${PORT}/api/v1`.padEnd(63) + "║",
  );
  logger.info(`║  WebSocket   : ws://${HOST}:${PORT}`.padEnd(63) + "║");
  logger.info(
    `║  Health      : http://localhost:${PORT}/health`.padEnd(63) + "║",
  );
  logger.info(`║  MongoDB     : ${dbHost}/${dbName}`.padEnd(63) + "║");
  logger.info("╚══════════════════════════════════════════════════════════╝");
  logger.info("");

  if (env === "development") {
    logger.info("[server] Development mode — verbose logging enabled");
    logger.info("[server] Run `npm run seed` if you need fresh test data");
  }
};

// ── Boot ──────────────────────────────────────────────────────────────────────
start().catch((err) => {
  // If start() itself throws synchronously (e.g. port already in use),
  // log it and exit — the process signal handlers won't help here because
  // `server` may not exist yet.
  process.stderr.write(`[server] Fatal startup error: ${err.message}\n`);
  process.stderr.write(err.stack + "\n");
  process.exit(1);
});
