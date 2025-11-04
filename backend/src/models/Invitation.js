// src/models/Invitation.js
const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['admin', 'cleaner', 'customer'],
    default: 'customer'
  },
  // Add a more specific role field for admin invitations
  role: {
    type: String,
    enum: ['admin', 'manager', 'support'],
    default: 'admin'
  },
  status: {
    type: String,
    enum: ['active', 'used', 'expired', 'revoked'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  usedAt: {
    type: Date
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Add a customMessage field for personalized invitations
  customMessage: {
    type: String,
    trim: true
  },
  // Track email sending status
  emailSent: {
    type: Boolean,
    default: false
  },
  // Track when the invitation was last resent
  lastResent: {
    type: Date
  }
}, { timestamps: true });

// Add index to improve query performance
invitationSchema.index({ token: 1 });
invitationSchema.index({ email: 1, status: 1 });
invitationSchema.index({ expiresAt: 1 });
invitationSchema.index({ type: 1, status: 1 });

// Add pre-save hook to set role based on type if not provided
invitationSchema.pre('save', function(next) {
  if (this.type === 'admin' && !this.role) {
    this.role = 'admin';
  }
  next();
});

// Method to check if invitation is expired
invitationSchema.methods.isExpired = function() {
  return this.status === 'expired' || (this.expiresAt && this.expiresAt < new Date());
};

// Method to mark invitation as used
invitationSchema.methods.markAsUsed = function(userId) {
  this.status = 'used';
  this.usedAt = new Date();
  this.usedBy = userId;
  return this.save();
};

// Method to revoke invitation
invitationSchema.methods.revoke = function() {
  this.status = 'revoked';
  return this.save();
};

// Static method to expire outdated invitations
invitationSchema.statics.expireOldInvitations = async function() {
  const now = new Date();
  return this.updateMany(
    { status: 'active', expiresAt: { $lt: now } },
    { $set: { status: 'expired' } }
  );
};

module.exports = mongoose.model('Invitation', invitationSchema);