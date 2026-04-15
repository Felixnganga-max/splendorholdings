const mongoose = require("mongoose");

// ─── Default seed values (used for validation fallback & seeding) ─────────────
// These are no longer hard-coded enums — the source of truth is the Category
// collection. Keep these only as a safe fallback for standalone script usage.
const DEFAULT_TYPES = [
  "Villa",
  "Apartment",
  "Townhouse",
  "Maisonette",
  "Land/Plot",
  "Commercial",
];

const DEFAULT_BADGES = [
  "Featured",
  "New Listing",
  "For Sale",
  "For Rent",
  "Off-Plan",
  "Sold Out",
  "Price Reduced",
  "Hot Deal",
  "Under Offer",
];

const STATUS_TYPES = ["active", "draft", "archived", "sold", "rented"];

// ─── Pricing sub-schema ───────────────────────────────────────────────────────
const pricingSchema = new mongoose.Schema(
  {
    // The true/original asking price (always set)
    original: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // Optional: override with a fixed offer price instead of a % discount
    // Either set this OR discountPercent — not both. Controller enforces this.
    offerPrice: {
      type: Number,
      min: [0, "Offer price cannot be negative"],
      default: null,
    },

    // Percentage off (0–99). Auto-computes effectivePrice if offerPrice not set.
    discountPercent: {
      type: Number,
      min: [0, "Discount cannot be negative"],
      max: [99, "Discount cannot exceed 99%"],
      default: null,
    },

    // Optional expiry for the offer. After this date, no discount is applied.
    offerExpiresAt: {
      type: Date,
      default: null,
    },

    // Human-readable label e.g. "KES 24.5M", "KES 8,800,000"
    // Auto-generated if not supplied (see pre-save hook below)
    label: {
      type: String,
      trim: true,
      maxlength: 40,
    },
  },
  { _id: false },
);

// ─── Image sub-schema ─────────────────────────────────────────────────────────
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

// ─── Main Property Schema ─────────────────────────────────────────────────────
const propertySchema = new mongoose.Schema(
  {
    // ── Core identity ──────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
      maxlength: [120, "Name cannot exceed 120 characters"],
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },

    coordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [36.8219, -1.2921] }, // Nairobi default
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    features: [{ type: String, trim: true, maxlength: 80 }],

    // ── Classification (references Category collection) ────────────────────────
    // Stored as plain strings for query simplicity; Category model is the
    // source of truth for valid values (validated in controller).
    type: {
      type: String,
      required: [true, "Property type is required"],
      trim: true,
    },

    badge: {
      type: String,
      trim: true,
      default: "New Listing",
    },

    // ── Specs ─────────────────────────────────────────────────────────────────
    beds: { type: Number, default: 0, min: 0, max: 50 },
    baths: { type: Number, default: 0, min: 0, max: 50 },
    area: { type: Number, min: 0 }, // m²

    // ── Smart Pricing ─────────────────────────────────────────────────────────
    pricing: {
      type: pricingSchema,
      required: true,
    },

    // ── Media ─────────────────────────────────────────────────────────────────
    images: [imageSchema],

    // ── Lifecycle / Visibility ────────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: STATUS_TYPES,
        message: `Status must be one of: ${STATUS_TYPES.join(", ")}`,
      },
      default: "active",
    },

    // Hard visibility toggle — false = hidden from all public queries
    isVisible: { type: Boolean, default: true },

    // Soft sold-out flag — property stays visible but is tagged "Sold Out"
    isSoldOut: { type: Boolean, default: false },

    soldAt: { type: Date, default: null },

    // ── Featuring ─────────────────────────────────────────────────────────────
    isFeatured: { type: Boolean, default: false },
    featuredUntil: { type: Date, default: null },

    // ── Engagement ────────────────────────────────────────────────────────────
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    inquiryCount: { type: Number, default: 0 },

    // ── Ownership ─────────────────────────────────────────────────────────────
    listedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Pre-save: pricing logic ──────────────────────────────────────────────────
