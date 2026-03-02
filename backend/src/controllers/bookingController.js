// src/controllers/bookingController.js
const Booking = require('../models/Booking');
const ServiceArea = require('../models/ServiceArea');
const User = require('../models/User');
const assignmentService = require('../services/assignmentService');
const geoUtils = require('../utils/geoUtils');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { service, date, time, duration, address, notes, cleanerId, pricing, serviceName } = req.body;

    // Resolve service name — may come as a type string or a display name from the context
    const resolvedService = service || serviceName;

    // Validate input
    if (!resolvedService || !date || !time || !duration || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required booking details'
      });
    }

    // Use the frontend-calculated total when provided (includes add-ons, discounts, VAT).
    // Fall back to a simple server-side calculation only when no pricing is sent.
    let price;
    if (pricing && pricing.total && pricing.total > 0) {
      price = pricing.total;
    } else {
      const hourlyRates = {
        'Regular Cleaning': 50,
        'Deep Cleaning': 70,
        'Move-In/Move-Out Cleaning': 90,
        'Office Cleaning': 60,
        'Window Cleaning': 40
      };
      price = (hourlyRates[resolvedService] || 50) * duration;
    }

    // Create new booking
    const booking = new Booking({
      user: userId,
      service: resolvedService,
      date: new Date(date),
      time,
      duration,
      address,
      notes,
      price,
      cleaner: cleanerId || null,
      status: cleanerId ? 'confirmed' : 'pending'
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking',
      error: error.message
    });
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all bookings for this user
    const bookings = await Booking.find({ user: userId })
      .sort({ date: -1 })
      .populate('cleaner', 'name email rating');
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
      error: error.message
    });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find booking and make sure it belongs to this user
    const booking = await Booking.findOne({ 
      _id: id,
      user: userId 
    }).populate('cleaner', 'name email phone rating');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not belonging to this user'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking details',
      error: error.message
    });
  }
};

/**
 * Check if cleaning service is available in specified postal code area
 * @route GET /api/bookings/availability/:postalCode
 * @access Public
 */
exports.checkServiceAvailability = async (req, res) => {
  try {
    const { postalCode } = req.params;
    
    if (!postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Postal code is required'
      });
    }
    
    // First check if this postal code is in our service areas
    const serviceArea = await ServiceArea.findOne({ 
      postalCode, 
      isActive: true 
    });
    
    if (!serviceArea) {
      return res.status(200).json({
        success: true,
        serviceAvailable: false,
        availableCleaners: 0,
        postalCode,
        message: 'We do not currently service this area'
      });
    }
    
    // Find available cleaners who service this postal code
    // Use the User model since cleaners are stored as users with role='cleaner'
    const availableCleaners = await User.countDocuments({
      roles: 'cleaner',
      isActive: true,
      serviceAreas: postalCode
    });
    
    // Service is available if we have at least one cleaner
    const serviceAvailable = availableCleaners > 0;
    
    res.status(200).json({
      success: true,
      serviceAvailable,
      availableCleaners,
      postalCode,
      city: serviceArea.city,
      message: serviceAvailable 
        ? `Service available with ${availableCleaners} cleaners in your area` 
        : 'No cleaners currently available in your area'
    });
  } catch (error) {
    console.error('Service availability check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking service availability',
      error: error.message
    });
  }
};

// Add this function to get available service types based on postal code
/**
 * Get available service types in the specified postal code
 * @route GET /api/bookings/service-types/:postalCode
 * @access Public
 */
