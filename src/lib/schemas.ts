import { z } from "zod";
import {
  PROPERTY_TYPES,
  SOURCES,
  STRATEGIES,
  RENO_ITEM_STATUSES,
} from "./types";

const nullableString = z.string().nullable();
const nullableNumber = z.number().nullable();

export const propertyExtractSchema = z.object({
  property_type: z.enum(PROPERTY_TYPES).nullable(),
  strategy: z.enum(STRATEGIES).nullable(),
  address_full: nullableString,
  district: nullableString,
  subdistrict: nullableString,
  province: nullableString,
  asking_price: nullableNumber,
  currency: z.string().nullable(),
  usable_sqm: nullableNumber,
  land_sqm: nullableNumber,
  beds: nullableNumber,
  baths: nullableNumber,
  parking: nullableNumber,
  phone: nullableString,
  agent_name: nullableString,
  agency: nullableString,
  ownership: nullableString,
  condition: nullableString,
  year_built: nullableNumber,
  alley_width_m: nullableNumber,
  corner_lot: z.boolean().nullable(),
  flood_note: nullableString,
  nearest_station: nullableString,
  station_distance_m: nullableNumber,
  source: z.enum(SOURCES).nullable(),
  tags: z.array(z.string()),
  original_text: nullableString,
  translated_summary: nullableString,
  intake_notes: nullableString,
  confidence: z.number().min(0).max(1).nullable(),
});

export type PropertyExtract = z.infer<typeof propertyExtractSchema>;

export const renovationGenerateSchema = z.object({
  title: z.string(),
  ai_summary: z.string(),
  items: z.array(
    z.object({
      room: z.string().nullable(),
      category: z.string().nullable(),
      description: z.string(),
      quantity: z.number(),
      unit: z.string(),
      unit_cost: z.number(),
      status: z.enum(RENO_ITEM_STATUSES),
      notes: z.string().nullable(),
    }),
  ),
});

export type RenovationGenerate = z.infer<typeof renovationGenerateSchema>;
