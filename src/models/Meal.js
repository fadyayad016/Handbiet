const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    cook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    cuisineType: String,
    ingredients: [String],
    availability: {
      days: [String],
      availableUntil: Date,
    },
    mainImage: { type: String }, 
    additionalImages: [String],  
    rating: { type: Number, default: 0.0, min: 0, max: 5.0 },
    salesCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'cancelled'],
      default: 'pending'
    },

  },
  { timestamps: true }
);
mealSchema.index({ name: 1, cook: 1, status: 1 }, { unique: true });

module.exports = mongoose.model("Meal", mealSchema);
