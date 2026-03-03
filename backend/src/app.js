// src/app.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const errorHandler = require("./middlewares/errorHandler");
const fs = require('fs');
const path = require('path');

const app = express();

// Determine allowed origins based on environment
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL.split(',')
    : ["http://localhost:3000", "http://localhost:3001"];

// Configure CORS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  const readyStateMap = {
    0: 'down',
    1: 'up',
    2: 'connecting',
    3: 'disconnecting',
  };
  const dbStateCode = mongoose.connection.readyState;
  const dbStatus = readyStateMap[dbStateCode] || 'unknown';

  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    db: {
      status: dbStatus,
      readyState: dbStateCode
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Helper function to safely require route modules with improved error logging
const safeRequire = (modulePath) => {
  try {
    return require(modulePath);
  } catch (error) {
    console.error(`Error loading module ${modulePath}:`, error.message);
    console.error(`Stack trace:`, error.stack);
    return null;
  }
};

// Define routes and their module paths
const routes = [
  { path: "/api/auth", module: "./routes/authRoutes" },
  { path: "/api/users", module: "./routes/userRoutes" },
  { path: "/api/admin", module: "./routes/adminRoutes" },
  { path: "/api/cleaner", module: "./routes/cleanerRoutes" },
  { path: "/api/bookings", module: "./routes/bookingRoutes" },
  { path: "/api/payments", module: "./routes/paymentRoutes" },
  { path: "/api/services", module: "./routes/serviceRoutes" },
  { path: "/api/reviews", module: "./routes/reviewRoutes" },
  { path: "/api/notifications", module: "./routes/notificationRoutes" },
  { path: "/api/messages", module: "./routes/messageRoutes" },
  { path: "/api/geo", module: "./routes/geoRoutes" }
];

// Register available routes
routes.forEach(route => {
  const routeModule = safeRequire(route.module);
  if (routeModule) {
    app.use(route.path, routeModule);
    console.log(`Route registered: ${route.path}`);
  }
});

// Handle 404 routes
app.all('*', (req, res, next) => {
  const err = new Error(`Cannot find ${req.originalUrl} on this server`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
