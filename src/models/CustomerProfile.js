const mongoose = require('mongoose');

const customerProfileSchema = new mongoose.Schema({
  favorites: {
    cooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    meals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meal' }]
  }
}, { _id: false });





module.exports = customerProfileSchema;