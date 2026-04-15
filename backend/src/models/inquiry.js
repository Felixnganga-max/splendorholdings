const mongoose = require("mongoose");

const INQUIRY_TYPES = [
  "Viewing Request",
  "Price Inquiry",
  "Offer Intent",
  "Information",
];
const INQUIRY_STATUSES = ["unread", "read", "replied", "archived"];

const inquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property reference is required"],
    },
    // Registered user OR anonymous guest
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    guestName: { type: String, trim: true, maxlength: 100 },
    guestEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
      maxlength: 100,
    },
    guestPhone: { type: String, trim: true, maxlength: 20 },

    type: {
      type: String,
      enum: { values: INQUIRY_TYPES, message: "Invalid inquiry type" },
      default: "Information",
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: INQUIRY_STATUSES,
      default: "unread",
    },
    replies: [
      {
        body: { type: String, required: true, trim: true, maxlength: 2000 },
        repliedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        repliedAt: { type: Date, default: Date.now },
        channel: {
          type: String,
          enum: ["email", "sms", "internal"],
          default: "email",
        },
      },
    ],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // IP for spam / rate-limit tracking
    senderIP: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
inquirySchema.index({ property: 1 });
inquirySchema.index({ sender: 1 });
inquirySchema.index({ status: 1 });
inquirySchema.index({ type: 1 });
inquirySchema.index({ createdAt: -1 });

// ── Virtual: display name ──────────────────────────────────────────────────────
inquirySchema.virtual("displayName").get(function () {
  if (this.sender) return undefined; // populated separately
  return this.guestName || this.guestEmail || "Anonymous";
});

inquirySchema.statics.TYPES = INQUIRY_TYPES;
inquirySchema.statics.STATUSES = INQUIRY_STATUSES;

module.exports = mongoose.model("Inquiry", inquirySchema);
