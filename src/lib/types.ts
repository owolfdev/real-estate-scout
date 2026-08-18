export const PROPERTY_TYPES = [
  "condo",
  "shophouse",
  "townhouse",
  "land",
  "house",
  "apartment",
  "office",
  "retail",
  "warehouse",
  "mixed_use",
  "other",
] as const;

export const STRATEGIES = ["rental", "flip", "both", "undecided"] as const;
export const STAGES = [
  "seen",
  "contacted",
  "viewed",
  "analyzing",
  "offer",
  "passed",
  "closed",
] as const;
export const SOURCES = [
  "sign",
  "agent",
  "facebook",
  "web",
  "walk-by",
  "other",
] as const;
export const LOCATION_SOURCES = ["device", "manual", "extracted"] as const;
export const MEDIA_KINDS = ["sign", "gallery", "renovation"] as const;
export const RENO_PLAN_STATUSES = ["draft", "active", "complete"] as const;
export const RENO_ITEM_STATUSES = ["todo", "doing", "done", "skipped"] as const;
export const RENO_CATEGORIES = [
  "demolition",
  "structural",
  "electrical",
  "plumbing",
  "kitchen",
  "bathroom",
  "flooring",
  "painting",
  "furniture",
  "exterior",
  "roof",
  "permits",
  "contingency",
  "other",
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type PropertyStrategy = (typeof STRATEGIES)[number];
export type PropertyStage = (typeof STAGES)[number];
export type ListingSource = (typeof SOURCES)[number];
export type LocationSource = (typeof LOCATION_SOURCES)[number];
export type MediaKind = (typeof MEDIA_KINDS)[number];
export type RenoPlanStatus = (typeof RENO_PLAN_STATUSES)[number];
export type RenoItemStatus = (typeof RENO_ITEM_STATUSES)[number];

export type GeoFix = {
  lat: number | null;
  lng: number | null;
  accuracy_m: number | null;
  source: LocationSource;
};

export type PropertyDraft = {
  type: PropertyType | null;
  strategy: PropertyStrategy;
  stage: PropertyStage;
  title: string;
  address_full: string;
  district: string;
  subdistrict: string;
  province: string;
  lat: number | null;
  lng: number | null;
  location_accuracy_m: number | null;
  location_source: LocationSource;
  usable_sqm: number | null;
  land_sqm: number | null;
  beds: number | null;
  baths: number | null;
  parking: number | null;
  asking_price: number | null;
  currency: string;
  phone: string;
  agent_name: string;
  agency: string;
  ownership: string;
  condition: string;
  year_built: number | null;
  alley_width_m: number | null;
  corner_lot: boolean;
  flood_note: string;
  nearest_station: string;
  station_distance_m: number | null;
  score: number | null;
  tags: string[];
  source: ListingSource;
  original_text: string;
  translated_summary: string;
  intake_notes: string;
};

export type Property = PropertyDraft & {
  id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type Media = {
  id: string;
  property_id: string;
  owner_id: string;
  kind: MediaKind;
  storage_path: string;
  caption: string | null;
  captured_lat: number | null;
  captured_lng: number | null;
  sort_order: number;
  created_at: string;
  signed_url?: string | null;
};

export type Note = {
  id: string;
  property_id: string;
  owner_id: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type RenovationPlan = {
  id: string;
  property_id: string;
  owner_id: string;
  title: string;
  status: RenoPlanStatus;
  currency: string;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
};

export type RenovationItem = {
  id: string;
  plan_id: string;
  owner_id: string;
  room: string | null;
  category: string | null;
  description: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  status: RenoItemStatus;
  sort_order: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export function emptyDraft(geo?: Partial<GeoFix>): PropertyDraft {
  return {
    type: null,
    strategy: "undecided",
    stage: "seen",
    title: "",
    address_full: "",
    district: "",
    subdistrict: "",
    province: "Bangkok",
    lat: geo?.lat ?? null,
    lng: geo?.lng ?? null,
    location_accuracy_m: geo?.accuracy_m ?? null,
    location_source: geo?.source ?? "device",
    usable_sqm: null,
    land_sqm: null,
    beds: null,
    baths: null,
    parking: null,
    asking_price: null,
    currency: "THB",
    phone: "",
    agent_name: "",
    agency: "",
    ownership: "",
    condition: "",
    year_built: null,
    alley_width_m: null,
    corner_lot: false,
    flood_note: "",
    nearest_station: "",
    station_distance_m: null,
    score: null,
    tags: [],
    source: "other",
    original_text: "",
    translated_summary: "",
    intake_notes: "",
  };
}
