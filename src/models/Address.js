const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String,
    isMain: { type: Boolean, default: false },
  },
  { _id: true }
);

module.exports = addressSchema;