exports.getAvailableServiceTypes = async (req, res) => {
  try {
    const { postalCode } = req.params;
    
    if (!postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Postal code is required'
      });
    }
    
    // First check if this postal code is in our service areas
    const serviceArea = await ServiceArea.findOne({ 
      postalCode, 
      isActive: true 
    });
    
    if (!serviceArea) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No services available in this area'
      });
    }
    
    // Find cleaners who service this postal code
    const cleaners = await User.find({
      roles: 'cleaner',
      isActive: true,
      serviceAreas: postalCode
    }).select('services');
    
    // Extract all service types offered by these cleaners
    let availableServices = new Set();
    
    cleaners.forEach(cleaner => {
      if (cleaner.services && Array.isArray(cleaner.services)) {
        cleaner.services.forEach(service => {
          availableServices.add(service);
        });
      }
    });
    
    // Convert to array
    const serviceTypes = Array.from(availableServices);
    
    // If no specific services found, return default service types
    if (serviceTypes.length === 0) {
      return res.status(200).json({
        success: true,
        data: [
          'Regular Cleaning',
          'Deep Cleaning',
          'Move-In/Move-Out Cleaning',
          'Office Cleaning'
        ]
      });
    }
    
    res.status(200).json({
      success: true,
      data: serviceTypes
    });
  } catch (error) {
    console.error('Error fetching available service types:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching service types',
      error: error.message
    });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { service, date, time, duration, address, notes } = req.body;
    
    // Find booking
    const booking = await Booking.findOne({ 
      _id: id,
      user: userId
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not belonging to this user'
      });
    }
    
    // Check if booking can be updated
    if (['completed', 'cancelled', 'in-progress'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update a booking with status: ${booking.status}`
      });
    }
    
    // Update fields
    if (service) booking.service = service;
    if (date) booking.date = new Date(date);
    if (time) booking.time = time;
    if (duration) booking.duration = duration;
    if (address) booking.address = address;
    if (notes !== undefined) booking.notes = notes;
    
    // Recalculate price if service or duration changed and no explicit price provided
    if ((service || duration) && !req.body.price) {
      const currentService = service || booking.service;
      const currentDuration = duration || booking.duration;
      const hourlyRates = {
        'Regular Cleaning': 50,
        'Deep Cleaning': 70,
        'Move-In/Move-Out Cleaning': 90,
        'Office Cleaning': 60,
        'Window Cleaning': 40
      };
      booking.price = (hourlyRates[currentService] || 50) * currentDuration;
    } else if (req.body.price) {
      booking.price = req.body.price;
    }
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating booking',
      error: error.message
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find booking
    const booking = await Booking.findOne({ 
      _id: id,
      user: userId
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not belonging to this user'
      });
    }
    
    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking with status: ${booking.status}`
      });
    }
    
    // Calculate if cancellation fee applies (less than 24h notice)
    const now = new Date();
    const bookingDate = new Date(booking.date);
    const hoursDifference = (bookingDate - now) / (1000 * 60 * 60);
    
    // Update booking
    booking.status = 'cancelled';
    booking.cancellationDate = now;
    booking.cancellationFee = hoursDifference < 24 ? booking.price * 0.5 : 0;
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        cancellationFee: booking.cancellationFee,
        refundAmount: booking.price - booking.cancellationFee
      }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking',
      error: error.message
    });
  }
};

