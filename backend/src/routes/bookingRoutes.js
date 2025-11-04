// src/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Public routes (no authentication required)
// These need to be defined before the protect middleware
router.get('/availability/:postalCode', bookingController.checkServiceAvailability);
router.get('/service-types/:postalCode', bookingController.getAvailableServiceTypes);
router.get('/available-slots', bookingController.getAvailableTimeSlots);
router.get('/available-cleaners', bookingController.getAvailableCleaners);

// Protected routes that require authentication
router.use(protect);

// Create and manage bookings
router.post('/', bookingController.createBooking);
router.get('/user', bookingController.getUserBookings);
router.get('/:id', bookingController.getBookingById);
router.put('/:id', bookingController.updateBooking);
router.put('/:id/cancel', bookingController.cancelBooking); // Changed from DELETE to PUT

// NEW ROUTES FOR ASSIGNMENT ALGORITHM
// Process payment and auto-assign cleaner
router.post('/:id/process-payment', bookingController.processPaymentAndAssign);

// Admin routes - these require admin middleware
// These should be after the regular routes to avoid conflicts
// For route-specific admin access, use the adminMiddleware directly
router.put('/admin/:id/assign', adminMiddleware, bookingController.adminAssignCleaner);
router.get('/admin/:id/assignment-scores', adminMiddleware, bookingController.getAssignmentScores);
router.get('/admin/needs-assignment', adminMiddleware, bookingController.getBookingsNeedingAssignment);
router.post('/admin/run-auto-assignment', adminMiddleware, bookingController.runAutoAssignment);

module.exports = router;