const User = require("../models/user");
const { verifyAccessToken } = require("../utils/jwt");
const { unauthorized, forbidden } = require("../utils/response");
const logger = require("../utils/logger");

/**
 * protect — verifies the JWT access token on every protected request.
 * Token must be in the Authorization header as Bearer <token>.
 *
 * On success, attaches req.user (full Mongoose document) so downstream
 * middleware and controllers have access to the user's role/settings.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return unauthorized(res, "Access token missing. Please log in.");
    }

    const token = authHeader.split(" ")[1];
    if (!token) return unauthorized(res, "Malformed authorization header.");

    // Verify signature and expiry
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return unauthorized(res, "Access token expired. Please refresh.");
      }
      return unauthorized(res, "Invalid access token.");
    }

    // Fetch user — ensure they still exist and are active
    const user = await User.findById(decoded.sub).select(
      User.PUBLIC_FIELDS + " passwordChangedAt",
    );
    if (!user) return unauthorized(res, "User no longer exists.");
    if (!user.isActive)
      return forbidden(res, "Your account has been deactivated.");

    // Check if password changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return unauthorized(
        res,
        "Password recently changed. Please log in again.",
      );
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error(`protect middleware error: ${err.message}`);
    return unauthorized(res, "Authentication failed.");
  }
};

/**
 * authorize — role-based access control (RBAC).
 * Call AFTER protect. Pass the roles that are allowed.
 *
 * Usage: router.get('/analytics', protect, authorize('admin'), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return forbidden(
        res,
        `Role '${req.user.role}' is not permitted to access this resource.`,
      );
    }
    next();
  };
};

/**
 * optionalAuth — attach user if token present, but don't fail if absent.
 * Useful for public endpoints that behave differently for logged-in users.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return next();

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub).select(User.PUBLIC_FIELDS);
    if (user && user.isActive) req.user = user;
  } catch {
    // Silently ignore invalid / expired tokens for optional routes
  }
  next();
};

/**
 * requireEmailVerified — gates routes behind email verification.
 * Call AFTER protect.
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return forbidden(
      res,
      "Please verify your email address to access this resource.",
    );
  }
  next();
};

module.exports = { protect, authorize, optionalAuth, requireEmailVerified };
