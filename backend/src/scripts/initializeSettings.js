// src/scripts/initializeSettings.js
const mongoose = require('mongoose');
const SystemSetting = require('../models/SystemSetting');
const config = require('../config/db');

// Function to initialize system settings
async function initializeSettings() {
  try {
    // Connect to the database
    await mongoose.connect(config.mongoURI, config.mongoOptions);
    console.log('Connected to MongoDB for settings initialization');
    
    // Initialize default system settings
    await SystemSetting.initializeDefaultSettings();
    
    console.log('Settings initialization complete');
    
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing settings:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeSettings();