const mongoose = require('mongoose');

const cookProfileSchema = new mongoose.Schema({
  bio: String,
  cuisineSpecialties: [String]
}, { _id: false });

module.exports = cookProfileSchema;