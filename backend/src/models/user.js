const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const ROLES = Object.freeze({
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
});

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      maxlength: [100, "Email cannot exceed 100 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: { values: Object.values(ROLES), message: "Invalid role" },
      default: ROLES.USER,
    },

    // ── Profile ──────────────────────────────────────────────
    phone: { type: String, trim: true, maxlength: 20 },
    location: { type: String, trim: true, maxlength: 100 },
    website: { type: String, trim: true, maxlength: 200 },
    bio: { type: String, trim: true, maxlength: 500 },
    avatar: { type: String },

    // ── Preferences / Settings ────────────────────────────────
    settings: {
      notifications: {
        emailOrders: { type: Boolean, default: true },
        emailInquiries: { type: Boolean, default: true },
        emailMarketing: { type: Boolean, default: false },
        smsAlerts: { type: Boolean, default: true },
      },
      security: {
        twoFactor: { type: Boolean, default: false },
        publicProfile: { type: Boolean, default: true },
      },
      appearance: {
        darkMode: { type: Boolean, default: false },
        compactView: { type: Boolean, default: false },
        autoArchive: { type: Boolean, default: true },
      },
      localisation: {
        language: { type: String, default: "English" },
        currency: { type: String, default: "KES" },
        timezone: { type: String, default: "Africa/Nairobi" },
      },
    },

    // ── Auth / Security ───────────────────────────────────────
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, select: false },
    emailVerifyExpires: { type: Date, select: false },

    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordChangedAt: { type: Date, select: false },

    // Refresh token store (hashed) — one active session per user by default
    refreshTokenHash: { type: String, select: false },

    // Track failed login attempts for lockout
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },

    lastLoginAt: { type: Date },
    lastLoginIP: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Note: email is already indexed via unique: true in the schema definition above.
// Declaring it again with userSchema.index({ email: 1 }) causes a duplicate
// index warning in Mongoose 8 — so it is intentionally omitted here.
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ── Pre-save: hash password ────────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, saltRounds);

  // Track when password was changed (used to invalidate old JWTs)
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000); // 1s buffer for token iat
  }
  next();
});

// ── Instance methods ──────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000,
    );
    return jwtIssuedAt < changedTimestamp;
  }
  return false;
};

userSchema.methods.generatePasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  // Store hashed version — raw token sent to user via email
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return rawToken;
};

userSchema.methods.generateEmailVerifyToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.emailVerifyToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  this.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return rawToken;
};

userSchema.methods.incrementLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

  // If previous lock has expired, reset
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// ── Static helpers ────────────────────────────────────────────────────────────
userSchema.statics.ROLES = ROLES;

// Sanitized public projection (never expose sensitive fields)
userSchema.statics.PUBLIC_FIELDS =
  "firstName lastName email role phone location website bio avatar settings isActive isEmailVerified lastLoginAt createdAt";

module.exports = mongoose.model("User", userSchema);
