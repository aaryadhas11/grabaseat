const mongoose = require('mongoose');

const DEFAULT_SHOWTIMES = [
  "09:30 AM",
  "12:15 PM",
  "03:30 PM",
  "06:00 PM",
  "08:45 PM",
  "11:15 PM"
];

const movieSchema = new mongoose.Schema({
  id: { type: Number },
  title: { type: String, required: true },
  genre: { type: String },
  rating: { type: String },
  price: { type: String }, // matching exact moviesData.js string price fields (e.g. "₹350")
  posterUrl: { type: String, required: true },
  certification: { type: String },
  trailerUrl: { type: String },
  type: { type: String, default: 'movie' },
  trending: { type: Boolean, default: false },
  vibe: { type: String },
  showTime: { type: [String], default: DEFAULT_SHOWTIMES },
  theaters: { type: [String], default: ["PVR Cinemas", "INOX Cineplex", "Cinepolis"] },
  pricing: {
    classic: { type: Number, default: 150 },
    prime: { type: Number, default: 250 },
    recliner: { type: Number, default: 450 }
  },
  blockedSeats: {
    type: [String], // Array of seat IDs blocked by Admin (e.g., ["A1", "F10"])
    default: []
  }
});

module.exports = mongoose.model('Movie', movieSchema);
