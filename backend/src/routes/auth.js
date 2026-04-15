const express = require("express");
const router = express.Router();

const {
  register,
  login,
  refresh,
  logout,
  getMe,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  activateUser,
} = require("../controllers/auth");

const { protect, authorize } = require("../middleware/auth");
const {
  mongoIdRule,
  paginationRules,
  validate,
} = require("../utils/validators");
const { body } = require("express-validator");

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// ── POST /api/v1/auth/register
router.post(
  "/register",
  [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  validate,
  register,
);

// ── POST /api/v1/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login,
);

// ── POST /api/v1/auth/refresh
router.post("/refresh", refresh);

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// ── POST /api/v1/auth/logout
router.post("/logout", protect, logout);

// ── GET /api/v1/auth/me
router.get("/me", protect, getMe);

// ── PATCH /api/v1/auth/change-password
router.patch(
  "/change-password",
  protect,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters")
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error("New password must differ from current password");
        }
        return true;
      }),
  ],
  validate,
  changePassword,
);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// All routes below are protected by protect + authorize("admin").
// ─────────────────────────────────────────────────────────────────────────────

// ── GET /api/v1/auth/admin/users
router.get(
  "/admin/users",
  protect,
  authorize("admin"),
  paginationRules,
  validate,
  getAllUsers,
);

// ── GET /api/v1/auth/admin/users/:id
router.get(
  "/admin/users/:id",
  protect,
  authorize("admin"),
  mongoIdRule,
  validate,
  getUserById,
);

// ── PATCH /api/v1/auth/admin/users/:id/role
router.patch(
  "/admin/users/:id/role",
  protect,
  authorize("admin"),
  mongoIdRule,
  body("role")
    .notEmpty()
    .isIn(["user", "manager", "admin"])
    .withMessage("Role must be user, manager, or admin"),
  validate,
  updateUserRole,
);

// ── PATCH /api/v1/auth/admin/users/:id/deactivate
router.patch(
  "/admin/users/:id/deactivate",
  protect,
  authorize("admin"),
  mongoIdRule,
  validate,
  deactivateUser,
);

// ── PATCH /api/v1/auth/admin/users/:id/activate
router.patch(
  "/admin/users/:id/activate",
  protect,
  authorize("admin"),
  mongoIdRule,
  validate,
  activateUser,
);

module.exports = router;
