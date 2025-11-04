const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    cleaner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',  // Cleaners are users with role='cleaner'
      default: null // Will be assigned later
    },
    service: {
      type: String,
      required: true,
      enum: ['Deep Cleaning', 'Regular Cleaning', 'Move-In/Move-Out Cleaning', 'Office Cleaning'],
    },
    date: { 
      type: Date, 
      required: true 
    },
    time: { 
      type: String, 
      required: true 
    }, // Example: "10:00 AM"
    duration: { 
      type: Number, 
      required: true 
    }, // Duration in hours
    price: {
      type: Number,
      required: true,
      min: 0
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      additionalInfo: { type: String } // For apartment numbers, gate codes, etc.
    },
    // Updated enum values to include new statuses for assignment algorithm
    status: { 
      type: String, 
      enum: ['pending', 'unassigned', 'paid', 'needs_assignment', 'assigned', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'pending' 
    },
    notes: { 
      type: String, 
      maxlength: 500 
    }, // Optional field with a character limit
    payment: {
      status: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'failed'],
        default: 'pending'
      },
      method: {
        type: String,
        enum: ['credit_card', 'debit_card', 'paypal', 'cash', 'other'],
        default: 'credit_card'
      },
      transactionId: { type: String },
      paidAt: { type: Date }
    },
    amount: {
      type: Number,
      get: function() {
        return this.price;
      },
      set: function(value) {
        this.price = value;
        return value;
      }
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringSchedule: {
      frequency: {
        type: String,
        enum: ['weekly', 'bi-weekly', 'monthly'],
      },
      dayOfWeek: { type: Number }, // 0-6 (Sunday-Saturday)
      endDate: { type: Date }
    },
    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: { type: String },
      createdAt: { type: Date }
    },
    cancellationReason: { type: String },
    cancellationDate: { type: Date },
    
    // NEW FIELDS FOR ASSIGNMENT ALGORITHM
    assignedAt: { 
      type: Date 
    },
    assignmentScores: {
      totalScore: Number,
      proximityScore: Number,
      ratingScore: Number,
      availabilityScore: Number,
      workloadScore: Number,
      customerPreferenceScore: Number
    },
    // Location coordinates for the booking
    location: {
      latitude: Number,
      longitude: Number,
      postalCode: { 
        type: String,
        get: function() {
          return this.address?.zipCode;
        }
      }
    },
    // Special requests field (extracted from notes for algorithm use)
    specialRequests: {
      type: String,
      get: function() {
        return this.notes;
      }
    },
    // Flag for premium services
    isPremiumService: {
      type: Boolean,
      default: false,
      get: function() {
        return this.service === 'Deep Cleaning' || this.service === 'Move-In/Move-Out Cleaning';
      }
    }
  },
  { 
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true }
  }
);

// Indexes for performance
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ cleaner: 1, status: 1 });
bookingSchema.index({ date: 1 });
bookingSchema.index({ createdAt: 1 });
bookingSchema.index({ status: 1 });
// New index for assignment algorithm
bookingSchema.index({ 'location.postalCode': 1 });

// Virtual fields to match controller expectations
bookingSchema.virtual('serviceType').get(function() {
  return this.service;
});

bookingSchema.virtual('paymentStatus').get(function() {
  return this.payment?.status;
});

bookingSchema.virtual('paymentMethod').get(function() {
  return this.payment?.method;
});

bookingSchema.virtual('scheduledAt').get(function() {
  if (!this.date) return null;
  
  // If time is in 12-hour format (e.g., "10:00 AM")
  if (this.time && this.time.includes(':')) {
    let hours = 0;
    let minutes = 0;
    
    // Parse time string
    if (this.time.includes('AM') || this.time.includes('PM')) {
      // 12-hour format with AM/PM
      const timeParts = this.time.split(':');
      hours = parseInt(timeParts[0], 10);
      const minutesPart = timeParts[1].split(' ');
      minutes = parseInt(minutesPart[0], 10);
      
      // Adjust hours for PM
      if (this.time.includes('PM') && hours < 12) {
        hours += 12;
      }
      // Adjust midnight (12 AM)
      if (this.time.includes('AM') && hours === 12) {
        hours = 0;
      }
    } else {
      // 24-hour format
      const timeParts = this.time.split(':');
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1], 10);
    }
    
    const scheduledDate = new Date(this.date);
    scheduledDate.setHours(hours, minutes, 0, 0);
    return scheduledDate;
  }
  
  return this.date;
});

