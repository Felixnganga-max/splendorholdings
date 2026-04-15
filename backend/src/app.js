"use strict";

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");

const {
  authRoutes,
  propertyRoutes,
  orderRoutes,
  inquiryRoutes,
  categoryRoutes,
} = require("./routes/root");

const app = express();

// ── Security & parsing middleware ─────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGINS, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", authRoutes);
app.use("/api/v1/properties", propertyRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/inquiries", inquiryRoutes);
app.use("/api/v1/categories", categoryRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({ status: "error", message: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error.";
  res.status(status).json({ status: "error", message });
});

module.exports = app;
