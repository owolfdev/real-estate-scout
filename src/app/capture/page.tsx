import { AppShell } from "@/components/app-shell";
import { CaptureStudio } from "@/components/capture-studio";
import { createClient } from "@/lib/supabase/server";

export default async function CapturePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AppShell email={user?.email}>
      <CaptureStudio />
    </AppShell>
  );
}
