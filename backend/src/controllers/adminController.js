const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment'); // Assuming you have a Payment model
const Notification = require('../models/Notification'); // Assuming you have a Notification model
const SystemSetting = require('../models/SystemSetting'); // Assuming you have a SystemSetting model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Get dashboard data with timeframe filtering
exports.getDashboard = async (req, res, next) => {
  try {
    const { timeframe = 'week' } = req.query;
    
    // Calculate date ranges based on timeframe
    const now = new Date();
    const startDate = new Date();
    const previousStartDate = new Date();
    
    // Set appropriate date ranges for current and previous periods
    if (timeframe === 'week') {
      startDate.setDate(now.getDate() - 7);
      previousStartDate.setDate(startDate.getDate() - 7);
    } else if (timeframe === 'month') {
      startDate.setMonth(now.getMonth() - 1);
      previousStartDate.setMonth(startDate.getMonth() - 1);
    } else if (timeframe === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
      previousStartDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    // Get total number of users in current timeframe
    const totalUsers = await User.countDocuments({
      createdAt: { $lte: now }
    });
    
    // Get new users in current timeframe
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: now }
    });
    
    // Get new users in previous timeframe
    const previousPeriodUsers = await User.countDocuments({
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });
    
    // Calculate user growth percentage
    const userGrowth = previousPeriodUsers > 0
      ? Math.round(((newUsers - previousPeriodUsers) / previousPeriodUsers) * 100)
      : newUsers > 0 ? 100 : 0;
    
    // Get active cleaners count
    const activeCleaners = await User.countDocuments({
      role: 'cleaner',
      $or: [{ status: 'active' }, { status: { $exists: false } }]
    });
    
    // Get pending cleaners count for notifications
    const pendingCleaners = await User.countDocuments({
      role: 'cleaner',
      status: 'pending'
    });
    
    // Get bookings in current timeframe
    const totalBookings = await Booking.countDocuments({
      createdAt: { $gte: startDate, $lte: now }
    });
    
    // Get bookings in previous timeframe
    const previousPeriodBookings = await Booking.countDocuments({
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });
    
    // Calculate booking growth percentage
    const bookingGrowth = previousPeriodBookings > 0
      ? Math.round(((totalBookings - previousPeriodBookings) / previousPeriodBookings) * 100)
      : totalBookings > 0 ? 100 : 0;
    
    // Get pending bookings
    const pendingBookings = await Booking.countDocuments({
      status: { $in: ['pending', 'unassigned'] }
    });
    
    // Calculate completion rate
    const completedBookings = await Booking.countDocuments({
      status: 'completed',
      createdAt: { $gte: startDate, $lte: now }
    });
    
    const completionRate = totalBookings > 0
      ? Math.round((completedBookings / totalBookings) * 100)
      : 0;
    
    // Get revenue for current timeframe
    const currentRevenueData = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const totalRevenue = currentRevenueData.length > 0 ? currentRevenueData[0].total : 0;
    
    // Get revenue for previous timeframe
    const previousRevenueData = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: previousStartDate, $lt: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const previousRevenue = previousRevenueData.length > 0 ? previousRevenueData[0].total : 0;
    
    // Calculate revenue growth percentage
    const revenueGrowth = previousRevenue > 0
      ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100)
      : totalRevenue > 0 ? 100 : 0;
    
    // Get recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('cleaner', 'name')
      .lean();
    
    // Format for the dashboard
    const formattedRecentBookings = recentBookings.map(booking => ({
      id: booking._id,
      customer: booking.user ? booking.user.name : 'Unknown',
      service: booking.serviceType || 'Standard Cleaning',
      cleaner: booking.cleaner ? booking.cleaner.name : 'Unassigned',
      date: booking.scheduledAt || booking.createdAt,
      status: booking.status,
      amount: booking.amount || 0
    }));
    
    // Get recent payouts (assuming you have a Payment model)
    const recentPayouts = await Payment.find({ type: 'payout' })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('cleaner', 'name')
      .lean();
    
    const formattedPayouts = recentPayouts.map(payout => ({
      id: payout._id,
      cleaner: payout.cleaner ? payout.cleaner.name : 'Unknown',
      date: payout.createdAt,
      amount: payout.amount,
      status: payout.status
    }));
    
    // Get revenue data for chart based on timeframe
    let revenueAggregation;
    let dateFormat;
    
    if (timeframe === 'week') {
      // Daily data for week view
      dateFormat = '%Y-%m-%d';
      startDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'month') {
      // Daily data for month view
      dateFormat = '%Y-%m-%d';
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeframe === 'year') {
      // Monthly data for year view
      dateFormat = '%Y-%m';
      startDate.setFullYear(now.getFullYear() - 1);
    }
    
    revenueAggregation = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          amount: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    const revenueData = revenueAggregation.map(item => ({
      date: item._id,
      amount: item.amount
    }));
    
    // Get system alerts (unresolved issues, critical system events)
    const systemAlerts = await Notification.find({
      type: 'system',
      status: 'unread'
    })
    .sort({ priority: -1, createdAt: -1 })
    .limit(3)
    .lean();
    
    const formattedAlerts = systemAlerts.map(alert => ({
      id: alert._id,
      title: alert.title,
      message: alert.message,
      priority: alert.priority,
      timestamp: alert.createdAt
    }));
    
    // Get new user registrations
    const newRegistrations = await User.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    
    const formattedRegistrations = newRegistrations.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      type: user.role,
      joined: user.createdAt
    }));
    
    // Get count of unresolved support tickets
    const unresolved = await Notification.countDocuments({
      type: 'support',
      status: 'unresolved'
    });
    
    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        totalUsers,
        totalRevenue,
        pendingBookings,
        activeCleaners,
        completionRate,
        userGrowth,
        revenueGrowth,
        pendingCleaners,
        unresolved
      },
      recentBookings: formattedRecentBookings,
      recentPayouts: formattedPayouts,
      revenueData,
      systemAlerts: formattedAlerts,
      newRegistrations: formattedRegistrations
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    next(error);
  }
};

