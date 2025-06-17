const mongoose = require('mongoose');

const cookProfileSchema = new mongoose.Schema({
  bio: String,
  cuisineSpecialties: [String],
    averageRating: {
    type: Number,
    default: 0.0,
    min: 0,
    max: 5.0,
  },
  totalReviews: { 
    type: Number,
    default: 0,
  },

}, { _id: false });

module.exports = cookProfileSchema;