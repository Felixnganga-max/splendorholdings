const express = require("express");
const router = express.Router();

const {
  getInquiries,
  getInquiry,
  getInquiryStats,
  createInquiry,
  replyToInquiry,
  assignInquiry,
  archiveInquiry,
} = require("../controllers/inquiry");

const { protect, authorize, optionalAuth } = require("../middleware/auth");
const { inquiryLimiter } = require("../utils/rateLimiter");
const {
  createInquiryRules,
  replyInquiryRules,
  mongoIdRule,
  paginationRules,
  validate,
} = require("../utils/validators");

// ── POST /api/v1/inquiries ────────────────────────────────────────────────────
// Public — guests submit from Contact.jsx; registered users optionally attached.
// optionalAuth attaches req.user if a valid Bearer token is present but does NOT
// reject unauthenticated requests.
router.post(
  "/",
  inquiryLimiter,
  optionalAuth,
  createInquiryRules,
  validate,
  createInquiry,
);

// All routes below require a valid JWT
router.use(protect);

// ── GET /api/v1/inquiries/stats ───────────────────────────────────────────────
// admin/manager only — unread count + breakdown for dashboard badge
router.get("/stats", authorize("admin", "manager"), getInquiryStats);

// ── GET /api/v1/inquiries ─────────────────────────────────────────────────────
// admin/manager → all | user → only their own submissions
router.get("/", paginationRules, validate, getInquiries);

// ── GET /api/v1/inquiries/:id ─────────────────────────────────────────────────
router.get("/:id", mongoIdRule, validate, getInquiry);

// ── POST /api/v1/inquiries/:id/reply ─────────────────────────────────────────
// admin/manager only — reply via email, SMS, or internal note
router.post(
  "/:id/reply",
  authorize("admin", "manager"),
  mongoIdRule,
  replyInquiryRules,
  validate,
  replyToInquiry,
);

// ── PATCH /api/v1/inquiries/:id/assign ───────────────────────────────────────
router.patch(
  "/:id/assign",
  authorize("admin", "manager"),
  mongoIdRule,
  validate,
  assignInquiry,
);

// ── PATCH /api/v1/inquiries/:id/archive ──────────────────────────────────────
router.patch(
  "/:id/archive",
  authorize("admin", "manager"),
  mongoIdRule,
  validate,
  archiveInquiry,
);

module.exports = router;
