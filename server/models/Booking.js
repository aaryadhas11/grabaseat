const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  movieId: {
    type: String,
    required: true
  },
  movieTitle: {
    type: String,
    required: true
  },
  // Added to support the new timing logic
  showTime: {
    type: String,
    required: true
  },
  selectedSeats: {
    type: [String],
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  theater: {
    type: String,
    default: "GrabASeat Cinema"
  },
  bookingDate: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);