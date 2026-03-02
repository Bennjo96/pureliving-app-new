// src/models/SystemSetting.js
const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Create compound index on key and category
systemSettingSchema.index({ key: 1, category: 1 });

// Static method to get a setting by key
systemSettingSchema.statics.getByKey = async function(key) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : null;
};

// Static method to set a setting value
systemSettingSchema.statics.setByKey = async function(key, value, category = 'general', description = '', updatedBy = null) {
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  return this.findOneAndUpdate(
    { key },
    {
      $set: {
        value,
        category,
        description,
        updatedBy
      }
    },
    options
  );
};

// Static method to get all settings by category
systemSettingSchema.statics.getByCategory = async function(category) {
  const settings = await this.find({ category });
  return settings.reduce((result, setting) => {
    result[setting.key] = setting.value;
    return result;
  }, {});
};

// Static method to get assignment algorithm weights
systemSettingSchema.statics.getAssignmentWeights = async function() {
  const setting = await this.findOne({ key: 'assignmentAlgorithm.weights' });
  if (setting && setting.value) {
    return setting.value;
  }
  
  // Return default weights if not found
  return {
    proximity: 0.30,
    rating: 0.25,
    availabilityOptimality: 0.20,
    workloadBalance: 0.15,
    customerPreference: 0.10
  };
};

// Static method to check if auto-assignment is enabled
systemSettingSchema.statics.isAutoAssignmentEnabled = async function() {
  const setting = await this.findOne({ key: 'assignmentAlgorithm.autoAssignmentEnabled' });
  if (setting && typeof setting.value === 'boolean') {
    return setting.value;
  }
  return true; // Default to enabled
};

// Static method to get max service radius
systemSettingSchema.statics.getMaxServiceRadius = async function() {
  const setting = await this.findOne({ key: 'assignmentAlgorithm.maxServiceRadius' });
  if (setting && typeof setting.value === 'number') {
    return setting.value;
  }
  return 25; // Default 25 km
};

// Initialize default settings if needed
systemSettingSchema.statics.initializeDefaultSettings = async function() {
  const defaultSettings = [
    {
      key: 'assignmentAlgorithm.weights',
      value: {
        proximity: 0.30,
        rating: 0.25,
        availabilityOptimality: 0.20,
        workloadBalance: 0.15,
        customerPreference: 0.10
      },
      category: 'algorithm',
      description: 'Weights used in the cleaner assignment algorithm'
    },
    {
      key: 'assignmentAlgorithm.maxServiceRadius',
      value: 25, // kilometers
      category: 'algorithm',
      description: 'Maximum service radius for cleaner assignments'
    },
    {
      key: 'assignmentAlgorithm.bookingBufferTime',
      value: 30, // minutes
      category: 'algorithm',
      description: 'Buffer time between bookings'
    },
    {
      key: 'assignmentAlgorithm.autoAssignmentEnabled',
      value: true,
      category: 'algorithm',
      description: 'Whether automatic cleaner assignment is enabled'
    },
    {
      key: 'system.maintenanceMode',
      value: false,
      category: 'system',
      description: 'Whether the system is in maintenance mode'
    },
    {
      key: 'serviceArea.demandHighThreshold',
      value: 3,
      category: 'serviceArea',
      description: 'Bookings-per-cleaner ratio above which demand is classified as high'
    },
    {
      key: 'serviceArea.demandLowThreshold',
      value: 1,
      category: 'serviceArea',
      description: 'Bookings-per-cleaner ratio below which demand is classified as low'
    }
  ];

  for (const setting of defaultSettings) {
    await this.findOneAndUpdate(
      { key: setting.key },
      {
        $setOnInsert: {
          value: setting.value,
          category: setting.category,
          description: setting.description,
          isEditable: true
        }
      },
      { upsert: true, new: true }
    );
  }
  
  console.log('Default system settings initialized');
};

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);

module.exports = SystemSetting;