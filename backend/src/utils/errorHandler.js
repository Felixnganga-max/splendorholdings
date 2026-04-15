const logger = require("../utils/logger");

/**
 * AppError — operational errors we explicitly throw.
 * Non-operational errors (bugs, unexpected DB failures) are caught separately.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true; // Differentiates from unexpected programmer errors
    Error.captureStackTrace(this, this.constructor);
  }
}

// ── MongoDB / Mongoose specific error handlers ─────────────────────────────────

const handleCastErrorDB = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}.`, 400);

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || "field";
  const value = err.keyValue?.[field];
  return new AppError(
    `Duplicate value for '${field}': '${value}'. Please use another value.`,
    409,
  );
};

const handleValidationErrorDB = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join(". ")}`, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);
const handleJWTExpiredError = () =>
  new AppError("Token expired. Please log in again.", 401);

// ── Response formatters ────────────────────────────────────────────────────────

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // Trusted, known error — safe to expose message to client
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Unknown / programming error — log it but don't leak details
  logger.error("UNHANDLED ERROR:", err);
  return res.status(500).json({
    status: "error",
    message: "Something went wrong. Please try again later.",
  });
};

// ── Global error handler middleware ───────────────────────────────────────────
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  logger.error(
    `${err.statusCode} ${req.method} ${req.originalUrl} — ${err.message}`,
  );

  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, res);
  }

  // Transform known Mongoose / JWT errors into AppErrors in production
  let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
  error.message = err.message;

  if (error.name === "CastError") error = handleCastErrorDB(error);
  else if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  else if (error.name === "ValidationError")
    error = handleValidationErrorDB(error);
  else if (error.name === "JsonWebTokenError") error = handleJWTError();
  else if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

  sendErrorProd(error, res);
};

/**
 * Wraps async route handlers to eliminate try/catch boilerplate.
 * Any thrown error is passed to Express's error pipeline.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { AppError, globalErrorHandler, asyncHandler };
