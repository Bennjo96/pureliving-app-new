// src/controllers/cleanerController.js
const User = require("../models/User");
const Booking = require("../models/Booking");
const Review = require('../models/Review');
const Notification = require('../models/Notification');

// Get cleaner dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const cleanerId = req.user.id;

    // Make sure the user is a cleaner
    const cleaner = await User.findById(cleanerId);
    if (!cleaner || !cleaner.roles.includes("cleaner")) {
      return res.status(403).json({
        success: false,
        message: "Access denied. User is not a cleaner.",
      });
    }

    // Get today's jobs
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaysJobs = await Booking.countDocuments({
      cleaner: cleanerId,
      date: { $gte: todayStart, $lte: todayEnd },
      status: { $nin: ["cancelled", "no-show"] },
    });

    // Get upcoming jobs (future bookings)
    const upcomingJobs = await Booking.countDocuments({
      cleaner: cleanerId,
      date: { $gt: todayEnd },
      status: { $nin: ["cancelled", "no-show", "completed"] },
    });

    // Calculate total working hours
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(
      currentYear,
      currentMonth + 1,
      0,
      23,
      59,
      59,
      999
    );

    const monthlyBookings = await Booking.find({
      cleaner: cleanerId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
      status: "completed",
    });

    const workingHours = monthlyBookings.reduce(
      (total, booking) => total + (booking.duration || 0),
      0
    );

    // Calculate monthly earnings
    const monthlyEarnings = monthlyBookings.reduce(
      (total, booking) => total + (booking.price || 0),
      0
    );

    // Get average rating
    const allCompletedBookings = await Booking.find({
      cleaner: cleanerId,
      status: "completed",
      "review.rating": { $exists: true },
    });

    const totalRatings = allCompletedBookings.length;
    const averageRating =
      totalRatings > 0
        ? allCompletedBookings.reduce(
            (sum, booking) => sum + (booking.review?.rating || 0),
            0
          ) / totalRatings
        : 0;

    // Get total completed jobs (lifetime)
    const totalCompletedJobs = await Booking.countDocuments({
      cleaner: cleanerId,
      status: "completed",
    });

    res.status(200).json({
      success: true,
      data: {
        todaysJobs,
        upcomingJobs,
        workingHours,
        monthlyEarnings,
        rating: averageRating.toFixed(1),
        totalBookings: monthlyBookings.length,
        totalCompletedJobs,
        thisMonthJobs: monthlyBookings.length,
      },
    });
  } catch (error) {
    console.error("Error fetching cleaner dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
      error: error.message,
    });
  }
};

// Get cleaner jobs
exports.getJobs = async (req, res) => {
  try {
    const cleanerId = req.user.id;
    const {
      status,
      dateFrom,
      dateTo,
      sortBy = "date",
      sortOrder = "asc",
    } = req.query;

    // Create query object
    let query = { cleaner: cleanerId };

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add date range filter if provided
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        query.date.$gte = fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        query.date.$lte = toDate;
      }
    }

    // Determine sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Find bookings
    const jobs = await Booking.find(query)
      .sort(sortOptions)
      .populate("user", "name email phone")
      .populate("location", "address city state zipCode");

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching cleaner jobs:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching jobs",
      error: error.message,
    });
  }
};

// Get job details
exports.getJobDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanerId = req.user.id;

    // Find the booking
    const job = await Booking.findOne({
      _id: id,
      cleaner: cleanerId,
    })
      .populate("user", "name email phone profilePicture")
      .populate("location", "address city state zipCode coordinates")
      .populate("service", "name description price duration");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or not assigned to this cleaner",
      });
    }

    // Get additional client info
    const clientBookingHistory = await Booking.countDocuments({
      user: job.user._id,
      cleaner: cleanerId,
      status: "completed",
    });

    const enhancedJobDetails = {
      ...job.toObject(),
      clientInfo: {
        ...job.user.toObject(),
        bookingHistory: clientBookingHistory,
      },
    };

    res.status(200).json({
      success: true,
      data: enhancedJobDetails,
    });
  } catch (error) {
    console.error("Error fetching job details:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching job details",
      error: error.message,
    });
  }
};

