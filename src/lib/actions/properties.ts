"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "./require-user";
import { storageBucket, tables } from "@/lib/supabase/tables";
import type { Property, PropertyDraft } from "@/lib/types";

function rowFromDraft(draft: PropertyDraft, ownerId: string) {
  return {
    owner_id: ownerId,
    type: draft.type,
    strategy: draft.strategy,
    stage: draft.stage,
    title: draft.title || null,
    address_full: draft.address_full || null,
    district: draft.district || null,
    subdistrict: draft.subdistrict || null,
    province: draft.province || null,
    lat: draft.lat,
    lng: draft.lng,
    location_accuracy_m: draft.location_accuracy_m,
    location_source: draft.location_source,
    usable_sqm: draft.usable_sqm,
    land_sqm: draft.land_sqm,
    beds: draft.beds,
    baths: draft.baths,
    parking: draft.parking,
    asking_price: draft.asking_price,
    currency: draft.currency || "THB",
    phone: draft.phone || null,
    agent_name: draft.agent_name || null,
    agency: draft.agency || null,
    ownership: draft.ownership || null,
    condition: draft.condition || null,
    year_built: draft.year_built,
    alley_width_m: draft.alley_width_m,
    corner_lot: draft.corner_lot,
    flood_note: draft.flood_note || null,
    nearest_station: draft.nearest_station || null,
    station_distance_m: draft.station_distance_m,
    score: draft.score,
    tags: draft.tags,
    source: draft.source,
    original_text: draft.original_text || null,
    translated_summary: draft.translated_summary || null,
    intake_notes: draft.intake_notes || null,
  };
}

async function uploadMedia(options: {
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"];
  userId: string;
  propertyId: string;
  file: File;
  kind: "sign" | "gallery" | "renovation";
  lat?: number | null;
  lng?: number | null;
  caption?: string;
}) {
  const ext = options.file.name.split(".").pop() || "jpg";
  const path = `${options.userId}/${options.propertyId}/${options.kind}-${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await options.supabase.storage
    .from(storageBucket)
    .upload(path, options.file, { contentType: options.file.type, upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { error } = await options.supabase.from(tables.media).insert({
    property_id: options.propertyId,
    owner_id: options.userId,
    kind: options.kind,
    storage_path: path,
    caption: options.caption || null,
    captured_lat: options.lat ?? null,
    captured_lng: options.lng ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function createProperty(formData: FormData) {
  const { supabase, user } = await requireUser();
  const draft = JSON.parse(String(formData.get("draft") || "{}")) as PropertyDraft;
  const { data, error } = await supabase
    .from(tables.properties)
    .insert(rowFromDraft(draft, user.id))
    .select("id")
    .single();
  if (error || !data) return { error: error?.message || "Could not save property" };

  const sign = formData.get("sign");
  if (sign instanceof File && sign.size > 0) {
    await uploadMedia({
      supabase,
      userId: user.id,
      propertyId: data.id,
      file: sign,
      kind: "sign",
      lat: draft.lat,
      lng: draft.lng,
      caption: "Listing sign",
    });
  }

  revalidatePath("/");
  revalidatePath(`/properties/${data.id}`);
  return { id: data.id as string };
}

export async function updateProperty(id: string, draft: PropertyDraft) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from(tables.properties)
    .update(rowFromDraft(draft, user.id))
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath(`/properties/${id}`);
  return { error: null };
}

export async function deleteProperty(id: string) {
  const { supabase, user } = await requireUser();
  const { data: media } = await supabase
    .from(tables.media)
    .select("storage_path")
    .eq("property_id", id)
    .eq("owner_id", user.id);
  if (media?.length) {
    await supabase.storage
      .from(storageBucket)
      .remove(media.map((item) => item.storage_path));
  }
  const { error } = await supabase
    .from(tables.properties)
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { error: null };
}

export async function addMedia(formData: FormData) {
  const { supabase, user } = await requireUser();
  const propertyId = String(formData.get("propertyId") || "");
  const kind = (String(formData.get("kind") || "gallery") as
    | "sign"
    | "gallery"
    | "renovation");
  const caption = String(formData.get("caption") || "");
  const lat = formData.get("lat") ? Number(formData.get("lat")) : null;
  const lng = formData.get("lng") ? Number(formData.get("lng")) : null;
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);

  for (const file of files) {
    if (file.size === 0) continue;
    await uploadMedia({
      supabase,
      userId: user.id,
      propertyId,
      file,
      kind,
      lat,
      lng,
      caption,
    });
  }

  revalidatePath(`/properties/${propertyId}`);
  return { error: null };
}

export async function deleteMedia(id: string, propertyId: string) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from(tables.media)
    .select("storage_path")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();
  if (data?.storage_path) {
    await supabase.storage.from(storageBucket).remove([data.storage_path]);
  }
  const { error } = await supabase
    .from(tables.media)
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) return { error: error.message };
  revalidatePath(`/properties/${propertyId}`);
  return { error: null };
}

export async function addNote(propertyId: string, body: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from(tables.notes).insert({
    property_id: propertyId,
    owner_id: user.id,
    body,
  });
  if (error) return { error: error.message };
  revalidatePath(`/properties/${propertyId}`);
  return { error: null };
}

export async function updateNote(id: string, propertyId: string, body: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from(tables.notes)
    .update({ body })
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) return { error: error.message };
  revalidatePath(`/properties/${propertyId}`);
  return { error: null };
}

export async function deleteNote(id: string, propertyId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from(tables.notes)
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) return { error: error.message };
  revalidatePath(`/properties/${propertyId}`);
  return { error: null };
}

export type PropertyListItem = Property & { cover_url: string | null };

export async function listProperties(): Promise<PropertyListItem[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from(tables.properties)
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  const ids = data.map((row) => row.id);
  const { data: media } = ids.length
    ? await supabase
        .from(tables.media)
        .select("property_id, storage_path, kind, created_at")
        .in("property_id", ids)
        .order("created_at", { ascending: true })
    : { data: [] };

  const coverByProperty = new Map<string, string>();
  for (const item of media ?? []) {
    if (!coverByProperty.has(item.property_id)) {
      coverByProperty.set(item.property_id, item.storage_path);
    }
  }

  const paths = [...coverByProperty.values()];
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data: urls } = await supabase.storage
      .from(storageBucket)
      .createSignedUrls(paths, 60 * 60);
    urls?.forEach((item) => {
      if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
    });
  }

  return data.map((row) => {
    const path = coverByProperty.get(row.id);
    return {
      ...(row as Property),
      cover_url: path ? signed.get(path) ?? null : null,
    };
  });
}
