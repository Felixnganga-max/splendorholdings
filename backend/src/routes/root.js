/**
 * routes/index.js
 *
 * Central route registry. Imports every individual route module and
 * exports them so app.js can mount them at their respective base paths.
 *
 * Base paths (set in app.js):
 *   /api/v1/auth          → authRoutes
 *   /api/v1/properties    → propertyRoutes
 *   /api/v1/orders        → orderRoutes
 *   /api/v1/inquiries     → inquiryRoutes
 *   /api/v1/profile       → profileRoutes
 *   /api/v1/analytics     → analyticsRoutes   (admin only)
 *   /api/v1/admin         → adminRoutes       (admin only)
 */

const authRoutes = require("./auth");
const propertyRoutes = require("./property");
const orderRoutes = require("./orders");
const inquiryRoutes = require("./inquiries");
const categoryRoutes = require("./category");
// const analyticsRoutes = require("./analytics");
// const adminRoutes = require("./aadmin");

module.exports = {
  authRoutes,
  propertyRoutes,
  orderRoutes,
  inquiryRoutes,
  categoryRoutes,
  // profileRoutes,
  // analyticsRoutes,
  // adminRoutes,
};
