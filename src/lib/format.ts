import type { PropertyStage, PropertyStrategy, PropertyType } from "./types";

const thb = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

export function formatTHB(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return thb.format(value);
}

export function formatTHBPerSqm(
  price: number | null | undefined,
  sqm: number | null | undefined,
) {
  if (price == null || sqm == null || sqm <= 0) return "—";
  return `${thb.format(price / sqm)}/㎡`;
}

export function formatNumber(value: number | null | undefined, suffix = "") {
  if (value == null || Number.isNaN(value)) return "—";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value)}${suffix}`;
}

export function labelType(type: PropertyType | null | undefined) {
  if (!type) return "Unknown type";
  return type.replaceAll("_", " ");
}

export function labelStage(stage: PropertyStage) {
  return stage.replaceAll("_", " ");
}

export function labelStrategy(strategy: PropertyStrategy) {
  if (strategy === "both") return "Rental + flip";
  return strategy;
}

export function formatCoords(lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return "No location yet";
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function titleFromProperty(input: {
  title?: string | null;
  address_full?: string | null;
  district?: string | null;
  subdistrict?: string | null;
  type?: PropertyType | null;
}) {
  if (input.title?.trim()) return input.title.trim();
  if (input.address_full?.trim()) return input.address_full.trim();
  const area = [input.subdistrict, input.district].filter(Boolean).join(", ");
  if (area) return `${labelType(input.type)} · ${area}`;
  return "Untitled prospect";
}
