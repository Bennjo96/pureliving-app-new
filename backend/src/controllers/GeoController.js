// src/controllers/GeoController.js
const axios = require("axios");
const User = require("../models/User");
const ServiceArea = require("../models/ServiceArea");

/**
 * Convert geographic coordinates to postal code using OpenStreetMap's Nominatim service
 * @route GET /api/geo/reverse-geocode
 * @access Public
 */
exports.reverseGeocode = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // Use OpenStreetMap Nominatim API for reverse geocoding
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          format: "json",
          lat: latitude,
          lon: longitude,
          zoom: 18,
          addressdetails: 1,
        },
        headers: {
          "User-Agent": "PureLivingHelpers/1.0", // Application name as user agent
        },
      }
    );

    // Extract postal code from the response
    const postalCode = response.data.address.postcode;

    if (!postalCode) {
      return res.status(404).json({
        success: false,
        message: "Could not determine postal code from coordinates",
      });
    }

    res.status(200).json({
      success: true,
      postalCode,
      address: response.data.address,
    });
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    res.status(500).json({
      success: false,
      message: "Error during reverse geocoding",
      error: error.message,
    });
  }
};

/**
 * Validate location by city name and return postal code
 * @route GET /api/geo/validate-location/:location
 * @access Public
 */
exports.validateLocation = async (req, res) => {
  try {
    const { location } = req.params;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Location name is required",
      });
    }

    // First check if this location exists in our service areas (by city name)
    const serviceArea = await ServiceArea.findOne({
      city: { $regex: new RegExp(location, "i") },
      isActive: true,
    });

    if (serviceArea) {
      return res.status(200).json({
        success: true,
        postalCode: serviceArea.postalCode,
        cityName: serviceArea.city,
        state: serviceArea.state,
      });
    }

    // If not found in our database, use Nominatim to search for the location
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: `${location}, Germany`,
          format: "json",
          addressdetails: 1,
          limit: 1,
          countrycodes: "de",
        },
        headers: {
          "User-Agent": "PureLivingHelpers/1.0",
        },
      }
    );

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const postalCode = result.address.postcode;
      const cityName =
        result.address.city ||
        result.address.town ||
        result.address.village ||
        location;

      if (postalCode) {
        // Check if this postal code is in our service areas
        const serviceAreaByPostal = await ServiceArea.findOne({
          postalCode,
          isActive: true,
        });

        if (serviceAreaByPostal) {
          return res.status(200).json({
            success: true,
            postalCode,
            cityName,
            state: result.address.state || serviceAreaByPostal.state,
          });
        }

        // If the postal code exists but is not in our service areas,
        // check for neighboring postal codes that are in our service
        const nearbyServiceAreas = await ServiceArea.find({
          isActive: true,
        })
          .sort({ postalCode: 1 })
          .limit(3);

        if (nearbyServiceAreas && nearbyServiceAreas.length > 0) {
          return res.status(200).json({
            success: true,
            postalCode: nearbyServiceAreas[0].postalCode,
            cityName: nearbyServiceAreas[0].city,
            state: nearbyServiceAreas[0].state,
            isNearby: true,
            originalCity: cityName,
          });
        }
      }
    }

    // If we couldn't find any matching location
    return res.status(404).json({
      success: false,
      message: "Location not found or not in our service area",
    });
  } catch (error) {
    console.error("Location validation error:", error);
    res.status(500).json({
      success: false,
      message: "Error validating location",
      error: error.message,
    });
  }
};

/**
 * Search for locations by name
 * @route GET /api/geo/search-locations/:query
 * @access Public
 */