// ===== CLEANER MANAGEMENT =====

// Get all cleaners
exports.getCleaners = async (req, res, next) => {
  try {
    // Find all users with role = 'cleaner'
    const cleaners = await User.find({ role: 'cleaner' })
      .lean();
    
    // Transform to the format expected by the CleanerManagement component
    const formattedCleaners = await Promise.all(cleaners.map(async cleaner => {
      // Split the name into first and last name for display
      const nameParts = cleaner.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Get actual cleaner stats from completed bookings
      const completedBookings = await Booking.find({
        cleaner: cleaner._id,
        status: 'completed'
      }).lean();
      
      const jobsCompleted = completedBookings.length;
      
      // Get reviews from bookings
      const reviewCount = completedBookings.filter(booking => booking.rating).length;
      
      // Calculate average rating
      const totalRating = completedBookings.reduce((sum, booking) => sum + (booking.rating || 0), 0);
      const rating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0;
      
      return {
        _id: cleaner._id.toString(),
        firstName,
        lastName,
        email: cleaner.email,
        phone: cleaner.phone || '',
        address: cleaner.addresses && cleaner.addresses.length > 0 
          ? `${cleaner.addresses[0].street}, ${cleaner.addresses[0].city}` 
          : '',
        status: cleaner.status || 'active',
        rating,
        reviewCount,
        jobsCompleted,
        rate: cleaner.rate || 0,
        services: cleaner.services || [],
        serviceAreas: cleaner.serviceAreas || [],
        bio: cleaner.bio || '',
        createdAt: cleaner.createdAt
      };
    }));
    
    res.status(200).json({ 
      success: true, 
      cleaners: formattedCleaners 
    });
  } catch (error) {
    console.error('Error fetching cleaners:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load cleaners',
      error: error.message 
    });
  }
};

