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
    ingredients: [String],
    time: {
      timeCook: { type: String },
      timePrep: { type: String },
    },
    addtion: String,
    typeOfMeal: String,
    availability: {
      days: [String],
      availableUntil: Date,
    },
    active: { type: Boolean, default: true },
    images: [
      {
        url: String,
        isMain: { type: Boolean, default: false },
      },
    ],
    cuisineType: String,
    mainImage: { type: String },
    rating: { type: Number, default: 0.0, min: 0, max: 5.0 },
    salesCount: { type: Number, default: 0.0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
);
mealSchema.index({ name: 1, cook: 1, status: 1 }, { unique: true });

module.exports = mongoose.model("Meal", mealSchema);