propertySchema.pre("save", function (next) {
  const p = this.pricing;

  // Offer expiry check — clear discount if expired
  if (p.offerExpiresAt && new Date() > p.offerExpiresAt) {
    p.offerPrice = null;
    p.discountPercent = null;
    p.offerExpiresAt = null;
  }

  // Auto-generate price label if not manually set
  if (!p.label) {
    const effective = getEffectivePrice(p);
    p.label = formatKES(effective);
  }

  // Auto-set status & badge when sold out
  if (this.isSoldOut && this.status === "active") {
    this.status = "sold";
    if (!this.soldAt) this.soldAt = new Date();
  }

  // Auto-expire featured flag
  if (
    this.isFeatured &&
    this.featuredUntil &&
    new Date() > this.featuredUntil
  ) {
    this.isFeatured = false;
  }

  next();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getEffectivePrice(pricing) {
  const now = new Date();
  const offerActive =
    !pricing.offerExpiresAt || now <= new Date(pricing.offerExpiresAt);

  if (offerActive && pricing.offerPrice != null) {
    return pricing.offerPrice;
  }
  if (offerActive && pricing.discountPercent != null) {
    return pricing.original * (1 - pricing.discountPercent / 100);
  }
  return pricing.original;
}

function formatKES(amount) {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `KES ${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `KES ${(amount / 1_000).toFixed(0)}K`;
  }
  return `KES ${amount.toLocaleString()}`;
}

// ─── Virtuals ─────────────────────────────────────────────────────────────────
propertySchema.virtual("pricing.effectivePrice").get(function () {
  return getEffectivePrice(this.pricing);
});

propertySchema.virtual("pricing.savings").get(function () {
  const effective = getEffectivePrice(this.pricing);
  return this.pricing.original - effective;
});

propertySchema.virtual("pricing.savingsPercent").get(function () {
  const savings = this.pricing.original - getEffectivePrice(this.pricing);
  if (savings <= 0) return 0;
  return Math.round((savings / this.pricing.original) * 100);
});

propertySchema.virtual("pricing.hasActiveOffer").get(function () {
  const p = this.pricing;
  const now = new Date();
  const offerActive = !p.offerExpiresAt || now <= new Date(p.offerExpiresAt);
  return offerActive && (p.offerPrice != null || p.discountPercent != null);
});

propertySchema.virtual("pricing.offerLabel").get(function () {
  const p = this.pricing;
  if (!this.pricing.hasActiveOffer) return null;
  if (p.discountPercent) return `${p.discountPercent}% OFF`;
  if (p.offerPrice) {
    const saved = p.original - p.offerPrice;
    return `Save ${formatKES(saved)}`;
  }
  return null;
});

propertySchema.virtual("primaryImage").get(function () {
  const primary = this.images?.find((img) => img.isPrimary);
  return primary?.url || this.images?.[0]?.url || null;
});

propertySchema.virtual("isCurrentlyFeatured").get(function () {
  if (!this.isFeatured) return false;
  if (!this.featuredUntil) return true;
  return new Date() <= new Date(this.featuredUntil);
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
propertySchema.index({ coordinates: "2dsphere" });
propertySchema.index({ type: 1, status: 1 });
propertySchema.index({ "pricing.original": 1 });
propertySchema.index({ badge: 1 });
propertySchema.index({ listedBy: 1 });
propertySchema.index({ createdAt: -1 });
propertySchema.index({ isVisible: 1, status: 1 });
propertySchema.index({ isFeatured: 1, featuredUntil: 1 });
propertySchema.index({ name: "text", location: "text", description: "text" });

// ─── Statics (kept for backward compat + seeding scripts) ────────────────────
propertySchema.statics.DEFAULT_TYPES = DEFAULT_TYPES;
propertySchema.statics.DEFAULT_BADGES = DEFAULT_BADGES;
propertySchema.statics.STATUSES = STATUS_TYPES;
propertySchema.statics.formatKES = formatKES;
propertySchema.statics.getEffectivePrice = getEffectivePrice;

module.exports = mongoose.model("Property", propertySchema);
