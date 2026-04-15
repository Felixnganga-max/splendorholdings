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

/* ─────────────────────────────────────────────
   CORS (HARDCODED FIX)
───────────────────────────────────────────── */

const allowedOrigins = [
  "http://localhost:5173",
  "https://www.splendorholdings.com",
  "https://splendorholdings.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow tools like Postman or server-to-server requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

// Preflight support
app.options("*", cors());

/* ─────────────────────────────────────────────
   SECURITY & PARSING MIDDLEWARE
───────────────────────────────────────────── */

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ─────────────────────────────────────────────
   LOGGING
───────────────────────────────────────────── */

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* ─────────────────────────────────────────────
   HEALTH CHECK
───────────────────────────────────────────── */

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ─────────────────────────────────────────────
   ROUTES
───────────────────────────────────────────── */

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", authRoutes);
app.use("/api/v1/properties", propertyRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/inquiries", inquiryRoutes);
app.use("/api/v1/categories", categoryRoutes);

/* ─────────────────────────────────────────────
   404 HANDLER
───────────────────────────────────────────── */

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found.`,
  });
});

/* ─────────────────────────────────────────────
   GLOBAL ERROR HANDLER
───────────────────────────────────────────── */

app.use((err, req, res, next) => {
  console.error("Error:", err);

  const status = err.statusCode || 500;

  res.status(status).json({
    status: "error",
    message: err.message || "Internal server error.",
  });
});

module.exports = app;
