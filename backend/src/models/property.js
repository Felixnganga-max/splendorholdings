const mongoose = require("mongoose");

// ─── Default seed values ──────────────────────────────────────────────────────
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
const LISTING_MODES = ["whole", "unit"]; // entire building vs one section
const LISTING_INTENTS = ["sale", "rent", "both"]; // what the owner is offering
const LAND_UNITS = ["acres", "hectares", "sqm", "sqft"];

// ─── Pricing sub-schema (sale) ────────────────────────────────────────────────
const pricingSchema = new mongoose.Schema(
  {
    original: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    offerPrice: {
      type: Number,
      min: [0, "Offer price cannot be negative"],
      default: null,
    },
    discountPercent: {
      type: Number,
      min: [0, "Discount cannot be negative"],
      max: [99, "Discount cannot exceed 99%"],
      default: null,
    },
    offerExpiresAt: { type: Date, default: null },
    // Human-readable label e.g. "KES 24.5M" — auto-generated if blank
    label: { type: String, trim: true, maxlength: 40 },
  },
  { _id: false },
);

// ─── Rental pricing sub-schema ────────────────────────────────────────────────
// Used when listingIntent is "rent" or "both".
// At least one of rentPerDay / rentPerMonth should be set.
const rentalPricingSchema = new mongoose.Schema(
  {
    rentPerDay: { type: Number, min: 0, default: null },
    rentPerMonth: { type: Number, min: 0, default: null },
    // e.g. "KES 45K/mo" — auto-generated if blank
    label: { type: String, trim: true, maxlength: 60 },
  },
  { _id: false },
);

// ─── Land area sub-schema ─────────────────────────────────────────────────────
// Separate from `area` (built-up m²). Used for Land/Plot listings (and any
// property where the land size matters independently of the built-up area).
const landAreaSchema = new mongoose.Schema(
  {
    value: { type: Number, min: 0, required: true },
    unit: {
      type: String,
      enum: {
        values: LAND_UNITS,
        message: `Land unit must be one of: ${LAND_UNITS.join(", ")}`,
      },
      required: true,
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
    // ── Identity ───────────────────────────────────────────────────────────────
    // `name` is the primary/unit-level name, e.g. "2 Bedroom Apartment"
    name: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
      maxlength: [120, "Name cannot exceed 120 characters"],
    },

    // Parent complex / building name, e.g. "Sunshine Apartments"
    // Required when listingMode === "unit"; optional otherwise.
    buildingName: {
      type: String,
      trim: true,
      maxlength: [120, "Building name cannot exceed 120 characters"],
      default: null,
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },

    coordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [36.8219, -1.2921] },
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    features: [{ type: String, trim: true, maxlength: 80 }],

    // ── Listing mode & intent ──────────────────────────────────────────────────
    // listingMode:   "whole" = entire property/building on offer
    //                "unit"  = one section inside a larger building
    listingMode: {
      type: String,
      enum: {
        values: LISTING_MODES,
        message: `listingMode must be: ${LISTING_MODES.join(", ")}`,
      },
      default: "whole",
    },

    // listingIntent: what the owner is offering
    //   "sale"  → only for-sale pricing applies
    //   "rent"  → only rental pricing applies
    //   "both"  → both sale and rental pricing shown
    listingIntent: {
      type: String,
      enum: {
        values: LISTING_INTENTS,
        message: `listingIntent must be: ${LISTING_INTENTS.join(", ")}`,
      },
      default: "sale",
    },

    // ── Classification ─────────────────────────────────────────────────────────
    type: {
      type: String,
      required: [true, "Property type is required"],
      trim: true,
    },
    badge: { type: String, trim: true, default: "New Listing" },

    // ── Specs ──────────────────────────────────────────────────────────────────
    beds: { type: Number, default: 0, min: 0, max: 50 },
    baths: { type: Number, default: 0, min: 0, max: 50 },
    area: { type: Number, min: 0 }, // built-up m²

    // Land area — separate from built-up area; populated for Land/Plot and
    // any listing where land size is relevant
    landArea: { type: landAreaSchema, default: null },

    // ── Pricing ────────────────────────────────────────────────────────────────
    // Sale pricing — required when listingIntent is "sale" or "both"
    pricing: { type: pricingSchema, default: null },

    // Rental pricing — required when listingIntent is "rent" or "both"
    rentalPricing: { type: rentalPricingSchema, default: null },

    // ── Media ──────────────────────────────────────────────────────────────────
    images: [imageSchema],

    // ── Lifecycle / Visibility ─────────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: STATUS_TYPES,
        message: `Status must be one of: ${STATUS_TYPES.join(", ")}`,
      },
      default: "active",
    },
    isVisible: { type: Boolean, default: true },
    isSoldOut: { type: Boolean, default: false },
    soldAt: { type: Date, default: null },

    // ── Featuring ──────────────────────────────────────────────────────────────
    isFeatured: { type: Boolean, default: false },
    featuredUntil: { type: Date, default: null },

    // ── Engagement ─────────────────────────────────────────────────────────────
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    inquiryCount: { type: Number, default: 0 },

    // ── Ownership ──────────────────────────────────────────────────────────────
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

