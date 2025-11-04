import { createContext, useContext, useEffect, useState } from 'react';

export const GoogleMapsContext = createContext({
  isLoaded: false,
  isLoading: false,
  loadError: null
});

export const GoogleMapsProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google?.maps?.places) {
      console.log('Google Maps already loaded, not loading again');
      setIsLoaded(true);
      return;
    }
    
    // Check if script is already in the DOM
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      console.log('Google Maps script tag already exists, waiting for load');
      const checkLoaded = setInterval(() => {
        if (window.google?.maps?.places) {
          console.log('Google Maps loaded via existing script tag');
          setIsLoaded(true);
          setIsLoading(false);
          clearInterval(checkLoaded);
        }
      }, 100);
      return () => clearInterval(checkLoaded);
    }
    
    console.log('Loading Google Maps for the first time');
    setIsLoading(true);
    
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    // Add loading=async parameter to the URL
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      setIsLoaded(true);
      setIsLoading(false);
    };
    
    script.onerror = (err) => {
      console.error('Error loading Google Maps script:', err);
      setLoadError('Failed to load Google Maps');
      setIsLoading(false);
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Don't remove the script when component unmounts
      // This ensures Maps stays loaded throughout the app
    };
  }, []);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, isLoading, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => useContext(GoogleMapsContext);