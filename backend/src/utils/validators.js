const { body, param, query, validationResult } = require("express-validator");
const { badRequest } = require("../utils/response");

/**
 * Run validation results and return 400 with field errors if any failed.
 * Place this AFTER your validation chain rules.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return badRequest(
      res,
      "Validation failed",
      errors.array().map((e) => ({ field: e.path, message: e.msg })),
    );
  }
  next();
};

// ── Auth validators ────────────────────────────────────────────────────────────
const registerRules = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: 50 }),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: 50 }),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  body("role")
    .optional()
    .isIn(["user", "manager"])
    .withMessage("Role must be user or manager (admin is assigned manually)"),
];

const loginRules = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const changePasswordRules = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain uppercase, lowercase, and a number",
    ),
];

// ── Property validators ────────────────────────────────────────────────────────
const propertyRules = [
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
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("type")
    .notEmpty()
    .withMessage("Property type is required")
    .isIn([
      "Villa",
      "Apartment",
      "Townhouse",
      "Maisonette",
      "Land/Plot",
      "Commercial",
    ])
    .withMessage("Invalid property type"),
  body("beds")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Beds must be a non-negative integer"),
  body("baths")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Baths must be a non-negative integer"),
  body("area")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Area must be a positive number"),
  body("badge")
    .optional()
    .isIn(["Featured", "New Listing", "For Sale", "For Rent", "Off-Plan"])
    .withMessage("Invalid badge"),
  body("description").optional().trim().isLength({ max: 2000 }),
  body("features")
    .optional()
    .isArray({ max: 30 })
    .withMessage("Features must be an array of up to 30 items"),
];

// ── Order validators ────────────────────────────────────────────────────────────
const createOrderRules = [
  body("propertyId")
    .notEmpty()
    .isMongoId()
    .withMessage("Valid property ID is required"),
  body("offeredPrice")
    .isFloat({ min: 0 })
    .withMessage("Offered price must be a positive number"),
  body("notes").optional().trim().isLength({ max: 1000 }),
];

const updateOrderStatusRules = [
  body("status")
    .notEmpty()
    .isIn([
      "Pending",
      "Under Review",
      "Approved",
      "Completed",
      "Declined",
      "Cancelled",
    ])
    .withMessage("Invalid order status"),
  body("note").optional().trim().isLength({ max: 500 }),
];

// ── Inquiry validators ─────────────────────────────────────────────────────────
const createInquiryRules = [
  body("propertyId")
    .notEmpty()
    .isMongoId()
    .withMessage("Valid property ID is required"),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 2000 }),
  body("type")
    .optional()
    .isIn(["Viewing Request", "Price Inquiry", "Offer Intent", "Information"])
    .withMessage("Invalid inquiry type"),
  body("guestName").optional().trim().isLength({ max: 100 }),
  body("guestEmail")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid guest email")
    .normalizeEmail(),
  body("guestPhone").optional().trim().isLength({ max: 20 }),
];

const replyInquiryRules = [
  body("body")
    .trim()
    .notEmpty()
    .withMessage("Reply body is required")
    .isLength({ max: 2000 }),
  body("channel")
    .optional()
    .isIn(["email", "sms", "internal"])
    .withMessage("Invalid channel"),
];

// ── Profile validator ──────────────────────────────────────────────────────────
const updateProfileRules = [
  body("firstName").optional().trim().notEmpty().isLength({ max: 50 }),
  body("lastName").optional().trim().notEmpty().isLength({ max: 50 }),
  body("phone").optional().trim().isLength({ max: 20 }),
  body("location").optional().trim().isLength({ max: 100 }),
  body("website")
    .optional()
    .trim()
    .isURL()
    .withMessage("Website must be a valid URL")
    .isLength({ max: 200 }),
  body("bio").optional().trim().isLength({ max: 500 }),
];

// ── Pagination query validator ────────────────────────────────────────────────
const paginationRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be 1–100")
    .toInt(),
];

// ── Mongo ID param validator ───────────────────────────────────────────────────
const mongoIdRule = param("id").isMongoId().withMessage("Invalid ID format");

module.exports = {
  validate,
  registerRules,
  loginRules,
  changePasswordRules,
  propertyRules,
  createOrderRules,
  updateOrderStatusRules,
  createInquiryRules,
  replyInquiryRules,
  updateProfileRules,
  paginationRules,
  mongoIdRule,
};
