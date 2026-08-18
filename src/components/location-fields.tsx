"use client";

import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { formatCoords } from "@/lib/format";
import type { GeoFix, LocationSource } from "@/lib/types";
import { MapPin } from "lucide-react";

export function LocationFields({
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
  onChange: (next: Partial<GeoFix>) => void;
  onRecapture?: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 text-primary" />
          {formatCoords(lat, lng)}
          {accuracy_m != null && ` · ±${accuracy_m}m`}
          <span className="text-xs uppercase tracking-[0.12em]">{source}</span>
        </p>
        {onRecapture && (
          <Button size="sm" variant="secondary" onClick={onRecapture}>
            Use current GPS
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Latitude">
          <Input
            inputMode="decimal"
            value={lat ?? ""}
            onChange={(e) =>
              onChange({
                lat: e.target.value === "" ? null : Number(e.target.value),
                source: "manual",
              })
            }
          />
        </Field>
        <Field label="Longitude">
          <Input
            inputMode="decimal"
            value={lng ?? ""}
            onChange={(e) =>
              onChange({
                lng: e.target.value === "" ? null : Number(e.target.value),
                source: "manual",
              })
            }
          />
        </Field>
      </div>
    </div>
  );
}