exports.searchLocations = async (req, res) => {
  try {
    const { query } = req.params;

    if (!query || query.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Query must be at least 3 characters",
      });
    }

    // First search our own database
    const dbLocations = await ServiceArea.find({
      $or: [
        { city: { $regex: new RegExp(query, "i") } },
        { state: { $regex: new RegExp(query, "i") } },
      ],
      isActive: true,
    }).limit(5);

    const formattedDbLocations = dbLocations.map((location) => ({
      name: location.city,
      postalCode: location.postalCode,
      state: location.state,
      source: "database",
    }));

    // If we have enough results from our database, return them
    if (formattedDbLocations.length >= 5) {
      return res.status(200).json({
        success: true,
        locations: formattedDbLocations,
      });
    }

    // Otherwise, supplement with Nominatim search
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: `${query}, Germany`,
          format: "json",
          addressdetails: 1,
          limit: 5,
          countrycodes: "de",
        },
        headers: {
          "User-Agent": "PureLivingHelpers/1.0",
        },
      }
    );

    let nominatimLocations = [];

    if (response.data && response.data.length > 0) {
      nominatimLocations = response.data
        .filter(
          (result) =>
            result.address &&
            (result.address.city ||
              result.address.town ||
              result.address.village)
        )
        .map((result) => ({
          name:
            result.address.city ||
            result.address.town ||
            result.address.village,
          postalCode: result.address.postcode,
          state: result.address.state,
          source: "nominatim",
        }));
    }

    // Combine results, remove duplicates, and limit to 5
    const allLocations = [...formattedDbLocations];

    for (const location of nominatimLocations) {
      if (!allLocations.some((l) => l.name === location.name)) {
        allLocations.push(location);
      }
      if (allLocations.length >= 5) break;
    }

    return res.status(200).json({
      success: true,
      locations: allLocations,
    });
  } catch (error) {
    console.error("Location search error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching locations",
      error: error.message,
    });
  }
};

/**
 * Get location info from coordinates
 * @route GET /api/geo/location-from-coordinates
 * @access Public
 */
exports.getLocationFromCoordinates = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // Use OpenStreetMap Nominatim API for reverse geocoding
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          format: "json",
          lat: latitude,
          lon: longitude,
          zoom: 18,
          addressdetails: 1,
        },
        headers: {
          "User-Agent": "PureLivingHelpers/1.0",
        },
      }
    );

    // Extract postal code and city name from the response
    const postalCode = response.data.address.postcode;
    const cityName =
      response.data.address.city ||
      response.data.address.town ||
      response.data.address.village ||
      response.data.address.suburb;

    if (!postalCode && !cityName) {
      return res.status(404).json({
        success: false,
        message: "Could not determine location from coordinates",
      });
    }

    // Check if this location is in our service areas
    let serviceArea = null;
    if (postalCode) {
      serviceArea = await ServiceArea.findOne({ postalCode, isActive: true });
    }

    if (!serviceArea && cityName) {
      serviceArea = await ServiceArea.findOne({
        city: { $regex: new RegExp(cityName, "i") },
        isActive: true,
      });
    }

    res.status(200).json({
      success: true,
      postalCode,
      cityName,
      state: response.data.address.state,
      country: response.data.address.country,
      isServiceArea: !!serviceArea,
      serviceAreaDetails: serviceArea,
    });
  } catch (error) {
    console.error("Location from coordinates error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting location from coordinates",
      error: error.message,
    });
  }
};

/**
 * Get service areas to display on map
 * @route GET /api/geo/service-areas
 * @access Public
 */
exports.getServiceAreas = async (req, res) => {
  try {
    const serviceAreas = await ServiceArea.find({ isActive: true }).select(
      "postalCode city state coordinates"
    );

    res.status(200).json({
      success: true,
      count: serviceAreas.length,
      data: serviceAreas,
    });
  } catch (error) {
    console.error("Error fetching service areas:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching service areas",
      error: error.message,
    });
  }
};

/**
 * Find service areas near a specific location
 * @route GET /api/geo/service-areas/nearby
 * @access Public
 */
exports.getNearbyServiceAreas = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // Convert to numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusInMeters = parseFloat(radius) * 1000; // Convert km to meters

    // Call the static method on the ServiceArea model
    const nearbyAreas = await ServiceArea.findNearby(lng, lat, radiusInMeters);

    res.status(200).json({
      success: true,
      count: nearbyAreas.length,
      data: nearbyAreas,
    });
  } catch (error) {
    console.error("Error finding nearby service areas:", error);
    res.status(500).json({
      success: false,
      message: "Server error while finding nearby service areas",
      error: error.message,
    });
  }
};

/**
 * Check if a postal code is in our service area
 * @route GET /api/geo/check/:postalCode
 * @access Public
 */
exports.checkPostalCode = async (req, res) => {
  try {
    const { postalCode } = req.params;

    if (!postalCode) {
      return res.status(400).json({
        success: false,
        message: "Postal code is required",
      });
    }

    // Check if this postal code exists in our service areas
    const serviceArea = await ServiceArea.findByPostalCode(postalCode);

    res.status(200).json({
      success: true,
      isServiceArea: !!serviceArea,
      data: serviceArea || null,
    });
  } catch (error) {
    console.error("Error checking postal code:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking postal code",
      error: error.message,
    });
  }
};

module.exports = exports;