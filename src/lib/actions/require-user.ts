import { createClient } from "@/lib/supabase/server";
import { tables } from "@/lib/supabase/tables";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("You need to be signed in");
  }

  const { data: profile } = await supabase
    .from(tables.profiles)
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const fullName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : "";
    const { error: profileError } = await supabase.from(tables.profiles).insert({
      id: user.id,
      full_name: fullName,
    });
    if (profileError && profileError.code !== "23505") {
      throw new Error(profileError.message);
    }
  }

  return { supabase, user };
}

