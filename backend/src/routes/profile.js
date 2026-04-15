const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  updateSettings,
} = require("../controllers/profileController");

const { protect } = require("../middleware/auth");
const { uploadSingle, handleUploadError } = require("../middleware/upload");
const { updateProfileRules, validate } = require("../utils/validators");

// All profile routes require authentication
router.use(protect);

// ── GET /api/v1/profile
// Returns the current user's full profile and settings
router.get("/", getProfile);

// ── PATCH /api/v1/profile
// Update personal info — supports optional avatar upload (multipart/form-data)
// If sending JSON only (no file), Content-Type: application/json works fine.
// If sending an avatar, use multipart/form-data with field name "avatar".
router.patch(
  "/",
  uploadSingle("avatar"),
  handleUploadError,
  updateProfileRules,
  validate,
  updateProfile,
);

// ── PATCH /api/v1/profile/settings
// Granular settings update — send only the sub-keys you want to change.
// Body shape: { notifications: { emailOrders: true }, appearance: { darkMode: false } }
router.patch("/settings", updateSettings);

module.exports = router;
