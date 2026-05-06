const Property = require("../models/property");
const Category = require("../models/category");
const cloudinary = require("../config/cloudinary");
const {
  success,
  created,
  notFound,
  paginated,
  forbidden,
  badRequest,
} = require("../utils/response");
const { asyncHandler, AppError } = require("../utils/errorHandler");
const streamifier = require("streamifier");

// ─── Cloudinary helpers ───────────────────────────────────────────────────────
const uploadToCloudinary = (buffer, folder = "splendor/properties") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

const deleteFromCloudinary = (publicId) =>
  cloudinary.uploader.destroy(publicId);

// ─── Category validation helper ───────────────────────────────────────────────
const getActiveCategoryLabels = async (kind) => {
  const cats = await Category.find({ kind, isActive: true })
    .select("label")
    .lean();
  if (cats.length > 0) return cats.map((c) => c.label);
  return kind === "type" ? Property.DEFAULT_TYPES : Property.DEFAULT_BADGES;
};

// ─── Sale pricing builder ─────────────────────────────────────────────────────
const buildPricing = (body) => {
  const { price, offerPrice, discountPercent, offerExpiresAt, priceLabel } = body;

  if (!price) throw new AppError("price is required for sale listings", 400);
  if (offerPrice != null && discountPercent != null) {
    throw new AppError(
      "Provide either offerPrice or discountPercent — not both.",
      400,
    );
  }

  return {
    original:        Number(price),
    offerPrice:      offerPrice      != null ? Number(offerPrice)      : null,
    discountPercent: discountPercent != null ? Number(discountPercent) : null,
    offerExpiresAt:  offerExpiresAt  ? new Date(offerExpiresAt)        : null,
    label:           priceLabel || null,
  };
};

// ─── Rental pricing builder ───────────────────────────────────────────────────
const buildRentalPricing = (body) => {
  const { rentPerDay, rentPerMonth, rentalLabel } = body;

  if (rentPerDay == null && rentPerMonth == null) {
    throw new AppError(
      "At least one of rentPerDay or rentPerMonth is required for rent listings.",
      400,
    );
  }

  return {
    rentPerDay:   rentPerDay   != null ? Number(rentPerDay)   : null,
    rentPerMonth: rentPerMonth != null ? Number(rentPerMonth) : null,
    label:        rentalLabel || null,
  };
};

// ─── Land area builder ────────────────────────────────────────────────────────
const buildLandArea = (body) => {
  const { landAreaValue, landAreaUnit } = body;
  if (!landAreaValue) return null;

  const validUnits = Property.LAND_UNITS;
  if (!validUnits.includes(landAreaUnit)) {
    throw new AppError(
      `landAreaUnit must be one of: ${validUnits.join(", ")}`,
      400,
    );
  }

  return { value: Number(landAreaValue), unit: landAreaUnit };
};

// ─── Unit variants builder ────────────────────────────────────────────────────
// Accepts a JSON string array from multipart form data.
// Each element: { label, beds?, baths?, area?, price?, rentPerMonth?, rentPerDay?, notes? }
const buildUnitVariants = (raw) => {
  if (!raw) return [];
  try {
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((v) => v && v.label)
      .map((v) => ({
        label:        String(v.label).trim().slice(0, 80),
        beds:         v.beds         != null ? Number(v.beds)         : null,
        baths:        v.baths        != null ? Number(v.baths)        : null,
        area:         v.area         != null ? Number(v.area)         : null,
        price:        v.price        != null ? Number(v.price)        : null,
        rentPerMonth: v.rentPerMonth != null ? Number(v.rentPerMonth) : null,
        rentPerDay:   v.rentPerDay   != null ? Number(v.rentPerDay)   : null,
        notes:        v.notes ? String(v.notes).trim().slice(0, 300)  : null,
      }));
  } catch {
    return [];
  }
};

// ─── Strip notes from public-facing output ────────────────────────────────────
const stripNotes = (property) => {
  if (!property) return property;
  const obj = typeof property.toObject === "function"
    ? property.toObject({ virtuals: true })
    : { ...property };
  delete obj.notes;
  return obj;
};

