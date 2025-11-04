// src/controllers/reviewController.js
const Review = require('../models/Review'); // You'll need to create this model
const Booking = require('../models/Booking');
const User = require('../models/User');

// Get reviews for a specific cleaner
exports.getCleanerReviews = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure the cleaner exists
    const cleaner = await User.findOne({ _id: id, role: 'cleaner' });
    if (!cleaner) {
      return res.status(404).json({
        success: false,
        message: 'Cleaner not found'
      });
    }
    
    // Find reviews for this cleaner
    const reviews = await Review.find({ cleaner: id })
      .sort({ createdAt: -1 })
      .populate('user', 'name profilePicture');
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching cleaner reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cleaner reviews',
      error: error.message
    });
  }
};

// Create a new review for a booking
exports.createReview = async (req, res) => {
  try {
    const { id } = req.params; // Booking ID
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5'
      });
    }
    
    // Find the booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Make sure the booking belongs to the user
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own bookings'
      });
    }
    
    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed bookings'
      });
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({ booking: id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }
    
    // Create the review
    const review = new Review({
      user: req.user.id,
      cleaner: booking.cleaner,
      booking: id,
      service: booking.service,
      rating,
      comment: comment || '',
      date: booking.date // Include the date the service was performed
    });
    
    await review.save();
    
    // Update booking with review information
    booking.hasReview = true;
    booking.reviewId = review._id;
    await booking.save();
    
    // Update cleaner's average rating
    const cleanerReviews = await Review.find({ cleaner: booking.cleaner });
    const totalRating = cleanerReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / cleanerReviews.length;
    
    await User.findByIdAndUpdate(booking.cleaner, { rating: averageRating });
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating review',
      error: error.message
    });
  }
};

// Update an existing review
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5'
      });
    }
    
    // Find the review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Make sure the review belongs to the user
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }
    
    // Check if review is too old to update (e.g., more than 30 days)
    const reviewDate = new Date(review.createdAt);
    const now = new Date();
    const daysDifference = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24));
    
    if (daysDifference > 30) {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be updated within 30 days of creation'
      });
    }
    
    // Update the review
    review.rating = rating;
    review.comment = comment || review.comment;
    review.updatedAt = new Date();
    
    await review.save();
    
    // Update cleaner's average rating
    const cleanerReviews = await Review.find({ cleaner: review.cleaner });
    const totalRating = cleanerReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / cleanerReviews.length;
    
    await User.findByIdAndUpdate(review.cleaner, { rating: averageRating });
    
    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating review',
      error: error.message
    });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if the user is the review owner or an admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }
    
    // Delete the review
    await Review.findByIdAndDelete(id);
    
    // Update the booking to remove the review reference
    await Booking.findByIdAndUpdate(review.booking, { 
      hasReview: false,
      reviewId: null
    });
    
    // Update cleaner's average rating
    const cleanerReviews = await Review.find({ cleaner: review.cleaner });
    let averageRating = 0;
    
    if (cleanerReviews.length > 0) {
      const totalRating = cleanerReviews.reduce((sum, r) => sum + r.rating, 0);
      averageRating = totalRating / cleanerReviews.length;
    }
    
    await User.findByIdAndUpdate(review.cleaner, { rating: averageRating });
    
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review',
      error: error.message
    });
  }
};

// Get all reviews made by the current user
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all reviews made by this user
    const reviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'cleaner',
        select: 'name profilePicture'
      })
      .populate({
        path: 'booking',
        select: 'service date status'
      });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user reviews',
      error: error.message
    });
  }
};

module.exports = exports;