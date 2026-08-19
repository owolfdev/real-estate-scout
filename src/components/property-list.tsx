"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { PropertyListItem } from "@/lib/actions/properties";
import { formatDistance } from "@/lib/geo";
import {
  formatTHB,
  labelStage,
  labelType,
  titleFromProperty,
} from "@/lib/format";

export function PropertyList({
  properties,
  layout = "gallery",
  distanceById,
}: {
  properties: PropertyListItem[];
  layout?: "list" | "gallery";
  distanceById?: Record<string, number>;
}) {
  if (layout === "list") {
    return (
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {properties.map((property) => {
          const distance = distanceById?.[property.id];
          return (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="flex items-center gap-3 p-3 transition active:bg-muted/40 hover:bg-muted/40"
            >
              <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {property.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={property.cover_url}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold tracking-tight">
                  {titleFromProperty(property)}
                </h2>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {[property.subdistrict, property.district]
                    .filter(Boolean)
                    .join(", ") || "No area"}
                  <span className="mx-1">·</span>
                  {formatTHB(property.asking_price)}
                  {distance != null && (
                    <>
                      <span className="mx-1">·</span>
                      {formatDistance(distance)}
                    </>
                  )}
                </p>
              </div>
              <Badge className="shrink-0">{labelStage(property.stage)}</Badge>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {properties.map((property) => {
        const distance = distanceById?.[property.id];
        return (
          <Link
            key={property.id}
            href={`/properties/${property.id}`}
            className="overflow-hidden rounded-lg border border-border bg-card transition active:scale-[0.99] active:bg-muted/40 hover:bg-muted/40"
          >
            <div className="aspect-square bg-muted md:aspect-[16/10]">
              {property.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={property.cover_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
                  No photo
                </div>
              )}
            </div>
            <div className="space-y-1 p-3">
              <h2 className="line-clamp-2 text-sm font-semibold leading-tight tracking-tight">
                {titleFromProperty(property)}
              </h2>
              <p className="text-xs text-muted-foreground">
                {formatTHB(property.asking_price)}
                {distance != null && ` · ${formatDistance(distance)}`}
              </p>
              <div className="flex gap-1">
                <Badge tone="forest">{labelType(property.type)}</Badge>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
