const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    cook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    meals: [
      {
        meal: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Meal",
          required: true,
        },
        quantity: { type: Number, default: 1 },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
    totalPrice: Number,
    deliveryAddress: addressSchema,
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    orderCode: {
      type: String,
      unique: true,

    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
