// src/services/paymentService.js
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const User = require('../models/User');

/**
 * Process a payment for a booking.
 *
 * In production this should integrate with a payment gateway (Stripe, PayPal, etc.).
 * For now it creates a Payment record and marks the booking as paid.
 *
 * @param {Object} options
 * @param {string} options.bookingId
 * @param {string} options.userId
 * @param {string} options.paymentMethod  - 'card' | 'paypal' | 'klarna' | 'cash'
 * @param {Object} [options.cardDetails]  - { number, cardType, expiry }
 * @param {Object} [options.billingAddress]
 * @param {boolean} [options.saveCard]
 * @returns {Promise<{ payment: Payment, booking: Booking }>}
 */
const processPayment = async ({ bookingId, userId, paymentMethod, cardDetails, billingAddress, saveCard }) => {
  const booking = await Booking.findOne({ _id: bookingId, user: userId });

  if (!booking) {
    const err = new Error('Booking not found or does not belong to this user');
    err.statusCode = 404;
    throw err;
  }

  if (booking.payment && booking.payment.status === 'paid') {
    const err = new Error('This booking has already been paid for');
    err.statusCode = 400;
    throw err;
  }

  // TODO: Replace with real gateway call (Stripe / PayPal charge)
  const transactionId = 'PAY' + Math.floor(100000 + Math.random() * 900000);

  const payment = await Payment.create({
    booking: bookingId,
    user: userId,
    amount: booking.price,
    paymentMethod,
    status: 'completed',
    transactionId,
    billingAddress,
  });

  // Keep booking's embedded payment sub-doc in sync
  booking.payment.status = 'paid';
  booking.payment.method = paymentMethod === 'card' ? 'credit_card' : paymentMethod;
  booking.payment.transactionId = transactionId;
  booking.payment.paidAt = new Date();
  await booking.save();

  // Optionally persist masked card details on the user profile
  if (saveCard && paymentMethod === 'card' && cardDetails) {
    const last4 = String(cardDetails.number).slice(-4);
    await User.findByIdAndUpdate(userId, {
      $push: {
        paymentMethods: {
          type: 'card',
          cardType: cardDetails.cardType || 'Credit/Debit',
          last4,
          maskedNumber: '••••••••••••' + last4,
          expiryDate: cardDetails.expiry,
          isDefault: false,
        },
      },
    });
  }

  return { payment, booking };
};

/**
 * Verify whether a payment exists and its current status.
 *
 * @param {Object} options
 * @param {string} [options.paymentId]   - transactionId string
 * @param {string} [options.bookingId]
 * @returns {Promise<Payment>}
 */
const verifyPayment = async ({ paymentId, bookingId }) => {
  let payment = null;

  if (paymentId) {
    payment = await Payment.findOne({ transactionId: paymentId });
  } else if (bookingId) {
    payment = await Payment.findOne({ booking: bookingId });
  }

  if (!payment) {
    const err = new Error('Payment not found');
    err.statusCode = 404;
    throw err;
  }

  return payment;
};

/**
 * Validate a promo code and calculate the discount for a booking.
 *
 * @param {Object} options
 * @param {string} options.code
 * @param {string} [options.bookingId]
 * @param {string} options.userId
 * @returns {Promise<Object>} - { code, type, value, description, discountAmount?, finalPrice? }
 */
const validatePromoCode = async ({ code, bookingId, userId }) => {
  // Hardcoded promo codes – swap this for a DB lookup when ready
  const promoCodes = {
    WELCOME20: { type: 'percentage', value: 20, description: '20% off your first booking' },
    CLEAN10:   { type: 'fixed',      value: 10, description: '€10 off your booking' },
    SUMMER2023:{ type: 'percentage', value: 15, description: '15% off summer bookings' },
  };

  const promo = promoCodes[code.toUpperCase()];

  if (!promo) {
    const err = new Error('Invalid promo code');
    err.statusCode = 404;
    throw err;
  }

  if (!bookingId) {
    return { code: code.toUpperCase(), ...promo };
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  // WELCOME20 is first-booking only
  if (code.toUpperCase() === 'WELCOME20') {
    const count = await Booking.countDocuments({ user: userId });
    if (count > 1) {
      const err = new Error('This promo code can only be used for your first booking');
      err.statusCode = 400;
      throw err;
    }
  }

  const discountAmount = promo.type === 'percentage'
    ? (booking.price * promo.value) / 100
    : Math.min(promo.value, booking.price);

  return {
    code: code.toUpperCase(),
    ...promo,
    discountAmount,
    finalPrice: booking.price - discountAmount,
  };
};

module.exports = { processPayment, verifyPayment, validatePromoCode };
