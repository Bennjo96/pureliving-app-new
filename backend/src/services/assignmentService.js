// src/services/assignmentService.js

const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const ServiceArea = require('../models/ServiceArea');
const SystemSetting = require('../models/SystemSetting');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const geoUtils = require('../utils/geoUtils');

/**
 * Service to handle the assignment of cleaners to booking requests
 */
const assignmentService = {
  /**
   * Find the best cleaner for a booking based on multiple factors
   * @param {string} bookingId - The booking ID to find a cleaner for
   * @returns {Promise<Object>} - The assigned cleaner or null if none available
   */
  async findBestCleanerForBooking(bookingId) {
    try {
      // Get booking details
      const booking = await Booking.findById(bookingId)
        .populate('user', 'name email');
      
      if (!booking) {
        throw new Error(`Booking with ID ${bookingId} not found`);
      }
      
      // Get service area for this booking
      let serviceArea = null;
      const bookingZipCode = booking.address && booking.address.zipCode;
      if (bookingZipCode) {
        serviceArea = await ServiceArea.findByPostalCode(bookingZipCode);
      }

      // If no service area found, we can't proceed with assignment
      if (!serviceArea) {
        console.log(`No service area found for postal code ${bookingZipCode}`);
        return null;
      }

      // Extract coordinates and attach zipCode so getQualifiedCleaners can use it
      const locationCoords = geoUtils.extractCoordinates(serviceArea.coordinates);
      locationCoords.postalCode = bookingZipCode;
      
      // Format date and time for availability checking
      const bookingDate = new Date(booking.date);
      let bookingStartHour = null;
      
      // Parse time string (assuming format like "09:00" or "09:00 AM")
      if (booking.time) {
        const timeStr = booking.time;
        if (timeStr.includes(':')) {
          const timeParts = timeStr.split(':');
          bookingStartHour = parseInt(timeParts[0], 10);
          
          // Adjust for PM if using 12-hour format
          if (timeStr.toLowerCase().includes('pm') && bookingStartHour < 12) {
            bookingStartHour += 12;
          }
          // Adjust for 12 AM in 12-hour format
          if (timeStr.toLowerCase().includes('am') && bookingStartHour === 12) {
            bookingStartHour = 0;
          }
        }
      }
      
      // Step 1: Get qualified cleaners
      const qualifiedCleaners = await this.getQualifiedCleaners(
        booking.service,
        bookingDate,
        bookingStartHour,
        booking.duration,
        locationCoords,
        serviceArea.serviceRadius
      );

      if (!qualifiedCleaners.length) {
        console.log('No qualified cleaners found for booking:', booking._id);
        return null;
      }

      // Step 2: Calculate scores for each qualified cleaner
      const scoredCleaners = await this.scoreCleaners(qualifiedCleaners, booking, locationCoords);

      // Step 3: Apply business rules and constraints
      const adjustedCleaners = await this.applyBusinessRules(scoredCleaners, booking);

      // Step 4: Select the best cleaner (highest score)
      const bestCleaner = adjustedCleaners.sort((a, b) => b.totalScore - a.totalScore)[0];

      console.log(`Selected cleaner ${bestCleaner.cleaner._id} with score ${bestCleaner.totalScore} for booking ${booking._id}`);
      return bestCleaner.cleaner;
    } catch (error) {
      console.error('Error finding best cleaner:', error);
      throw error;
    }
  },

  /**
   * Get cleaners who meet basic qualifications for the booking
   */
  async getQualifiedCleaners(serviceType, bookingDate, bookingStartHour, bookingDuration, location, maxRadius = 25) {
    try {
      // Get the day of week (0-6, where 0 is Sunday)
      const bookingDay = bookingDate.getDay();
      
      // Calculate booking end hour
      const bookingEndHour = bookingStartHour + bookingDuration;
      
      // Find all active cleaners with the required service type
      const cleaners = await User.find({
        roles: 'cleaner',
        isActive: true,
        services: serviceType
      });
      
      // Get all bookings that overlap with this time period
      const overlappingBookings = await Booking.find({
        date: bookingDate,
        status: { $nin: ['cancelled', 'no-show'] },
        $or: [
          // Existing booking starts during the new booking time range
          {
            time: { $regex: new RegExp(`^${bookingStartHour}:|^${bookingStartHour + 1}:|^${bookingStartHour + 2}:`) }
          },
          // Or another condition that checks for overlap
          {
            $expr: {
              $and: [
                { $lt: [{ $toInt: { $substr: ["$time", 0, 2] } }, bookingEndHour] },
                { $gte: [{ $add: [{ $toInt: { $substr: ["$time", 0, 2] } }, "$duration"] }, bookingStartHour] }
              ]
            }
          }
        ]
      });
      
      // Create a set of cleaner IDs who are already booked
      const bookedCleanerIds = new Set();
      overlappingBookings.forEach(booking => {
        if (booking.cleaner) {
          bookedCleanerIds.add(booking.cleaner.toString());
        }
      });
      
      // Filter out cleaners who are unavailable or out of range
      const qualifiedCleaners = cleaners.filter(cleaner => {
        // Skip if already booked during this time
        if (bookedCleanerIds.has(cleaner._id.toString())) {
          return false;
        }
        
        // Check if cleaner works on this day and during these hours
        let dayAvailable = false;
        
        // Handle both old and new availability formats
        if (cleaner.availability && cleaner.availability.weeklySchedule) {
          // Using the weeklySchedule format
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const daySchedule = cleaner.availability.weeklySchedule.find(
            schedule => schedule.day === dayNames[bookingDay] && schedule.available
          );
          
          if (daySchedule && daySchedule.slots && daySchedule.slots.length > 0) {
            // Check if any slot covers the booking hours
            dayAvailable = daySchedule.slots.some(slot => {
              const [start, end] = slot.split('-');
              const slotStartHour = parseInt(start.split(':')[0], 10);
              const slotEndHour = parseInt(end.split(':')[0], 10);
              
              return slotStartHour <= bookingStartHour && slotEndHour >= bookingEndHour;
            });
          }
        }
        
        if (!dayAvailable) {
          return false;
        }
        
        // Check if cleaner serves this location
        let inServiceArea = false;
        
        // First check postal code match
        if (cleaner.serviceAreas && cleaner.serviceAreas.includes(location.postalCode)) {
          inServiceArea = true;
        } else {
          // Fall back to distance calculation if available
          inServiceArea = this.isCleanerInRange(cleaner, location, maxRadius);
        }
        
        return inServiceArea;
      });
      
      return qualifiedCleaners;
    } catch (error) {
      console.error('Error getting qualified cleaners:', error);
      throw error;
    }
  },

  /**
   * Helper to check if cleaner is in range of a location
   */
  isCleanerInRange(cleaner, location, maxRadius) {
    // If we have cleaner's addresses with coordinates
    if (cleaner.addresses && cleaner.addresses.length > 0) {
      for (const address of cleaner.addresses) {
        if (address.coordinates && address.coordinates.latitude && address.coordinates.longitude) {
          const distance = geoUtils.calculateDistance(
            location.latitude,
            location.longitude,
            address.coordinates.latitude,
            address.coordinates.longitude
          );
          if (distance <= maxRadius) {
            return true;
          }
        }
      }
    }
    
    // If we have service area references
    if (cleaner.serviceAreaRefs && cleaner.serviceAreaRefs.length > 0) {
      // This would need to be populated, but since we're just checking IDs here, we'll skip
      return true;
    }
    
    return false;
  },

  /**
   * Score qualified cleaners based on multiple factors
   */
  async scoreCleaners(qualifiedCleaners, booking, location) {
    try {
      // Get algorithm weights from settings (or use defaults)
      const weights = await SystemSetting.getAssignmentWeights().catch(() => ({
        proximity: 0.30,
        rating: 0.25,
        availabilityOptimality: 0.20,
        workloadBalance: 0.15,
        customerPreference: 0.10
      }));
      
      // Get customer's past bookings to check for preferred cleaners
      const customerBookings = await Booking.find({
        user: booking.user,
        status: 'completed'
      }).populate('cleaner').populate('review');
      
      const scoredCleaners = await Promise.all(qualifiedCleaners.map(async cleaner => {
        // 1. Proximity Score (0-100)
        let proximityScore = 50; // Default middle score
        
        // Calculate based on cleaner's addresses if available
        if (cleaner.addresses && cleaner.addresses.length > 0) {
          let closestDistance = Infinity;
          
          for (const address of cleaner.addresses) {
            if (address.coordinates && address.coordinates.latitude && address.coordinates.longitude) {
              const distance = geoUtils.calculateDistance(
                location.latitude,
                location.longitude,
                address.coordinates.latitude,
                address.coordinates.longitude
              );
              if (distance < closestDistance) {
                closestDistance = distance;
              }
            }
          }
          
          // Convert distance to score (closer = higher score)
          // 0km = 100, 25km = 0
          if (closestDistance !== Infinity) {
            const maxDistance = 25; // Maximum distance in km
            proximityScore = Math.max(0, 100 - (closestDistance / maxDistance * 100));
          }
        }
        
        // 2. Rating Score (0-100)
        let ratingScore = 50; // Default for new cleaners
        
        if (typeof cleaner.rating === 'number') {
          // Convert 0-5 rating to 0-100 score
          ratingScore = cleaner.rating * 20;
        } else {
          // Get reviews if rating is not on user object
          const reviews = await Review.find({ cleaner: cleaner._id }).sort({ createdAt: -1 }).limit(50);
          
          if (reviews.length > 0) {
            const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
            ratingScore = avgRating * 20;
          }
        }
        
        // 3. Availability Optimality Score (0-100)
        // Higher score if this booking fits well in their schedule
        let availabilityOptimalityScore = 70; // Reasonable default
        
        // This would require knowing their other bookings on this day
        // For now we'll use a simplistic approach
        
        // 4. Workload Balance Score (0-100)
        let workloadBalanceScore = 50; // Default middle score
        
        // Calculate bookings for this month for this cleaner
        const startOfMonth = new Date(booking.date.getFullYear(), booking.date.getMonth(), 1);
        const endOfMonth = new Date(booking.date.getFullYear(), booking.date.getMonth() + 1, 0);
        
        const monthlyBookings = await Booking.countDocuments({
          cleaner: cleaner._id,
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth
          },
          status: { $nin: ['cancelled', 'no-show'] }
        });
        
        // Calculate average monthly bookings for all cleaners
        const averageMonthlyBookings = await Booking.aggregate([
          {
            $match: {
              date: {
                $gte: startOfMonth,
                $lte: endOfMonth
              },
              status: { $nin: ['cancelled', 'no-show'] },
              cleaner: { $exists: true, $ne: null }
            }
          },
          {
            $group: {
              _id: '$cleaner',
              count: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: null,
              avgBookings: { $avg: '$count' }
            }
          }
        ]);
        
        const avgMonthlyBookings = averageMonthlyBookings.length > 0 ? 
          averageMonthlyBookings[0].avgBookings : 10; // Default if no data
        
        // Score based on how underbooked this cleaner is compared to average
        const workloadRatio = monthlyBookings / avgMonthlyBookings;
        workloadBalanceScore = Math.max(0, 100 - (workloadRatio * 100));
        
        // 5. Customer Preference Score (0-100)
        let customerPreferenceScore = 0;
        
        // Check if customer has previously used this cleaner
        const previousBookings = customerBookings.filter(b => 
          b.cleaner && b.cleaner._id.toString() === cleaner._id.toString()
        );
        
        if (previousBookings.length > 0) {
          // Calculate average rating given to this cleaner by the customer
          const avgCustomerRating = previousBookings.reduce((sum, b) => {
            return b.review ? sum + b.review.rating : sum + 3; // Default to 3 if no review
          }, 0) / previousBookings.length;
          
          // Base score on booking count and ratings
          customerPreferenceScore = Math.min(100, (previousBookings.length * 20) + ((avgCustomerRating - 1) * 10));
        }
        
        // Calculate total weighted score
        const totalScore = (
          proximityScore * weights.proximity +
          ratingScore * weights.rating +
          availabilityOptimalityScore * weights.availabilityOptimality +
          workloadBalanceScore * weights.workloadBalance +
          customerPreferenceScore * weights.customerPreference
        );
        
        return {
          cleaner,
          totalScore,
          scores: {
            proximityScore,
            ratingScore,
            availabilityOptimalityScore,
            workloadBalanceScore,
            customerPreferenceScore
          }
        };
      }));
      
      return scoredCleaners;
    } catch (error) {
      console.error('Error scoring cleaners:', error);
      throw error;
    }
  },

  /**
   * Apply business rules and constraints
   */
  async applyBusinessRules(scoredCleaners, booking) {
    // Make a copy to avoid modifying the original
    const adjustedCleaners = [...scoredCleaners];
    
    // Rule 1: Ensure new cleaners get opportunities
    adjustedCleaners.forEach(item => {
      // Get completed booking count if available
      let completedJobsCount = 0;
      
      if (item.cleaner.cleanerStats && typeof item.cleaner.cleanerStats.totalJobsCompleted === 'number') {
        completedJobsCount = item.cleaner.cleanerStats.totalJobsCompleted;
      }
      
      // Boost new cleaners who have less than 5 completed jobs
      if (completedJobsCount < 5) {
        const newCleanerBoost = Math.max(0, 10 - (completedJobsCount * 2));
        item.totalScore += newCleanerBoost;
        console.log(`Boosting new cleaner ${item.cleaner._id} by ${newCleanerBoost} points`);
      }
    });
    
    // Rule 2: Check for premium customers
    let isPremiumCustomer = false;
    
    // Check if this is a premium service
    const premiumServices = ['Deep Cleaning', 'Move-In/Move-Out Cleaning'];
    if (premiumServices.includes(booking.service)) {
      isPremiumCustomer = true;
    }
    
    // Or check if user has premium tier
    if (booking.user && booking.user.customerTier === 'premium') {
      isPremiumCustomer = true;
    }
    
    if (isPremiumCustomer) {
      adjustedCleaners.forEach(item => {
        // For premium customers, prioritize higher-rated cleaners
        if (item.scores.ratingScore > 80) {
          item.totalScore += 15;
          console.log(`Boosting high-rated cleaner ${item.cleaner._id} for premium customer`);
        }
      });
    }
    
    // Rule 3: Special requests matching
    if (booking.notes) {
      const specialRequests = booking.notes.toLowerCase();
      
      // Check for specific requirements
      const hasPetRequirement = specialRequests.includes('pet') || specialRequests.includes('dog') || specialRequests.includes('cat');
      const hasAllergyRequirement = specialRequests.includes('allerg') || specialRequests.includes('sensitive');
      
      adjustedCleaners.forEach(item => {
        let specialRequestBonus = 0;
        
        // Check for special skills matching
        if (item.cleaner.skills && Array.isArray(item.cleaner.skills)) {
          // Match pet-friendly cleaners
          if (hasPetRequirement && item.cleaner.skills.some(skill => 
            typeof skill === 'object' && skill.name && skill.name.toLowerCase().includes('pet'))) {
            specialRequestBonus += 10;
          }
          
          // Match hypoallergenic cleaning specialists
          if (hasAllergyRequirement && item.cleaner.skills.some(skill => 
            typeof skill === 'object' && skill.name && (
              skill.name.toLowerCase().includes('allerg') || 
              skill.name.toLowerCase().includes('sensitive')
            ))) {
            specialRequestBonus += 10;
          }
        }
        
        // Also check services array for matches
        if (item.cleaner.services && Array.isArray(item.cleaner.services)) {
          // Match pet-friendly cleaners
          if (hasPetRequirement && item.cleaner.services.some(service => 
            service.toLowerCase().includes('pet'))) {
            specialRequestBonus += 5;
          }
          
          // Match hypoallergenic cleaning specialists
          if (hasAllergyRequirement && item.cleaner.services.some(service => 
            service.toLowerCase().includes('allerg') || 
            service.toLowerCase().includes('sensitive'))) {
            specialRequestBonus += 5;
          }
        }
        
        if (specialRequestBonus > 0) {
          item.totalScore += specialRequestBonus;
          console.log(`Boosting cleaner ${item.cleaner._id} by ${specialRequestBonus} points for special skill match`);
        }
      });
    }
    
    return adjustedCleaners;
  },

  /**
   * Assign cleaner to booking
   */
  async assignCleanerToBooking(bookingId, cleanerId) {
    try {
      // Update booking with assigned cleaner
      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          cleaner: cleanerId,
          status: 'assigned',
          assignedAt: new Date()
        },
        { new: true }
      )
      .populate('cleaner', 'name email')
      .populate('user', 'name email');

      if (!updatedBooking) {
        throw new Error(`Booking with ID ${bookingId} not found`);
      }

      // Send notifications
      await this.sendAssignmentNotifications(updatedBooking);
      
      return updatedBooking;
    } catch (error) {
      console.error('Error assigning cleaner to booking:', error);
      throw error;
    }
  },

  /**
   * Send notifications about assignment
   */
  async sendAssignmentNotifications(booking) {
    const bookingDate = new Date(booking.date).toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // --- In-app notifications ---
    const notificationPromises = [
      Notification.create({
        recipient: booking.cleaner._id,
        type: 'booking',
        title: 'New Job Assigned',
        message: `You have been assigned a ${booking.service} on ${bookingDate} at ${booking.time}.`,
        relatedId: booking._id,
        relatedModel: 'Booking',
        link: `/cleaner/jobs/${booking._id}`
      }),
      Notification.create({
        recipient: booking.user._id,
        type: 'booking',
        title: 'Cleaner Assigned',
        message: `Your booking on ${bookingDate} has been assigned to ${booking.cleaner.name}.`,
        relatedId: booking._id,
        relatedModel: 'Booking',
        link: `/booking/track/${booking._id}`
      })
    ];

    await Promise.all(notificationPromises).catch(err =>
      console.error('Error creating assignment notifications:', err)
    );

    // --- Emails (non-blocking — failures must not abort the assignment) ---
    const emailPromises = [
      sendEmail({
        to: booking.cleaner.email,
        subject: 'New Cleaning Job Assigned',
        html: `
          <div style="font-family:sans-serif">
            <h2>New Job Assignment</h2>
            <p>Hi ${booking.cleaner.name},</p>
            <p>You have been assigned a new <strong>${booking.service}</strong> on
               <strong>${bookingDate}</strong> at <strong>${booking.time}</strong>.</p>
            <p>Log in to your dashboard to view the full details.</p>
          </div>
        `,
        text: `Hi ${booking.cleaner.name}, you have been assigned a new ${booking.service} on ${bookingDate} at ${booking.time}. Log in to your dashboard for details.`
      }).catch(err => console.error('Error sending cleaner assignment email:', err)),

      sendEmail({
        to: booking.user.email,
        subject: 'Your Cleaner Has Been Assigned',
        html: `
          <div style="font-family:sans-serif">
            <h2>Booking Confirmed</h2>
            <p>Hi ${booking.user.name},</p>
            <p>Great news! Your <strong>${booking.service}</strong> on
               <strong>${bookingDate}</strong> at <strong>${booking.time}</strong>
               has been assigned to <strong>${booking.cleaner.name}</strong>.</p>
            <p>You can track your booking status at any time from your dashboard.</p>
          </div>
        `,
        text: `Hi ${booking.user.name}, your ${booking.service} on ${bookingDate} at ${booking.time} has been assigned to ${booking.cleaner.name}.`
      }).catch(err => console.error('Error sending customer assignment email:', err))
    ];

    await Promise.all(emailPromises);
  },
  
  /**
   * Get assignment scores for a booking (for admin view)
   */
  async getAssignmentScores(bookingId) {
    try {
      const booking = await Booking.findById(bookingId)
        .populate('user', 'name email');

      if (!booking) {
        throw new Error(`Booking with ID ${bookingId} not found`);
      }
      
      // Get service area for this booking
      let serviceArea = null;
      let location = { latitude: null, longitude: null };
      
      if (booking.address && booking.address.postalCode) {
        serviceArea = await ServiceArea.findByPostalCode(booking.address.postalCode);
        
        if (serviceArea && serviceArea.coordinates) {
          location = geoUtils.extractCoordinates(serviceArea.coordinates);
        }
      }
      
      // Format date and time for availability checking
      const bookingDate = new Date(booking.date);
      let bookingStartHour = null;
      
      // Parse time string (assuming format like "09:00" or "09:00 AM")
      if (booking.time) {
        const timeStr = booking.time;
        if (timeStr.includes(':')) {
          const timeParts = timeStr.split(':');
          bookingStartHour = parseInt(timeParts[0], 10);
          
          // Adjust for PM if using 12-hour format
          if (timeStr.toLowerCase().includes('pm') && bookingStartHour < 12) {
            bookingStartHour += 12;
          }
          // Adjust for 12 AM in 12-hour format
          if (timeStr.toLowerCase().includes('am') && bookingStartHour === 12) {
            bookingStartHour = 0;
          }
        }
      }

      // Get qualified cleaners
      const qualifiedCleaners = await this.getQualifiedCleaners(
        booking.service,
        bookingDate,
        bookingStartHour,
        booking.duration,
        location,
        serviceArea ? serviceArea.serviceRadius : 25
      );

      if (!qualifiedCleaners.length) {
        return [];
      }

      // Score cleaners
      const scoredCleaners = await this.scoreCleaners(qualifiedCleaners, booking, location);

      // Apply business rules
      const adjustedCleaners = await this.applyBusinessRules(scoredCleaners, booking);
      
      // Sort by score
      const sortedCleaners = adjustedCleaners.sort((a, b) => b.totalScore - a.totalScore);

      // Format for admin view
      return sortedCleaners.map(item => ({
        cleanerId: item.cleaner._id,
        cleanerName: item.cleaner.name,
        totalScore: Math.round(item.totalScore),
        scores: {
          proximity: Math.round(item.scores.proximityScore),
          rating: Math.round(item.scores.ratingScore),
          availability: Math.round(item.scores.availabilityOptimalityScore),
          workload: Math.round(item.scores.workloadBalanceScore),
          customerPreference: Math.round(item.scores.customerPreferenceScore)
        },
        distance: item.scores.proximityScore ? 
          `~${Math.round((100 - item.scores.proximityScore) / 4)} km` : 'Unknown',
        currentlyAssigned: booking.cleaner && booking.cleaner.toString() === item.cleaner._id.toString()
      }));
    } catch (error) {
      console.error('Error getting assignment scores:', error);
      throw error;
    }
  },
  
  /**
   * Auto-assign cleaners to all unassigned bookings
   * This can be run as a scheduled job
   */
  async autoAssignPendingBookings() {
    try {
      // Check if auto-assignment is enabled
      const autoAssignmentEnabled = await SystemSetting.isAutoAssignmentEnabled()
        .catch(() => true); // Default to enabled if setting not found
      
      if (!autoAssignmentEnabled) {
        console.log('Auto-assignment is disabled in system settings');
        return { processed: 0, assigned: 0, failed: 0 };
      }
      
      // Find all paid bookings without a cleaner
      const pendingBookings = await Booking.find({
        status: 'paid',
        cleaner: { $exists: false }
      }).sort({ date: 1 }); // Process earlier bookings first
      
      console.log(`Found ${pendingBookings.length} pending bookings for auto-assignment`);
      
      let assigned = 0;
      let failed = 0;
      
      // Process each booking
      for (const booking of pendingBookings) {
        try {
          const cleaner = await this.findBestCleanerForBooking(booking._id);
          
          if (cleaner) {
            await this.assignCleanerToBooking(booking._id, cleaner._id);
            assigned++;
            console.log(`Auto-assigned booking ${booking._id} to cleaner ${cleaner._id}`);
          } else {
            // Update booking to needs manual assignment
            await Booking.findByIdAndUpdate(booking._id, {
              status: 'needs_assignment'
            });
            failed++;
            console.log(`Could not find cleaner for booking ${booking._id}, marked for manual assignment`);
          }
        } catch (error) {
          console.error(`Error auto-assigning booking ${booking._id}:`, error);
          failed++;
        }
      }
      
      return {
        processed: pendingBookings.length,
        assigned,
        failed
      };
    } catch (error) {
      console.error('Error in auto-assignment job:', error);
      throw error;
    }
  }
};

module.exports = assignmentService;