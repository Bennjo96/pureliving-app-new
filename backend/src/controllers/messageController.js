// src/controllers/messageController.js
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const notificationController = require('./notificationController');

// Get all conversations for current user
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .sort({ lastMessageTime: -1 })
    .populate('participants', 'name email role profileImage')
    .limit(20);
    
    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
};

// Get single conversation with messages
exports.getConversation = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    
    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    }).populate('participants', 'name email role profileImage');
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Mark conversation as read by this user
    await Conversation.findByIdAndUpdate(conversationId, {
      $pull: { readBy: { user: req.user.id } }
    });
    
    await Conversation.findByIdAndUpdate(conversationId, {
      $push: { readBy: { user: req.user.id, readAt: new Date() } }
    });
    
    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation'
    });
  }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    
    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Get messages with pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    
    // If after parameter is provided, get messages after that timestamp
    const afterParam = req.query.after ? new Date(req.query.after) : null;
    const filter = afterParam 
      ? { conversation: conversationId, createdAt: { $gt: afterParam } }
      : { conversation: conversationId };
    
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name email role profileImage');
    
    const total = await Message.countDocuments({ conversation: conversationId });
    
    res.status(200).json({
      success: true,
      count: messages.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: messages.reverse() // Reverse to get chronological order
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
};

// Create a new conversation
exports.createConversation = async (req, res) => {
  try {
    const { recipientId, message, subject } = req.body;
    
    if (!recipientId || !message || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipient, message and subject'
      });
    }
    
    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }
    
    // Check if conversation already exists between these users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, recipientId] }
    });
    
    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [req.user.id, recipientId],
        subject,
        lastMessage: message,
        lastMessageTime: new Date(),
        readBy: [{ user: req.user.id }]
      });
    }
    
    // Add message to conversation
    const newMessage = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      text: message
    });
    
    // Update conversation with last message
    conversation.lastMessage = message;
    conversation.lastMessageTime = new Date();
    await conversation.save();
    
    // Create notification for recipient
    await notificationController.createNotification({
      recipient: recipientId,
      type: 'message',
      title: 'New Message',
      message: `You have a new message from ${req.user.name}`,
      relatedId: conversation._id,
      relatedModel: 'Conversation',
      link: `/messages/${conversation._id}`
    });
    
    res.status(201).json({
      success: true,
      data: {
        conversation,
        message: newMessage
      }
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating conversation'
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }
    
    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Create new message
    const newMessage = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      text: message
    });
    
    // Update conversation with last message
    conversation.lastMessage = message;
    conversation.lastMessageTime = new Date();
    
    // Remove all read records except sender's
    conversation.readBy = conversation.readBy.filter(
      read => read.user.toString() === req.user.id.toString()
    );
    
    // Add sender as having read
    if (!conversation.readBy.some(read => read.user.toString() === req.user.id.toString())) {
      conversation.readBy.push({ user: req.user.id, readAt: new Date() });
    }
    
    await conversation.save();
    
    // Notify other participants
    const otherParticipants = conversation.participants.filter(
      p => p.toString() !== req.user.id.toString()
    );
    
    for (const recipient of otherParticipants) {
      await notificationController.createNotification({
        recipient,
        type: 'message',
        title: 'New Message',
        message: `You have a new message from ${req.user.name}`,
        relatedId: conversation._id,
        relatedModel: 'Conversation',
        link: `/messages/${conversation._id}`
      });
    }
    
    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
};

// Mark conversation as read
exports.markConversationAsRead = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    
    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Update the read status for this user
    await Conversation.findByIdAndUpdate(conversationId, {
      $pull: { readBy: { user: req.user.id } }
    });
    
    await Conversation.findByIdAndUpdate(conversationId, {
      $push: { readBy: { user: req.user.id, readAt: new Date() } }
    });
    
    res.status(200).json({
      success: true,
      message: 'Conversation marked as read'
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating conversation'
    });
  }
};

// Get available recipients for messaging
exports.getAvailableRecipients = async (req, res) => {
  try {
    // Logic depends on your business rules
    // For example, a customer might only message cleaners they've booked
    // An admin might message anyone
    // A cleaner might message customers they've worked with
    
    let recipients = [];
    const userRole = req.user.role;
    
    if (userRole === 'admin') {
      // Admins can message anyone
      recipients = await User.find({ _id: { $ne: req.user.id } })
        .select('name email role profileImage')
        .limit(50);
    } else if (userRole === 'customer') {
      // Customers can message admins and their cleaners
      // This would typically involve a JOIN with bookings to find relevant cleaners
      recipients = await User.find({ 
        role: { $in: ['admin', 'cleaner'] }
      })
      .select('name email role profileImage')
      .limit(50);
    } else if (userRole === 'cleaner') {
      // Cleaners can message admins and their customers
      recipients = await User.find({ 
        role: { $in: ['admin', 'customer'] }
      })
      .select('name email role profileImage')
      .limit(50);
    }
    
    res.status(200).json({
      success: true,
      count: recipients.length,
      data: recipients
    });
  } catch (error) {
    console.error('Error fetching recipients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recipients'
    });
  }
};