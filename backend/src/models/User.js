const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  // Multi-role field: a user can be a customer, a cleaner, or an admin, or any combination thereof.
  roles: {
    type: [String],
    enum: ['customer', 'cleaner', 'admin'],
    default: ['customer']
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Payment-related fields
  paymentMethods: [{
    type: {
      type: String,
      enum: ['card', 'paypal', 'klarna'],
      required: true
    },
    // Card-specific fields
    cardType: String,
    last4: String,
    maskedNumber: String,
    expiryDate: String,
    // PayPal-specific fields
    email: String,
    // Common fields
    isDefault: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Customer-specific fields
  promoCodes: [{
    code: String,
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true
    },
    value: Number,
    description: String,
    expiryDate: Date,
    isUsed: {
      type: Boolean,
      default: false
    },
    usedAt: Date
  }],
  
  // Customer tier for assignment algorithm
  customerTier: {
    type: String,
    enum: ['standard', 'premium', 'vip'],
    default: 'standard'
  },

  // ENHANCED Cleaner-specific fields for assignment algorithm
  availability: {
    weeklySchedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      available: {
        type: Boolean,
        default: true
      },
      slots: [String], // Format: "09:00-17:00"
      // Added: numeric day and hours for algorithm
      dayOfWeek: {
        type: Number, // 0-6 for Sunday-Saturday
        required: function() { return this.available; }
      },
      startHour: {
        type: Number, // 0-23 hours
        required: function() { return this.available; }
      },
      endHour: {
        type: Number, // 0-23 hours
        required: function() { return this.available; }
      }
    }],
    timeOff: [{
      startDate: Date,
      endDate: Date,
      reason: String
    }]
  },

  // Enhanced service areas - both string format and references
  serviceAreas: [String], // Original: ZIP codes or city names
  
  // NEW: Service areas as references with coordinates for proximity calculation
  serviceAreaRefs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceArea'
  }],
  
  // Original services offered
  services: [String], // Services offered by the cleaner
  
  // NEW: Specific skills for special requests matching
  skills: [{
    name: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      default: 'intermediate'
    }
  }],
  
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  
  // NEW: Statistics for assignment algorithm
  cleanerStats: {
    totalJobsCompleted: {
      type: Number,
      default: 0
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    // NEW: Performance metrics
    reliability: {
      completionRate: {
        type: Number,
        default: 100, // Percentage
        min: 0,
        max: 100
      },
      punctualityRate: {
        type: Number,
        default: 100, // Percentage
        min: 0,
        max: 100
      },
      cancellationRate: {
        type: Number,
        default: 0,  // Percentage
        min: 0,
        max: 100
      }
    },
    // NEW: Assignment algorithm performance
    assignmentScores: {
      averageProximityScore: {
        type: Number,
        default: 0
      },
      averageRatingScore: {
        type: Number,
        default: 0
      },
      averageAvailabilityScore: {
        type: Number,
        default: 0
      },
      averageWorkloadScore: {
        type: Number,
        default: 0
      },
      averageCustomerPreferenceScore: {
        type: Number,
        default: 0
      }
    }
  },
  
  bio: String,
  profilePicture: String,

  // Addresses
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: 'DE' // Germany as default
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    // NEW: Location coordinates for proximity calculation
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  }],

  // Billing information
  billingInfo: {
    companyName: String,
    vatNumber: String,
    billingAddress: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    }
  },

  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light'
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    language: {
      type: String,
      enum: ['en', 'fr', 'es', 'de', 'ar'],
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      app: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: false
      }
    },
    privacy: {
      shareProfileData: {
        type: Boolean,
        default: false
      },
      allowLocationAccess: {
        type: Boolean,
        default: false
      }
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Password encryption middleware
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Virtual to get reviews for cleaners
UserSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'cleaner',
  justOne: false
});

// Virtual to get bookings for users or cleaners
UserSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: function() {
    return this.hasRole('cleaner') ? 'cleaner' : 'user';
  },
  justOne: false
});

// Password comparison method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
UserSchema.methods.generateVerificationToken = function() {
  // Generate token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  // Hash and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  // Set expiry (24 hours)
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return verificationToken;
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(32).toString('hex');
  // Hash and set to passwordResetToken field
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // Set expiry (1 hour)
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  return resetToken;
};