// Create a new cleaner
exports.createCleaner = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, address, serviceAreas, services, rate, bio, status } = req.body;
    
    // Generate a temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    
    // Create a new user with role = cleaner
    const newCleaner = new User({
      name: `${firstName} ${lastName}`,
      email,
      password: tempPassword, // Will be hashed by the model's pre-save hook
      roles: ['cleaner'], // Changed from role to roles based on your User model
      status: status || 'pending',
      serviceAreas: serviceAreas || [],
      services: services || [],
      rate: rate || 0,
      bio: bio || ''
    });
    
    // Add address if provided
    if (address) {
      newCleaner.addresses = [{
        type: 'work',
        street: address,
        isPrimary: true
      }];
    }
    
    // Add phone if provided
    if (phone) {
      newCleaner.phone = phone;
    }
    
    await newCleaner.save();
    
    // Find an admin user to be the recipient
    // You can either look up an admin user each time
    const admin = await User.findOne({ roles: 'admin' });
    
    // Create system notification with recipient
    await Notification.create({
      type: 'system',
      title: 'New Cleaner Registration',
      message: `${firstName} ${lastName} has registered as a cleaner and is awaiting approval.`,
      priority: 'medium',
      status: 'unread',
      recipient: admin ? admin._id : req.user.id // Use the admin ID if found, otherwise use the current admin user's ID
    });
    
    // Send email with temporary password
    try {
      await sendEmail({
        to: email,
        subject: 'Your Cleaner Account Has Been Created',
        html: `
          <div>
            <h1>Welcome to Our Cleaning Service!</h1>
            <p>Your account has been created. You can log in with:</p>
            <p>Email: ${email}</p>
            <p>Temporary Password: ${tempPassword}</p>
            <p>Please change your password after first login.</p>
          </div>
        `,
        text: `Welcome to Our Cleaning Service! Your account has been created. You can log in with Email: ${email} and Temporary Password: ${tempPassword}. Please change your password after first login.`
      });
    } catch (emailError) {
      console.error('Error sending cleaner welcome email:', emailError);
      // Continue even if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Cleaner created successfully',
      data: {
        id: newCleaner._id,
        email: newCleaner.email
      }
    });
  } catch (error) {
    console.error('Error creating cleaner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create cleaner',
      error: error.message
    });
  }
};

// Update cleaner
exports.updateCleaner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, address, serviceAreas, services, rate, bio, status } = req.body;
    
    // Prepare update data
    const updateData = {};
    
    // Only update fields that are provided
    if (firstName && lastName) {
      updateData.name = `${firstName} ${lastName}`;
    }
    
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (serviceAreas) updateData.serviceAreas = serviceAreas;
    if (services) updateData.services = services;
    if (rate) updateData.rate = rate;
    if (bio) updateData.bio = bio;
    if (status) updateData.status = status;
    
    // Handle address update
    if (address) {
      // Get current user to check if addresses exist
      const currentUser = await User.findById(id);
      
      if (currentUser.addresses && currentUser.addresses.length > 0) {
        // Update first address
        updateData['addresses.0.street'] = address;
      } else {
        // Create new address
        updateData.addresses = [{
          type: 'work',
          street: address,
          isPrimary: true
        }];
      }
    }
    
    const updatedCleaner = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();
    
    if (!updatedCleaner) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cleaner not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Cleaner updated successfully'
    });
  } catch (error) {
    console.error('Error updating cleaner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cleaner',
      error: error.message
    });
  }
};

