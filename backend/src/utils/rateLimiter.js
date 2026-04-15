const rateLimit = require("express-rate-limit");
const { error } = require("../utils/response");

const createLimiter = (options) =>
  rateLimit({
    windowMs:
      options.windowMs ||
      parseInt(process.env.RATE_LIMIT_WINDOW_MS) ||
      15 * 60 * 1000,
    max: options.max || parseInt(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true, // Return rate limit info in RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    skipSuccessfulRequests: options.skipSuccessful || false,
    handler: (req, res) => {
      return error(
        res,
        options.message ||
          "Too many requests. Please slow down and try again later.",
        429,
      );
    },
    // Skip for trusted internal services (add your load balancer IPs here)
    skip: (req) => {
      const trustedIPs = (process.env.TRUSTED_IPS || "")
        .split(",")
        .map((ip) => ip.trim());
      return trustedIPs.includes(req.ip);
    },
    keyGenerator: (req) => {
      // Rate-limit by user ID if authenticated, otherwise by IP
      return req.user?.id || req.ip;
    },
  });

// General API rate limit
const apiLimiter = createLimiter({
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: "Too many requests from this IP. Please try again in 15 minutes.",
});

// Strict limiter for auth routes (login/register) — prevents brute force
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message:
    "Too many authentication attempts. Please wait 15 minutes before trying again.",
  skipSuccessful: true, // Don't count successful logins
});

// Stricter limiter for password reset
const passwordResetLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Too many password reset requests. Please try again in 1 hour.",
});

// Inquiry submit rate limit (prevent spam)
const inquiryLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: "Too many inquiry submissions. Please try again in 1 hour.",
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  inquiryLimiter,
};
