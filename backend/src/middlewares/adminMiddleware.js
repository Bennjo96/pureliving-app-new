// src/middlewares/adminMiddleware.js
const { protect } = require('./authMiddleware');
const User = require('../models/User'); // Import User model for additional checks

const isAdmin = async (req, res, next) => {
  try {
    // Ensure user exists and is an admin
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Additional database check for admin status
    const user = await User.findById(req.user.id);
    
    if (!user || !user.roles.includes('admin')) {  // Updated to check roles array
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin rights required.'
      });
    }

    // Optional: Log admin access attempts
    console.log(`Admin access: ${user.email} accessed ${req.path}`);

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin authentication'
    });
  }
};

// Export as a function that chains the middleware
module.exports = (req, res, next) => {
  // Apply the protection middleware first
  protect(req, res, (err) => {
    if (err) return next(err);
    
    // Then apply the admin check
    isAdmin(req, res, (err) => {
      if (err) return next(err);
      
      // Finally apply the timestamp middleware
      const timestamp = new Date().toISOString();
      req.adminAccessTimestamp = timestamp;
      next();
    });
  });
};