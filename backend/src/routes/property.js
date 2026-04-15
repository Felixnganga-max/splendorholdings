const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");

const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  toggleVisibility,
  toggleSoldOut,
  setOffer,
  deleteProperty,
  removePropertyImage,
} = require("../controllers/property");

const { protect, authorize, optionalAuth } = require("../middleware/auth");
const {
  mongoIdRule,
  paginationRules,
  validate,
} = require("../utils/validators");
const upload = require("../middleware/upload");

// ── Filter validation ──────────────────────────────────────────────────────────
// Type/badge are now free-form strings validated against the Category collection
// in the controller, so we just ensure they're clean strings here.
const propertyFilterRules = [
  query("type").optional().isString().trim().escape(),
  query("badge").optional().isString().trim().escape(),
  query("status").optional().isString().trim().escape(),
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("minPrice must be a positive number"),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("maxPrice must be a positive number"),
  query("search").optional().isString().trim().escape(),
  query("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be boolean"),
  query("isSoldOut")
    .optional()
    .isBoolean()
    .withMessage("isSoldOut must be boolean"),
  query("includeHidden").optional().isBoolean(),
];

// ── Create validation ─────────────────────────────────────────────────────────
const createPropertyRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Property name is required")
    .isLength({ max: 120 }),
  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required")
    .isLength({ max: 200 }),

  // Pricing
  body("price").notEmpty().withMessage("price is required").isFloat({ min: 0 }),
  body("offerPrice")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("offerPrice must be a positive number"),
  body("discountPercent")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 99 })
    .withMessage("discountPercent must be 0–99"),
  body("offerExpiresAt")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("offerExpiresAt must be a valid date"),
  body("priceLabel").optional().trim().isLength({ max: 40 }),

  body("type").trim().notEmpty().withMessage("Property type is required"),
  body("badge").optional().trim(),
  body("beds").optional().isInt({ min: 0, max: 50 }),
  body("baths").optional().isInt({ min: 0, max: 50 }),
  body("area").optional().isFloat({ min: 0 }),
  body("description").optional().trim().isLength({ max: 2000 }),
  body("features").optional().isArray(),
  body("features.*").optional().trim().isLength({ max: 80 }),
  body("isFeatured").optional().isBoolean(),
  body("featuredUntil").optional({ nullable: true }).isISO8601(),
];

// ── Update validation ─────────────────────────────────────────────────────────
const updatePropertyRules = [
  body("name").optional().trim().isLength({ max: 120 }),
  body("location").optional().trim().isLength({ max: 200 }),

  // Pricing (all optional for partial updates)
  body("price").optional().isFloat({ min: 0 }),
  body("offerPrice").optional({ nullable: true }).isFloat({ min: 0 }),
  body("discountPercent")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 99 }),
  body("offerExpiresAt").optional({ nullable: true }).isISO8601(),
  body("priceLabel").optional().trim().isLength({ max: 40 }),
  body("clearOffer").optional().isBoolean(),

  body("type").optional().trim(),
  body("badge").optional().trim(),
  body("status").optional().isString().trim(),
  body("beds").optional().isInt({ min: 0, max: 50 }),
  body("baths").optional().isInt({ min: 0, max: 50 }),
  body("area").optional().isFloat({ min: 0 }),
  body("description").optional().trim().isLength({ max: 2000 }),
  body("features").optional().isArray(),
  body("features.*").optional().trim().isLength({ max: 80 }),
  body("isVisible").optional().isBoolean(),
  body("isSoldOut").optional().isBoolean(),
  body("isFeatured").optional().isBoolean(),
  body("featuredUntil").optional({ nullable: true }).isISO8601(),
];

// ── Offer-only validation ─────────────────────────────────────────────────────
const offerRules = [
  body("discountPercent")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 99 }),
  body("offerPrice").optional({ nullable: true }).isFloat({ min: 0 }),
  body("offerExpiresAt").optional({ nullable: true }).isISO8601(),
  body("clearOffer").optional().isBoolean(),
];

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// GET  /api/v1/properties
router.get(
  "/",
  optionalAuth,
  paginationRules,
  propertyFilterRules,
  validate,
  getProperties,
);

// GET  /api/v1/properties/:id
router.get("/:id", optionalAuth, mongoIdRule, validate, getProperty);

// POST /api/v1/properties
router.post(
  "/",
  protect,
  authorize("admin", "manager"),
  upload.array("images", 10),
  createPropertyRules,
  validate,
  createProperty,
);

// PATCH /api/v1/properties/:id  (full or partial update)
router.patch(
  "/:id",
  protect,
  authorize("admin", "manager"),
  mongoIdRule,
  upload.array("images", 10),
  updatePropertyRules,
  validate,
  updateProperty,
);

// PATCH /api/v1/properties/:id/visibility  (quick hide/show toggle)
router.patch(
  "/:id/visibility",
  protect,
  authorize("admin", "manager"),
  mongoIdRule,
  validate,
  toggleVisibility,
);

// PATCH /api/v1/properties/:id/sold-out  (quick sold-out toggle)
router.patch(
  "/:id/sold-out",
  protect,
  authorize("admin", "manager"),
  mongoIdRule,
  validate,
  toggleSoldOut,
);

// PATCH /api/v1/properties/:id/offer  (add / remove offer without full update)
router.patch(
  "/:id/offer",
  protect,
  authorize("admin", "manager"),
  mongoIdRule,
  offerRules,
  validate,
  setOffer,
);

// DELETE /api/v1/properties/:id
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  mongoIdRule,
  validate,
  deleteProperty,
);

// DELETE /api/v1/properties/:id/images/:imageId
router.delete(
  "/:id/images/:imageId",
  protect,
  authorize("admin", "manager"),
  mongoIdRule,
  validate,
  removePropertyImage,
);

module.exports = router;