// Get available time slots
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const { date, serviceType, postalCode } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date'
      });
    }
    
    // Define base time slots
    const allTimeSlots = [
      "08:00", "09:00", "10:00", "11:00", "12:00", 
      "13:00", "14:00", "15:00", "16:00", "17:00"
    ];
    
    const selectedDate = new Date(date);
    
    // If we have a postal code, check if service is available there
    if (postalCode) {
      const serviceArea = await ServiceArea.findOne({ 
        postalCode, 
        isActive: true 
      });
      
      if (!serviceArea) {
        return res.status(200).json({
          success: true,
          data: [],
          message: 'No service available in this postal code'
        });
      }
    }
    
    // Get all bookings for the selected date
    const bookings = await Booking.find({
      date: {
        $gte: new Date(selectedDate.setHours(0, 0, 0)),
        $lt: new Date(selectedDate.setHours(23, 59, 59))
      },
      status: { $nin: ['cancelled'] }
    }).select('time duration cleaner');
    
    // Find available cleaners for this date and postal code
    let availableCleanerIds = [];
    
    if (postalCode) {
      const cleaners = await User.find({
        roles: 'cleaner',
        isActive: true,
        serviceAreas: postalCode
      }).select('_id');
      
      availableCleanerIds = cleaners.map(c => c._id.toString());
    }
    
    // Calculate available time slots based on cleaner availability
    let availableTimeSlots = [...allTimeSlots];
    
    if (postalCode && availableCleanerIds.length > 0) {
      // For each time slot, check if we have an available cleaner
      availableTimeSlots = allTimeSlots.filter(timeSlot => {
        // Count how many cleaners are already booked at this time
        const bookedCleaners = new Set();
        
        bookings.forEach(booking => {
          if (booking.time === timeSlot && booking.cleaner) {
            bookedCleaners.add(booking.cleaner.toString());
          }
        });
        
        // Check if we have at least one available cleaner
        return availableCleanerIds.some(id => !bookedCleaners.has(id));
      });
    }
    
    res.status(200).json({
      success: true,
      data: availableTimeSlots
    });
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching time slots',
      error: error.message
    });
  }
};

// Get available cleaners with improved matching
exports.getAvailableCleaners = async (req, res) => {
  try {
    const { date, timeSlot, serviceType, postalCode, latitude, longitude } = req.query;
    
    if (!date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date and time slot'
      });
    }
    
    // Create a date object
    const bookingDate = new Date(date);
    const bookingDay = bookingDate.getDay();
    
    // Parse time to hours
    const bookingHour = parseInt(timeSlot.split(':')[0]);
    
    // Default duration based on service type
    const serviceDurations = {
      'Regular Cleaning': 2,
      'Deep Cleaning': 4,
      'Move-In/Move-Out Cleaning': 5,
      'Office Cleaning': 3
    };
    
    const duration = serviceDurations[serviceType] || 2;
    
    // Base query
    let query = {
      roles: 'cleaner',
      isActive: true
    };
    
    // Add service type filter if provided
    if (serviceType) {
      query.services = serviceType;
    }
    
    // Add postal code filter if provided
    if (postalCode) {
      query.serviceAreas = postalCode;
    }
    
    // Find all potential cleaners
    const cleaners = await User.find(query)
      .select('name email rating bio profilePicture services availability');
    
    // Get all bookings for the selected date and time
    const existingBookings = await Booking.find({
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59))
      },
      status: { $nin: ['cancelled'] }
    }).select('time duration cleaner');
    
    // Create a map of cleaners who are already booked
    const bookedCleanerHours = {};
    
    existingBookings.forEach(booking => {
      if (booking.cleaner) {
        const cleanerId = booking.cleaner.toString();
        if (!bookedCleanerHours[cleanerId]) {
          bookedCleanerHours[cleanerId] = [];
        }
        
        const bookingHourStart = parseInt(booking.time.split(':')[0]);
        for (let i = 0; i < booking.duration; i++) {
          bookedCleanerHours[cleanerId].push(bookingHourStart + i);
        }
      }
    });
    
    // Filter cleaners who are available
    const availableCleaners = cleaners.filter(cleaner => {
      // Check if cleaner is already booked
      const cleanerId = cleaner._id.toString();
      const bookedHours = bookedCleanerHours[cleanerId] || [];
      
      // Check if any booked hours conflict with the requested time slot
      for (let i = 0; i < duration; i++) {
        if (bookedHours.includes(bookingHour + i)) {
          return false;
        }
      }
      
      // Check if cleaner works on this day and during these hours
      if (cleaner.availability && cleaner.availability.weeklySchedule) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const daySchedule = cleaner.availability.weeklySchedule.find(
          schedule => schedule.day === dayNames[bookingDay] && schedule.available
        );
        
        if (!daySchedule || !daySchedule.slots || daySchedule.slots.length === 0) {
          return false;
        }
        
        // Check if any slot covers the requested hours
        return daySchedule.slots.some(slot => {
          const [start, end] = slot.split('-');
          const slotStartHour = parseInt(start.split(':')[0]);
          const slotEndHour = parseInt(end.split(':')[0]);
          
          return slotStartHour <= bookingHour && slotEndHour >= (bookingHour + duration);
        });
      }
      
      return false;
    });
    
    // Score cleaners if latitude and longitude are provided
    let scoredCleaners = availableCleaners;
    
    if (latitude && longitude) {
      scoredCleaners = availableCleaners.map(cleaner => {
        let proximityScore = 50; // Default middle score
        
        // Calculate closest cleaner address if available
        if (cleaner.addresses && cleaner.addresses.length > 0) {
          const addresses = cleaner.addresses.filter(addr => 
            addr.coordinates && addr.coordinates.latitude && addr.coordinates.longitude
          );
          
          if (addresses.length > 0) {
            const distances = addresses.map(addr => 
              geoUtils.calculateDistance(
                parseFloat(latitude),
                parseFloat(longitude),
                addr.coordinates.latitude,
                addr.coordinates.longitude
              )
            );
            
            const minDistance = Math.min(...distances);
            proximityScore = Math.max(0, 100 - (minDistance * 4)); // 25km = 0
          }
        }
        
        // Calculate rating score
        let ratingScore = 50; // Default
        if (cleaner.rating) {
          ratingScore = cleaner.rating * 20; // 5 stars = 100 points
        }
        
        // Calculate final score (simple weighted average)
        const totalScore = (proximityScore * 0.6) + (ratingScore * 0.4);
        
        return {
          ...cleaner.toObject(),
          score: totalScore,
          distance: proximityScore < 100 ? `~${Math.round((100 - proximityScore) / 4)} km` : 'Nearby'
        };
      });
      
      // Sort by score descending
      scoredCleaners.sort((a, b) => b.score - a.score);
    }
    
    res.status(200).json({
      success: true,
      count: scoredCleaners.length,
      data: scoredCleaners
    });
  } catch (error) {
    console.error('Error fetching available cleaners:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching available cleaners',
      error: error.message
    });
  }
};