// ─── Query builder ────────────────────────────────────────────────────────────
const buildPropertyQuery = (queryParams, isPublic = true) => {
  const {
    page = 1,
    limit = 12,
    sort = "-isFeatured -createdAt",
    type,
    badge,
    status,
    minPrice,
    maxPrice,
    search,
    isSoldOut,
    includeHidden,
    isFeatured,
    listingIntent,
    listingMode,
    projectStatus,
  } = queryParams;

  const filter = {};

  if (isPublic) {
    filter.isVisible = true;
    filter.status    = { $in: ["active", "sold"] };
  } else {
    if (includeHidden !== "true") filter.isVisible = true;
    if (status) filter.status = status;
  }

  if (type)          filter.type          = type;
  if (badge)         filter.badge         = badge;
  if (listingIntent) filter.listingIntent = listingIntent;
  if (listingMode)   filter.listingMode   = listingMode;
  if (projectStatus) filter.projectStatus = projectStatus;
  if (isFeatured === "true") filter.isFeatured = true;
  if (isSoldOut  === "true") filter.isSoldOut  = true;
  if (isSoldOut  === "false") filter.isSoldOut = false;

  if (minPrice || maxPrice) {
    filter["pricing.original"] = {};
    if (minPrice) filter["pricing.original"].$gte = Number(minPrice);
    if (maxPrice) filter["pricing.original"].$lte = Number(maxPrice);
  }

  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  return { filter, sort, skip, limit: Number(limit), page: Number(page) };
};

// ─── GET /api/v1/properties ───────────────────────────────────────────────────
const getProperties = asyncHandler(async (req, res) => {
  const isPublic = !req.user || !["admin", "manager"].includes(req.user.role);
  const { filter, sort, skip, limit, page } = buildPropertyQuery(
    req.query,
    isPublic,
  );

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate("listedBy", "firstName lastName email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Property.countDocuments(filter),
  ]);

  // Strip notes from public responses
  const safeProperties = isPublic ? properties.map(stripNotes) : properties;

  return paginated(
    res,
    { properties: safeProperties },
    { page, limit, total, pages: Math.ceil(total / limit) },
  );
});

// ─── GET /api/v1/properties/:id ───────────────────────────────────────────────
const getProperty = asyncHandler(async (req, res) => {
  const isAdminOrManager =
    req.user && ["admin", "manager"].includes(req.user.role);

  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { $inc: { viewCount: 1 } },
    { new: true },
  )
    .populate("listedBy", "firstName lastName email phone")
    .lean({ virtuals: true });

  if (!property) return notFound(res, "Property not found.");

  if (!property.isVisible && !isAdminOrManager) {
    return notFound(res, "Property not found.");
  }

  // Strip notes for public consumers
  const safeProperty = isAdminOrManager ? property : stripNotes(property);

  return success(res, { property: safeProperty });
});

