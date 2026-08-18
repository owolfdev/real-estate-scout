import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { PropertyListItem } from "@/lib/actions/properties";
import {
  formatTHB,
  labelStage,
  labelType,
  titleFromProperty,
} from "@/lib/format";

export function PropertyList({ properties }: { properties: PropertyListItem[] }) {
  if (!properties.length) {
    return (
      <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
        <p className="text-xl font-semibold tracking-tight">No prospects yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Capture a sign or type a listing to start the catalog.
        </p>
        <Link
          href="/capture"
          className="mt-6 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          New prospect
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {properties.map((property) => (
        <Link
          key={property.id}
          href={`/properties/${property.id}`}
          className="overflow-hidden rounded-lg border border-border bg-card transition hover:bg-muted/40"
        >
          <div className="aspect-[16/10] bg-muted">
            {property.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={property.cover_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No photo
              </div>
            )}
          </div>
          <div className="space-y-2 p-4">
            <div className="flex gap-2">
              <Badge tone="forest">{labelType(property.type)}</Badge>
              <Badge>{labelStage(property.stage)}</Badge>
            </div>
            <h2 className="text-lg font-semibold leading-tight tracking-tight">
              {titleFromProperty(property)}
            </h2>
            <p className="text-sm text-muted-foreground">
              {formatTHB(property.asking_price)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
