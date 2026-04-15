const crypto = require("crypto");
const User = require("../models/user");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  refreshCookieOptions,
} = require("../utils/jwt");
const {
  success,
  created,
  unauthorized,
  badRequest,
  forbidden,
  error,
} = require("../utils/response");
const { asyncHandler, AppError } = require("../utils/errorHandler");
const logger = require("../utils/logger");

/**
 * POST /api/v1/auth/register
 * Public — create a new user account.
 * Note: Assigning 'admin' role is not allowed via this endpoint.
 */
const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Prevent self-assigning admin role
  const safeRole = role === "admin" ? "user" : role;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return badRequest(res, "An account with this email already exists.");
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: safeRole,
  });

  // Issue tokens immediately after registration
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user._id);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", refreshToken, refreshCookieOptions());

  logger.info(`New user registered: ${email} [${user.role}]`);

  return created(
    res,
    {
      accessToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        settings: user.settings,
      },
    },
    "Account created successfully.",
  );
});

/**
 * POST /api/v1/auth/login
 * Public — authenticate with email and password.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Fetch with password field (excluded by default)
  const user = await User.findOne({ email }).select(
    "+password +loginAttempts +lockUntil",
  );

  // Consistent error to avoid email enumeration
  if (!user) {
    return unauthorized(res, "Invalid email or password.");
  }

  if (!user.isActive) {
    return unauthorized(
      res,
      "This account has been deactivated. Contact support.",
    );
  }

  // Check account lockout
  if (user.isLocked) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return unauthorized(
      res,
      `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incrementLoginAttempts();
    return unauthorized(res, "Invalid email or password.");
  }

  // Successful login — reset attempts and record metadata
  await user.resetLoginAttempts();
  user.lastLoginAt = new Date();
  user.lastLoginIP = req.ip;

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user._id);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", refreshToken, refreshCookieOptions());

  logger.info(`User logged in: ${email} [${user.role}] from ${req.ip}`);

  return success(
    res,
    {
      accessToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        settings: user.settings,
        avatar: user.avatar,
      },
    },
    "Logged in successfully.",
  );
});

/**
 * POST /api/v1/auth/refresh
 * Public — exchange HttpOnly refresh token cookie for a new access token.
 * Implements refresh token rotation: each use issues a new refresh token.
 */
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return unauthorized(res, "Refresh token missing.");

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    // Clear the bad cookie
    res.clearCookie("refreshToken", { path: "/api/v1/auth" });
    return unauthorized(
      res,
      "Invalid or expired refresh token. Please log in again.",
    );
  }

  const hashedToken = hashToken(token);
  const user = await User.findOne({
    _id: decoded.sub,
    refreshTokenHash: hashedToken,
  });

  if (!user || !user.isActive) {
    res.clearCookie("refreshToken", { path: "/api/v1/auth" });
    return unauthorized(
      res,
      "Refresh token not recognised. Please log in again.",
    );
  }

  // Rotate tokens
  const newAccessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user._id);
  user.refreshTokenHash = hashToken(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", newRefreshToken, refreshCookieOptions());

  return success(res, { accessToken: newAccessToken }, "Token refreshed.");
});

/**
 * POST /api/v1/auth/logout
 * Protected — invalidate the refresh token and clear the cookie.
 */
const logout = asyncHandler(async (req, res) => {
  // Invalidate stored refresh token hash
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { refreshTokenHash: 1 },
    });
  }
  res.clearCookie("refreshToken", { path: "/api/v1/auth" });
  return success(res, {}, "Logged out successfully.");
});

/**
 * GET /api/v1/auth/me
 * Protected — return current user profile.
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(User.PUBLIC_FIELDS);
  return success(res, { user });
});

/**
 * PATCH /api/v1/auth/change-password
 * Protected — change the authenticated user's password.
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return badRequest(res, "Current password is incorrect.");

  user.password = newPassword;
  // Clear refresh tokens to force re-login on all devices
  user.refreshTokenHash = undefined;
  await user.save();

  res.clearCookie("refreshToken", { path: "/api/v1/auth" });
  logger.info(`Password changed for user: ${user.email}`);

  return success(res, {}, "Password updated. Please log in again.");
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN FUNCTIONS
// All routes below are protected by protect + authorize("admin") in the router.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/users
 * Admin — list all users with optional role filter and pagination.
 * Query params: ?role=admin|manager|user  ?page=1  ?limit=20
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (
    role &&
    Object.values(
      User.schema.path("role").enumValues || ["admin", "manager", "user"],
    ).includes(role)
  ) {
    filter.role = role;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(User.PUBLIC_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return success(res, {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * GET /api/v1/admin/users/:id
 * Admin — get a single user's full profile.
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(User.PUBLIC_FIELDS);

  if (!user) {
    return badRequest(res, "User not found.");
  }

  return success(res, { user });
});

/**
 * PATCH /api/v1/admin/users/:id/role
 * Admin — promote or demote a user's role.
 * Body: { "role": "manager" }
 * Cannot change your own role.
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Prevent admin from demoting themselves
  if (req.user._id.toString() === id) {
    return forbidden(res, "You cannot change your own role.");
  }

  const user = await User.findById(id).select(User.PUBLIC_FIELDS);
  if (!user) {
    return badRequest(res, "User not found.");
  }

  const previousRole = user.role;
  user.role = role;
  await user.save({ validateBeforeSave: false });

  logger.info(
    `Admin ${req.user.email} changed role of ${user.email}: ${previousRole} → ${role}`,
  );

  return success(res, { user }, `User role updated to '${role}'.`);
});

/**
 * PATCH /api/v1/admin/users/:id/deactivate
 * Admin — soft-deactivate a user account.
 * Invalidates their refresh token so they are logged out immediately.
 * Cannot deactivate yourself.
 */
const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    return forbidden(res, "You cannot deactivate your own account.");
  }

  const user = await User.findById(id).select(User.PUBLIC_FIELDS);
  if (!user) {
    return badRequest(res, "User not found.");
  }

  if (!user.isActive) {
    return badRequest(res, "User account is already deactivated.");
  }

  // Deactivate and invalidate any active session
  await User.findByIdAndUpdate(id, {
    $set: { isActive: false },
    $unset: { refreshTokenHash: 1 },
  });

  logger.info(`Admin ${req.user.email} deactivated account: ${user.email}`);

  return success(res, {}, `Account for ${user.email} has been deactivated.`);
});

/**
 * PATCH /api/v1/admin/users/:id/activate
 * Admin — re-activate a previously deactivated account.
 */
const activateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select(User.PUBLIC_FIELDS);
  if (!user) {
    return badRequest(res, "User not found.");
  }

  if (user.isActive) {
    return badRequest(res, "User account is already active.");
  }

  await User.findByIdAndUpdate(id, { $set: { isActive: true } });

  logger.info(`Admin ${req.user.email} activated account: ${user.email}`);

  return success(res, {}, `Account for ${user.email} has been activated.`);
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  changePassword,
  // Admin
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  activateUser,
};
