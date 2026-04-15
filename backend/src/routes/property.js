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

const LISTING_MODES = ["whole", "unit"];
const LISTING_INTENTS = ["sale", "rent", "both"];
const LAND_UNITS = ["acres", "hectares", "sqm", "sqft"];

// ── Filter validation ──────────────────────────────────────────────────────────
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
  query("listingIntent")
    .optional()
    .isIn(LISTING_INTENTS)
    .withMessage(`listingIntent must be one of: ${LISTING_INTENTS.join(", ")}`),
  query("listingMode")
    .optional()
    .isIn(LISTING_MODES)
    .withMessage(`listingMode must be one of: ${LISTING_MODES.join(", ")}`),
];

// ── Create validation ─────────────────────────────────────────────────────────
const createPropertyRules = [
  // Identity
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Property name is required")
    .isLength({ max: 120 }),
  body("buildingName")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage("buildingName cannot exceed 120 characters"),
  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required")
    .isLength({ max: 200 }),

  // Listing mode & intent
  body("listingMode")
    .optional()
    .isIn(LISTING_MODES)
    .withMessage(`listingMode must be one of: ${LISTING_MODES.join(", ")}`),
  body("listingIntent")
    .optional()
    .isIn(LISTING_INTENTS)
    .withMessage(`listingIntent must be one of: ${LISTING_INTENTS.join(", ")}`),

  // Sale pricing (required only when intent includes "sale" — controller enforces)
  body("price")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("price must be a positive number"),
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

  // Rental pricing (required only when intent includes "rent" — controller enforces)
  body("rentPerDay")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("rentPerDay must be a positive number"),
  body("rentPerMonth")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("rentPerMonth must be a positive number"),
  body("rentalLabel").optional().trim().isLength({ max: 60 }),

  // Land area
  body("landAreaValue")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("landAreaValue must be a positive number"),
  body("landAreaUnit")
    .optional()
    .isIn(LAND_UNITS)
    .withMessage(`landAreaUnit must be one of: ${LAND_UNITS.join(", ")}`),

  // Classification & specs
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
  body("buildingName")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 120 }),
  body("location").optional().trim().isLength({ max: 200 }),

  body("listingMode")
    .optional()
    .isIn(LISTING_MODES)
    .withMessage(`listingMode must be one of: ${LISTING_MODES.join(", ")}`),
  body("listingIntent")
    .optional()
    .isIn(LISTING_INTENTS)
    .withMessage(`listingIntent must be one of: ${LISTING_INTENTS.join(", ")}`),

  // Sale pricing
  body("price").optional().isFloat({ min: 0 }),
  body("offerPrice").optional({ nullable: true }).isFloat({ min: 0 }),
  body("discountPercent")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 99 }),
  body("offerExpiresAt").optional({ nullable: true }).isISO8601(),
  body("priceLabel").optional().trim().isLength({ max: 40 }),
  body("clearOffer").optional().isBoolean(),

  // Rental pricing
  body("rentPerDay").optional({ nullable: true }).isFloat({ min: 0 }),
  body("rentPerMonth").optional({ nullable: true }).isFloat({ min: 0 }),
  body("rentalLabel").optional().trim().isLength({ max: 60 }),

  // Land area
  body("landAreaValue").optional({ nullable: true }).isFloat({ min: 0 }),
  body("landAreaUnit").optional().isIn(LAND_UNITS),

  // Other
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

router.get(
  "/",
  optionalAuth,
  paginationRules,
  propertyFilterRules,
  validate,
  getProperties,
);
router.get("/:id", optionalAuth, mongoIdRule, validate, getProperty);

router.post(
  "/",
  protect,
  authorize("admin", "manager"),
  upload.array("images", 10),
  createPropertyRules,
  validate,
  createProperty,
);

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

router.patch(
  "/:id/visibility",
  protect,
  authorize("admin", "manager"),
  mongoIdRule,
  validate,
  toggleVisibility,
);
router.patch(
  "/:id/sold-out",
  protect,
  authorize("admin", "manager"),
  mongoIdRule,
  validate,
  toggleSoldOut,
);
router.patch(
  "/:id/offer",
  protect,
  authorize("admin", "manager"),
  mongoIdRule,
  offerRules,
  validate,
  setOffer,
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  mongoIdRule,
  validate,
  deleteProperty,
);
router.delete(
  "/:id/images/:imageId",
  protect,
  authorize("admin", "manager"),
  mongoIdRule,
  validate,
  removePropertyImage,
);

module.exports = router;