// Update job status
exports.updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, completionPhotos } = req.body;
    const cleanerId = req.user.id;

    // Validate input
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // Find and update the booking
    const job = await Booking.findOne({
      _id: id,
      cleaner: cleanerId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or not assigned to this cleaner",
      });
    }

    // Check if status transition is valid
    const validTransitions = {
      pending: ["accepted", "rejected"],
      accepted: ["en-route", "cancelled"],
      "en-route": ["in-progress", "cancelled", "no-show"],
      "in-progress": ["completed", "cancelled"],
      completed: ["completed"], // Cannot change from completed
      cancelled: ["cancelled"], // Cannot change from cancelled
      rejected: ["rejected"], // Cannot change from rejected
      "no-show": ["no-show"], // Cannot change from no-show
    };

    if (!validTransitions[job.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from '${job.status}' to '${status}'`,
      });
    }

    // Update job
    job.status = status;
    if (notes) job.notes = notes;

    // Status-specific updates
    if (status === "en-route") {
      job.enRouteAt = new Date();
    } else if (status === "in-progress") {
      job.startedAt = new Date();
    } else if (status === "completed") {
      job.completedAt = new Date();
      if (completionPhotos && Array.isArray(completionPhotos)) {
        job.completionPhotos = completionPhotos;
      }
    } else if (status === "no-show") {
      job.noShowAt = new Date();
    }

    await job.save();

    res.status(200).json({
      success: true,
      message: "Job status updated successfully",
      data: job,
    });
  } catch (error) {
    console.error("Error updating job status:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating job status",
      error: error.message,
    });
  }
};

// Get cleaner availability
exports.getAvailability = async (req, res) => {
  try {
    const cleanerId = req.user.id;

    const cleaner = await User.findById(cleanerId);
    if (!cleaner) {
      return res.status(404).json({
        success: false,
        message: "Cleaner not found",
      });
    }

    res.status(200).json({
      success: true,
      data: cleaner.availability || {
        weeklySchedule: [
          { day: "monday", available: true, slots: ["9:00-17:00"] },
          { day: "tuesday", available: true, slots: ["9:00-17:00"] },
          { day: "wednesday", available: true, slots: ["9:00-17:00"] },
          { day: "thursday", available: true, slots: ["9:00-17:00"] },
          { day: "friday", available: true, slots: ["9:00-17:00"] },
          { day: "saturday", available: false, slots: [] },
          { day: "sunday", available: false, slots: [] },
        ],
        timeOff: [],
      },
    });
  } catch (error) {
    console.error("Error fetching cleaner availability:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching availability",
      error: error.message,
    });
  }
};

// Update cleaner availability
exports.updateAvailability = async (req, res) => {
  try {
    const cleanerId = req.user.id;
    const { weeklySchedule, timeOff } = req.body;

    // Validate input
    if (!weeklySchedule) {
      return res.status(400).json({
        success: false,
        message: "Weekly schedule is required",
      });
    }

    // Ensure timeOff dates are properly formatted
    let formattedTimeOff = [];
    if (timeOff && Array.isArray(timeOff)) {
      formattedTimeOff = timeOff.map((time) => ({
        startDate: new Date(time.startDate),
        endDate: new Date(time.endDate),
        reason: time.reason || "Personal",
      }));
    }

    // Normalise weeklySchedule: derive startHour / endHour from the first slot
    // when they are not explicitly provided, keeping both formats in sync for
    // the assignment algorithm (which reads startHour/endHour) and the UI
    // (which reads slots strings like "09:00-17:00").
    const normalisedSchedule = weeklySchedule.map((entry) => {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = entry.dayOfWeek != null
        ? entry.dayOfWeek
        : dayNames.indexOf((entry.day || '').toLowerCase());

      let { startHour, endHour } = entry;

      if (entry.available && entry.slots && entry.slots.length > 0) {
        const firstSlot = entry.slots[0]; // e.g. "09:00-17:00"
        const parts = firstSlot.split('-');
        if (parts.length === 2) {
          if (startHour == null) startHour = parseInt(parts[0].split(':')[0], 10);
          if (endHour   == null) endHour   = parseInt(parts[1].split(':')[0], 10);
        }
      }

      return { ...entry, dayOfWeek, startHour, endHour };
    });

    // Update cleaner
    const cleaner = await User.findByIdAndUpdate(
      cleanerId,
      {
        availability: {
          weeklySchedule: normalisedSchedule,
          timeOff: formattedTimeOff,
        },
      },
      { new: true }
    );

    if (!cleaner) {
      return res.status(404).json({
        success: false,
        message: "Cleaner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data: cleaner.availability,
    });
  } catch (error) {
    console.error("Error updating cleaner availability:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating availability",
      error: error.message,
    });
  }
};

// Get reviews for the current cleaner
exports.getCleanerReviews = async (req, res) => {
  try {
    const cleanerId = req.user.id;

    // Find reviews for this cleaner
    const reviews = await Review.find({ cleaner: cleanerId })
      .sort({ createdAt: -1 })
      .populate("user", "name profilePicture")
      .populate("booking", "service date");

    // Enhanced implementation with tagging
    const keywordCategories = {
      cleanliness: {
        positive: ["clean", "spotless", "thorough", "meticulous", "detailed"],
        negative: ["missed", "dirty", "incomplete", "messy", "dusty"],
      },
      communication: {
        positive: [
          "responsive",
          "communicative",
          "friendly",
          "professional",
          "polite",
        ],
        negative: [
          "unresponsive",
          "rude",
          "communication",
          "unprofessional",
          "unfriendly",
        ],
      },
      reliability: {
        positive: [
          "punctual",
          "on-time",
          "reliable",
          "consistent",
          "dependable",
        ],
        negative: ["late", "missed", "unreliable", "no-show", "inconsistent"],
      },
      efficiency: {
        positive: ["quick", "efficient", "fast", "effective", "productive"],
        negative: ["slow", "inefficient", "wasteful", "careless", "rushed"],
      },
      value: {
        positive: ["worth", "value", "affordable", "reasonable", "fair"],
        negative: [
          "expensive",
          "overpriced",
          "costly",
          "not worth",
          "poor value",
        ],
      },
    };

    // Format reviews for frontend
    const formattedReviews = reviews.map((review) => {
      const comment = review.comment ? review.comment.toLowerCase() : "";
      const tags = [];
      const improvementAreas = [];

      // Extract tags and improvement areas based on keywords
      Object.entries(keywordCategories).forEach(([category, keywords]) => {
        keywords.positive.forEach((keyword) => {
          if (comment.includes(keyword)) {
            tags.push(keyword);
          }
        });

        keywords.negative.forEach((keyword) => {
          if (comment.includes(keyword)) {
            improvementAreas.push(keyword);
          }
        });
      });

      return {
        id: review._id,
        customerName: review.user ? review.user.name : "Anonymous",
        rating: review.rating,
        comment: review.comment,
        date: review.date,
        serviceType: review.service,
        response: review.response ? review.response.text : null,
        respondedAt: review.response ? review.response.date : null,
        tags: [...new Set(tags)], // Remove duplicates
        improvementAreas: [...new Set(improvementAreas)], // Remove duplicates
      };
    });

    res.status(200).json({
      success: true,
      data: formattedReviews,
    });
  } catch (error) {
    console.error("Error fetching cleaner reviews:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching reviews",
      error: error.message,
    });
  }
};

exports.getCleanerReviewStats = async (req, res) => {
  try {
    const cleanerId = req.user.id;

    // Find all reviews for this cleaner
    const reviews = await Review.find({ cleaner: cleanerId });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Calculate rating distribution
    const ratingDistribution = [0, 0, 0, 0, 0]; // For ratings 1-5
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[review.rating - 1]++;
      }
    });

    // Enhanced keyword categorization
    const keywordCategories = {
      cleanliness: {
        positive: ["clean", "spotless", "thorough", "meticulous", "detailed"],
        negative: ["missed", "dirty", "incomplete", "messy", "dusty"],
      },
      communication: {
        positive: [
          "responsive",
          "communicative",
          "friendly",
          "professional",
          "polite",
        ],
        negative: [
          "unresponsive",
          "rude",
          "communication",
          "unprofessional",
          "unfriendly",
        ],
      },
      reliability: {
        positive: [
          "punctual",
          "on-time",
          "reliable",
          "consistent",
          "dependable",
        ],
        negative: ["late", "missed", "unreliable", "no-show", "inconsistent"],
      },
      efficiency: {
        positive: ["quick", "efficient", "fast", "effective", "productive"],
        negative: ["slow", "inefficient", "wasteful", "careless", "rushed"],
      },
      value: {
        positive: ["worth", "value", "affordable", "reasonable", "fair"],
        negative: [
          "expensive",
          "overpriced",
          "costly",
          "not worth",
          "poor value",
        ],
      },
    };

    // Count keyword occurrences
    const keywordCounts = {};
    const improvementCounts = {};

    reviews.forEach((review) => {
      const comment = review.comment ? review.comment.toLowerCase() : "";

      // Process each category
      Object.entries(keywordCategories).forEach(([category, keywords]) => {
        // Count positive keywords
        keywords.positive.forEach((keyword) => {
          if (comment.includes(keyword)) {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
          }
        });

        // Count negative keywords
        keywords.negative.forEach((keyword) => {
          if (comment.includes(keyword)) {
            improvementCounts[keyword] = (improvementCounts[keyword] || 0) + 1;
          }
        });
      });
    });

    // Format the results
    const commonTags = Object.entries(keywordCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 positive traits

    const improvementAreas = Object.entries(improvementCounts)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 areas to improve

    const stats = {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution,
      commonTags,
      improvementAreas,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching cleaner review stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching review statistics",
      error: error.message,
    });
  }
};

exports.respondToReview = async (req, res) => {
  try {
    const cleanerId = req.user.id;
    const { reviewId } = req.params;
    const { response } = req.body;

    if (!response || !response.trim()) {
      return res.status(400).json({
        success: false,
        message: "Response text is required",
      });
    }

    // Find the review
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if the cleaner is responding to a review about themselves
    if (review.cleaner.toString() !== cleanerId) {
      return res.status(403).json({
        success: false,
        message: "You can only respond to your own reviews",
      });
    }

    // Add or update the response
    review.response = {
      text: response,
      date: new Date(),
      responder: cleanerId,
    };

    await review.save();

    // Notify the customer who left the review
    await Notification.create({
      recipient: review.user,
      type: 'booking',
      title: 'Your Review Received a Response',
      message: `The cleaner has responded to your review.`,
      relatedId: review._id,
      relatedModel: 'Booking',
      link: `/customer/reviews`
    }).catch(err => console.error('Error creating review response notification:', err));

    res.status(200).json({
      success: true,
      message: "Response added successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error responding to review:", error);
    res.status(500).json({
      success: false,
      message: "Server error while responding to review",
      error: error.message,
    });
  }
};

// Add service update method
exports.updateServices = async (req, res) => {
  try {
    const cleanerId = req.user.id;
    const { services } = req.body;

    if (!Array.isArray(services)) {
      return res.status(400).json({
        success: false,
        message: "Services must be an array",
      });
    }

    const updatedCleaner = await User.findByIdAndUpdate(
      cleanerId,
      { services },
      { new: true, runValidators: false }
    );

    if (!updatedCleaner) {
      return res.status(404).json({
        success: false,
        message: "Cleaner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Services updated successfully",
    });
  } catch (error) {
    console.error("Error updating services:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating services",
    });
  }
};

/**
 * Get the cleaner's own profile
 * @route GET /api/cleaner/profile
 * @access Private (Cleaner only)
 */
exports.getCleanerProfile = async (req, res) => {
  try {
    // The user ID comes from the auth middleware
    const userId = req.user.id;

    // Find the user with their cleaner information
    const user = await User.findById(userId).select(
      "name email roles bio profilePicture availability serviceAreas services rating"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return the profile data
    return res.status(200).json({
      success: true,
      data: {
        user: user,
      },
    });
  } catch (error) {
    console.error("Error fetching cleaner profile:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching profile",
    });
  }
};

/**
 * Update the cleaner's profile
 * @route PUT /api/cleaner/profile
 * @access Private (Cleaner only)
 */
exports.updateCleanerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fields that a cleaner can update about themselves
    const updateFields = {};

    // Only include fields that are present in the request
    if (req.body.bio !== undefined) updateFields.bio = req.body.bio;
    if (req.body.profilePicture !== undefined)
      updateFields.profilePicture = req.body.profilePicture;
    if (req.body.services !== undefined)
      updateFields.services = req.body.services;
    if (req.body.serviceAreas !== undefined)
      updateFields.serviceAreas = req.body.serviceAreas;

    // Update the user document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select(
      "name email roles bio profilePicture availability serviceAreas services rating"
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Error updating cleaner profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// Get public cleaner profile
exports.getPublicCleanerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Find cleaner - update role check to use roles array
    const cleaner = await User.findOne({
      _id: id,
      roles: { $in: ["cleaner"] }, // Changed from role: 'cleaner' to check roles array
    }).select(
      "name email profilePicture bio rating serviceAreas services experience certifications languages"
    );

    if (!cleaner) {
      return res.status(404).json({
        success: false,
        message: "Cleaner not found",
      });
    }

    // Get completed bookings count
    const completedBookings = await Booking.countDocuments({
      cleaner: id,
      status: "completed",
    });

    // Get reviews
    const reviews = await Booking.find({
      cleaner: id,
      status: "completed",
      "review.rating": { $exists: true },
    })
      .select("review user date service")
      .sort({ "review.createdAt": -1 })
      .limit(10)
      .populate("user", "name profilePicture")
      .populate("service", "name");

    // Calculate average ratings by category
    const allReviews = await Booking.find({
      cleaner: id,
      status: "completed",
      "review.rating": { $exists: true },
    }).select("review");

    const ratingCategories = {
      overall: 0,
      reliability: 0,
      quality: 0,
      communication: 0,
      value: 0,
    };

    if (allReviews.length > 0) {
      allReviews.forEach((booking) => {
        ratingCategories.overall += booking.review.rating || 0;
        ratingCategories.reliability +=
          booking.review.reliabilityRating || booking.review.rating || 0;
        ratingCategories.quality +=
          booking.review.qualityRating || booking.review.rating || 0;
        ratingCategories.communication +=
          booking.review.communicationRating || booking.review.rating || 0;
        ratingCategories.value +=
          booking.review.valueRating || booking.review.rating || 0;
      });

      Object.keys(ratingCategories).forEach((key) => {
        ratingCategories[key] = (
          ratingCategories[key] / allReviews.length
        ).toFixed(1);
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...cleaner.toObject(),
        completedBookings,
        ratings: ratingCategories,
        reviews: reviews.map((booking) => ({
          rating: booking.review.rating,
          comment: booking.review.comment,
          date: booking.review.createdAt || booking.date,
          user: booking.user,
          service: booking.service?.name || "Cleaning Service",
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching cleaner profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching cleaner profile",
      error: error.message,
    });
  }
};

// Update cleaner profile
exports.updateProfile = async (req, res) => {
  try {
    const cleanerId = req.user.id;
    const {
      bio,
      serviceAreas,
      services,
      experience,
      certifications,
      languages,
      hourlyRate,
    } = req.body;

    // Find and update the cleaner
    const updatedCleaner = await User.findByIdAndUpdate(
      cleanerId,
      {
        bio,
        serviceAreas,
        services,
        experience,
        certifications,
        languages,
        hourlyRate,
      },
      { new: true, runValidators: true }
    );

    if (!updatedCleaner) {
      return res.status(404).json({
        success: false,
        message: "Cleaner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        bio: updatedCleaner.bio,
        serviceAreas: updatedCleaner.serviceAreas,
        services: updatedCleaner.services,
        experience: updatedCleaner.experience,
        certifications: updatedCleaner.certifications,
        languages: updatedCleaner.languages,
        hourlyRate: updatedCleaner.hourlyRate,
      },
    });
  } catch (error) {
    console.error("Error updating cleaner profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: error.message,
    });
  }
};

// Get cleaner earnings
exports.getEarnings = async (req, res) => {
  try {
    const cleanerId = req.user.id;
    const { period } = req.query;

    let startDate, endDate;
    const now = new Date();

    // Set date range based on period
    switch (period) {
      case "week":
        // Start of current week (Sunday)
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        break;
      case "month":
        // Start of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now);
        break;
      case "year":
        // Start of current year
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now);
        break;
      default:
        // Last 30 days by default
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        endDate = new Date(now);
    }

    // Find completed bookings in the date range
    const bookings = await Booking.find({
      cleaner: cleanerId,
      status: "completed",
      completedAt: { $gte: startDate, $lte: endDate },
    }).sort({ completedAt: -1 });

    // Calculate earnings
    const totalEarnings = bookings.reduce(
      (total, booking) => total + (booking.price || 0),
      0
    );

    // Group earnings by day/week/month based on period
    let earningsBreakdown = [];

    if (period === "week" || period === "month") {
      // Group by day for week and month views
      const groupedByDay = {};
      bookings.forEach((booking) => {
        const day = booking.completedAt.toISOString().split("T")[0];
        if (!groupedByDay[day]) {
          groupedByDay[day] = { date: day, earnings: 0, count: 0 };
        }
        groupedByDay[day].earnings += booking.price || 0;
        groupedByDay[day].count += 1;
      });
      earningsBreakdown = Object.values(groupedByDay);
    } else if (period === "year") {
      // Group by month for year view
      const groupedByMonth = {};
      bookings.forEach((booking) => {
        const month = booking.completedAt.toISOString().substring(0, 7); // YYYY-MM
        if (!groupedByMonth[month]) {
          groupedByMonth[month] = { date: month, earnings: 0, count: 0 };
        }
        groupedByMonth[month].earnings += booking.price || 0;
        groupedByMonth[month].count += 1;
      });
      earningsBreakdown = Object.values(groupedByMonth);
    } else {
      // Group by day for default view
      const groupedByDay = {};
      bookings.forEach((booking) => {
        const day = booking.completedAt.toISOString().split("T")[0];
        if (!groupedByDay[day]) {
          groupedByDay[day] = { date: day, earnings: 0, count: 0 };
        }
        groupedByDay[day].earnings += booking.price || 0;
        groupedByDay[day].count += 1;
      });
      earningsBreakdown = Object.values(groupedByDay);
    }

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        totalJobs: bookings.length,
        period,
        breakdown: earningsBreakdown.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching cleaner earnings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching earnings",
      error: error.message,
    });
  }
};

module.exports = exports;
