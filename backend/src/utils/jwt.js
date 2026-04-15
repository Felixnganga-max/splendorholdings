const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * Sign an access token (short-lived).
 * Payload contains only role-safe fields — no sensitive data.
 */
const signAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
      // iat (issued at) is added automatically by jsonwebtoken
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      issuer: "slendor-api",
      audience: "slendor-client",
    },
  );
};

/**
 * Sign a refresh token (long-lived, stored as hash in DB).
 * Contains minimal payload — just the user ID.
 */
const signRefreshToken = (userId) => {
  return jwt.sign({ sub: userId.toString() }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    issuer: "slendor-api",
    audience: "slendor-client",
  });
};

/**
 * Verify an access token. Throws on failure.
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: "slendor-api",
    audience: "slendor-client",
  });
};

/**
 * Verify a refresh token. Throws on failure.
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
    issuer: "slendor-api",
    audience: "slendor-client",
  });
};

/**
 * Hash a refresh token for safe DB storage.
 * Never store raw refresh tokens.
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Cookie options for the refresh token HttpOnly cookie.
 * Adjust sameSite based on your deployment (Strict for same-origin, None+Secure for cross-origin).
 */
const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  maxAge:
    parseInt(process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000,
  path: "/api/v1/auth", // Limit cookie scope to auth routes only
});

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  refreshCookieOptions,
};