// Update cleaner status
exports.updateCleanerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const updatedCleaner = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();
    
    if (!updatedCleaner) {
      return res.status(404).json({
        success: false,
        message: 'Cleaner not found'
      });
    }
    
    // Create system notification
    await Notification.create({
      type: 'system',
      title: 'Cleaner Status Updated',
      message: `${updatedCleaner.name}'s status has been updated to ${status}.`,
      priority: 'low',
      status: 'unread'
    });
    
    res.status(200).json({
      success: true,
      message: `Cleaner status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating cleaner status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cleaner status',
      error: error.message
    });
  }
};

// Approve cleaner
exports.approveCleaner = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const updatedCleaner = await User.findByIdAndUpdate(
      id,
      { status: 'active' },
      { new: true }
    ).lean();
    
    if (!updatedCleaner) {
      return res.status(404).json({
        success: false,
        message: 'Cleaner not found'
      });
    }
    
    // Create system notification
    await Notification.create({
      type: 'system',
      title: 'Cleaner Approved',
      message: `${updatedCleaner.name} has been approved and can now accept jobs.`,
      priority: 'medium',
      status: 'unread'
    });
    
    // Send approval notification email
    try {
      await sendEmail({
        to: updatedCleaner.email,
        subject: 'Your Cleaner Account Has Been Approved',
        html: `
          <div>
            <h1>Congratulations!</h1>
            <p>Your cleaner account has been approved. You can now log in and start accepting jobs.</p>
          </div>
        `,
        text: `Congratulations! Your cleaner account has been approved. You can now log in and start accepting jobs.`
      });
    } catch (emailError) {
      console.error('Error sending cleaner approval email:', emailError);
      // Continue even if email fails
    }
    
    res.status(200).json({
      success: true,
      message: 'Cleaner approved successfully'
    });
  } catch (error) {
    console.error('Error approving cleaner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve cleaner',
      error: error.message
    });
  }
};

// Delete cleaner
exports.deleteCleaner = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const deletedCleaner = await User.findByIdAndDelete(id);
    
    if (!deletedCleaner) {
      return res.status(404).json({
        success: false,
        message: 'Cleaner not found'
      });
    }
    
    // Create system notification
    await Notification.create({
      type: 'system',
      title: 'Cleaner Deleted',
      message: `${deletedCleaner.name}'s account has been deleted from the system.`,
      priority: 'medium',
      status: 'unread'
    });
    
    res.status(200).json({
      success: true,
      message: 'Cleaner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting cleaner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete cleaner',
      error: error.message
    });
  }
};

// ===== BOOKING MANAGEMENT =====

// Get all bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('cleaner', 'name');
      
    // Format bookings for the admin dashboard
    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      customer: {
        name: booking.user ? booking.user.name : 'Unknown',
        email: booking.user ? booking.user.email : '',
      },
      service: booking.serviceType || 'Standard Cleaning',
      cleaner: booking.cleaner ? booking.cleaner.name : 'Unassigned',
      date: booking.scheduledAt || booking.createdAt,
      time: booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleTimeString() : '',
      duration: booking.duration || '2 hours',
      status: booking.status,
      amount: booking.amount || 0,
      payment: booking.paymentMethod || 'Credit Card',
      paymentStatus: booking.paymentStatus || 'Pending',
      notes: booking.notes || '',
      recurring: booking.isRecurring || false
    }));
    
    res.status(200).json({ 
      success: true, 
      bookings: formattedBookings 
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load bookings',
      error: error.message
    });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Create system notification
    await Notification.create({
      type: 'system',
      title: 'Booking Status Updated',
      message: `Booking #${updatedBooking._id} status has been updated to ${status}.`,
      priority: 'low',
      status: 'unread'
    });
    
    // Notify customer about status change
    try {
      if (updatedBooking.user && updatedBooking.user.email) {
        await sendEmail({
          to: updatedBooking.user.email,
          subject: `Your Booking Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          html: `
            <div>
              <h1>Booking Update</h1>
              <p>Your booking has been updated to: ${status}</p>
              <p>Thank you for using our services!</p>
            </div>
          `,
          text: `Booking Update: Your booking has been updated to: ${status}. Thank you for using our services!`
        });
      }
    } catch (emailError) {
      console.error('Error sending booking status email:', emailError);
      // Continue even if email fails
    }

    res.status(200).json({ success: true, data: updatedBooking });
  } catch (error) {
    next(error);
  }
};

// Assign a cleaner to a booking
exports.assignCleaner = async (req, res, next) => {
  try {
    const { bookingId, cleanerId } = req.body;

    if (!bookingId || !cleanerId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and Cleaner ID are required",
      });
    }

    // Verify the cleaner exists
    const cleaner = await User.findOne({ _id: cleanerId, role: 'cleaner' });
    if (!cleaner) {
      return res.status(404).json({
        success: false,
        message: "Cleaner not found"
      });
    }

    // Update the booking with the provided cleanerId and update status
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        cleaner: cleanerId,
        status: 'assigned' // Update status to reflect assignment
      },
      { new: true }
    ).populate('user', 'name email');

    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    // Create system notification
    await Notification.create({
      type: 'system',
      title: 'Cleaner Assigned to Booking',
      message: `${cleaner.name} has been assigned to booking #${updatedBooking._id}.`,
      priority: 'medium',
      status: 'unread'
    });
    
    // Notify cleaner about new assignment
    try {
      await sendEmail({
        to: cleaner.email,
        subject: 'New Cleaning Job Assigned',
        html: `
          <div>
            <h1>New Job Assignment</h1>
            <p>You have been assigned to a new cleaning job. Please check your dashboard for details.</p>
          </div>
        `,
        text: `New Job Assignment: You have been assigned to a new cleaning job. Please check your dashboard for details.`
      });
    } catch (emailError) {
      console.error('Error sending cleaner assignment email:', emailError);
      // Continue even if email fails
    }
    
    // Notify customer about cleaner assignment
    try {
      if (updatedBooking.user && updatedBooking.user.email) {
        await sendEmail({
          to: updatedBooking.user.email,
          subject: 'Cleaner Assigned to Your Booking',
          html: `
            <div>
              <h1>Booking Update</h1>
              <p>A cleaner has been assigned to your booking. Your service is now confirmed.</p>
              <p>Thank you for using our services!</p>
            </div>
          `,
          text: `Booking Update: A cleaner has been assigned to your booking. Your service is now confirmed. Thank you for using our services!`
        });
      }
    } catch (emailError) {
      console.error('Error sending customer assignment email:', emailError);
      // Continue even if email fails
    }

    res.status(200).json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error('Error assigning cleaner:', error);
    next(error);
  }
};

