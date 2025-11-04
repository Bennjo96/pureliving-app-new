// src/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

// Protect all routes
router.use(protect);

// Get all conversations
router.get('/conversations', messageController.getConversations);

// Get one conversation
router.get('/conversations/:conversationId', messageController.getConversation);

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', messageController.getMessages);

// Create new conversation
router.post('/conversations', messageController.createConversation);

// Send message to existing conversation
router.post('/conversations/:conversationId', messageController.sendMessage);

// Mark conversation as read
router.patch('/conversations/:conversationId/read', messageController.markConversationAsRead);

// Get available recipients for messaging
router.get('/recipients', messageController.getAvailableRecipients);

module.exports = router;