// NEW METHODS FOR ASSIGNMENT ALGORITHM

/**
 * Process payment and auto-assign cleaner
 * @route POST /api/bookings/:id/process-payment
 * @access Private
 */
exports.processPaymentAndAssign = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentDetails } = req.body;
    const userId = req.user.id;
    
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }
    
    // Verify the booking exists and belongs to the user
    const booking = await Booking.findOne({
      _id: id,
      user: userId
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or does not belong to this user'
      });
    }
    
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Booking is already in ${booking.status} status and cannot be processed for payment`
      });
    }
    
    // Process payment - this is a placeholder
    // In a real implementation, you would integrate with a payment gateway
    const paymentSuccessful = true; // Assume payment success for now
    
    if (!paymentSuccessful) {
      return res.status(400).json({
        success: false,
        message: 'Payment processing failed'
      });
    }
    
    // Update booking to paid status
    booking.status = 'paid';
    booking.paymentMethod = paymentMethod;
    booking.paymentDetails = paymentDetails || {};
    booking.paymentDate = new Date();
    
    await booking.save();
    
    // Try to assign a cleaner automatically
    try {
      const bestCleaner = await assignmentService.findBestCleanerForBooking(booking._id);
      
      if (!bestCleaner) {
        // No qualified cleaners found, mark for manual assignment
        await Booking.findByIdAndUpdate(booking._id, { 
          status: 'needs_assignment'
        });
        
        return res.status(200).json({
          success: true,
          message: 'Payment processed successfully. No cleaners available at the moment. We will assign one shortly.',
          data: {
            bookingId: booking._id,
            status: 'needs_assignment'
          }
        });
      }
      
      // Assign the best cleaner to the booking
      const updatedBooking = await assignmentService.assignCleanerToBooking(
        booking._id, 
        bestCleaner._id
      );
      
      return res.status(200).json({
        success: true,
        message: 'Payment processed and cleaner assigned successfully',
        data: {
          bookingId: updatedBooking._id,
          status: updatedBooking.status,
          cleaner: {
            id: bestCleaner._id,
            name: bestCleaner.name,
            rating: bestCleaner.rating || 0
          }
        }
      });
    } catch (error) {
      console.error('Error in automatic assignment:', error);
      
      // If assignment fails, still return success for the payment
      return res.status(200).json({
        success: true,
        message: 'Payment processed successfully, but cleaner assignment failed. We will assign one manually.',
        data: {
          bookingId: booking._id,
          status: 'paid'
        }
      });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing payment',
      error: error.message
    });
  }
};

/**
 * Admin endpoint to manually assign a cleaner
 * @route PUT /api/admin/bookings/:id/assign
 * @access Private (Admin only)
 */
exports.adminAssignCleaner = async (req, res) => {
  try {
    // Admin check should be handled by middleware
    
    const { id } = req.params;
    const { cleanerId } = req.body;
    
    if (!cleanerId) {
      return res.status(400).json({
        success: false,
        message: 'Cleaner ID is required'
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
    
    // Check if booking can be assigned
    if (!['pending', 'paid', 'needs_assignment'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot assign cleaner to a booking with status: ${booking.status}`
      });
    }
    
    // Verify cleaner exists and is active
    const cleaner = await User.findOne({
      _id: cleanerId,
      roles: 'cleaner',
      isActive: true
    });
    
    if (!cleaner) {
      return res.status(404).json({
        success: false,
        message: 'Cleaner not found or not active'
      });
    }
    
    // Assign the cleaner using the assignment service
    const updatedBooking = await assignmentService.assignCleanerToBooking(id, cleanerId);
    
    res.status(200).json({
      success: true,
      message: 'Cleaner assigned successfully',
      data: {
        bookingId: updatedBooking._id,
        cleanerId: cleanerId,
        status: updatedBooking.status
      }
    });
  } catch (error) {
    console.error('Error assigning cleaner:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning cleaner',
      error: error.message
    });
  }
};