// Reassign a booking to a different cleaner
exports.reassignBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cleanerId } = req.body;
    
    if (!cleanerId) {
      return res.status(400).json({
        success: false,
        message: "Cleaner ID is required"
      });
    }
    
    // Verify the cleaner exists
    const cleaner = await User.findOne({ _id: cleanerId, role: 'cleaner' });
    if (!cleaner) {
      return res.status(404).json({
        success: false,
        message: "Cleaner not found"
      });
    }
    
    // Get the current booking to identify previous cleaner
    const currentBooking = await Booking.findById(id).populate('cleaner', 'name');
    if (!currentBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }
    
    const previousCleanerName = currentBooking.cleaner ? currentBooking.cleaner.name : 'Unassigned';
    
    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { cleaner: cleanerId },
      { new: true }
    ).populate('user', 'name email');
    
    // Create system notification
    await Notification.create({
      type: 'system',
      title: 'Booking Reassigned',
      message: `Booking #${id} reassigned from ${previousCleanerName} to ${cleaner.name}.`,
      priority: 'medium',
      status: 'unread'
    });
    
    // Notify new cleaner about assignment
    try {
      await sendEmail({
        to: cleaner.email,
        subject: 'New Cleaning Job Assigned',
        html: `
          <div>
            <h1>New Job Assignment</h1>
            <p>You have been assigned to a cleaning job. Please check your dashboard for details.</p>
          </div>
        `,
        text: `New Job Assignment: You have been assigned to a cleaning job. Please check your dashboard for details.`
      });
    } catch (emailError) {
      console.error('Error sending new cleaner assignment email:', emailError);
      // Continue even if email fails
    }
    
    // Notify previous cleaner about reassignment
    if (currentBooking.cleaner && currentBooking.cleaner._id.toString() !== cleanerId) {
      try {
        await sendEmail({
          to: currentBooking.cleaner.email,
          subject: 'Job Reassignment Notice',
          html: `
            <div>
              <h1>Job Reassignment Notice</h1>
              <p>A job previously assigned to you has been reassigned to another cleaner.</p>
            </div>
          `,
          text: `Job Reassignment Notice: A job previously assigned to you has been reassigned to another cleaner.`
        });
      } catch (emailError) {
        console.error('Error sending previous cleaner reassignment email:', emailError);
        // Continue even if email fails
      }
    }
    
    res.status(200).json({
      success: true,
      message: "Booking reassigned successfully"
    });
  } catch (error) {
    console.error('Error reassigning booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reassign booking',
      error: error.message
    });
  }
};

