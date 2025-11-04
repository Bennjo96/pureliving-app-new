// src/models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cleaner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  service: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: ''
  },
  date: {
    type: Date, // Date when the service was performed
    required: true
  },
  isVerified: {
    type: Boolean,
    default: true // Set to true since we only allow reviews from completed bookings
  },
  response: {
    text: String,
    date: Date,
    // Reference to the user who responded (typically the cleaner)
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  reportCount: {
    type: Number,
    default: 0
  },
  isHidden: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for faster queries
ReviewSchema.index({ cleaner: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, createdAt: -1 });
ReviewSchema.index({ booking: 1 });

module.exports = mongoose.model('Review', ReviewSchema);