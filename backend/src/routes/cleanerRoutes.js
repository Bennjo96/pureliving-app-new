// src/routes/cleanerRoutes.js
const express = require('express');
const router = express.Router();
const cleanerController = require('../controllers/cleanerController');
const { protect } = require('../middlewares/authMiddleware');
const cleanerAuth = require('../middlewares/cleanerAuthMiddleware');

// Public cleaner information
router.get('/public/:id', cleanerController.getPublicCleanerProfile);

// Apply authentication and cleaner role check for all protected routes
router.use(protect);
router.use(cleanerAuth);

// Profile endpoints
router.get('/profile', cleanerController.getCleanerProfile);
router.put('/profile', cleanerController.updateCleanerProfile);

// Dashboard and job management
router.get('/dashboard', cleanerController.getDashboard);
router.get('/jobs', cleanerController.getJobs);
router.get('/jobs/:id', cleanerController.getJobDetails);
router.put('/jobs/:id/status', cleanerController.updateJobStatus);

// Availability management
router.get('/availability', cleanerController.getAvailability);
router.put('/availability', cleanerController.updateAvailability);

// Reviews Routes
router.get('/reviews', cleanerController.getCleanerReviews);
router.get('/reviews/stats', cleanerController.getCleanerReviewStats);
router.post('/reviews/:reviewId/respond', cleanerController.respondToReview);

// Add service update endpoint
router.put('/services', cleanerController.updateServices);

module.exports = router;