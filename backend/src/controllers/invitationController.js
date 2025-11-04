// src/controllers/invitationController.js
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const sendEmail = require('../utils/sendEmail');

/**
 * Get all admin invitations
 */
exports.getAdminInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({ 
      type: 'admin',
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, invitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invitations' });
  }
};

/**
 * Create a new admin invitation
 */
exports.createAdminInvitation = async (req, res) => {
  try {
    const { email, expiresDays = 7 } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    // Check if there's already an active invitation for this email
    const existingInvitation = await Invitation.findOne({
      email: email.toLowerCase(),
      type: 'admin',
      status: 'active',
      expiresAt: { $gt: new Date() }
    });
    
    if (existingInvitation) {
      return res.status(400).json({ 
        success: false, 
        message: 'An active invitation already exists for this email' 
      });
    }
    
    // Check if user already exists with this email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'This email already belongs to an admin user'
      });
    }
    
    // Create expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiresDays));
    
    // Create invitation
    const invitation = new Invitation({
      email: email.toLowerCase(),
      type: 'admin',
      token: uuidv4(),
      createdBy: req.user._id, // Assuming req.user is populated by middleware
      expiresAt,
      status: 'active'
    });
    
    await invitation.save();
    
    // Send invitation email
    await sendInvitationEmail(invitation);
    
    res.status(201).json({ 
      success: true, 
      message: 'Invitation created and sent successfully', 
      invitation 
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({ success: false, message: 'Failed to create invitation' });
  }
};

/**
 * Delete/revoke an invitation
 */
exports.deleteAdminInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }
    
    // Mark as revoked instead of deleting (for audit trail)
    invitation.status = 'revoked';
    await invitation.save();
    
    res.json({ success: true, message: 'Invitation revoked successfully' });
  } catch (error) {
    console.error('Error revoking invitation:', error);
    res.status(500).json({ success: false, message: 'Failed to revoke invitation' });
  }
};

/**
 * Resend an invitation email
 */
exports.resendAdminInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }
    
    if (invitation.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Can only resend active invitations'
      });
    }
    
    // Update the expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Default to 7 days for resends
    invitation.expiresAt = expiresAt;
    
    await invitation.save();
    
    // Send invitation email
    await sendInvitationEmail(invitation);
    
    res.json({ 
      success: true, 
      message: 'Invitation resent successfully',
      invitation
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    res.status(500).json({ success: false, message: 'Failed to resend invitation' });
  }
};

/**
 * Get invitation statistics
 */
exports.getInvitationStats = async (req, res) => {
  try {
    const now = new Date();
    
    // Count by status
    const [active, used, expired, revoked] = await Promise.all([
      Invitation.countDocuments({ type: 'admin', status: 'active', expiresAt: { $gt: now } }),
      Invitation.countDocuments({ type: 'admin', status: 'used' }),
      Invitation.countDocuments({ type: 'admin', status: 'active', expiresAt: { $lte: now } }),
      Invitation.countDocuments({ type: 'admin', status: 'revoked' })
    ]);
    
    // Recent invitations
    const recentInvitations = await Invitation.find({ type: 'admin' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name email');
    
    res.json({
      success: true,
      stats: {
        active,
        used,
        expired,
        revoked,
        total: active + used + expired + revoked
      },
      recentInvitations
    });
  } catch (error) {
    console.error('Error getting invitation stats:', error);
    res.status(500).json({ success: false, message: 'Failed to get invitation statistics' });
  }
};

/**
 * Validate an invitation token (public route)
 */
exports.validateAdminInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findOne({
      token: req.params.token,
      type: 'admin',
      status: 'active',
      expiresAt: { $gt: new Date() }
    });
    
    if (!invitation) {
      return res.json({ 
        valid: false,
        message: 'Invalid or expired invitation token'
      });
    }
    
    res.json({ 
      valid: true, 
      email: invitation.email 
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    res.status(500).json({ 
      valid: false, 
      message: 'Error validating invitation'
    });
  }
};

/**
 * Helper function to send invitation email
 */
async function sendInvitationEmail(invitation) {
  // Generate the invitation link
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const inviteLink = `${baseUrl}/admin/signup?token=${invitation.token}`;
  
  // Invitation email content
  const emailContent = {
    to: invitation.email,
    subject: 'You are invited to become an admin at PureLiving',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Admin Invitation</h2>
        <p>You have been invited to become an administrator at PureLiving.</p>
        <p>Please click the link below to create your admin account:</p>
        <p>
          <a href="${inviteLink}" style="display: inline-block; background-color: #14b8a6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Accept Invitation
          </a>
        </p>
        <p><strong>Note:</strong> This invitation will expire on ${invitation.expiresAt.toLocaleDateString()}.</p>
        <p>If you did not request this invitation, please ignore this email.</p>
        <p>Thank you,<br>The PureLiving Team</p>
      </div>
    `
  };
  
  // Send the email
  await sendEmail(emailContent);
}

module.exports = exports;