// ─── POST /api/v1/properties ──────────────────────────────────────────────────
const createProperty = asyncHandler(async (req, res) => {
  const {
    name,
    buildingName,
    location,
    beds,
    baths,
    area,
    type,
    badge,
    description,
    features,
    unitVariants,
    notes,
    isFeatured,
    featuredUntil,
    coordinates,
    listingMode   = "whole",
    listingIntent = "sale",
    projectStatus,
  } = req.body;

  const isProject = type === "Project";

  // ── Validate listingMode & listingIntent ───────────────────────────────────
  if (!Property.LISTING_MODES.includes(listingMode)) {
    return badRequest(
      res,
      `listingMode must be one of: ${Property.LISTING_MODES.join(", ")}`,
    );
  }
  if (!Property.LISTING_INTENTS.includes(listingIntent)) {
    return badRequest(
      res,
      `listingIntent must be one of: ${Property.LISTING_INTENTS.join(", ")}`,
    );
  }

  // buildingName required for unit mode
  if (listingMode === "unit" && !buildingName) {
    return badRequest(res, "buildingName is required when listingMode is 'unit'.");
  }

  // ── Project-specific validation ───────────────────────────────────────────
  if (isProject) {
    if (!projectStatus || !Property.PROJECT_STATUSES.includes(projectStatus)) {
      return badRequest(
        res,
        `projectStatus is required for Projects. Valid values: ${Property.PROJECT_STATUSES.join(", ")}`,
      );
    }
  }

  // ── Validate type & badge ──────────────────────────────────────────────────
  const [validTypes, validBadges] = await Promise.all([
    getActiveCategoryLabels("type"),
    getActiveCategoryLabels("badge"),
  ]);

  if (!validTypes.includes(type)) {
    return badRequest(
      res,
      `Invalid property type. Valid types: ${validTypes.join(", ")}`,
    );
  }
  if (badge && !validBadges.includes(badge)) {
    return badRequest(
      res,
      `Invalid badge. Valid badges: ${validBadges.join(", ")}`,
    );
  }

  // ── Sale pricing (optional for Projects) ───────────────────────────────────
  let pricing = null;
  if (listingIntent === "sale" || listingIntent === "both") {
    if (!isProject || req.body.price) {
      // Build pricing only when price is supplied or it's not a Project
      try {
        pricing = buildPricing(req.body);
      } catch (err) {
        return badRequest(res, err.message);
      }
    }
  }

  // ── Rental pricing ─────────────────────────────────────────────────────────
  let rentalPricing = null;
  if (listingIntent === "rent" || listingIntent === "both") {
    try {
      rentalPricing = buildRentalPricing(req.body);
    } catch (err) {
      return badRequest(res, err.message);
    }
  }

  // ── Land area ──────────────────────────────────────────────────────────────
  let landArea = null;
  try {
    landArea = buildLandArea(req.body);
  } catch (err) {
    return badRequest(res, err.message);
  }

  // ── Unit variants ──────────────────────────────────────────────────────────
  const parsedVariants = buildUnitVariants(unitVariants);

  // ── Upload images ──────────────────────────────────────────────────────────
  const images = req.files?.length
    ? await Promise.all(
        req.files.map(async (file, idx) => {
          const result = await uploadToCloudinary(file.buffer);
          return {
            url:       result.secure_url,
            publicId:  result.public_id,
            isPrimary: idx === 0,
          };
        }),
      )
    : [];

  const property = await Property.create({
    name,
    buildingName: buildingName || null,
    location,
    beds,
    baths,
    area,
    type,
    badge:         badge || "New Listing",
    description,
    features: features
      ? Array.isArray(features)
        ? features
        : JSON.parse(features)
      : [],
    unitVariants:  parsedVariants,
    notes:         notes ? String(notes).trim() : null,
    pricing,
    rentalPricing,
    landArea,
    listingMode,
    listingIntent,
    projectStatus: isProject ? projectStatus : null,
    images,
    isFeatured:    isFeatured === "true" || isFeatured === true || false,
    featuredUntil: featuredUntil ? new Date(featuredUntil) : null,
    coordinates:   coordinates  ? JSON.parse(coordinates)  : undefined,
    listedBy:      req.user._id,
  });

  return created(res, { property }, "Property listed successfully.");
});

