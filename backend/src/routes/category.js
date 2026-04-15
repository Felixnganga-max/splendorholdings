const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category");

const { protect, authorize, optionalAuth } = require("../middleware/auth");
const { mongoIdRule, validate } = require("../utils/validators");

// ── Validation ────────────────────────────────────────────────────────────────
const createCategoryRules = [
  body("kind")
    .notEmpty()
    .withMessage("kind is required")
    .isIn(["type", "badge"])
    .withMessage("kind must be 'type' or 'badge'"),
  body("label")
    .trim()
    .notEmpty()
    .withMessage("label is required")
    .isLength({ max: 60 })
    .withMessage("label cannot exceed 60 characters"),
  body("color")
    .optional({ nullable: true })
    .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .withMessage("color must be a valid hex (e.g. #0d6e5e)"),
  body("icon").optional().trim().isLength({ max: 40 }),
  body("sortOrder").optional().isInt({ min: 0 }),
  body("description").optional().trim().isLength({ max: 200 }),
];

const updateCategoryRules = [
  body("label").optional().trim().isLength({ max: 60 }),
  body("color")
    .optional({ nullable: true })
    .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .withMessage("color must be a valid hex"),
  body("icon").optional().trim().isLength({ max: 40 }),
  body("sortOrder").optional().isInt({ min: 0 }),
  body("description").optional().trim().isLength({ max: 200 }),
  body("isActive").optional().isBoolean(),
];

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// GET  /api/v1/categories          (public, optional ?kind=type|badge)
router.get("/", optionalAuth, getCategories);

// POST /api/v1/categories          (admin/manager only)
router.post(
  "/",
  protect,
  authorize("admin", "manager"),
  createCategoryRules,
  validate,
  createCategory,
);

// PATCH /api/v1/categories/:id
router.patch(
  "/:id",
  protect,
  authorize("admin", "manager"),
  mongoIdRule,
  updateCategoryRules,
  validate,
  updateCategory,
);

// DELETE /api/v1/categories/:id
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  mongoIdRule,
  validate,
  deleteCategory,
);

module.exports = router;
