
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", },


  type: { type: String, enum: ["order", "meal_pending", "meal_approved", "meal_rejected", "other"], required: true, },


  order: {
    type: mongoose.Schema.Types.ObjectId, ref: "Order",


    required: function () {
      return this.type === "order"; // Required only if type is 'order'
    },
  },
  meal: {
    type: mongoose.Schema.Types.ObjectId, ref: "Meal",

    required: function () {
      return (
        this.type === "meal_pending" ||
        this.type === "meal_approved" ||
        this.type === "meal_rejected"
      );
    }, // Required only if type is meal-related
  },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