// ─── PATCH /api/v1/properties/:id ─────────────────────────────────────────────
const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return notFound(res, "Property not found.");

  const isAdminOrManager = ["admin", "manager"].includes(req.user.role);
  if (
    !isAdminOrManager &&
    property.listedBy.toString() !== req.user._id.toString()
  ) {
    return forbidden(res, "You are not authorised to edit this property.");
  }

  // ── Validate type/badge if changed ────────────────────────────────────────
  if (req.body.type || req.body.badge) {
    const [validTypes, validBadges] = await Promise.all([
      getActiveCategoryLabels("type"),
      getActiveCategoryLabels("badge"),
    ]);
    if (req.body.type && !validTypes.includes(req.body.type)) {
      return badRequest(res, `Invalid property type. Valid: ${validTypes.join(", ")}`);
    }
    if (req.body.badge && !validBadges.includes(req.body.badge)) {
      return badRequest(res, `Invalid badge. Valid: ${validBadges.join(", ")}`);
    }
  }

  // ── Validate listingMode / listingIntent changes ───────────────────────────
  if (req.body.listingMode && !Property.LISTING_MODES.includes(req.body.listingMode)) {
    return badRequest(res, `listingMode must be one of: ${Property.LISTING_MODES.join(", ")}`);
  }
  if (req.body.listingIntent && !Property.LISTING_INTENTS.includes(req.body.listingIntent)) {
    return badRequest(res, `listingIntent must be one of: ${Property.LISTING_INTENTS.join(", ")}`);
  }

  const effectiveMode   = req.body.listingMode   ?? property.listingMode;
  const effectiveIntent = req.body.listingIntent  ?? property.listingIntent;
  const effectiveType   = req.body.type           ?? property.type;
  const isProject       = effectiveType === "Project";

  if (effectiveMode === "unit" && !(req.body.buildingName ?? property.buildingName)) {
    return badRequest(res, "buildingName is required when listingMode is 'unit'.");
  }

  // ── Project status validation ──────────────────────────────────────────────
  if (req.body.projectStatus !== undefined) {
    if (!Property.PROJECT_STATUSES.includes(req.body.projectStatus)) {
      return badRequest(
        res,
        `projectStatus must be one of: ${Property.PROJECT_STATUSES.join(", ")}`,
      );
    }
  }
  // Enforce projectStatus required if switching type to Project
  if (isProject && !req.body.projectStatus && !property.projectStatus) {
    return badRequest(res, "projectStatus is required when type is 'Project'.");
  }

  // ── Scalar fields ──────────────────────────────────────────────────────────
  const scalarFields = [
    "name", "buildingName", "location", "beds", "baths", "area",
    "type", "badge", "description", "features", "status",
    "isFeatured", "featuredUntil", "listingMode", "listingIntent",
    "projectStatus",
  ];
  scalarFields.forEach((field) => {
    if (req.body[field] !== undefined) property[field] = req.body[field];
  });

  // ── Notes (admin/manager only) ─────────────────────────────────────────────
  if (req.body.notes !== undefined && isAdminOrManager) {
    property.notes = req.body.notes ? String(req.body.notes).trim() : null;
  }

  // ── Unit variants ──────────────────────────────────────────────────────────
  if (req.body.unitVariants !== undefined) {
    property.unitVariants = buildUnitVariants(req.body.unitVariants);
  }

  // ── Visibility toggle ──────────────────────────────────────────────────────
  if (req.body.isVisible !== undefined) {
    property.isVisible = req.body.isVisible === "true" || req.body.isVisible === true;
  }

  // ── Sold Out toggle ────────────────────────────────────────────────────────
  if (req.body.isSoldOut !== undefined) {
    const soldOut = req.body.isSoldOut === "true" || req.body.isSoldOut === true;
    property.isSoldOut = soldOut;
    if (soldOut && !property.soldAt) property.soldAt = new Date();
    if (!soldOut) property.soldAt = null;
  }

  // ── Sale pricing update ────────────────────────────────────────────────────
  const salePricingFields = ["price", "offerPrice", "discountPercent", "offerExpiresAt", "priceLabel"];
  const hasSaleUpdate =
    salePricingFields.some((f) => req.body[f] !== undefined) || req.body.clearOffer;

  if (hasSaleUpdate && (effectiveIntent === "sale" || effectiveIntent === "both")) {
    // For Projects, only build pricing if a price value is actually provided
    if (!isProject || (req.body.price ?? property.pricing?.original)) {
      try {
        const merged = {
          price:           req.body.price           ?? property.pricing?.original,
          offerPrice:      req.body.offerPrice      !== undefined ? req.body.offerPrice      : property.pricing?.offerPrice,
          discountPercent: req.body.discountPercent !== undefined ? req.body.discountPercent : property.pricing?.discountPercent,
          offerExpiresAt:  req.body.offerExpiresAt  !== undefined ? req.body.offerExpiresAt  : property.pricing?.offerExpiresAt,
          priceLabel:      req.body.priceLabel      !== undefined ? req.body.priceLabel      : property.pricing?.label,
        };
        if (req.body.clearOffer === "true" || req.body.clearOffer === true) {
          merged.offerPrice = null; merged.discountPercent = null;
          merged.offerExpiresAt = null; merged.priceLabel = null;
        }
        property.pricing = buildPricing(merged);
      } catch (err) {
        return badRequest(res, err.message);
      }
    }
  }

  // ── Rental pricing update ──────────────────────────────────────────────────
  const rentalFields   = ["rentPerDay", "rentPerMonth", "rentalLabel"];
  const hasRentalUpdate = rentalFields.some((f) => req.body[f] !== undefined);

  if (hasRentalUpdate && (effectiveIntent === "rent" || effectiveIntent === "both")) {
    try {
      const merged = {
        rentPerDay:   req.body.rentPerDay   !== undefined ? req.body.rentPerDay   : property.rentalPricing?.rentPerDay,
        rentPerMonth: req.body.rentPerMonth !== undefined ? req.body.rentPerMonth : property.rentalPricing?.rentPerMonth,
        rentalLabel:  req.body.rentalLabel  !== undefined ? req.body.rentalLabel  : property.rentalPricing?.label,
      };
      property.rentalPricing = buildRentalPricing(merged);
    } catch (err) {
      return badRequest(res, err.message);
    }
  }

  // ── Land area update ───────────────────────────────────────────────────────
  if (req.body.landAreaValue !== undefined || req.body.landAreaUnit !== undefined) {
    try {
      property.landArea = buildLandArea({
        landAreaValue: req.body.landAreaValue ?? property.landArea?.value,
        landAreaUnit:  req.body.landAreaUnit  ?? property.landArea?.unit,
      });
    } catch (err) {
      return badRequest(res, err.message);
    }
  }

  // ── New image uploads ──────────────────────────────────────────────────────
  if (req.files?.length) {
    const newImages = await Promise.all(
      req.files.map(async (file) => {
        const result = await uploadToCloudinary(file.buffer);
        return { url: result.secure_url, publicId: result.public_id };
      }),
    );
    property.images.push(...newImages);
  }

  await property.save();
  return success(
    res,
    { property: property.toObject({ virtuals: true }) },
    "Property updated.",
  );
});

