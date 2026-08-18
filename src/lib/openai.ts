import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  propertyExtractSchema,
  renovationGenerateSchema,
  type PropertyExtract,
  type RenovationGenerate,
} from "./schemas";

function client() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey: key });
}

function model() {
  return process.env.OPENAI_MODEL || "gpt-4o";
}

const EXTRACT_INSTRUCTIONS = `You are a Thailand real estate acquisition scout.
Extract structured listing data from the user's notes and/or a photo of a for-sale / for-rent sign.
Signs and notes are often in Thai. Translate every structured field into English.
Copy any visible Thai text into original_text exactly as written. Do not invent prices, phones, or sizes.
If a field is not present, use null. Normalize money to a THB number with no commas or units.
Use common English romanization for Bangkok areas (Ari, Thonglor, Chatuchak, Phrom Phong).
strategy: rental, flip, both, or undecided based on clues only.
source: sign if a sign photo is present, otherwise infer from the text.`;

const RENO_INSTRUCTIONS = `You are a renovation estimator for Thai residential properties (houses, shophouses, condos) aimed at rental or flip.
From the photos and notes, produce a detailed, editable renovation plan in English.
Use THB contractor-style line items. Be specific about rooms and work.
Include demolition, MEP, finishes, and a contingency line when appropriate.
Estimates are typical Bangkok ranges — say so in ai_summary and note uncertainty.
Do not invent rooms that the photos clearly do not show.`;

export async function extractProperty(input: {
  text?: string;
  imageBase64?: string;
  imageMime?: string;
  lat?: number | null;
  lng?: number | null;
}): Promise<PropertyExtract> {
  const content: OpenAI.Responses.ResponseInputContent[] = [
    {
      type: "input_text",
      text: [
        input.text?.trim()
          ? `Scout notes:\n${input.text.trim()}`
          : "No text notes were provided. Use the photo if present.",
        input.lat != null && input.lng != null
          ? `Device location at capture: ${input.lat}, ${input.lng} (Thailand). Use this only as geographic context; do not invent a street address from coordinates alone.`
          : "No device location was captured.",
      ].join("\n\n"),
    },
  ];

  if (input.imageBase64) {
    const mime = input.imageMime || "image/jpeg";
    content.push({
      type: "input_image",
      image_url: `data:${mime};base64,${input.imageBase64}`,
      detail: "high",
    });
  }

  const response = await client().responses.parse({
    model: model(),
    instructions: EXTRACT_INSTRUCTIONS,
    input: [{ role: "user", content }],
    text: { format: zodTextFormat(propertyExtractSchema, "property_extract") },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI did not return structured property data");
  }
  return response.output_parsed;
}

export async function generateRenovation(input: {
  notes?: string;
  images: { base64: string; mime?: string }[];
}): Promise<RenovationGenerate> {
  const content: OpenAI.Responses.ResponseInputContent[] = [
    {
      type: "input_text",
      text: input.notes?.trim()
        ? `Renovation brief:\n${input.notes.trim()}`
        : "Create a renovation plan from the property photos.",
    },
  ];

  for (const image of input.images.slice(0, 8)) {
    content.push({
      type: "input_image",
      image_url: `data:${image.mime || "image/jpeg"};base64,${image.base64}`,
      detail: "high",
    });
  }

  const response = await client().responses.parse({
    model: model(),
    instructions: RENO_INSTRUCTIONS,
    input: [{ role: "user", content }],
    text: {
      format: zodTextFormat(renovationGenerateSchema, "renovation_plan"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI did not return a renovation plan");
  }
  return response.output_parsed;
}
