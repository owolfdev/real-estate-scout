"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GalleryPanel } from "@/components/gallery-panel";
import { MapPanel } from "@/components/map-panel";
import { NotesPanel } from "@/components/notes-panel";
import { PropertyForm } from "@/components/property-form";
import { PropertyView } from "@/components/property-view";
import { RenovationPanel } from "@/components/renovation-panel";
import { deleteProperty, updateProperty } from "@/lib/actions/properties";
import { pickCover } from "@/lib/media";
import {
  formatTHB,
  formatTHBPerSqm,
  labelStage,
  labelStrategy,
  labelType,
  titleFromProperty,
} from "@/lib/format";
import type {
  Media,
  Note,
  Property,
  PropertyDraft,
  RenovationItem,
  RenovationPlan,
} from "@/lib/types";

const tabs = ["overview", "gallery", "notes", "reno", "map"] as const;

function toDraft(property: Property): PropertyDraft {
  return {
    type: property.type,
    strategy: property.strategy,
    stage: property.stage,
    title: property.title ?? "",
    address_full: property.address_full,
    district: property.district,
    subdistrict: property.subdistrict,
    province: property.province,
    lat: property.lat,
    lng: property.lng,
    location_accuracy_m: property.location_accuracy_m,
    location_source: property.location_source,
    usable_sqm: property.usable_sqm,
    land_sqm: property.land_sqm,
    beds: property.beds,
    baths: property.baths,
    parking: property.parking,
    asking_price: property.asking_price,
    currency: property.currency,
    phone: property.phone,
    agent_name: property.agent_name,
    agency: property.agency,
    ownership: property.ownership,
    condition: property.condition,
    year_built: property.year_built,
    alley_width_m: property.alley_width_m,
    corner_lot: property.corner_lot,
    flood_note: property.flood_note,
    nearest_station: property.nearest_station,
    station_distance_m: property.station_distance_m,
    score: property.score,
    tags: property.tags,
    source: property.source,
    original_text: property.original_text,
    translated_summary: property.translated_summary,
    intake_notes: property.intake_notes,
  };
}

export function PropertyDetail({
  property,
  media,
  notes,
  plan,
  items,
}: {
  property: Property;
  media: Media[];
  notes: Note[];
  plan: RenovationPlan | null;
  items: RenovationItem[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof tabs)[number]>("overview");
  const [saved, setSaved] = useState<PropertyDraft>(toDraft(property));
  const [draft, setDraft] = useState<PropertyDraft>(toDraft(property));
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const cover = pickCover(media.filter((item) => item.signed_url))?.signed_url;

  function enterEdit() {
    setMessage(null);
    setEditing(true);
    setTab("overview");
  }

  function cancelEdit() {
    setDraft(saved);
    setEditing(false);
    setMessage(null);
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt=""
          className="h-56 w-full rounded-lg object-cover md:h-72"
        />
      )}
      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge tone="forest">{labelType(draft.type)}</Badge>
            <Badge>{labelStage(draft.stage)}</Badge>
            <Badge tone="brass">{labelStrategy(draft.strategy)}</Badge>
          </div>
          {editing ? (
            <Button variant="secondary" size="sm" onClick={cancelEdit}>
              Cancel
            </Button>
          ) : (
            <Button size="sm" onClick={enterEdit}>
              <Pencil className="size-3.5" />
              Edit
            </Button>
          )}
        </div>
        <h1 className="font-semibold tracking-tight text-3xl text-foreground md:text-4xl">
          {titleFromProperty(draft)}
        </h1>
        <p className="text-lg text-muted-foreground">
          {formatTHB(draft.asking_price)}
          <span className="mx-2">·</span>
          {formatTHBPerSqm(draft.asking_price, draft.usable_sqm)}
        </p>
      </header>

      <nav className="flex gap-1 overflow-x-auto rounded-md bg-muted p-1">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-md px-4 py-2 text-sm capitalize active:scale-95 ${
              tab === item ? "bg-card text-foreground shadow-sm" : "text-muted-foreground active:bg-card/70"
            }`}
          >
            {item === "reno" ? "Renovation" : item}
          </button>
        ))}
      </nav>

      {tab === "overview" && (
        <div className="space-y-6">
          {editing ? (
            <>
              <PropertyForm
                draft={draft}
                onChange={setDraft}
                onRecaptureLocation={() => {
                  navigator.geolocation?.getCurrentPosition((pos) => {
                    setDraft((current) => ({
                      ...current,
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude,
                      location_accuracy_m: Math.round(pos.coords.accuracy),
                      location_source: "device",
                    }));
                  });
                }}
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  busy={busy === "save"}
                  disabled={busy != null}
                  onClick={async () => {
                    setBusy("save");
                    try {
                      const result = await updateProperty(property.id, draft);
                      if (result.error) {
                        setMessage(result.error);
                        return;
                      }
                      setSaved(draft);
                      setEditing(false);
                      setMessage("Saved");
                    } finally {
                      setBusy(null);
                    }
                  }}
                >
                  {busy === "save" ? "Saving…" : "Save changes"}
                </Button>
                <Button variant="secondary" disabled={busy != null} onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  busy={busy === "delete"}
                  disabled={busy != null}
                  onClick={async () => {
                    if (!confirm("Delete this prospect?")) return;
                    setBusy("delete");
                    try {
                      const result = await deleteProperty(property.id);
                      if (result.error) {
                        setMessage(result.error);
                        return;
                      }
                      router.push("/");
                    } finally {
                      setBusy(null);
                    }
                  }}
                >
                  {busy === "delete" ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </>
          ) : (
            <PropertyView draft={draft} />
          )}
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
      )}

      {tab === "gallery" && (
        <GalleryPanel
          propertyId={property.id}
          media={media}
          lat={draft.lat}
          lng={draft.lng}
        />
      )}
      {tab === "notes" && <NotesPanel propertyId={property.id} notes={notes} />}
      {tab === "reno" && (
        <RenovationPanel
          propertyId={property.id}
          plan={plan}
          items={items}
          media={media}
        />
      )}
      {tab === "map" && (
        <MapPanel
          lat={draft.lat}
          lng={draft.lng}
          accuracy_m={draft.location_accuracy_m}
          source={draft.location_source}
          onRecapture={
            editing
              ? () => {
                  navigator.geolocation?.getCurrentPosition((pos) => {
                    setDraft((current) => ({
                      ...current,
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude,
                      location_accuracy_m: Math.round(pos.coords.accuracy),
                      location_source: "device",
                    }));
                  });
                }
              : undefined
          }
          onChange={
            editing
              ? (next) =>
                  setDraft((current) => ({
                    ...current,
                    lat: next.lat !== undefined ? next.lat : current.lat,
                    lng: next.lng !== undefined ? next.lng : current.lng,
                    location_accuracy_m:
                      next.accuracy_m !== undefined
                        ? next.accuracy_m
                        : current.location_accuracy_m,
                    location_source: next.source ?? current.location_source,
                  }))
              : undefined
          }
        />
      )}
    </div>
  );
}