// ===== USER MANAGEMENT =====
// Create a new user
// Create a new user
exports.createUser = async (req, res, next) => {
  try {
    const userData = req.body;
    
    // Handle roles array conversion
    if (userData.role && !userData.roles) {
      userData.roles = [userData.role];
      delete userData.role;
    }
    
    // Use a standard password for all users created via admin panel
    // Choose something memorable but not too simple
    const standardPassword = "Welcome@123"; // You can choose any secure password here
    userData.password = standardPassword;
    
    const newUser = new User(userData);
    await newUser.save();
    
    // Create system notification with recipient
    await Notification.create({
      type: 'system',
      title: 'New User Added',
      message: `A new user account has been created for ${userData.name} (${userData.email}).`,
      priority: 'low',
      status: 'unread',
      recipient: req.user.id
    });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        roles: newUser.roles
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    next(error);
  }
};

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().lean();
    
    // Get bookings for each user to calculate stats
    const formattedUsers = await Promise.all(users.map(async user => {
      // Get user's bookings
      const userBookings = await Booking.find({ user: user._id }).lean();
      
      // Calculate total spent
      const totalSpent = userBookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
      
      // Extract role from roles array
      let role = 'client'; // Default role
      if (user.roles && user.roles.length > 0) {
        role = user.roles[0]; // Take first role from array
      } else if (user.role) {
        // For backward compatibility with old data
        role = user.role;
      }
      
      return {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: role, // Use the extracted role
        status: user.status || 'active',
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        totalBookings: userBookings.length,
        totalSpent,
        address: user.addresses && user.addresses.length > 0 
          ? `${user.addresses[0].street || ''}, ${user.addresses[0].city || ''}` 
          : '',
        adminNotes: user.adminNotes || ''
      };
    }));
    
    res.status(200).json({ 
      success: true, 
      data: formattedUsers 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    next(error);
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData.password;
    
    // Convert role to roles array if provided
    if (updateData.role && !updateData.roles) {
      updateData.roles = [updateData.role];
      delete updateData.role;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    next(error);
  }
};

// Update user role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get previous role from roles array
    const previousRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'none';
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { roles: [role] }, // Update roles array instead of role
      { new: true }
    ).select('-password');

    // Create system notification
    await Notification.create({
      type: 'system',
      title: 'User Role Updated',
      message: `${user.name}'s role has been changed from ${previousRole} to ${role}.`,
      priority: 'medium',
      status: 'unread',
      recipient: req.user.id // Make sure to include recipient
    });

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// Delete a user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    // Create system notification
    await Notification.create({
      type: 'system',
      title: 'User Deleted',
      message: `User ${user.name} (${user.email}) has been deleted from the system.`,
      priority: 'medium',
      status: 'unread'
    });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ===== ANALYTICS & SYSTEM =====

