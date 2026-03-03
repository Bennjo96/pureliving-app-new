// backend/src/server.js
const app = require('./app');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const os = require('os');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Server configuration
const portString = process.env.PORT || '5002';
const PORT = parseInt(portString, 10);
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

let server;

// Function to start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start the server
    server = app.listen(PORT, HOST, () => {
      console.log('--------------------------------------------');
      console.log(`🚀 Server running in ${NODE_ENV} mode`);
      console.log(`🔗 URL: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
      console.log(`🧠 Memory: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`);
      console.log(`💻 CPU: ${os.cpus().length} cores`);
      console.log('--------------------------------------------');
    });

    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy. Trying port ${PORT + 1}`);
        server = app.listen(PORT + 1, HOST, () => {
          console.log(`🚀 Server running on port ${PORT + 1}`);
        });
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Graceful shutdown function
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Graceful shutdown initiated...`);
  
  try {
    // Close the server
    if (server) {
      await new Promise((resolve) => {
        server.close(() => {
          console.log('HTTP server closed');
          resolve();
        });
      });
    }
    
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle various termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥');
  console.log(err.name, err.message);
  console.log(err.stack);
  
  // Close server & exit process
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥');
  console.log(err.name, err.message);
  console.log(err.stack);
  process.exit(1);
});

// For Nodemon restarts
process.once('SIGUSR2', () => {
  gracefulShutdown('SIGUSR2')
    .then(() => process.kill(process.pid, 'SIGUSR2'));
});
