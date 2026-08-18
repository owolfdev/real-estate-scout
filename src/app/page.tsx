import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PropertyList } from "@/components/property-list";
import { listProperties } from "@/lib/actions/properties";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/utils";

export default async function HomePage() {
  if (!hasSupabaseEnv()) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight">Scout</h1>
        <p className="mt-4 text-muted-foreground">
          Add your Supabase keys to <code className="text-foreground">.env.local</code>{" "}
          and run the SQL in <code className="text-foreground">supabase/schema.sql</code>.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const properties = user ? await listProperties() : [];

  return (
    <AppShell email={user?.email}>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Thailand</p>
          <h1 className="text-3xl font-semibold tracking-tight">Prospects</h1>
        </div>
        <Link
          href="/capture"
          className="hidden h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground sm:inline-flex"
        >
          New prospect
        </Link>
      </div>
      <PropertyList properties={properties} />
    </AppShell>
  );
}
