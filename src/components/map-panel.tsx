"use client";

import { LocationFields } from "@/components/location-fields";
import type { GeoFix, LocationSource } from "@/lib/types";

export function MapPanel({
  lat,
  lng,
  accuracy_m,
  source,
  onChange,
  onRecapture,
}: {
  lat: number | null;
  lng: number | null;
  accuracy_m: number | null;
  source: LocationSource;
  onChange?: (next: Partial<GeoFix>) => void;
  onRecapture?: () => void;
}) {
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const hasPoint = lat != null && lng != null;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-muted">
        {hasPoint && mapsKey ? (
          <iframe
            title="Property map"
            className="h-72 w-full"
            loading="lazy"
            src={`https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${lat},${lng}&zoom=16`}
          />
        ) : hasPoint ? (
          <iframe
            title="Property map placeholder"
            className="h-72 w-full grayscale-[20%]"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.008}%2C${lng + 0.01}%2C${lat + 0.008}&layer=mapnik&marker=${lat}%2C${lng}`}
          />
        ) : (
          <div className="flex h-72 items-center justify-center px-6 text-center text-sm text-muted-foreground">
            Location will appear here once GPS or coordinates are set.
          </div>
        )}
      </div>
      {!mapsKey && (
        <p className="text-xs text-muted-foreground">
          Using an OpenStreetMap placeholder. Add{" "}
          <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to
          switch to Google Maps.
        </p>
      )}
      {onChange && (
        <LocationFields
          lat={lat}
          lng={lng}
          accuracy_m={accuracy_m}
          source={source}
          onChange={onChange}
          onRecapture={onRecapture}
        />
      )}
    </div>
  );
}
