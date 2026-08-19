"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List, MapPin, Search, X } from "lucide-react";
import { PropertyList } from "@/components/property-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import type { PropertyListItem } from "@/lib/actions/properties";
import { titleFromProperty } from "@/lib/format";
import { haversineMeters } from "@/lib/geo";
import { cn } from "@/lib/utils";

const PinMap = dynamic(
  () => import("@/components/pin-map").then((mod) => mod.PinMap),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse bg-muted md:h-80" />,
  },
);

const RADII = [
  { label: "500 m", value: 500 },
  { label: "1 km", value: 1000 },
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
] as const;

type Layout = "list" | "gallery";
type Pin = { lat: number; lng: number };

function haystack(property: PropertyListItem) {
  return [
    titleFromProperty(property),
    property.title,
    property.address_full,
    property.district,
    property.subdistrict,
    property.province,
    property.translated_summary,
    property.original_text,
    property.intake_notes,
    property.nearest_station,
    property.agent_name,
    property.agency,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function ProspectsExplorer({
  properties,
}: {
  properties: PropertyListItem[];
}) {
  const [query, setQuery] = useState("");
  const [layout, setLayout] = useState<Layout>("gallery");
  const [layoutReady, setLayoutReady] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [pin, setPin] = useState<Pin | null>(null);
  const [radiusM, setRadiusM] = useState(2000);

  useEffect(() => {
    const stored = window.localStorage.getItem("scout-prospects-layout");
    if (stored === "list" || stored === "gallery") setLayout(stored);
    setLayoutReady(true);
  }, []);

  useEffect(() => {
    if (!layoutReady) return;
    window.localStorage.setItem("scout-prospects-layout", layout);
  }, [layout, layoutReady]);

  const mapMarkers = useMemo(() => {
    if (!pin) return [];
    return properties.flatMap((property) => {
      if (property.lat == null || property.lng == null) return [];
      const meters = haversineMeters(
        pin.lat,
        pin.lng,
        property.lat,
        property.lng,
      );
      return meters <= radiusM
        ? [{ lat: property.lat, lng: property.lng }]
        : [];
    });
  }, [properties, pin, radiusM]);

  const { visible, distanceById } = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const distances: Record<string, number> = {};
    const next = properties.filter((property) => {
      if (needle && !haystack(property).includes(needle)) return false;
      if (!pin) return true;
      if (property.lat == null || property.lng == null) return false;
      const meters = haversineMeters(
        pin.lat,
        pin.lng,
        property.lat,
        property.lng,
      );
      distances[property.id] = meters;
      return meters <= radiusM;
    });
    return { visible: next, distanceById: pin ? distances : undefined };
  }, [properties, query, pin, radiusM]);

  if (!properties.length) {
    return (
      <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
        <p className="text-xl font-semibold tracking-tight">No prospects yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Capture a sign or type a listing to start the catalog.
        </p>
        <Link
          href="/capture"
          className="mt-6 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground active:scale-95 active:opacity-80"
        >
          New prospect
        </Link>
      </div>
    );
  }

  function dropMyLocation() {
    navigator.geolocation?.getCurrentPosition((position) => {
      setPin({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }

  const activeRadius = RADII.find((item) => item.value === radiusM)?.label;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, area, notes…"
            className="h-10 pr-10 pl-9"
            type="search"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground active:opacity-70"
              onClick={() => setQuery("")}
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={pin ? "primary" : "secondary"}
            onClick={() => setLocationOpen((open) => !open)}
          >
            <MapPin className="size-4" />
            {pin ? activeRadius : "Near"}
          </Button>
          <div className="flex gap-1 rounded-md bg-muted p-1">
            <button
              type="button"
              onClick={() => setLayout("list")}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm active:scale-95",
                layout === "list"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              <List className="size-3.5" />
              List
            </button>
            <button
              type="button"
              onClick={() => setLayout("gallery")}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm active:scale-95",
                layout === "gallery"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              <LayoutGrid className="size-3.5" />
              Gallery
            </button>
          </div>
        </div>
      </div>

      {locationOpen && (
        <div className="space-y-3 overflow-hidden rounded-lg border border-border">
          <PinMap
            pin={pin}
            radiusM={radiusM}
            markers={mapMarkers}
            onPin={setPin}
          />
          <div className="flex flex-wrap items-center gap-2 px-3 pb-3">
            <p className="w-full text-xs text-muted-foreground">
              Tap the map to pin a spot. The circle is the search radius;
              charcoal pins are prospects inside it.
            </p>
            {RADII.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setRadiusM(item.value)}
                className={cn(
                  "h-8 rounded-md px-3 text-xs active:scale-95",
                  radiusM === item.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
            <Button type="button" size="sm" variant="secondary" onClick={dropMyLocation}>
              My location
            </Button>
            {pin && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setPin(null)}
              >
                Clear pin
              </Button>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {visible.length === properties.length
          ? `${properties.length} prospect${properties.length === 1 ? "" : "s"}`
          : `${visible.length} of ${properties.length}`}
      </p>

      {visible.length ? (
        <PropertyList
          properties={visible}
          layout={layout}
          distanceById={distanceById}
        />
      ) : (
        <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          No prospects match.
          <button
            type="button"
            className="mt-3 block w-full text-primary underline"
            onClick={() => {
              setQuery("");
              setPin(null);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
