// src/models/Service.js
const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  detailedDescription: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    required: true
  },
  features: [String],
  additionalServices: [{
    id: String,
    name: String,
    price: Number,
    duration: String
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  icon: String
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);