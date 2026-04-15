const mongoose = require("mongoose");

/**
 * Category Model
 * Drives the valid values for Property.type and Property.badge.
 * Admins can add/edit/delete categories from a dashboard without any
 * code changes or redeployments.
 */
const categorySchema = new mongoose.Schema(
  {
    // "type" categories (Villa, Apartment …) or "badge" categories (Featured …)
    kind: {
      type: String,
      required: true,
      enum: ["type", "badge"],
    },

    label: {
      type: String,
      required: [true, "Label is required"],
      trim: true,
      maxlength: [60, "Label cannot exceed 60 characters"],
    },

    // URL-friendly slug, auto-generated from label
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },

    // Badge-specific: hex color displayed in the UI (e.g. "#0d6e5e")
    color: {
      type: String,
      trim: true,
      match: [/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid hex color"],
      default: null,
    },

    // Icon name (for UI frameworks, e.g. lucide icon slug)
    icon: {
      type: String,
      trim: true,
      default: null,
    },

    // Whether this category is available for selection
    isActive: { type: Boolean, default: true },

    // Display order in filter tabs / dropdowns
    sortOrder: { type: Number, default: 0 },

    // Optional description
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Auto-generate slug before saving
categorySchema.pre("save", function (next) {
  if (this.isModified("label") || !this.slug) {
    this.slug = this.label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Unique: same label can't appear twice within the same kind
categorySchema.index({ kind: 1, slug: 1 }, { unique: true });
categorySchema.index({ kind: 1, isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("Category", categorySchema);
