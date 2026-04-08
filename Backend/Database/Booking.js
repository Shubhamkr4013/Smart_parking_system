const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  slot: String,
  name: String,
  email: String,
  phone: String,
  vehicle: String,
  time: String,
  coupon: String
});

module.exports = mongoose.model("Booking", bookingSchema);