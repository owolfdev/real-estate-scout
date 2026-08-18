import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { hasSupabaseEnv } from "@/lib/utils";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-16">
      <p className="text-xs text-muted-foreground">Real estate</p>
      <h1 className="text-4xl font-semibold tracking-tight">Scout</h1>
      <p className="mt-3 mb-8 text-muted-foreground">
        Catalog signs, notes, and renovation plans for Thai rentals and flips.
      </p>
      <Suspense>
        <LoginForm configured={hasSupabaseEnv()} />
      </Suspense>
    </div>
  );
}