// Helper method to add a payment method
UserSchema.methods.addPaymentMethod = function(paymentMethod) {
  if (!this.paymentMethods) {
    this.paymentMethods = [];
  }
  // If this is the default payment method, update all others to non-default
  if (paymentMethod.isDefault) {
    this.paymentMethods = this.paymentMethods.map(method => ({
      ...method,
      isDefault: false
    }));
  }
  this.paymentMethods.push(paymentMethod);
  return this;
};

// Helper method to add an address
UserSchema.methods.addAddress = function(address) {
  if (!this.addresses) {
    this.addresses = [];
  }
  // If this is the primary address, update all others to non-primary
  if (address.isPrimary) {
    this.addresses = this.addresses.map(addr => ({
      ...addr,
      isPrimary: false
    }));
  }
  this.addresses.push(address);
  return this;
};

// Optional helper method to check if the user has a specific role
UserSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

// NEW: Method to update cleaner stats after booking completion
UserSchema.methods.updateCleanerStats = async function() {
  try {
    if (!this.hasRole('cleaner')) {
      return this;
    }
    
    // Get all completed bookings for this cleaner
    const Booking = mongoose.model('Booking');
    const completedBookings = await Booking.find({
      cleaner: this._id,
      status: 'completed'
    });
    
    // Update total jobs completed
    if (!this.cleanerStats) {
      this.cleanerStats = {};
    }
    this.cleanerStats.totalJobsCompleted = completedBookings.length;
    
    // Get all reviews
    const Review = mongoose.model('Review');
    const reviews = await Review.find({
      cleaner: this._id
    });
    
    // Update rating and rating count
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      this.rating = parseFloat((totalRating / reviews.length).toFixed(2));
      this.cleanerStats.ratingCount = reviews.length;
    }
    
    // Calculate reliability metrics
    const allBookings = await Booking.find({
      cleaner: this._id,
      status: { $in: ['completed', 'cancelled', 'no-show'] }
    });
    
    if (allBookings.length > 0) {
      const completedCount = allBookings.filter(booking => booking.status === 'completed').length;
      const cancelledCount = allBookings.filter(booking => booking.status === 'cancelled').length;
      const noShowCount = allBookings.filter(booking => booking.status === 'no-show').length;
      
      if (!this.cleanerStats.reliability) {
        this.cleanerStats.reliability = {};
      }
      
      this.cleanerStats.reliability.completionRate = Math.round((completedCount / allBookings.length) * 100);
      this.cleanerStats.reliability.cancellationRate = Math.round((cancelledCount / allBookings.length) * 100);
    }
    
    return this.save();
  } catch (error) {
    console.error('Error updating cleaner stats:', error);
    throw error;
  }
};

// NEW: Helper method to convert availability to format needed by assignment algorithm
UserSchema.methods.getAvailabilityForAlgorithm = function() {
  if (!this.availability || !this.availability.weeklySchedule) {
    return [];
  }
  
  // Map to the format expected by the assignment algorithm
  return this.availability.weeklySchedule
    .filter(schedule => schedule.available)
    .map(schedule => {
      // Convert day strings to numbers (0-6 for Sunday-Saturday)
      const dayMap = {
        'sunday': 0,
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6
      };
      
      // Use the dayOfWeek if it exists, otherwise convert from string
      const dayOfWeek = schedule.dayOfWeek !== undefined 
        ? schedule.dayOfWeek 
        : dayMap[schedule.day.toLowerCase()];
      
      // Parse the start and end hours from slots if not explicitly provided
      let startHour = schedule.startHour;
      let endHour = schedule.endHour;
      
      if (startHour === undefined || endHour === undefined) {
        // Try to parse from the first slot
        if (schedule.slots && schedule.slots.length > 0) {
          const firstSlot = schedule.slots[0];
          const [startTime, endTime] = firstSlot.split('-');
          
          if (startTime && endTime) {
            startHour = parseInt(startTime.split(':')[0], 10);
            endHour = parseInt(endTime.split(':')[0], 10);
          }
        }
      }
      
      return {
        dayOfWeek,
        startHour: startHour || 9, // Default to 9 AM if not specified
        endHour: endHour || 17     // Default to 5 PM if not specified
      };
    });
};

module.exports = mongoose.model('User', UserSchema);