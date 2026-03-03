// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const invitationController = require('../controllers/invitationController');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Apply admin middleware to all routes except validation
router.use((req, res, next) => {
  // Skip admin middleware for invitation validation route
  if (req.path.startsWith('/invitations/validate/')) {
    return next();
  }
  // Apply admin middleware for all other routes
  adminMiddleware(req, res, next);
});

// Dashboard Routes
router.get('/dashboard', adminController.getDashboard);
router.get('/analytics/export', adminController.exportAnalytics);

// Admin Invitation Management Routes
router.get('/invitations', invitationController.getAdminInvitations);
router.post('/invitations', invitationController.createAdminInvitation);
router.delete('/invitations/:id', invitationController.deleteAdminInvitation);
router.post('/invitations/:id/resend', invitationController.resendAdminInvitation);
router.get('/invitations/stats', invitationController.getInvitationStats);

// Invitation Validation (public route - handled by middleware exclusion above)
router.get('/invitations/validate/:token', invitationController.validateAdminInvitation);

// Cleaner Management Routes
router.get('/cleaners', adminController.getCleaners);
router.post('/cleaners', adminController.createCleaner);
router.put('/cleaners/:id', adminController.updateCleaner);
router.put('/cleaners/:id/status', adminController.updateCleanerStatus);
router.put('/cleaners/:id/approve', adminController.approveCleaner);
router.delete('/cleaners/:id', adminController.deleteCleaner);

// Bookings Management
router.get('/bookings', adminController.getAllBookings);
router.put('/bookings/:id', adminController.updateBookingStatus);
router.post('/bookings/assign-cleaner', adminController.assignCleaner);
router.put('/bookings/:id/reassign', adminController.reassignBooking);

// Users Management
router.get('/users', adminController.getAllUsers);
// Add route for creating new users
router.post('/users', adminController.createUser);
// Handle updateUserRole via updateUser for now
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Analytics Routes
router.get('/analytics', adminController.getAnalytics);
router.get('/payments', adminController.getPaymentAnalytics);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.patch('/notifications/:id/read', adminController.markNotificationAsRead);

// System Settings
router.get('/system-settings', adminController.getSystemSettings);
router.put('/system-settings', adminController.updateSystemSettings);

// NEW ROUTES FOR ASSIGNMENT ALGORITHM
// Use safe pattern with fallbacks in case methods don't exist yet
router.get('/bookings/needs-assignment', (req, res) => {
  if (adminController.getBookingsNeedingAssignment) {
    return adminController.getBookingsNeedingAssignment(req, res);
  }
  res.status(501).json({ 
    success: false, 
    message: 'Assignment algorithm not yet fully implemented' 
  });
});

router.get('/bookings/:id/assignment-scores', (req, res) => {
  if (adminController.getAssignmentScores) {
    return adminController.getAssignmentScores(req, res);
  }
  res.status(501).json({ 
    success: false, 
    message: 'Assignment scoring not yet implemented' 
  });
});

router.post('/bookings/run-auto-assignment', (req, res) => {
  if (adminController.runAutoAssignment) {
    return adminController.runAutoAssignment(req, res);
  }
  res.status(501).json({ 
    success: false, 
    message: 'Auto-assignment not yet implemented' 
  });
});

module.exports = router;