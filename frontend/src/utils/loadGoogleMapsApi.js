// frontend/src/utils/loadGoogleMapsApi.js
export const loadGoogleMapsApi = () => {
  // Check if already loaded
  if (window.google && window.google.maps) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google Maps API loaded successfully");
      resolve();
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps API");
      reject(new Error('Google Maps script failed to load'));
    };
    
    document.head.appendChild(script);
  });
};