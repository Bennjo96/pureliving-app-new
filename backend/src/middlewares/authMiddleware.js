const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from the token
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Add user to request object
      req.user = {
        id: user._id,
        roles: user.roles
      };
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Middleware to restrict routes to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    const userRoles = req.user.roles || [];
    const hasRole = userRoles.some(role => roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `User roles [${userRoles.join(', ')}] are not authorized to access this route`
      });
    }
    next();
  };
};