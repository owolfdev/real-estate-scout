import { requireUser } from "./require-user";
import { storageBucket, tables } from "@/lib/supabase/tables";
import type { Media, Note, Property, RenovationItem, RenovationPlan } from "@/lib/types";

export async function loadProperty(id: string) {
  const { supabase, user } = await requireUser();
  const { data: property, error } = await supabase
    .from(tables.properties)
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();
  if (error || !property) return null;

  const [{ data: media }, { data: notes }, { data: plan }] = await Promise.all([
    supabase
      .from(tables.media)
      .select("*")
      .eq("property_id", id)
      .order("sort_order")
      .order("created_at"),
    supabase
      .from(tables.notes)
      .select("*")
      .eq("property_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from(tables.renovationPlans)
      .select("*")
      .eq("property_id", id)
      .maybeSingle(),
  ]);

  let items: RenovationItem[] = [];
  if (plan) {
    const { data } = await supabase
      .from(tables.renovationItems)
      .select("*")
      .eq("plan_id", plan.id)
      .order("sort_order");
    items = (data ?? []) as RenovationItem[];
  }

  const paths = (media ?? []).map((item) => item.storage_path);
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data: urls } = await supabase.storage
      .from(storageBucket)
      .createSignedUrls(paths, 60 * 60);
    urls?.forEach((item) => {
      if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
    });
  }

  return {
    property: property as Property,
    media: ((media ?? []) as Media[]).map((item) => ({
      ...item,
      signed_url: signed.get(item.storage_path) ?? null,
    })),
    notes: (notes ?? []) as Note[],
    plan: (plan as RenovationPlan | null) ?? null,
    items,
  };
}
