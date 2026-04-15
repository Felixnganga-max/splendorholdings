const mongoose = require("mongoose");

const ORDER_STATUSES = [
  "Pending",
  "Under Review",
  "Approved",
  "Completed",
  "Declined",
  "Cancelled",
];

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      // Auto-generated in pre-save
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property is required"],
    },
    // Snapshot price at time of order (property price may change later)
    offeredPrice: {
      type: Number,
      required: [true, "Offered price is required"],
      min: 0,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Buyer is required"],
    },
    // Buyer contact snapshot (in case user changes their details later)
    buyerSnapshot: {
      name: String,
      email: String,
      phone: String,
    },
    status: {
      type: String,
      enum: { values: ORDER_STATUSES, message: "Invalid order status" },
      default: "Pending",
    },
    notes: { type: String, trim: true, maxlength: 1000 },
    // Internal admin/manager notes — never exposed to buyers
    internalNotes: { type: String, trim: true, maxlength: 2000, select: false },

    // Who last actioned the order and when
    actionedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actionedAt: { type: Date },

    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
        note: { type: String, maxlength: 500 },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ buyer: 1 });
orderSchema.index({ property: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// ── Auto-generate order number ─────────────────────────────────────────────────
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

orderSchema.statics.STATUSES = ORDER_STATUSES;

module.exports = mongoose.model("Order", orderSchema);
