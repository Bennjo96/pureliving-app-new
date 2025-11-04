// src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

// Protect all routes
router.use(protect);

// Get all notifications
router.get('/', notificationController.getNotifications);

// Get unread notifications count
router.get('/unread/count', notificationController.getUnreadCount);

// Mark all as read
router.patch('/read-all', notificationController.markAllAsRead);

// Mark as read or delete single notification
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;