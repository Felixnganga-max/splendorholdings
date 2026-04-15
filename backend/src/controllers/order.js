const Order = require("../models/order");
const Property = require("../models/property");
const {
  success,
  created,
  notFound,
  forbidden,
  badRequest,
  paginated,
} = require("../utils/response");
const { asyncHandler } = require("../utils/errorHandler");
const { getIO } = require("../sockets/sockets");

/**
 * GET /api/v1/orders
 * admin/manager — all orders; user — only their own.
 */
const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, sort = "-createdAt" } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = {};
  if (!["admin", "manager"].includes(req.user.role)) {
    filter.buyer = req.user._id;
  }
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("property", "name location type priceLabel images")
      .populate("buyer", "firstName lastName email phone")
      .populate("actionedBy", "firstName lastName")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Order.countDocuments(filter),
  ]);

  return paginated(
    res,
    { orders },
    {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  );
});

/**
 * GET /api/v1/orders/:id
 */
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate(
      "property",
      "name location type price priceLabel images beds baths area",
    )
    .populate("buyer", "firstName lastName email phone")
    .populate("actionedBy", "firstName lastName")
    .populate("statusHistory.changedBy", "firstName lastName");

  if (!order) return notFound(res, "Order not found.");

  const isAdminOrManager = ["admin", "manager"].includes(req.user.role);
  const isBuyer = order.buyer._id.toString() === req.user._id.toString();

  if (!isAdminOrManager && !isBuyer) {
    return forbidden(res, "Not authorised to view this order.");
  }

  return success(res, { order });
});

/**
 * POST /api/v1/orders
 * Any authenticated user — place a purchase interest order.
 */
const createOrder = asyncHandler(async (req, res) => {
  const { propertyId, offeredPrice, notes } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) return notFound(res, "Property not found.");
  if (property.status === "sold")
    return badRequest(res, "This property is already sold.");
  if (property.status !== "active")
    return badRequest(res, "This property is not currently available.");

  // Prevent duplicate pending orders on the same property by the same buyer
  const existingOrder = await Order.findOne({
    property: propertyId,
    buyer: req.user._id,
    status: { $in: ["Pending", "Under Review"] },
  });
  if (existingOrder) {
    return badRequest(
      res,
      `You already have an open order (${existingOrder.orderNumber}) for this property.`,
    );
  }

  const order = await Order.create({
    property: propertyId,
    buyer: req.user._id,
    offeredPrice,
    notes,
    buyerSnapshot: {
      name: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
    },
    statusHistory: [
      {
        status: "Pending",
        changedBy: req.user._id,
        note: "Order placed",
      },
    ],
  });

  await order.populate([
    { path: "property", select: "name location type priceLabel" },
    { path: "buyer", select: "firstName lastName email" },
  ]);

  // Real-time notification to admin/manager rooms
  try {
    getIO()
      .to("role:admin")
      .to("role:manager")
      .emit("order:new", {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          propertyName: order.property.name,
          buyerName: order.buyer.firstName + " " + order.buyer.lastName,
          offeredPrice: order.offeredPrice,
          createdAt: order.createdAt,
        },
      });
  } catch (_) {} // Don't fail the HTTP response if socket fails

  return created(
    res,
    { order },
    `Order ${order.orderNumber} placed successfully.`,
  );
});

/**
 * PATCH /api/v1/orders/:id/status
 * admin/manager — update order status.
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const order = await Order.findById(req.params.id)
    .populate("buyer", "firstName lastName email")
    .populate("property", "name");

  if (!order) return notFound(res, "Order not found.");

  const previousStatus = order.status;
  order.status = status;
  order.actionedBy = req.user._id;
  order.actionedAt = new Date();
  order.statusHistory.push({
    status,
    changedBy: req.user._id,
    note: note || `Status changed from ${previousStatus} to ${status}`,
  });

  await order.save();

  // Notify the buyer in real-time
  try {
    getIO().to(`user:${order.buyer._id}`).emit("order:statusUpdated", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      propertyName: order.property.name,
      previousStatus,
      newStatus: status,
    });
  } catch (_) {}

  return success(res, { order }, "Order status updated.");
});

/**
 * PATCH /api/v1/orders/:id/cancel
 * Buyer can cancel their own pending/under-review orders.
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return notFound(res, "Order not found.");

  if (order.buyer.toString() !== req.user._id.toString()) {
    return forbidden(res, "Not authorised to cancel this order.");
  }

  if (!["Pending", "Under Review"].includes(order.status)) {
    return badRequest(
      res,
      `Order cannot be cancelled at status '${order.status}'.`,
    );
  }

  order.status = "Cancelled";
  order.statusHistory.push({
    status: "Cancelled",
    changedBy: req.user._id,
    note: "Cancelled by buyer",
  });
  await order.save();

  return success(res, { order }, "Order cancelled.");
});

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
};
