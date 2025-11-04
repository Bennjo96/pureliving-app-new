const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Protect all user routes with authentication
router.use(protect);

// Profile management
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Settings management
router.get('/settings', userController.getUserSettings);
router.put('/settings', userController.updateUserSettings);

// Password and account management
router.put('/change-password', userController.changePassword);
router.delete('/delete-account', userController.deleteAccount);

// Bookings
router.get('/bookings', userController.getUserBookings);

// Addresses
router.get('/addresses', userController.getUserAddresses);
router.post('/addresses', userController.addUserAddress);
router.put('/addresses/:id', userController.updateUserAddress);
router.delete('/addresses/:id', userController.deleteUserAddress);

// Notifications
router.get('/notifications', userController.getUserNotifications);
router.put('/notifications/mark-read/:id', userController.markNotificationAsRead);
router.put('/notifications/mark-all-read', userController.markAllNotificationsAsRead);

module.exports = router;