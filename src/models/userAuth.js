
const mongoose = require('mongoose');
const addressSchema = require('./Address');
const cookProfileSchema = require('./CookProfile');
const customerProfileSchema = require('./CustomerProfile');


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: { type: String },
  role: { type: String, enum: ['customer', 'cook', 'admin'], required: true }, 
  firstName: String,
  lastName: String,
  profilePicture: String,
  address: addressSchema,
  cookProfile: cookProfileSchema,
  customerProfile: customerProfileSchema
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
