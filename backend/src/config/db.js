// backend/src/config/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    // Enhanced connection options (removed deprecated options)
    const connectionOptions = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      // Note: useNewUrlParser and useUnifiedTopology are now default in mongoose 6+
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI, connectionOptions);

    // Log connection details
    console.log(`
      MongoDB Connection Successful 🚀
      Host: ${conn.connection.host}
      Database: ${conn.connection.db.databaseName}
      Connection State: ${conn.connection.readyState}
    `);

    // Event listeners for additional monitoring
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected! Attempting to reconnect...');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    // Optional: Implement reconnection strategy
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    return conn;
  } catch (error) {
    console.error(`
      ❌ Failed to Connect to MongoDB:
      Error: ${error.message}
      URI: ${process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:[^:]*@/, ':****@') : 'Not provided'}
    `);

    // Advanced error handling
    if (error.name === 'MongoNetworkError') {
      console.error('Network-related MongoDB connection issue');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('Could not select MongoDB server. Check if the database server is running.');
    }

    // Optional: Send error to monitoring service
    // sendErrorToMonitoringService(error);

    const nodeEnv = process.env.NODE_ENV || 'development';
    if (nodeEnv === 'development') {
      console.error('⚠️  Development mode: continuing startup with database status DOWN.');
      return null;
    }

    // Exit process with failure in non-development environments
    process.exit(1);
  }
};

// Improved graceful shutdown handler with additional error checking
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal || 'Unknown signal'} received. Graceful shutdown initiated...`);
  
  try {
    // Only close if there's an active connection
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
    } else {
      console.log('No active MongoDB connection to close');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error during MongoDB connection closure:', error);
    process.exit(1);
  }
};

// Handle various termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Ctrl+C
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Termination signal
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT')); // Quit signal

module.exports = connectDB;