// ─── Pre-save hook ────────────────────────────────────────────────────────────
propertySchema.pre("save", function (next) {
  // ── Sale pricing ────────────────────────────────────────────────────────────
  if (this.pricing) {
    const p = this.pricing;

    if (p.offerExpiresAt && new Date() > p.offerExpiresAt) {
      p.offerPrice = null;
      p.discountPercent = null;
      p.offerExpiresAt = null;
    }

    if (!p.label) {
      p.label = formatKES(getEffectivePrice(p));
    }
  }

  // ── Rental pricing label ────────────────────────────────────────────────────
  if (this.rentalPricing && !this.rentalPricing.label) {
    const rp = this.rentalPricing;
    const parts = [];
    if (rp.rentPerMonth != null) parts.push(`${formatKES(rp.rentPerMonth)}/mo`);
    if (rp.rentPerDay != null) parts.push(`${formatKES(rp.rentPerDay)}/day`);
    rp.label = parts.join(" · ") || null;
  }

  // ── Sold out ────────────────────────────────────────────────────────────────
  if (this.isSoldOut && this.status === "active") {
    this.status = "sold";
    if (!this.soldAt) this.soldAt = new Date();
  }

  // ── buildingName required for unit mode ─────────────────────────────────────
  if (this.listingMode === "unit" && !this.buildingName) {
    return next(
      new Error("buildingName is required when listingMode is 'unit'"),
    );
  }

  // ── Featured expiry ─────────────────────────────────────────────────────────
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
  if (!pricing) return 0;
  const now = new Date();
  const offerActive =
    !pricing.offerExpiresAt || now <= new Date(pricing.offerExpiresAt);
  if (offerActive && pricing.offerPrice != null) return pricing.offerPrice;
  if (offerActive && pricing.discountPercent != null)
    return pricing.original * (1 - pricing.discountPercent / 100);
  return pricing.original;
}

function formatKES(amount) {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `KES ${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  if (amount >= 1_000) return `KES ${(amount / 1_000).toFixed(0)}K`;
  return `KES ${amount.toLocaleString()}`;
}

// ─── Virtuals ─────────────────────────────────────────────────────────────────
propertySchema.virtual("pricing.effectivePrice").get(function () {
  return getEffectivePrice(this.pricing);
});
propertySchema.virtual("pricing.savings").get(function () {
  if (!this.pricing) return 0;
  return this.pricing.original - getEffectivePrice(this.pricing);
});
propertySchema.virtual("pricing.savingsPercent").get(function () {
  if (!this.pricing) return 0;
  const savings = this.pricing.original - getEffectivePrice(this.pricing);
  if (savings <= 0) return 0;
  return Math.round((savings / this.pricing.original) * 100);
});
propertySchema.virtual("pricing.hasActiveOffer").get(function () {
  if (!this.pricing) return false;
  const p = this.pricing;
  const offerActive =
    !p.offerExpiresAt || new Date() <= new Date(p.offerExpiresAt);
  return offerActive && (p.offerPrice != null || p.discountPercent != null);
});
propertySchema.virtual("pricing.offerLabel").get(function () {
  if (!this.pricing?.hasActiveOffer) return null;
  const p = this.pricing;
  if (p.discountPercent) return `${p.discountPercent}% OFF`;
  if (p.offerPrice) return `Save ${formatKES(p.original - p.offerPrice)}`;
  return null;
});

// Full display name: "2 Bedroom Apartment — Sunshine Apartments, Kiamiti Road"
propertySchema.virtual("displayName").get(function () {
  if (this.buildingName) return `${this.name} — ${this.buildingName}`;
  return this.name;
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
propertySchema.index({ listingIntent: 1 });
propertySchema.index({ listingMode: 1 });
propertySchema.index({
  name: "text",
  location: "text",
  description: "text",
  buildingName: "text",
});

// ─── Statics ──────────────────────────────────────────────────────────────────
propertySchema.statics.DEFAULT_TYPES = DEFAULT_TYPES;
propertySchema.statics.DEFAULT_BADGES = DEFAULT_BADGES;
propertySchema.statics.STATUSES = STATUS_TYPES;
propertySchema.statics.LISTING_MODES = LISTING_MODES;
propertySchema.statics.LISTING_INTENTS = LISTING_INTENTS;
propertySchema.statics.LAND_UNITS = LAND_UNITS;
propertySchema.statics.formatKES = formatKES;
propertySchema.statics.getEffectivePrice = getEffectivePrice;

module.exports = mongoose.model("Property", propertySchema);
