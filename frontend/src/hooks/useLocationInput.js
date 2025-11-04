// src/hooks/useLocationInput.js
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../contexts/BookingContext";
import { loadGoogleMapsApi } from "../utils/loadGoogleMapsApi";

// simple 5‑digit German PLZ regex
const isValidPLZ = (str) => /^\d{5}$/.test(str);

/**
 * Manages <HeroSection>'s location input:
 * - attaches Google Places Autocomplete
 * - lets user auto‑detect via geolocation
 * - validates / geocodes and navigates to /services when OK
 *
 * Returns:
 *   register  ... props for <input>
 *   submit    ... onSubmit handler for <form>
 *   detectLocation ... "use my location" button
 *   loading / detectLoading / error
 */
export default function useLocationInput() {
  const { setAndValidateLocation, locationLoading } = useBooking();
  const navigate = useNavigate();

  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [detectLoading, setDetectLoading] = useState(false);

  const inputRef   = useRef(null);
  const autoRef    = useRef(null);
  const geocoder   = useRef(null);

  /* ---------------- Google Maps init ---------------- */
  useEffect(() => {
    let mounted = true;

    loadGoogleMapsApi()
      .then(() => {
        if (!mounted) return;

        geocoder.current = new window.google.maps.Geocoder();

        autoRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            componentRestrictions: { country: "de" },
            types: ["(regions)", "postal_code"],
            fields: ["address_components", "name"],
          }
        );

        autoRef.current.addListener("place_changed", () => {
          const place = autoRef.current.getPlace();
          if (!place || !place.address_components) return;

          const postal = place.address_components.find((c) =>
            c.types.includes("postal_code")
          )?.long_name;

          const city =
            place.address_components.find((c) =>
              c.types.some((t) =>
                ["locality", "postal_town", "administrative_area_level_3"].includes(
                  t
                )
              )
            )?.long_name || place.name;

          setValue(city || postal || "");
          setError("");

          if (postal && isValidPLZ(postal)) {
            setAndValidateLocation(postal, city);
          }
        });
      })
      .catch((e) => {
        console.error("Google Maps failed:", e);
        setError("Location services could not be loaded.");
      });

    return () => {
      mounted = false;
      if (autoRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autoRef.current);
      }
    };
  }, [setAndValidateLocation]);

  /* ---------------- detect via browser geolocation ---------------- */
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by this browser.");
      return;
    }

    setDetectLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latLng = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        geocoder.current.geocode({ location: latLng }, (results, status) => {
          setDetectLoading(false);

          if (
            status === window.google.maps.GeocoderStatus.OK &&
            results &&
            results[0]
          ) {
            const postal = results[0].address_components.find((c) =>
              c.types.includes("postal_code")
            )?.long_name;

            const city =
              results[0].address_components.find((c) =>
                c.types.some((t) =>
                  ["locality", "postal_town", "administrative_area_level_3"].includes(
                    t
                  )
                )
              )?.long_name || "Unknown";

            if (postal && isValidPLZ(postal)) {
              setValue(city);
              setAndValidateLocation(postal, city);
              handleNavigate(postal, city);
            } else {
              setError("Could not determine a valid PLZ for your location.");
            }
          } else {
            setError("Geocoder failed. Please enter your location manually.");
          }
        });
      },
      (geoErr) => {
        setDetectLoading(false);
        setError(
          geoErr.code === geoErr.PERMISSION_DENIED
            ? "Location permission denied."
            : "Could not retrieve your position."
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }, [setAndValidateLocation]);

  /* ---------------- submit via form ---------------- */
  const handleNavigate = (postalCode, cityName) => {
    navigate("/services", { state: { postalCode, cityName } });
  };

  const submit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");

      const trimmed = value.trim();

      // empty -> trigger detect
      if (!trimmed) {
        detectLocation();
        return;
      }

      setLoading(true);

      let postalCode = "";
      let cityName   = "";

      // User typed 5‑digit PLZ
      if (isValidPLZ(trimmed)) {
        postalCode = trimmed;
        cityName   = trimmed; // fallback, we'll try geocode for nicer name
      } else {
        cityName = trimmed;
      }

      // If we need a postal code or better city name, geocode the input
      if (!postalCode || cityName === trimmed) {
        try {
          const { results } = await geocoder.current.geocode({
            address: trimmed,
            componentRestrictions: { country: "de" },
          });

          if (results && results[0]) {
            postalCode =
              postalCode ||
              results[0].address_components.find((c) =>
                c.types.includes("postal_code")
              )?.long_name;

            cityName =
              results[0].address_components.find((c) =>
                c.types.some((t) =>
                  ["locality", "postal_town"].includes(t)
                )
              )?.long_name || cityName;
          }
        } catch {
          /* ignore, will validate below */
        }
      }

      if (!postalCode || !isValidPLZ(postalCode)) {
        setError("Please enter a valid German postal code or city.");
        setLoading(false);
        return;
      }

      const ok = await setAndValidateLocation(postalCode, cityName);
      setLoading(false);

      if (ok) {
        handleNavigate(postalCode, cityName);
      } else {
        setError("Service is not yet available in your area.");
      }
    },
    [value, detectLocation, setAndValidateLocation, navigate]
  );

  /* ---------------- exposed helpers ---------------- */
  return {
    register: {
      ref: inputRef,
      value,
      onChange: (e) => setValue(e.target.value),
    },
    submit,
    detectLocation,
    loading: loading || locationLoading,
    detectLoading,
    error,
  };
}