/**
 * Admin endpoint to view assignment scores for a booking
 * @route GET /api/admin/bookings/:id/assignment-scores
 * @access Private (Admin only)
 */
exports.getAssignmentScores = async (req, res) => {
  try {
    // Admin check should be handled by middleware
    
    const { id } = req.params;
    
    try {
      const scores = await assignmentService.getAssignmentScores(id);
      
      res.status(200).json({
        success: true,
        count: scores.length,
        data: scores
      });
    } catch (error) {
      console.error('Error getting assignment scores:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  } catch (error) {
    console.error('Error processing assignment scores request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting assignment scores',
      error: error.message
    });
  }
};

/**
 * Admin endpoint to get bookings that need manual assignment
 * @route GET /api/admin/bookings/needs-assignment
 * @access Private (Admin only)
 */
exports.getBookingsNeedingAssignment = async (req, res) => {
  try {
    // Admin check should be handled by middleware
    
    // Find all bookings needing assignment
    const bookings = await Booking.find({ 
      status: 'needs_assignment' 
    })
    .sort({ date: 1 })
    .populate('user', 'name email')
    .select('service date time duration address price user createdAt');
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings needing assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
      error: error.message
    });
  }
};

/**
 * Admin endpoint to run the auto-assignment job manually
 * @route POST /api/admin/bookings/run-auto-assignment
 * @access Private (Admin only)
 */
exports.runAutoAssignment = async (req, res) => {
  try {
    // Admin check should be handled by middleware
    
    const results = await assignmentService.autoAssignPendingBookings();
    
    res.status(200).json({
      success: true,
      message: `Auto-assignment completed: ${results.assigned} assigned, ${results.failed} failed`,
      data: results
    });
  } catch (error) {
    console.error('Error running auto-assignment job:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while running auto-assignment',
      error: error.message
    });
  }
};

module.exports = exports;