// Virtual fields for algorithm
bookingSchema.virtual('startTime').get(function() {
  return this.scheduledAt;
});

bookingSchema.virtual('endTime').get(function() {
  if (!this.scheduledAt) return null;
  
  const endTime = new Date(this.scheduledAt);
  endTime.setHours(endTime.getHours() + this.duration);
  return endTime;
});

// Virtual property for formatted date and time
bookingSchema.virtual('formattedDateTime').get(function() {
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return `${this.date.toLocaleDateString('en-US', dateOptions)} at ${this.time}`;
});

// Rating direct access
bookingSchema.virtual('rating').get(function() {
  return this.review?.rating;
});

// Create method to check for booking conflicts
bookingSchema.statics.checkForConflicts = async function(cleanerId, date, time, duration) {
  const startDate = new Date(date);
  let startHour = 0;
  let startMinute = 0;
  
  // Parse time string
  if (typeof time === 'string' && time.includes(':')) {
    if (time.includes('AM') || time.includes('PM')) {
      // 12-hour format with AM/PM
      const timeParts = time.split(':');
      let hours = parseInt(timeParts[0], 10);
      const minutesPart = timeParts[1].split(' ');
      let minutes = parseInt(minutesPart[0], 10);
      
      // Adjust hours for PM
      if (time.includes('PM') && hours < 12) {
        hours += 12;
      }
      // Adjust midnight (12 AM)
      if (time.includes('AM') && hours === 12) {
        hours = 0;
      }
      
      startHour = hours;
      startMinute = minutes;
    } else {
      // 24-hour format
      const timeParts = time.split(':');
      startHour = parseInt(timeParts[0], 10);
      startMinute = parseInt(timeParts[1], 10);
    }
  }
  
  // Set hours and minutes
  startDate.setHours(startHour, startMinute, 0, 0);
  
  // Calculate end time
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + duration);
  
  // Find bookings with date overlapping with the new booking time
  const conflictingBookings = await this.find({
    cleaner: cleanerId,
    status: { $nin: ['cancelled', 'no-show'] },
    $or: [
      // Existing booking starts during the new booking time range
      {
        scheduledAt: { $gte: startDate, $lt: endDate }
      },
      // Existing booking ends during the new booking time range
      {
        $expr: {
          $and: [
            { $lt: ["$scheduledAt", endDate] },
            { 
              $gt: [
                { $add: ["$scheduledAt", { $multiply: ["$duration", 60, 60, 1000] }] },
                startDate
              ]
            }
          ]
        }
      }
    ]
  });
  
  return conflictingBookings.length > 0;
};

// Method to cancel a booking
bookingSchema.methods.cancel = async function(reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancellationDate = new Date();
  return this.save();
};

// Method to assign a cleaner
bookingSchema.methods.assignCleaner = async function(cleanerId) {
  this.cleaner = cleanerId;
  this.status = 'assigned';
  this.assignedAt = new Date();
  return this.save();
};

// Method to update status
bookingSchema.methods.updateStatus = async function(status) {
  this.status = status;
  
  // If status is completed, also mark payment as paid
  if (status === 'completed' && this.payment && this.payment.status === 'pending') {
    this.payment.status = 'paid';
    this.payment.paidAt = new Date();
  }
  
  return this.save();
};

// Method to add a review
bookingSchema.methods.addReview = async function(rating, comment) {
  this.review = {
    rating,
    comment,
    createdAt: new Date()
  };
  return this.save();
};

// Pre-save middleware to ensure amount matches price
bookingSchema.pre('save', function(next) {
  if (this.price && !this.amount) {
    this.amount = this.price;
  } else if (this.amount && !this.price) {
    this.price = this.amount;
  }
  
  // Set location coordinates from address if not set
  if (this.address && !this.location) {
    // In a real implementation, you might use a geocoding service here
    // For now, we'll leave this as a placeholder
    this.location = {
      postalCode: this.address.zipCode
    };
  }
  
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);