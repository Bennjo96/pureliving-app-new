// src/middlewares/cleanerAuthMiddleware.js
const User = require("../models/User");

const cleanerAuth = async (req, res, next) => {
  try {
    // Check if user has cleaner role directly from token
    if (req.user.roles && req.user.roles.includes("cleaner")) {
      return next();
    }

    // Double-check by fetching user from database
    const user = await User.findById(req.user.id);

    if (!user || !user.roles || !user.roles.includes("cleaner")) {
      return res.status(403).json({
        success: false,
        message: "Access denied. User is not a cleaner.",
      });
    }

    next();
  } catch (error) {
    console.error("Error in cleaner auth middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authorization",
    });
  }
};

module.exports = cleanerAuth;
