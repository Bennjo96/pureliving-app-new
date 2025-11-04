// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const invitationController = require('../controllers/invitationController');

// Token refresh routes
router.post('/refresh-token', authController.refreshToken);
router.post('/admin/refresh-token', authController.refreshAdminToken);

// Regular auth routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

// Admin-specific auth routes
router.post('/admin/login', authController.adminLogin);
router.post('/admin/register', authController.adminRegister);

// Admin invitation validation - public route, doesn't need auth
router.get('/admin/invitations/validate/:token', invitationController.validateAdminInvitation);

module.exports = router;