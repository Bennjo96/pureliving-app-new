// src/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

// Public review routes
router.get('/cleaner/:id', reviewController.getCleanerReviews);

// Protected routes
router.use(protect);
router.post('/booking/:id', reviewController.createReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.get('/user', reviewController.getUserReviews);

module.exports = router;