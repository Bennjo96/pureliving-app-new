// src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

// Protected routes
router.use(protect);

// Process payments
router.post('/process', paymentController.processPayment);
router.post('/verify-payment', paymentController.verifyPayment);

// Promo codes
router.post('/validate-promo', paymentController.validatePromoCode);
router.get('/user-promos', paymentController.getUserPromoCodes);

// Saved payment methods
router.get('/methods', paymentController.getSavedPaymentMethods);
router.post('/methods', paymentController.addPaymentMethod);
router.delete('/methods/:id', paymentController.deletePaymentMethod);

module.exports = router;