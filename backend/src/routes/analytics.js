const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getRevenueChart,
  getViewsChart,
  getTrafficSources,
  getTopAreas,
  getOrdersByStatus,
  getInquiryTypes,
} = require("../controllers/analyticsController");

const { protect, authorize } = require("../middleware/auth");

// ─────────────────────────────────────────────────────────────────────────────
// EVERY route in this file is ADMIN ONLY.
// protect → verifies the JWT is valid and the user still exists.
// authorize('admin') → rejects anyone whose role is not 'admin'.
// This double-guard is applied at router level so no individual route
// can accidentally be left unprotected.
// ─────────────────────────────────────────────────────────────────────────────
router.use(protect, authorize("admin"));

// ── GET /api/v1/analytics/dashboard
// Top-level KPI cards: revenue, orders, inquiries, properties, users
router.get("/dashboard", getDashboardStats);

// ── GET /api/v1/analytics/revenue
// Monthly completed-order revenue for the past 12 months (chart data)
router.get("/revenue", getRevenueChart);

// ── GET /api/v1/analytics/views
// Top 10 properties by total view count
router.get("/views", getViewsChart);

// ── GET /api/v1/analytics/traffic
// Traffic source breakdown (Direct / Social / Referral / Paid)
router.get("/traffic", getTrafficSources);

// ── GET /api/v1/analytics/top-areas
// Property performance aggregated by location area
router.get("/top-areas", getTopAreas);

// ── GET /api/v1/analytics/orders-status
// Order counts grouped by status (Pending / Under Review / Approved / Completed…)
router.get("/orders-status", getOrdersByStatus);

// ── GET /api/v1/analytics/inquiry-types
// Inquiry counts grouped by type (Viewing / Price / Offer / Information)
router.get("/inquiry-types", getInquiryTypes);

module.exports = router;
