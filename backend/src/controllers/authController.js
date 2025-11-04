const User = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

// Register a new user
exports.register = async (req, res) => {
  try {
    // Use the provided role if any; otherwise default to "customer"
    const { name, email, password, role } = req.body;
    let roles = [];
    if (role) {
      // If a role is provided (e.g., "cleaner"), add it
      roles.push(role);
    } else {
      roles.push("customer");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // If user exists, generate a token for them and return it (auto-login)
      const token = jwt.sign(
        { id: existingUser._id, roles: existingUser.roles },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      // If user wasn't verified, mark them as verified now
      if (!existingUser.isEmailVerified) {
        existingUser.isEmailVerified = true;
        await existingUser.save();
      }
      
      return res.status(200).json({
        success: true,
        message: 'Account already exists. Logged in successfully.',
        code: 'EXISTING_ACCOUNT_LOGIN',
        token,
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          roles: existingUser.roles,
          isVerified: true
        }
      });
    }

    // Create new user - auto-verified
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      roles, // store roles as an array
      isEmailVerified: true // Auto-verify all users
    });

    // Save user to database
    await user.save();

    // Generate token for auto-login
    const token = jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Return success with token for auto-login
    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account is ready to use.',
      code: 'REGISTRATION_SUCCESS',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        isVerified: true
      }
    });
  } catch (error) {
    console.error('Registration error details:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      code: 'SERVER_ERROR'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Auto-verify the user if they weren't verified
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save();
    }

    // Generate token including roles
    const token = jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      token,
      code: 'LOGIN_SUCCESS',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        isVerified: true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      code: 'SERVER_ERROR'
    });
  }
};

// User logout - client side handled, just a stub
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    code: 'LOGOUT_SUCCESS'
  });
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      code: 'SERVER_ERROR'
    });
  }
};

// Verify email - keeping but auto-verifying
exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
        code: 'INVALID_VERIFICATION_TOKEN'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
      code: 'EMAIL_VERIFIED'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      code: 'SERVER_ERROR'
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email',
        code: 'USER_NOT_FOUND'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'PureLiving - Reset Your Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #14b8a6;">Reset Your Password</h1>
            <p>Hi ${user.name},</p>
            <p>You requested to reset your password. Please click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetURL}" style="background-color: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
            <p>This link will expire in 1 hour.</p>
            <p>Thanks,<br>The PureLiving Team</p>
          </div>
        `,
        text: `You requested to reset your password. Please go to: ${resetURL} to reset your password.`
      });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
        code: 'RESET_EMAIL_SENT'
      });
    } catch (error) {
      console.error('Password reset email error:', error);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent',
        code: 'EMAIL_SEND_FAILED'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      code: 'SERVER_ERROR'
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
        code: 'INVALID_RESET_TOKEN'
      });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.',
      code: 'PASSWORD_RESET_SUCCESS'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      code: 'SERVER_ERROR'
    });
  }
};

// Admin login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password, adminCode } = req.body;

    if (adminCode !== process.env.ADMIN_CODE) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin code',
        code: 'INVALID_ADMIN_CODE'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Ensure the user has the 'admin' role
    if (!user.roles.includes('admin')) {
      user.roles.push('admin');
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      token,
      code: 'ADMIN_LOGIN_SUCCESS',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      code: 'SERVER_ERROR'
    });
  }
};

// Regular user token refresh
exports.refreshToken = async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        code: 'TOKEN_MISSING'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Validate token even if expired
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Check if user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Generate new token with shorter expiration
    const newToken = jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Shorter expiration for better security
    );
    
    return res.status(200).json({
      success: true,
      token: newToken,
      code: 'TOKEN_REFRESHED',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      code: 'SERVER_ERROR'
    });
  }
};

// Admin token refresh
exports.refreshAdminToken = async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        code: 'TOKEN_MISSING'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Validate token even if expired
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Check if user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Verify admin role
    if (!user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin',
        code: 'NOT_ADMIN'
      });
    }
    
    // Generate new token with shorter expiration
    const newToken = jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Shorter expiration for better security
    );
    
    return res.status(200).json({
      success: true,
      token: newToken,
      code: 'ADMIN_TOKEN_REFRESHED',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error('Admin token refresh error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      code: 'SERVER_ERROR'
    });
  }
};

// Admin registration
exports.adminRegister = async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;

    if (adminCode !== process.env.ADMIN_CODE) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin code',
        code: 'INVALID_ADMIN_CODE'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (!existingUser.roles.includes('admin')) {
        existingUser.roles.push('admin');
        await existingUser.save();

        const token = jwt.sign(
          { id: existingUser._id, roles: existingUser.roles },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        return res.status(200).json({
          success: true,
          message: 'User updated to admin role',
          code: 'USER_UPDATED_TO_ADMIN',
          token,
          user: {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            roles: existingUser.roles
          }
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Email already registered as admin',
        code: 'EMAIL_ALREADY_ADMIN'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      roles: ['admin'], // Set roles to admin
      isEmailVerified: true // Auto-verify admin accounts
    });

    const token = jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      success: true,
      token,
      code: 'ADMIN_REGISTRATION_SUCCESS',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      code: 'SERVER_ERROR'
    });
  }
};