// ─── PATCH /api/v1/properties/:id/visibility ─────────────────────────────────
const toggleVisibility = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return notFound(res, "Property not found.");
  property.isVisible = !property.isVisible;
  await property.save();
  return success(
    res,
    { isVisible: property.isVisible },
    `Property is now ${property.isVisible ? "visible" : "hidden"}.`,
  );
});

// ─── PATCH /api/v1/properties/:id/sold-out ───────────────────────────────────
const toggleSoldOut = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return notFound(res, "Property not found.");
  property.isSoldOut = !property.isSoldOut;
  if (property.isSoldOut) {
    property.soldAt  = new Date();
    property.status  = "sold";
  } else {
    property.soldAt  = null;
    property.status  = "active";
  }
  await property.save();
  return success(
    res,
    { isSoldOut: property.isSoldOut, status: property.status },
    `Property marked as ${property.isSoldOut ? "sold out" : "available"}.`,
  );
});

// ─── PATCH /api/v1/properties/:id/offer ──────────────────────────────────────
const setOffer = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return notFound(res, "Property not found.");

  const { discountPercent, offerPrice, offerExpiresAt, clearOffer } = req.body;

  if (clearOffer === true || clearOffer === "true") {
    property.pricing.offerPrice      = null;
    property.pricing.discountPercent = null;
    property.pricing.offerExpiresAt  = null;
    property.pricing.label           = null;
  } else {
    if (offerPrice != null && discountPercent != null) {
      return badRequest(res, "Provide either offerPrice or discountPercent — not both.");
    }
    if (offerPrice      != null) property.pricing.offerPrice      = Number(offerPrice);
    if (discountPercent != null) property.pricing.discountPercent = Number(discountPercent);
    if (offerExpiresAt)          property.pricing.offerExpiresAt  = new Date(offerExpiresAt);
    property.pricing.label = null;
  }

  property.markModified("pricing");
  await property.save();
  return success(
    res,
    { pricing: property.toObject({ virtuals: true }).pricing },
    clearOffer ? "Offer removed." : "Offer applied.",
  );
});

// ─── DELETE /api/v1/properties/:id ───────────────────────────────────────────
const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return notFound(res, "Property not found.");
  if (property.images?.length) {
    await Promise.all(
      property.images.map((img) => deleteFromCloudinary(img.publicId)),
    );
  }
  await property.deleteOne();
  return success(res, {}, "Property deleted.");
});

// ─── DELETE /api/v1/properties/:id/images/:imageId ───────────────────────────
const removePropertyImage = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return notFound(res, "Property not found.");
  const image = property.images.id(req.params.imageId);
  if (!image) return notFound(res, "Image not found.");
  await deleteFromCloudinary(image.publicId);
  property.images = property.images.filter(
    (img) => img._id.toString() !== req.params.imageId,
  );
  await property.save();
  return success(res, { property }, "Image removed.");
});

module.exports = {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  toggleVisibility,
  toggleSoldOut,
  setOffer,
  deleteProperty,
  removePropertyImage,
};