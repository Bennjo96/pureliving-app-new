// src/routes/geoRoutes.js
const express = require("express");
const router = express.Router();
const geoController = require("../controllers/GeoController");

/**
 * @route   GET /api/geo/reverse-geocode
 * @desc    Convert latitude/longitude to postal code
 * @access  Public
 * @params  latitude, longitude (query parameters)
 */
router.get("/reverse-geocode", geoController.reverseGeocode);

/**
 * @route   GET /api/geo/location-from-coordinates
 * @desc    Get full location info from coordinates
 * @access  Public
 * @params  latitude, longitude (query parameters)
 */
router.get(
  "/location-from-coordinates",
  geoController.getLocationFromCoordinates
);

/**
 * @route   GET /api/geo/validate-location/:location
 * @desc    Validate location by city name
 * @access  Public
 * @params  location (URL parameter)
 */
router.get("/validate-location/:location", geoController.validateLocation);

/**
 * @route   GET /api/geo/search-locations/:query
 * @desc    Search for locations by name
 * @access  Public
 * @params  query (URL parameter)
 */
router.get("/search-locations/:query", geoController.searchLocations);

/**
 * @route   GET /api/geo/service-areas
 * @desc    Get all active service areas
 * @access  Public
 */
router.get("/service-areas", geoController.getServiceAreas);

/**
 * @route   GET /api/geo/service-areas/nearby
 * @desc    Find service areas near a specific location
 * @access  Public
 * @params  latitude, longitude, radius (query parameters)
 */
router.get("/service-areas/nearby", geoController.getNearbyServiceAreas);

/**
 * @route   GET /api/geo/check/:postalCode
 * @desc    Check if a postal code is in our service area
 * @access  Public
 * @params  postalCode (URL parameter)
 */
router.get("/check/:postalCode", geoController.checkPostalCode);

module.exports = router;