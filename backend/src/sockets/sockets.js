/**
 * sockets/index.js
 *
 * Socket.IO server — authentication, room management, and all
 * real-time event handling for the Slendor platform.
 *
 * Architecture:
 *   Every connected socket is automatically placed in:
 *     - user:<userId>   private room — targeted notifications to one user
 *     - role:<role>     shared room  — broadcast to all admins / all managers
 *
 *   Controllers call getIO().to('role:admin').emit(...) to push events.
 *   The frontend subscribes with socket.on('order:new', handler).
 *
 * Events emitted by server:
 *   order:new            → role:admin, role:manager
 *   order:statusUpdated  → user:<buyerId>
 *   inquiry:new          → role:admin, role:manager
 *   inquiry:replied      → user:<senderId>
 *   inquiry:typing       → inquiry:<id>
 *   system:onlineCount   → role:admin
 *   system:ping          → (all, keepalive ACK)
 *
 * Events received from client:
 *   property:watch       admin/manager subscribe to a property feed
 *   property:unwatch     unsubscribe from a property feed
 *   inquiry:watch        admin/manager subscribe to an inquiry thread
 *   inquiry:unwatch      unsubscribe from an inquiry thread
 *   inquiry:typing       typing indicator while composing a reply
 *   system:ping          keepalive heartbeat from client
 */

const { Server } = require("socket.io");
const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/user");
const logger = require("../utils/logger");

let io = null;

// ── Initialize ────────────────────────────────────────────────────────────────

const initSockets = (httpServer) => {
  const allowedOrigins = (
    process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:5173"
  )
    .split(",")
    .map((o) => o.trim());

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 20000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6, // 1 MB max event payload
    transports: ["websocket", "polling"],
  });

  // ── JWT auth middleware ────────────────────────────────────────────────────
  // Runs before the connection event. Rejects unauthenticated sockets.
  io.use(async (socket, next) => {
    try {
      // Token can come from auth.token (preferred) or Authorization header
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(
          Object.assign(new Error("Authentication required"), {
            data: "AUTH_MISSING",
          }),
        );
      }

      let decoded;
      try {
        decoded = verifyAccessToken(token);
      } catch (err) {
        const msg =
          err.name === "TokenExpiredError" ? "AUTH_EXPIRED" : "AUTH_INVALID";
        return next(Object.assign(new Error(msg), { data: msg }));
      }

      const user = await User.findById(decoded.sub).select(
        "_id firstName lastName role isActive",
      );
      if (!user)
        return next(
          Object.assign(new Error("User not found"), {
            data: "AUTH_USER_NOT_FOUND",
          }),
        );
      if (!user.isActive)
        return next(
          Object.assign(new Error("Account deactivated"), {
            data: "AUTH_INACTIVE",
          }),
        );

      // Attach to socket for use in event handlers
      socket.user = {
        id: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
      };

      next();
    } catch (err) {
      logger.error(`Socket auth error: ${err.message}`);
      next(
        Object.assign(new Error("Authentication failed"), {
          data: "AUTH_ERROR",
        }),
      );
    }
  });

  // ── Connection handler ─────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const { id: userId, name, role } = socket.user;
    logger.debug(`[Socket] Connected: ${name} [${role}] — ${socket.id}`);

    // Join private user room and role broadcast room
    socket.join(`user:${userId}`);
    socket.join(`role:${role}`);

    // Send the connecting user their room memberships as confirmation
    socket.emit("system:connected", {
      socketId: socket.id,
      userId,
      role,
      rooms: [`user:${userId}`, `role:${role}`],
    });

    // Broadcast updated online count to admins
    broadcastOnlineCount();

    // ── Property feed subscriptions ──────────────────────────────────────────
    // Admins and managers can watch individual property activity feeds.
    // When a new order/inquiry comes in for that property, they get notified.

    socket.on("property:watch", (propertyId) => {
      if (!isValidId(propertyId)) return;
      if (!["admin", "manager"].includes(role)) return;
      socket.join(`property:${propertyId}`);
      logger.debug(`[Socket] ${name} watching property ${propertyId}`);
    });

    socket.on("property:unwatch", (propertyId) => {
      if (!isValidId(propertyId)) return;
      socket.leave(`property:${propertyId}`);
    });

    // ── Inquiry thread subscriptions ─────────────────────────────────────────
    // Admins/managers join an inquiry room to get typing indicators and
    // real-time reply updates for a specific thread.

    socket.on("inquiry:watch", (inquiryId) => {
      if (!isValidId(inquiryId)) return;
      if (!["admin", "manager"].includes(role)) return;
      socket.join(`inquiry:${inquiryId}`);
      logger.debug(`[Socket] ${name} watching inquiry ${inquiryId}`);
    });

    socket.on("inquiry:unwatch", (inquiryId) => {
      if (!isValidId(inquiryId)) return;
      socket.leave(`inquiry:${inquiryId}`);
    });

    // ── Typing indicator ─────────────────────────────────────────────────────
    // Emitted by admin/manager while composing a reply.
    // Forwarded to all other sockets watching the same inquiry thread.

    socket.on("inquiry:typing", ({ inquiryId, isTyping }) => {
      if (!isValidId(inquiryId)) return;
      if (!["admin", "manager"].includes(role)) return;
      socket.to(`inquiry:${inquiryId}`).emit("inquiry:typing", {
        userId,
        name,
        isTyping: Boolean(isTyping),
      });
    });

    // ── Keepalive ping ────────────────────────────────────────────────────────
    socket.on("system:ping", () => {
      socket.emit("system:pong", { timestamp: Date.now() });
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on("disconnecting", () => {
      logger.debug(`[Socket] Disconnecting: ${name} [${role}] — ${socket.id}`);
    });

    socket.on("disconnect", (reason) => {
      logger.debug(`[Socket] Disconnected: ${name} — reason: ${reason}`);
      // Give the online count a tick to settle before broadcasting
      setImmediate(broadcastOnlineCount);
    });

    socket.on("error", (err) => {
      logger.error(`[Socket] Error for ${name}: ${err.message}`);
    });
  });

  logger.info("[Socket.IO] Server initialized");
  return io;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Return the initialized Socket.IO instance. Throws if not yet initialized. */
