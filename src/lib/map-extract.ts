import type { PropertyExtract } from "./schemas";
import { emptyDraft, type GeoFix, type PropertyDraft } from "./types";

function text(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export function draftFromExtract(
  extract: PropertyExtract,
  geo: Partial<GeoFix>,
): PropertyDraft {
  const draft = emptyDraft(geo);
  return {
    ...draft,
    type: extract.property_type,
    strategy: extract.strategy ?? "undecided",
    address_full: text(extract.address_full),
    district: text(extract.district),
    subdistrict: text(extract.subdistrict),
    province: text(extract.province) || "Bangkok",
    asking_price: extract.asking_price,
    currency: extract.currency?.trim() || "THB",
    usable_sqm: extract.usable_sqm,
    land_sqm: extract.land_sqm,
    beds: extract.beds,
    baths: extract.baths,
    parking: extract.parking,
    phone: text(extract.phone),
    agent_name: text(extract.agent_name),
    agency: text(extract.agency),
    ownership: text(extract.ownership),
    condition: text(extract.condition),
    year_built: extract.year_built,
    alley_width_m: extract.alley_width_m,
    corner_lot: extract.corner_lot ?? false,
    flood_note: text(extract.flood_note),
    nearest_station: text(extract.nearest_station),
    station_distance_m: extract.station_distance_m,
    tags: extract.tags ?? [],
    source: extract.source ?? (geo.source === "device" ? "sign" : "other"),
    original_text: text(extract.original_text),
    translated_summary: text(extract.translated_summary),
    intake_notes: text(extract.intake_notes),
  };
}
