"use client";

import { useCallback, useEffect, useState } from "react";
import type { GeoFix } from "@/lib/types";

const emptyFix: GeoFix = {
  lat: null,
  lng: null,
  accuracy_m: null,
  source: "device",
};

export function useGeolocation(active = true) {
  const [fix, setFix] = useState<GeoFix>(emptyFix);
  const [error, setError] = useState<string | null>(null);

  const applyPosition = useCallback((position: GeolocationPosition) => {
    setFix({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy_m: Math.round(position.coords.accuracy),
      source: "device",
    });
    setError(null);
  }, []);

  const capture = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not available on this device");
      return;
    }
    navigator.geolocation.getCurrentPosition(applyPosition, (err) =>
      setError(err.message),
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 },
    );
  }, [applyPosition]);

  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      applyPosition,
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [active, applyPosition]);

  return { fix, setFix, error, capture };
}
