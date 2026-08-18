"use client";

import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { LocationFields } from "@/components/location-fields";
import {
  PROPERTY_TYPES,
  SOURCES,
  STAGES,
  STRATEGIES,
  type GeoFix,
  type PropertyDraft,
} from "@/lib/types";

function num(value: string) {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export function TitleField({
  draft,
  onChange,
  className,
}: {
  draft: PropertyDraft;
  onChange: (next: PropertyDraft) => void;
  className?: string;
}) {
  return (
    <Field label="Title" className={className}>
      <Input
        value={draft.title}
        placeholder={draft.address_full || "Defaults to the address"}
        onChange={(e) => onChange({ ...draft, title: e.target.value })}
      />
    </Field>
  );
}

export function PropertyForm({
  draft,
  onChange,
  onRecaptureLocation,
}: {
  draft: PropertyDraft;
  onChange: (next: PropertyDraft) => void;
  onRecaptureLocation?: () => void;
}) {
  const set = <K extends keyof PropertyDraft>(key: K, value: PropertyDraft[K]) =>
    onChange({ ...draft, [key]: value });

  return (
    <div className="space-y-8">
      <TitleField draft={draft} onChange={onChange} />
      {(draft.original_text || draft.translated_summary) && (
        <section className="rounded-lg border border-border bg-card p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            From the sign
          </p>
          {draft.translated_summary && (
            <p className="text-sm leading-6 text-foreground">{draft.translated_summary}</p>
          )}
          {draft.original_text && (
            <p className="mt-3 border-t border-border pt-3 text-sm leading-6 text-muted-foreground">
              {draft.original_text}
            </p>
          )}
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Type">
          <Select
            value={draft.type ?? ""}
            onChange={(e) =>
              set("type", (e.target.value || null) as PropertyDraft["type"])
            }
          >
            <option value="">Unknown</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Strategy">
          <Select
            value={draft.strategy}
            onChange={(e) =>
              set("strategy", e.target.value as PropertyDraft["strategy"])
            }
          >
            {STRATEGIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Stage">
          <Select
            value={draft.stage}
            onChange={(e) => set("stage", e.target.value as PropertyDraft["stage"])}
          >
            {STAGES.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Source">
          <Select
            value={draft.source}
            onChange={(e) => set("source", e.target.value as PropertyDraft["source"])}
          >
            {SOURCES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Asking price (THB)">
          <Input
            inputMode="decimal"
            value={draft.asking_price ?? ""}
            onChange={(e) => set("asking_price", num(e.target.value))}
          />
        </Field>
        <Field label="Usable sqm">
          <Input
            inputMode="decimal"
            value={draft.usable_sqm ?? ""}
            onChange={(e) => set("usable_sqm", num(e.target.value))}
          />
        </Field>
        <Field label="Land sqm">
          <Input
            inputMode="decimal"
            value={draft.land_sqm ?? ""}
            onChange={(e) => set("land_sqm", num(e.target.value))}
          />
        </Field>
        <Field label="Beds / baths / parking">
          <div className="grid grid-cols-3 gap-2">
            <Input
              inputMode="numeric"
              placeholder="Beds"
              value={draft.beds ?? ""}
              onChange={(e) => set("beds", num(e.target.value))}
            />
            <Input
              inputMode="numeric"
              placeholder="Baths"
              value={draft.baths ?? ""}
              onChange={(e) => set("baths", num(e.target.value))}
            />
            <Input
              inputMode="numeric"
              placeholder="Park"
              value={draft.parking ?? ""}
              onChange={(e) => set("parking", num(e.target.value))}
            />
          </div>
        </Field>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Address" className="sm:col-span-2">
          <Input
            value={draft.address_full}
            onChange={(e) => set("address_full", e.target.value)}
          />
        </Field>
        <Field label="Subdistrict">
          <Input
            value={draft.subdistrict}
            onChange={(e) => set("subdistrict", e.target.value)}
          />
        </Field>
        <Field label="District">
          <Input
            value={draft.district}
            onChange={(e) => set("district", e.target.value)}
          />
        </Field>
        <Field label="Province">
          <Input
            value={draft.province}
            onChange={(e) => set("province", e.target.value)}
          />
        </Field>
        <Field label="Nearest BTS / MRT">
          <Input
            value={draft.nearest_station}
            onChange={(e) => set("nearest_station", e.target.value)}
          />
        </Field>
      </section>

      <section>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Location
        </p>
        <LocationFields
          lat={draft.lat}
          lng={draft.lng}
          accuracy_m={draft.location_accuracy_m}
          source={draft.location_source}
          onRecapture={onRecaptureLocation}
          onChange={(next: Partial<GeoFix>) =>
            onChange({
              ...draft,
              lat: next.lat !== undefined ? next.lat : draft.lat,
              lng: next.lng !== undefined ? next.lng : draft.lng,
              location_accuracy_m:
                next.accuracy_m !== undefined
                  ? next.accuracy_m
                  : draft.location_accuracy_m,
              location_source: next.source ?? draft.location_source,
            })
          }
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone">
          <Input value={draft.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="Agent">
          <Input
            value={draft.agent_name}
            onChange={(e) => set("agent_name", e.target.value)}
          />
        </Field>
        <Field label="Agency">
          <Input value={draft.agency} onChange={(e) => set("agency", e.target.value)} />
        </Field>
        <Field label="Ownership">
          <Input
            value={draft.ownership}
            onChange={(e) => set("ownership", e.target.value)}
          />
        </Field>
        <Field label="Condition">
          <Input
            value={draft.condition}
            onChange={(e) => set("condition", e.target.value)}
          />
        </Field>
        <Field label="Year built">
          <Input
            inputMode="numeric"
            value={draft.year_built ?? ""}
            onChange={(e) => set("year_built", num(e.target.value))}
          />
        </Field>
        <Field label="Tags (comma separated)" className="sm:col-span-2">
          <Input
            value={draft.tags.join(", ")}
            onChange={(e) =>
              set(
                "tags",
                e.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              )
            }
          />
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <Textarea
            value={draft.intake_notes}
            onChange={(e) => set("intake_notes", e.target.value)}
          />
        </Field>
      </section>
    </div>
  );
}
