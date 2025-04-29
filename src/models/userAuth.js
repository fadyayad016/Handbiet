const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String
}, { _id: false });

const cookProfileSchema = new mongoose.Schema({
  bio: String,
  cuisineSpecialties: [String]
}, { _id: false });

const customerProfileSchema = new mongoose.Schema({
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String ,required: true },
  role: { type: String, enum: ['customer', 'cook', 'admin'], required: true },
  firstName: String,
  lastName: String,
  profilePicture: String,
  address: addressSchema,
  cookProfile: cookProfileSchema,
  customerProfile: customerProfileSchema
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
