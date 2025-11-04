// src/utils/geoUtils.js

/**
 * Utility functions for geolocation calculations used in cleaner assignment algorithm
 */
const geoUtils = {
  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} - Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    // Null check
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
      return Infinity;
    }
    
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  },

  /**
   * Convert degrees to radians
   * @param {number} deg - Degrees
   * @returns {number} - Radians
   */
  deg2rad(deg) {
    return deg * (Math.PI/180);
  },

  /**
   * Estimate travel time between two points
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} - Estimated travel time in minutes
   */
  estimateTravelTime(lat1, lon1, lat2, lon2) {
    // Calculate distance in km
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
    
    // Estimate travel time based on distance
    // Assuming average travel speed of 30 km/h in urban areas
    // This gives us 2 minutes per kilometer
    return Math.ceil(distance * 2);
  },
  
  /**
   * Check if a point is within a specific radius of another point
   * @param {number} lat1 - Latitude of center point
   * @param {number} lon1 - Longitude of center point
   * @param {number} lat2 - Latitude of point to check
   * @param {number} lon2 - Longitude of point to check
   * @param {number} radius - Radius in kilometers
   * @returns {boolean} - True if within radius, false otherwise
   */
  isWithinRadius(lat1, lon1, lat2, lon2, radius) {
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
    return distance <= radius;
  },
  
  /**
   * Extract coordinates from MongoDB GeoJSON format
   * @param {Object} coordinates - MongoDB GeoJSON coordinates
   * @returns {Object} - {latitude, longitude}
   */
  extractCoordinates(coordinates) {
    if (!coordinates || !coordinates.coordinates) {
      return { latitude: null, longitude: null };
    }
    
    // MongoDB stores as [longitude, latitude]
    return {
      longitude: coordinates.coordinates[0],
      latitude: coordinates.coordinates[1]
    };
  },
  
  /**
   * Create MongoDB GeoJSON point
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   * @returns {Object} - MongoDB GeoJSON point
   */
  createGeoJSONPoint(longitude, latitude) {
    return {
      type: "Point",
      coordinates: [longitude, latitude]
    };
  },
  
  /**
   * Parse coordinates from postal code
   * Requires integration with geocoding service for real implementation
   * This is a placeholder that would need to be implemented with a geocoding API
   * @param {string} postalCode - Postal code
   * @returns {Promise<Object>} - Promise resolving to {latitude, longitude}
   */
  async getCoordinatesFromPostalCode(postalCode) {
    // In a real implementation, you would use a geocoding service
    // For now, this is a placeholder - you should replace with actual geocoding
    
    // Using a dummy implementation - in production you would
    // use a service like Google Maps API, Nominatim, or another geocoding service
    
    // Check if we have a ServiceArea model with this postal code
    try {
      const ServiceArea = require('../models/ServiceArea');
      const area = await ServiceArea.findByPostalCode(postalCode);
      
      if (area && area.coordinates) {
        const coords = this.extractCoordinates(area.coordinates);
        return coords;
      }
    } catch (error) {
      console.error('Error retrieving coordinates from ServiceArea:', error);
    }
    
    // Fallback - in real implementation, call geocoding API here
    console.warn(`No coordinates found for postal code ${postalCode} - using fallback`);
    return {
      latitude: null,
      longitude: null
    };
  },
  
  /**
   * Get postal code from coordinates
   * Requires integration with reverse geocoding service for real implementation
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Promise<string>} - Promise resolving to postal code
   */
  async getPostalCodeFromCoordinates(latitude, longitude) {
    // In a real implementation, you would use a reverse geocoding service
    // For now, this is a placeholder
    
    try {
      // Try to find closest ServiceArea
      const ServiceArea = require('../models/ServiceArea');
      
      // Use MongoDB's geospatial query if coordinates are in expected format
      const areas = await ServiceArea.find({
        coordinates: {
          $near: {
            $geometry: this.createGeoJSONPoint(longitude, latitude),
            $maxDistance: 10000 // 10km in meters
          }
        }
      }).limit(1);
      
      if (areas && areas.length > 0) {
        return areas[0].postalCode;
      }
      
      // Fallback to manual calculation if geospatial query doesn't work
      const allAreas = await ServiceArea.find({ isActive: true });
      
      if (allAreas && allAreas.length > 0) {
        // Find closest area
        let closestArea = null;
        let minDistance = Infinity;
        
        for (const area of allAreas) {
          const coords = this.extractCoordinates(area.coordinates);
          const distance = this.calculateDistance(
            latitude, longitude, 
            coords.latitude, coords.longitude
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            closestArea = area;
          }
        }
        
        if (closestArea) {
          return closestArea.postalCode;
        }
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
    }
    
    // Fallback
    console.warn(`No postal code found for coordinates (${latitude}, ${longitude}) - using fallback`);
    return null;
  }
};

module.exports = geoUtils;