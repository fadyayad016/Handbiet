const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  cook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  cuisineType: String,
  ingredients: [String],
  availability: {
    days: [String],
    availableUntil: Date
  },
  images: [String],
  rating: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Meal', mealSchema);
