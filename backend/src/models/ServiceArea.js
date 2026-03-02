// src/models/ServiceArea.js
const mongoose = require('mongoose');

const serviceAreaSchema = new mongoose.Schema({
  postalCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    default: 'Germany',
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  serviceRadius: {
    type: Number, 
    default: 10, // radius in kilometers
    min: 1,
    max: 100
  },
  
  // NEW FIELDS FOR ASSIGNMENT ALGORITHM
  
  // Available services in this area
  availableServices: {
    type: [String],
    default: ['Regular Cleaning', 'Deep Cleaning', 'Move-In/Move-Out Cleaning', 'Office Cleaning', 'Window Cleaning']
  },
  
  // Base pricing for this area (can vary by location)
  pricing: {
    regularCleaning: {
      type: Number,
      default: 25 // per hour
    },
    deepCleaning: {
      type: Number,
      default: 35 // per hour
    },
    moveInOutCleaning: {
      type: Number,
      default: 40 // per hour
    },
    officeCleaning: {
      type: Number,
      default: 30 // per hour
    },
    windowCleaning: {
      type: Number,
      default: 20 // per hour
    }
  },
  
  // Optimization fields for assignment algorithm
  demandLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  cleanerCount: {
    type: Number,
    default: 0
  },
  averageBookingsPerWeek: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create geospatial index on coordinates
serviceAreaSchema.index({ coordinates: '2dsphere' });

// Pre-save middleware to update the 'updatedAt' field
serviceAreaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for direct latitude access
serviceAreaSchema.virtual('latitude').get(function() {
  if (this.coordinates && this.coordinates.coordinates && this.coordinates.coordinates.length > 1) {
    return this.coordinates.coordinates[1];
  }
  return null;
});

// Virtual for direct longitude access
serviceAreaSchema.virtual('longitude').get(function() {
  if (this.coordinates && this.coordinates.coordinates && this.coordinates.coordinates.length > 0) {
    return this.coordinates.coordinates[0];
  }
  return null;
});

// Static method to find service areas near coordinates
serviceAreaSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    },
    isActive: true
  });
};

// Static method to find service area by postal code
serviceAreaSchema.statics.findByPostalCode = function(postalCode) {
  return this.findOne({ postalCode, isActive: true });
};

// NEW METHODS FOR ASSIGNMENT ALGORITHM

// Helper method to calculate Haversine distance (direct distance between points)
serviceAreaSchema.statics.calculateDistance = function(lon1, lat1, lon2, lat2) {
  const R = 6371; // Radius of the earth in km
  
  // Convert to radians
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// Check if a location is within service radius
serviceAreaSchema.methods.containsLocation = function(longitude, latitude) {
  const distance = this.constructor.calculateDistance(
    this.longitude,
    this.latitude,
    longitude,
    latitude
  );
  return distance <= this.serviceRadius;
};

// Estimate travel time between this area and another location
serviceAreaSchema.methods.estimateTravelTime = function(longitude, latitude) {
  // Calculate distance in km
  const distance = this.constructor.calculateDistance(
    this.longitude,
    this.latitude,
    longitude,
    latitude
  );
  
  // Estimate travel time (minutes)
  // Assuming average speed of 30 km/h in city
  return Math.ceil(distance * 2); // 2 minutes per km
};

// Method to update service area statistics
serviceAreaSchema.methods.updateStats = async function() {
  try {
    const User = mongoose.model('User');
    const Booking = mongoose.model('Booking');
    const SystemSetting = mongoose.model('SystemSetting');

    // Count active cleaners in this service area
    const cleanerCount = await User.countDocuments({
      roles: 'cleaner',
      isActive: true,
      serviceAreas: this.postalCode
    });

    // Get booking metrics for the last 4 weeks
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const bookingCount = await Booking.countDocuments({
      'address.postalCode': this.postalCode,
      createdAt: { $gte: fourWeeksAgo }
    });

    const averageBookingsPerWeek = bookingCount / 4;

    // Read configurable thresholds from SystemSetting, fall back to defaults
    const [highThreshold, lowThreshold] = await Promise.all([
      SystemSetting.getByKey('serviceArea.demandHighThreshold').catch(() => null),
      SystemSetting.getByKey('serviceArea.demandLowThreshold').catch(() => null)
    ]);
    const highRatio = (highThreshold != null) ? highThreshold : 3;
    const lowRatio  = (lowThreshold  != null) ? lowThreshold  : 1;

    let demandLevel = 'medium';
    if (cleanerCount === 0) {
      demandLevel = 'high';
    } else {
      const ratio = averageBookingsPerWeek / cleanerCount;
      if (ratio > highRatio) demandLevel = 'high';
      else if (ratio < lowRatio) demandLevel = 'low';
    }

    this.cleanerCount = cleanerCount;
    this.averageBookingsPerWeek = averageBookingsPerWeek;
    this.demandLevel = demandLevel;

    return this.save();
  } catch (error) {
    console.error('Error updating service area stats:', error);
    throw error;
  }
};

// Get price for a specific service type
serviceAreaSchema.methods.getPriceForService = function(serviceType) {
  const serviceMap = {
    'Regular Cleaning': this.pricing.regularCleaning,
    'Deep Cleaning': this.pricing.deepCleaning,
    'Move-In/Move-Out Cleaning': this.pricing.moveInOutCleaning,
    'Office Cleaning': this.pricing.officeCleaning,
    'Window Cleaning': this.pricing.windowCleaning
  };

  return serviceMap[serviceType] || this.pricing.regularCleaning;
};

const ServiceArea = mongoose.model('ServiceArea', serviceAreaSchema);

module.exports = ServiceArea;