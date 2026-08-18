"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "./require-user";
import { tables } from "@/lib/supabase/tables";
import type { RenoItemStatus, RenoPlanStatus } from "@/lib/types";

export type RenoItemInput = {
  id?: string;
  room: string | null;
  category: string | null;
  description: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  status: RenoItemStatus;
  sort_order: number;
  notes: string | null;
};

export async function saveRenovationPlan(input: {
  propertyId: string;
  title: string;
  status: RenoPlanStatus;
  ai_summary: string;
  items: RenoItemInput[];
}) {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from(tables.renovationPlans)
    .select("id")
    .eq("property_id", input.propertyId)
    .eq("owner_id", user.id)
    .maybeSingle();

  let planId = existing?.id as string | undefined;
  if (planId) {
    const { error } = await supabase
      .from(tables.renovationPlans)
      .update({
        title: input.title,
        status: input.status,
        ai_summary: input.ai_summary || null,
      })
      .eq("id", planId);
    if (error) return { error: error.message };
    await supabase.from(tables.renovationItems).delete().eq("plan_id", planId);
  } else {
    const { data, error } = await supabase
      .from(tables.renovationPlans)
      .insert({
        property_id: input.propertyId,
        owner_id: user.id,
        title: input.title,
        status: input.status,
        ai_summary: input.ai_summary || null,
      })
      .select("id")
      .single();
    if (error || !data) return { error: error?.message || "Could not save plan" };
    planId = data.id;
  }

  if (input.items.length) {
    const { error } = await supabase.from(tables.renovationItems).insert(
      input.items.map((item, index) => ({
        plan_id: planId,
        owner_id: user.id,
        room: item.room,
        category: item.category,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_cost: item.unit_cost,
        status: item.status,
        sort_order: item.sort_order ?? index,
        notes: item.notes,
      })),
    );
    if (error) return { error: error.message };
  }

  revalidatePath(`/properties/${input.propertyId}`);
  return { error: null, planId };
}