// Real export implementation for Analytics
exports.exportAnalytics = async (req, res, next) => {
  try {
    const { timeframe } = req.query;
    
    // Calculate date ranges based on timeframe
    const now = new Date();
    const startDate = new Date();
    
    if (timeframe === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeframe === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // Default to last 30 days
      startDate.setDate(now.getDate() - 30);
    }

    // Total Users
    const totalUsers = await User.countDocuments({
      createdAt: { $lte: now }
    });
    
    // New Users in timeframe
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: now }
    });

    // Active Cleaners
    const activeCleaners = await User.countDocuments({ 
      role: 'cleaner',
      $or: [{ status: 'active' }, { status: { $exists: false } }]
    });

    // Pending Cleaners
    const pendingCleaners = await User.countDocuments({ 
      role: 'cleaner',
      status: 'pending'
    });

    // Total Bookings in timeframe
    const totalBookings = await Booking.countDocuments({
      createdAt: { $gte: startDate, $lte: now }
    });

    // Pending Bookings
    const pendingBookings = await Booking.countDocuments({
      status: { $in: ['pending', 'unassigned'] }
    });

    // Completed Bookings in timeframe
    const completedBookings = await Booking.countDocuments({
      status: 'completed',
      createdAt: { $gte: startDate, $lte: now }
    });

    // Completion Rate (%)
    const completionRate = totalBookings > 0 
      ? Math.round((completedBookings / totalBookings) * 100)
      : 0;

    // Total Revenue from completed bookings in timeframe
    const revenueAgg = await Booking.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: startDate, $lte: now }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Average booking value
    const avgBookingValue = completedBookings > 0 
      ? (totalRevenue / completedBookings).toFixed(2)
      : 0;

    // Prepare data for CSV export
    const data = [
      { Metric: "Total Users", Value: totalUsers },
      { Metric: "New Users in Period", Value: newUsers },
      { Metric: "Active Cleaners", Value: activeCleaners },
      { Metric: "Pending Cleaners", Value: pendingCleaners },
      { Metric: "Total Bookings in Period", Value: totalBookings },
      { Metric: "Completed Bookings in Period", Value: completedBookings },
      { Metric: "Pending Bookings", Value: pendingBookings },
      { Metric: "Completion Rate (%)", Value: completionRate },
      { Metric: "Total Revenue in Period", Value: totalRevenue },
      { Metric: "Average Booking Value", Value: avgBookingValue }
    ];

    // Convert data array to CSV string
    const headers = Object.keys(data[0]).join(",") + "\n";
    const rows = data.map(row => Object.values(row).join(",")).join("\n");
    const csvContent = headers + rows;

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=analytics-export-${timeframe || 'custom'}.csv`);

    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// Get analytics data
exports.getAnalytics = async (req, res, next) => {
  try {
    const { timeframe = 'month' } = req.query;
    
    // Calculate date ranges based on timeframe
    const now = new Date();
    const startDate = new Date();
    const previousStartDate = new Date();
    
    // Set appropriate date ranges for current and previous periods
    if (timeframe === 'week') {
      startDate.setDate(now.getDate() - 7);
      previousStartDate.setDate(startDate.getDate() - 7);
    } else if (timeframe === 'month') {
      startDate.setMonth(now.getMonth() - 1);
      previousStartDate.setMonth(startDate.getMonth() - 1);
    } else if (timeframe === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
      previousStartDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    // Get user data
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: now }
    });
    const previousPeriodUsers = await User.countDocuments({
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });
    
    // Calculate user growth
    const userGrowth = previousPeriodUsers > 0
      ? ((newUsers - previousPeriodUsers) / previousPeriodUsers) * 100
      : newUsers > 0 ? 100 : 0;
    
    // Get booking data
    const totalBookings = await Booking.countDocuments({
      createdAt: { $gte: startDate, $lte: now }
    });
    const completedBookings = await Booking.countDocuments({
      status: 'completed',
      createdAt: { $gte: startDate, $lte: now }
    });
    const previousPeriodBookings = await Booking.countDocuments({
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });
    
    // Calculate booking growth
    const bookingGrowth = previousPeriodBookings > 0
      ? ((totalBookings - previousPeriodBookings) / previousPeriodBookings) * 100
      : totalBookings > 0 ? 100 : 0;
    
    // Get revenue data
    const revenueData = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
    const previousRevenueData = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: previousStartDate, $lt: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const previousRevenue = previousRevenueData.length > 0 ? previousRevenueData[0].total : 0;
    
    // Calculate revenue growth
    const revenueGrowth = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : totalRevenue > 0 ? 100 : 0;
    
    // Get chart data based on timeframe
    let dateFormat;
    let interval;
    
    if (timeframe === 'week') {
      dateFormat = '%Y-%m-%d';
      interval = { days: 1 };
    } else if (timeframe === 'month') {
      dateFormat = '%Y-%m-%d';
      interval = { days: 1 };
    } else if (timeframe === 'year') {
      dateFormat = '%Y-%m';
      interval = { months: 1 };
    }
    
    // Revenue over time
    const revenueOverTime = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          revenue: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Bookings over time
    const bookingsOverTime = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Users over time
    const usersOverTime = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Format chart data
    const chartData = {
      revenue: revenueOverTime.map(item => ({
        date: item._id,
        value: item.revenue
      })),
      bookings: bookingsOverTime.map(item => ({
        date: item._id,
        value: item.count
      })),
      users: usersOverTime.map(item => ({
        date: item._id,
        value: item.count
      }))
    };
    
    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          new: newUsers,
          growth: userGrowth.toFixed(2)
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          growth: bookingGrowth.toFixed(2),
          completionRate: totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(2) : 0
        },
        revenue: {
          total: totalRevenue,
          growth: revenueGrowth.toFixed(2),
          average: completedBookings > 0 ? (totalRevenue / completedBookings).toFixed(2) : 0
        }
      },
      chartData
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    next(error);
  }
};

// Get payment analytics
exports.getPaymentAnalytics = async (req, res, next) => {
  try {
    const { timeframe = 'month', status } = req.query;
    
    // Calculate date ranges based on timeframe
    const now = new Date();
    const startDate = new Date();
    
    // Set appropriate date ranges
    if (timeframe === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeframe === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }
    
    // Build match condition
    const matchCondition = {
      createdAt: { $gte: startDate, $lte: now }
    };
    
    if (status) {
      matchCondition.paymentStatus = status;
    }
    
    // Get payment data
    const payments = await Booking.find(matchCondition)
      .select('amount paymentMethod paymentStatus createdAt')
      .lean();
    
    // Calculate totals
    const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const successfulPayments = payments.filter(p => p.paymentStatus === 'completed');
    const successfulAmount = successfulPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    // Group by payment method
    const paymentMethods = {};
    payments.forEach(payment => {
      const method = payment.paymentMethod || 'unknown';
      if (!paymentMethods[method]) {
        paymentMethods[method] = {
          count: 0,
          amount: 0
        };
      }
      paymentMethods[method].count++;
      paymentMethods[method].amount += payment.amount || 0;
    });
    
    // Group by payment status
    const paymentStatuses = {};
    payments.forEach(payment => {
      const status = payment.paymentStatus || 'unknown';
      if (!paymentStatuses[status]) {
        paymentStatuses[status] = {
          count: 0,
          amount: 0
        };
      }
      paymentStatuses[status].count++;
      paymentStatuses[status].amount += payment.amount || 0;
    });
    
    // Get payments over time
    const paymentsOverTime = await Booking.aggregate([
      {
        $match: matchCondition
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalCount: payments.length,
          totalAmount,
          successfulCount: successfulPayments.length,
          successfulAmount,
          successRate: payments.length > 0 ? (successfulPayments.length / payments.length * 100).toFixed(2) : 0
        },
        paymentMethods,
        paymentStatuses,
        timeline: paymentsOverTime.map(item => ({
          date: item._id,
          amount: item.amount,
          count: item.count
        }))
      }
    });
  } catch (error) {
    console.error('Error getting payment analytics:', error);
    next(error);
  }
};

// Get notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    next(error);
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      id,
      { status: 'read' },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    next(error);
  }
};

// Clear all notifications
exports.clearAllNotifications = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { status: 'unread' },
      { status: 'read' }
    );
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    next(error);
  }
};

// Get unread notification count
exports.getUnreadNotificationsCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ status: 'unread' });
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    next(error);
  }
};

// Get system settings
exports.getSystemSettings = async (req, res, next) => {
  try {
    // Get all system settings
    const settings = await SystemSetting.find().lean();
    
    // Convert to key-value format
    const formattedSettings = {};
    settings.forEach(setting => {
      formattedSettings[setting.key] = setting.value;
    });
    
    res.status(200).json({
      success: true,
      data: formattedSettings
    });
  } catch (error) {
    console.error('Error getting system settings:', error);
    next(error);
  }
};

// Update system settings
exports.updateSystemSettings = async (req, res, next) => {
  try {
    const settings = req.body;
    
    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await SystemSetting.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true }
      );
    }
    
    // Create system notification
    await Notification.create({
      type: 'system',
      title: 'System Settings Updated',
      message: 'System settings have been updated.',
      priority: 'medium',
      status: 'unread'
    });
    
    res.status(200).json({
      success: true,
      message: 'System settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    next(error);
  }
};