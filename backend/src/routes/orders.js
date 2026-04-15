const express = require("express");
const router = express.Router();

const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/order");

const { protect, authorize } = require("../middleware/auth");
const {
  createOrderRules,
  updateOrderStatusRules,
  mongoIdRule,
  paginationRules,
  validate,
} = require("../utils/validators");

// All order routes require a valid JWT
router.use(protect);

// ── GET /api/v1/orders
// admin/manager → all orders | user → own orders only (scoped in controller)
router.get("/", paginationRules, validate, getOrders);

// ── GET /api/v1/orders/:id
router.get("/:id", mongoIdRule, validate, getOrder);

// ── POST /api/v1/orders
// Any authenticated user can place a purchase-interest order
router.post("/", createOrderRules, validate, createOrder);

// ── PATCH /api/v1/orders/:id/status
// admin or manager only — move order through the workflow
router.patch(
  "/:id/status",
  authorize("admin", "manager"),
  mongoIdRule,
  updateOrderStatusRules,
  validate,
  updateOrderStatus,
);

// ── PATCH /api/v1/orders/:id/cancel
// Buyer can cancel their own pending/under-review order
router.patch("/:id/cancel", mongoIdRule, validate, cancelOrder);

module.exports = router;
