const Inquiry = require("../models/inquiry");
const Property = require("../models/property");
const {
  success,
  created,
  notFound,
  forbidden,
  paginated,
  badRequest,
} = require("../utils/response");
const { asyncHandler } = require("../utils/errorHandler");
const { getIO } = require("../sockets/sockets");

/**
 * GET /api/v1/inquiries
 * admin/manager — all; user — their own submissions only.
 */
const getInquiries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, type, sort = "-createdAt" } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = {};
  if (!["admin", "manager"].includes(req.user.role)) {
    filter.sender = req.user._id;
  }
  if (status) filter.status = status;
  if (type) filter.type = type;

  const [inquiries, total] = await Promise.all([
    Inquiry.find(filter)
      .populate("property", "name location type")
      .populate("sender", "firstName lastName email phone")
      .populate("assignedTo", "firstName lastName")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Inquiry.countDocuments(filter),
  ]);

  return paginated(
    res,
    { inquiries },
    {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  );
});

/**
 * GET /api/v1/inquiries/:id
 */
const getInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id)
    .populate("property", "name location type price priceLabel")
    .populate("sender", "firstName lastName email phone")
    .populate("replies.repliedBy", "firstName lastName role");

  if (!inquiry) return notFound(res, "Inquiry not found.");

  const isAdminOrManager = ["admin", "manager"].includes(req.user.role);
  const isOwner = inquiry.sender?._id?.toString() === req.user._id.toString();

  if (!isAdminOrManager && !isOwner) {
    return forbidden(res, "Not authorised to view this inquiry.");
  }

  // Mark as read if admin/manager views it
  if (isAdminOrManager && inquiry.status === "unread") {
    inquiry.status = "read";
    await inquiry.save();
  }

  return success(res, { inquiry });
});

/**
 * POST /api/v1/inquiries
 * Public (with optional auth) — submit an inquiry.
 * Guest users provide name/email/phone fields.
 */
const createInquiry = asyncHandler(async (req, res) => {
  const { propertyId, message, type, guestName, guestEmail, guestPhone } =
    req.body;

  const property = await Property.findById(propertyId);
  if (!property) return notFound(res, "Property not found.");

  // Guests must provide contact info
  if (!req.user && !guestEmail) {
    return badRequest(res, "Guest email is required when not logged in.");
  }

  const inquiry = await Inquiry.create({
    property: propertyId,
    sender: req.user?._id,
    guestName,
    guestEmail,
    guestPhone,
    message,
    type: type || "Information",
    senderIP: req.ip,
  });

  await inquiry.populate("property", "name location");

  // Real-time alert to admin/manager rooms
  try {
    const displayName = req.user ? req.user.fullName : guestName || guestEmail;
    getIO()
      .to("role:admin")
      .to("role:manager")
      .emit("inquiry:new", {
        inquiry: {
          id: inquiry._id,
          propertyName: inquiry.property.name,
          type: inquiry.type,
          displayName,
          createdAt: inquiry.createdAt,
        },
      });
  } catch (_) {}

  return created(res, { inquiry }, "Your inquiry has been sent.");
});

/**
 * POST /api/v1/inquiries/:id/reply
 * admin/manager — reply to an inquiry.
 */
const replyToInquiry = asyncHandler(async (req, res) => {
  const { body, channel = "email" } = req.body;

  const inquiry = await Inquiry.findById(req.params.id).populate(
    "sender",
    "firstName lastName email",
  );

  if (!inquiry) return notFound(res, "Inquiry not found.");

  inquiry.replies.push({ body, repliedBy: req.user._id, channel });
  inquiry.status = "replied";
  await inquiry.save();

  // Notify the sender in real-time if they are a registered user
  try {
    if (inquiry.sender) {
      getIO().to(`user:${inquiry.sender._id}`).emit("inquiry:replied", {
        inquiryId: inquiry._id,
        propertyId: inquiry.property,
        message: "You have a new reply to your inquiry.",
      });
    }
  } catch (_) {}

  return success(res, { inquiry }, "Reply sent.");
});

/**
 * PATCH /api/v1/inquiries/:id/assign
 * admin/manager — assign inquiry to a staff member.
 */
const assignInquiry = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const inquiry = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { assignedTo: userId },
    { new: true },
  ).populate("assignedTo", "firstName lastName");

  if (!inquiry) return notFound(res, "Inquiry not found.");
  return success(res, { inquiry }, "Inquiry assigned.");
});

/**
 * PATCH /api/v1/inquiries/:id/archive
 * admin/manager — archive an inquiry.
 */
const archiveInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { status: "archived" },
    { new: true },
  );
  if (!inquiry) return notFound(res, "Inquiry not found.");
  return success(res, { inquiry }, "Inquiry archived.");
});

module.exports = {
  getInquiries,
  getInquiry,
  createInquiry,
  replyToInquiry,
  assignInquiry,
  archiveInquiry,
};
