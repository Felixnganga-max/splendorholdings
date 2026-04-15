const Category = require("../models/category");
const Property = require("../models/property");
const { success, created, notFound, badRequest } = require("../utils/response");
const { asyncHandler } = require("../utils/errorHandler");

// ─── GET /api/v1/categories ───────────────────────────────────────────────────
// Public — returns active categories, optionally filtered by kind
const getCategories = asyncHandler(async (req, res) => {
  const { kind, includeInactive } = req.query;
  const filter = {};

  if (kind) filter.kind = kind;

  // Only admins/managers may see inactive categories
  const isPrivileged = req.user && ["admin", "manager"].includes(req.user.role);
  if (!isPrivileged || includeInactive !== "true") {
    filter.isActive = true;
  }

  const categories = await Category.find(filter)
    .sort({ kind: 1, sortOrder: 1, label: 1 })
    .lean();

  return success(res, { categories });
});

// ─── POST /api/v1/categories ──────────────────────────────────────────────────
const createCategory = asyncHandler(async (req, res) => {
  const { kind, label, color, icon, sortOrder, description } = req.body;

  const category = await Category.create({
    kind,
    label,
    color: color || null,
    icon: icon || null,
    sortOrder: sortOrder ?? 0,
    description: description || null,
    createdBy: req.user._id,
  });

  return created(res, { category }, "Category created.");
});

// ─── PATCH /api/v1/categories/:id ────────────────────────────────────────────
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return notFound(res, "Category not found.");

  const fields = [
    "label",
    "color",
    "icon",
    "sortOrder",
    "description",
    "isActive",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) category[f] = req.body[f];
  });

  await category.save();
  return success(res, { category }, "Category updated.");
});

// ─── DELETE /api/v1/categories/:id ───────────────────────────────────────────
// Soft-delete (deactivate) if any properties use it; hard delete otherwise.
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return notFound(res, "Category not found.");

  const field = category.kind === "type" ? "type" : "badge";
  const inUseCount = await Property.countDocuments({ [field]: category.label });

  if (inUseCount > 0) {
    // Soft delete — deactivate so it can't be assigned to new properties
    category.isActive = false;
    await category.save();
    return success(
      res,
      { category },
      `Category deactivated (used by ${inUseCount} properties). No properties were changed.`,
    );
  }

  await category.deleteOne();
  return success(res, {}, "Category deleted.");
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
