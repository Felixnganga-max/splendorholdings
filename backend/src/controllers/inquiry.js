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
const {
  sendCustomerAck,
  sendAdminNotification,
  sendReplyToCustomer,
} = require("../utils/emailService");

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/inquiries
// admin/manager → all   |   user → their own submissions
// ─────────────────────────────────────────────────────────────────────────────
const getInquiries = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    type,
    sort = "-createdAt",
    search,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const filter = {};

  if (!["admin", "manager"].includes(req.user.role)) {
    filter.sender = req.user._id;
  }
  if (status) filter.status = status;
  if (type) filter.type = type;

  // Free-text search across guest name / email
  if (search) {
    const re = new RegExp(search, "i");
    filter.$or = [{ guestName: re }, { guestEmail: re }];
  }

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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/inquiries/stats
// admin/manager — unread count + breakdown by type
// ─────────────────────────────────────────────────────────────────────────────
const getInquiryStats = asyncHandler(async (req, res) => {
  const [statusCounts, typeCounts] = await Promise.all([
    Inquiry.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Inquiry.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
  ]);

  const stats = {
    total: 0,
    unread: 0,
    byStatus: {},
    byType: {},
  };

  statusCounts.forEach(({ _id, count }) => {
    stats.byStatus[_id] = count;
    stats.total += count;
    if (_id === "unread") stats.unread = count;
  });

  typeCounts.forEach(({ _id, count }) => {
    stats.byType[_id] = count;
  });

  return success(res, { stats });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/inquiries/:id
// ─────────────────────────────────────────────────────────────────────────────
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

  // Mark as read when admin/manager opens it
  if (isAdminOrManager && inquiry.status === "unread") {
    inquiry.status = "read";
    await inquiry.save();
  }

  return success(res, { inquiry });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/inquiries
// Public (optionalAuth). Accepts both:
//   - Contact form payload: { name, email, phone, message, inquiryType, property? }
//   - Legacy payload:       { guestName, guestEmail, guestPhone, message, type, propertyId? }
// ─────────────────────────────────────────────────────────────────────────────
const createInquiry = asyncHandler(async (req, res) => {
  // ── Normalise field names from contact form ──
  const {
    // Contact.jsx sends these:
    name,
    email,
    phone,
    inquiryType,
    // Legacy / direct API sends these:
    guestName,
    guestEmail,
    guestPhone,
    type,
    // Both:
    message,
    property: propertyId,
  } = req.body;

  const resolvedName = name || guestName || req.user?.firstName || null;
  const resolvedEmail = email || guestEmail || req.user?.email || null;
  const resolvedPhone = phone || guestPhone || null;
  const resolvedType = inquiryType || type || "General Enquiry";

  // Must have at minimum an email to reply to
  if (!resolvedEmail && !req.user) {
    return badRequest(res, "An email address is required.");
  }

  if (!message) {
    return badRequest(res, "Message is required.");
  }

  // ── Optional property lookup ──
  let property = null;
  if (propertyId) {
    property = await Property.findById(propertyId).select("name location");
    if (!property) return notFound(res, "Property not found.");
  }

  // ── Create inquiry ──
  const inquiry = await Inquiry.create({
    property: property?._id || null,
    sender: req.user?._id || null,
    guestName: resolvedName,
    guestEmail: resolvedEmail,
    guestPhone: resolvedPhone,
    message,
    type: resolvedType,
    senderIP: req.ip,
  });

  // ── Fire-and-forget emails (don't block the response) ──
  const customerName = resolvedName || resolvedEmail;
  const customerEmail = resolvedEmail;

  // 1. Customer acknowledgement
  sendCustomerAck({
    name: customerName,
    email: customerEmail,
    message,
    inquiryType: resolvedType,
    property,
  }).catch((err) => console.error("[email] Customer ack failed:", err.message));

  // 2. Admin / Sally notification
  sendAdminNotification({
    name: customerName,
    email: customerEmail,
    phone: resolvedPhone,
    message,
    inquiryType: resolvedType,
    property,
    inquiryId: inquiry._id.toString(),
  }).catch((err) =>
    console.error("[email] Admin notification failed:", err.message),
  );

  await inquiry.populate("property", "name location");

  return created(res, { inquiry }, "Your inquiry has been sent.");
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/inquiries/:id/reply
// admin/manager — reply and send email to customer
// ─────────────────────────────────────────────────────────────────────────────
const replyToInquiry = asyncHandler(async (req, res) => {
  const { body, channel = "email" } = req.body;

  const inquiry = await Inquiry.findById(req.params.id)
    .populate("sender", "firstName lastName email")
    .populate("property", "name location");

  if (!inquiry) return notFound(res, "Inquiry not found.");

  inquiry.replies.push({ body, repliedBy: req.user._id, channel });
  inquiry.status = "replied";
  await inquiry.save();

  // Send email reply to customer if channel is email
  if (channel === "email") {
    const customerEmail = inquiry.sender?.email || inquiry.guestEmail;
    const customerName = inquiry.sender
      ? `${inquiry.sender.firstName} ${inquiry.sender.lastName}`
      : inquiry.guestName || inquiry.guestEmail || "Valued Client";
    const staffName = `${req.user.firstName} ${req.user.lastName}`;

    if (customerEmail) {
      sendReplyToCustomer({
        customerName,
        customerEmail,
        replyBody: body,
        staffName,
        property: inquiry.property,
      }).catch((err) =>
        console.error("[email] Reply send failed:", err.message),
      );
    }
  }

  return success(res, { inquiry }, "Reply sent.");
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/inquiries/:id/assign
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/inquiries/:id/archive
// ─────────────────────────────────────────────────────────────────────────────
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
  getInquiryStats,
  createInquiry,
  replyToInquiry,
  assignInquiry,
  archiveInquiry,
};
