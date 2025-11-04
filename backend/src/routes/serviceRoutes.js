// src/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes (no authentication needed)
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.get('/category/:category', serviceController.getServicesByCategory);

// Features/FAQ endpoints
router.get('/features', serviceController.getServiceFeatures);
router.get('/faq', serviceController.getServiceFAQs);

module.exports = router;