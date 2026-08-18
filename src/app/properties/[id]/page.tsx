import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PropertyDetail } from "@/components/property-detail";
import { loadProperty } from "@/lib/actions/load-property";
import { createClient } from "@/lib/supabase/server";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const data = await loadProperty(id);
  if (!data) notFound();

  return (
    <AppShell email={user?.email}>
      <PropertyDetail
        property={data.property}
        media={data.media}
        notes={data.notes}
        plan={data.plan}
        items={data.items}
      />
    </AppShell>
  );
}
