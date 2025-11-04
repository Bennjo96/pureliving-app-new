import React, { useRef, useEffect, useState } from "react";
import { MapPin, Loader, Search } from "lucide-react";
import { useGoogleMaps } from "../../contexts/GoogleMapsContext";

const GooglePlacesAutocomplete = ({
  onPlaceSelect,
  placeholder = "Enter a location",
  disabled = false,
  country = "de",
  value = "",
  onChange,
  className = "",
}) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [interactedWith, setInteractedWith] = useState(false);

  // Clear initialization errors
  useEffect(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    try {
      // Check if the API is properly loaded
      if (!window.google?.maps?.places) {
        console.warn("Google Maps Places API not available");
        return;
      }

      // Try using the Autocomplete constructor instead of PlaceAutocompleteElement
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          componentRestrictions: { country },
          fields: ["address_components", "formatted_address", "geometry"],
        }
      );

      autocompleteRef.current = autocomplete;

      // Handle place selection
      const handlePlaceChanged = () => {
        setBusy(true);
        try {
          const place = autocomplete.getPlace();

          if (!place || !place.address_components) {
            setError("Please select a valid address");
            onPlaceSelect(null);
            setBusy(false);
            return;
          }

          // Extract location data
          let postalCode = "";
          let cityName = "";

          place.address_components.forEach((component) => {
            if (component.types.includes("postal_code")) {
              postalCode = component.long_name;
            }
            if (
              component.types.includes("locality") ||
              component.types.includes("postal_town")
            ) {
              cityName = component.long_name;
            }
          });

          const coords = place.geometry?.location
            ? {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              }
            : undefined;

          const placeData = {
            postalCode,
            cityName,
            formattedAddress: place.formatted_address,
            coordinates: coords,
          };

          onPlaceSelect(placeData);
          onChange?.(place.formatted_address || "");
          setError(null);
        } catch (err) {
          console.error("Error selecting location:", err);
          setError("Error selecting location");
          onPlaceSelect(null);
        } finally {
          setBusy(false);
        }
      };

      // Standard event listener for Autocomplete
      autocomplete.addListener("place_changed", handlePlaceChanged);

      return () => {
        if (autocompleteRef.current) {
          window.google.maps.event.clearInstanceListeners(autocomplete);
          autocompleteRef.current = null;
        }
      };
    } catch (err) {
      console.error("Google Maps initialization error:", err);
      // Don't show initialization errors to the user
    }
  }, [isLoaded, country, onPlaceSelect, onChange]);

  const handleInputChange = (e) => {
    setInteractedWith(true);
    onChange?.(e.target.value);
    if (!e.target.value) onPlaceSelect(null);
  };

  // Fallback when API isn't available
  if (loadError) {
    return (
      <div className="w-full">
        <div className="flex items-center bg-white/90 rounded-lg overflow-hidden border border-transparent transition-colors">
          <div className="pl-4">
            <MapPin className="w-5 h-5 text-gray-500 pointer-events-none" />
          </div>
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full py-4 px-3 text-lg bg-transparent text-gray-800 placeholder-gray-600 focus:outline-none"
          />
        </div>
        <p className="mt-2 text-red-300 text-sm">
          Location search unavailable. Please enter your address manually.
        </p>
      </div>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex justify-center py-4">
        <Loader className="animate-spin w-6 h-6 text-teal-600" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center bg-white/90 rounded-lg overflow-hidden border border-transparent focus-within:border-teal-400 transition-colors">
        <div className="pl-4">
          <MapPin className="w-5 h-5 text-gray-500 pointer-events-none" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled || busy}
          className="w-full py-4 px-3 text-lg bg-transparent text-gray-800 placeholder-gray-600 focus:outline-none"
        />
        <div className="pr-4">
          {busy ? (
            <Loader className="animate-spin w-5 h-5 text-teal-600" />
          ) : (
            <Search className="w-5 h-5 text-teal-600" />
          )}
        </div>
      </div>
      {/* Only show errors after user interaction */}
      {error && interactedWith && (
        <p className="mt-2 text-red-300 text-sm">{error}</p>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete;
