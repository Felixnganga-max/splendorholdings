const mongoose = require("mongoose");

// ─── Default seed values ──────────────────────────────────────────────────────
const DEFAULT_TYPES = [
  "Villa",
  "Apartment",
  "Townhouse",
  "Maisonette",
  "Land",
  "Commercial",
  "Condos",
  "Project",
  "Pent House",
  "Duplex House",
  "Triplex House",
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
const LISTING_MODES = ["whole", "unit"];
const LISTING_INTENTS = ["sale", "rent", "both"];
const LAND_UNITS = ["acres", "hectares", "sqm", "sqft"];
const PROJECT_STATUSES = ["in-progress", "complete"];

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
const rentalPricingSchema = new mongoose.Schema(
  {
    rentPerDay: { type: Number, min: 0, default: null },
    rentPerMonth: { type: Number, min: 0, default: null },
    label: { type: String, trim: true, maxlength: 60 },
  },
  { _id: false },
);

// ─── Land area sub-schema ─────────────────────────────────────────────────────
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

// ─── Unit variant sub-schema ──────────────────────────────────────────────────
// Allows a listing to advertise multiple configurations, e.g.:
//   "2 Bedroom" → KES 4.5M  |  "3 Bedroom" → KES 6.2M
const unitVariantSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    }, // e.g. "2 Bedroom Apartment"
    beds: { type: Number, min: 0, default: null },
    baths: { type: Number, min: 0, default: null },
    area: { type: Number, min: 0, default: null }, // m²
    price: { type: Number, min: 0, default: null }, // sale price for this variant
    rentPerMonth: { type: Number, min: 0, default: null },
    rentPerDay: { type: Number, min: 0, default: null },
    notes: { type: String, trim: true, maxlength: 300, default: null },
  },
  { _id: true },
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
    name: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
      maxlength: [120, "Name cannot exceed 120 characters"],
    },

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

    // ── Rich description ───────────────────────────────────────────────────────
    // Stored as plain text using a lightweight markdown-like convention:
    //   - Lines starting with "- " are bullet points
    //   - Blank lines separate paragraphs
    // The frontend renders this into <p> and <ul>/<li> elements.
    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },

    features: [{ type: String, trim: true, maxlength: 80 }],

    // ── Unit variants ──────────────────────────────────────────────────────────
    // Optional array of configurations within one listing.
    // e.g. a block of apartments with 1BR, 2BR, 3BR options.
    unitVariants: { type: [unitVariantSchema], default: [] },

    // ── Listing mode & intent ──────────────────────────────────────────────────
    listingMode: {
      type: String,
      enum: {
        values: LISTING_MODES,
        message: `listingMode must be: ${LISTING_MODES.join(", ")}`,
      },
      default: "whole",
    },

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

    // ── Project-specific fields ────────────────────────────────────────────────
    // Only enforced / displayed when type === "Project"
    projectStatus: {
      type: String,
      enum: {
        values: PROJECT_STATUSES,
        message: `projectStatus must be one of: ${PROJECT_STATUSES.join(", ")}`,
      },
      default: null,
    },

    // ── Admin notes ────────────────────────────────────────────────────────────
    // Internal-only memo visible only to admin/manager roles.
    // Never surfaced in public API responses.
    notes: {
      type: String,
      trim: true,
      maxlength: [3000, "Notes cannot exceed 3000 characters"],
      default: null,
    },

    // ── Specs ──────────────────────────────────────────────────────────────────
    beds: { type: Number, default: 0, min: 0, max: 50 },
    baths: { type: Number, default: 0, min: 0, max: 50 },
    area: { type: Number, min: 0 },

    landArea: { type: landAreaSchema, default: null },

    // ── Pricing ────────────────────────────────────────────────────────────────
    // For Projects, pricing is optional (price may not be set yet).
    pricing: { type: pricingSchema, default: null },
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
  // ── Sale pricing label ──────────────────────────────────────────────────────
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

  // ── projectStatus required for Project type ─────────────────────────────────
  if (this.type === "Project" && !this.projectStatus) {
    return next(new Error("projectStatus is required when type is 'Project'"));
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
propertySchema.index({ projectStatus: 1 });
propertySchema.index({
  name: "text",
  location: "text",
  description: "text",
  buildingName: "text",
  notes: "text",
});

// ─── Statics ──────────────────────────────────────────────────────────────────
propertySchema.statics.DEFAULT_TYPES = DEFAULT_TYPES;
propertySchema.statics.DEFAULT_BADGES = DEFAULT_BADGES;
propertySchema.statics.STATUSES = STATUS_TYPES;
propertySchema.statics.LISTING_MODES = LISTING_MODES;
propertySchema.statics.LISTING_INTENTS = LISTING_INTENTS;
propertySchema.statics.LAND_UNITS = LAND_UNITS;
propertySchema.statics.PROJECT_STATUSES = PROJECT_STATUSES;
propertySchema.statics.formatKES = formatKES;
propertySchema.statics.getEffectivePrice = getEffectivePrice;

module.exports = mongoose.model("Property", propertySchema);