const getIO = () => {
  if (!io)
    throw new Error(
      "Socket.IO not initialized — call initSockets(httpServer) first.",
    );
  return io;
};

/** Broadcast real-time connected-user count to all admin sockets. */
const broadcastOnlineCount = async () => {
  if (!io) return;
  try {
    const sockets = await io.fetchSockets();
    // Deduplicate: one user can have multiple browser tabs open
    const uniqueUsers = new Set(sockets.map((s) => s.user?.id).filter(Boolean));
    io.to("role:admin").emit("system:onlineCount", { count: uniqueUsers.size });
  } catch (err) {
    logger.error(`[Socket] broadcastOnlineCount error: ${err.message}`);
  }
};

/**
 * Send a notification to a single user.
 * Safe to call even when the user is offline — Socket.IO just silently drops it.
 *
 * @param {string} userId   Mongoose ObjectId as string
 * @param {string} event    Event name
 * @param {object} payload  Event payload
 */
const notifyUser = (userId, event, payload) => {
  try {
    getIO().to(`user:${userId}`).emit(event, payload);
  } catch (err) {
    logger.error(`[Socket] notifyUser error: ${err.message}`);
  }
};

/**
 * Broadcast to all admin and manager sockets.
 *
 * @param {string} event   Event name
 * @param {object} payload Event payload
 */
const notifyStaff = (event, payload) => {
  try {
    getIO().to("role:admin").to("role:manager").emit(event, payload);
  } catch (err) {
    logger.error(`[Socket] notifyStaff error: ${err.message}`);
  }
};

/**
 * Broadcast to all sockets watching a specific property.
 *
 * @param {string} propertyId  Mongoose ObjectId as string
 * @param {string} event       Event name
 * @param {object} payload     Event payload
 */
const notifyPropertyWatchers = (propertyId, event, payload) => {
  try {
    getIO().to(`property:${propertyId}`).emit(event, payload);
  } catch (err) {
    logger.error(`[Socket] notifyPropertyWatchers error: ${err.message}`);
  }
};

/** Validate that a string looks like a Mongo ObjectId or safe room name. */
const isValidId = (id) =>
  typeof id === "string" &&
  id.length >= 10 &&
  id.length <= 64 &&
  /^[\w-]+$/.test(id);

module.exports = {
  initSockets,
  getIO,
  notifyUser,
  notifyStaff,
  notifyPropertyWatchers,
};
