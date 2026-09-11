const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  movieId: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
