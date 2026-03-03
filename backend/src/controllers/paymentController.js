// src/controllers/paymentController.js
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment'); // You might need to create this model

// Process payment for a booking
exports.processPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId, paymentMethod, cardDetails, billingAddress, saveCard } = req.body;
    
    // Validate input
    if (!bookingId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId and paymentMethod'
      });
    }
    
    // Find the booking
    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not belonging to this user'
      });
    }
    
    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been paid for'
      });
    }
    
    // In a real application, you would:
    // 1. Integrate with a payment gateway (Stripe, PayPal, etc.)
    // 2. Send the payment request to the gateway
    // 3. Process the response
    
    // For demo purposes, we'll simulate a successful payment
    const paymentId = 'PAY' + Math.floor(100000 + Math.random() * 900000);
    
    // Save payment information
    const payment = new Payment({
      booking: bookingId,
      user: userId,
      amount: booking.price,
      paymentMethod,
      status: 'completed',
      transactionId: paymentId,
      billingAddress
    });
    
    await payment.save();
    
    // Update booking payment status
    booking.payment.status = 'paid';
    booking.payment.method = paymentMethod === 'card' ? 'credit_card' : paymentMethod;
    booking.payment.transactionId = payment.transactionId;
    booking.payment.paidAt = new Date();
    
    await booking.save();
    
    // If user wants to save card for future use
    if (saveCard && paymentMethod === 'card' && cardDetails) {
      // Mask card number for security (only store last 4 digits)
      const last4 = cardDetails.number.slice(-4);
      const maskedCardNumber = '••••••••••••' + last4;
      
      // Save card to user profile
      await User.findByIdAndUpdate(userId, {
        $push: {
          paymentMethods: {
            type: 'card',
            cardType: cardDetails.cardType || 'Credit/Debit',
            last4,
            maskedNumber: maskedCardNumber,
            expiryDate: cardDetails.expiry,
            isDefault: true // Make this the default payment method
          }
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        paymentId,
        amount: booking.price,
        status: 'completed',
        bookingId
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing payment',
      error: error.message
    });
  }
};

// Verify payment status
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, bookingId } = req.body;
    
    if (!paymentId && !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide paymentId or bookingId'
      });
    }
    
    let payment;
    
    if (paymentId) {
      payment = await Payment.findOne({ transactionId: paymentId });
    } else {
      payment = await Payment.findOne({ booking: bookingId });
    }
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        paymentId: payment.transactionId,
        status: payment.status,
        amount: payment.amount,
        date: payment.createdAt
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying payment',
      error: error.message
    });
  }
};

// Validate promo code
exports.validatePromoCode = async (req, res) => {
  try {
    const { code, bookingId } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a promo code'
      });
    }
    
    // In a real application, you would check against a database of promo codes
    // For demo purposes, we'll hardcode a few valid promo codes
    const promoCodes = {
      'WELCOME20': { type: 'percentage', value: 20, description: '20% off your first booking' },
      'CLEAN10': { type: 'fixed', value: 10, description: '€10 off your booking' },
      'SUMMER2023': { type: 'percentage', value: 15, description: '15% off summer bookings' }
    };
    
    const promoCode = promoCodes[code.toUpperCase()];
    
    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid promo code'
      });
    }
    
    // If booking ID is provided, check if the code can be applied to this booking
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      // Example: WELCOME20 can only be used for first-time bookings
      if (code.toUpperCase() === 'WELCOME20') {
        const userBookingsCount = await Booking.countDocuments({ user: req.user.id });
        if (userBookingsCount > 1) {
          return res.status(400).json({
            success: false,
            message: 'This promo code can only be used for your first booking'
          });
        }
      }
      
      // Calculate discount amount
      let discountAmount = 0;
      if (promoCode.type === 'percentage') {
        discountAmount = (booking.price * promoCode.value) / 100;
      } else {
        discountAmount = Math.min(promoCode.value, booking.price); // Don't discount more than the price
      }
      
      res.status(200).json({
        success: true,
        message: 'Promo code applied successfully',
        data: {
          code: code.toUpperCase(),
          type: promoCode.type,
          value: promoCode.value,
          description: promoCode.description,
          discountAmount,
          finalPrice: booking.price - discountAmount
        }
      });
    } else {
      // Just validate the code without applying it to a booking
      res.status(200).json({
        success: true,
        message: 'Valid promo code',
        data: {
          code: code.toUpperCase(),
          type: promoCode.type,
          value: promoCode.value,
          description: promoCode.description
        }
      });
    }
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while validating promo code',
      error: error.message
    });
  }
};

// Get user's promo codes
exports.getUserPromoCodes = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // In a real application, you would query a database for promo codes available to this user
    // For demo purposes, return sample data
    const userPromoCodes = [
      {
        code: 'WELCOME20',
        type: 'percentage',
        value: 20,
        description: '20% off your first booking',
        expiryDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isUsed: false
      },
      {
        code: 'REFERRAL15',
        type: 'percentage',
        value: 15,
        description: '15% off for referring a friend',
        expiryDate: new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        isUsed: false
      }
    ];
    
    res.status(200).json({
      success: true,
      count: userPromoCodes.length,
      data: userPromoCodes
    });
  } catch (error) {
    console.error('Error fetching user promo codes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching promo codes',
      error: error.message
    });
  }
};

// Get saved payment methods
exports.getSavedPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('paymentMethods');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const paymentMethods = user.paymentMethods || [];
    
    res.status(200).json({
      success: true,
      count: paymentMethods.length,
      data: paymentMethods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment methods',
      error: error.message
    });
  }
};

// Add payment method
exports.addPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, cardDetails, isDefault } = req.body;
    
    if (!type || (type === 'card' && !cardDetails)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide payment method details'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Initialize payment methods array if it doesn't exist
    if (!user.paymentMethods) {
      user.paymentMethods = [];
    }
    
    let newPaymentMethod = {};
    
    if (type === 'card') {
      // Mask card number for security (only store last 4 digits)
      const last4 = cardDetails.number.slice(-4);
      const maskedCardNumber = '••••••••••••' + last4;
      
      newPaymentMethod = {
        type: 'card',
        cardType: cardDetails.cardType || 'Credit/Debit',
        last4,
        maskedNumber: maskedCardNumber,
        expiryDate: cardDetails.expiry,
        isDefault: isDefault || false
      };
    } else if (type === 'paypal') {
      newPaymentMethod = {
        type: 'paypal',
        email: req.body.email,
        isDefault: isDefault || false
      };
    }
    
    // If this is the default payment method, update all others to non-default
    if (newPaymentMethod.isDefault) {
      user.paymentMethods = user.paymentMethods.map(method => ({
        ...method,
        isDefault: false
      }));
    }
    
    // Add the new payment method
    user.paymentMethods.push(newPaymentMethod);
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: newPaymentMethod
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding payment method',
      error: error.message
    });
  }
};

// Delete payment method
exports.deletePaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find the payment method
    const paymentMethodIndex = user.paymentMethods.findIndex(
      method => method._id.toString() === id
    );
    
    if (paymentMethodIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }
    
    // Check if it's the only payment method
    if (user.paymentMethods.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the only payment method'
      });
    }
    
    // Check if it's the default payment method
    const isDefault = user.paymentMethods[paymentMethodIndex].isDefault;
    
    // Remove the payment method
    user.paymentMethods.splice(paymentMethodIndex, 1);
    
    // If it was the default, set the first remaining method as default
    if (isDefault && user.paymentMethods.length > 0) {
      user.paymentMethods[0].isDefault = true;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting payment method',
      error: error.message
    });
  }
};

module.exports = exports;