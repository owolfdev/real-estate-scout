"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FormSubmitButton } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { signIn, signUp } from "@/lib/actions/auth";

export function LoginForm({ configured }: { configured: boolean }) {
  const params = useSearchParams();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [error, setError] = useState<string | null>(
    params.get("error") ? "Could not complete sign-in." : null,
  );
  const [message, setMessage] = useState<string | null>(null);

  if (!configured) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm leading-6 text-muted-foreground">
        Add your Supabase URL and <code className="font-mono">sb_publishable</code>{" "}
        key to <code className="font-mono">.env.local</code>, then run{" "}
        <code className="font-mono">supabase/schema.sql</code> in the SQL editor.
      </div>
    );
  }

  return (
    <form
      className="space-y-4 rounded-lg border border-border bg-card p-6"
      action={async (formData) => {
        setError(null);
        setMessage(null);
        const result =
          mode === "in" ? await signIn(formData) : await signUp(formData);
        if (result?.error) setError(result.error);
        if (result && "message" in result && result.message) setMessage(result.message);
      }}
    >
      <input type="hidden" name="next" value={params.get("next") || "/"} />
      <Field label="Email">
        <Input name="email" type="email" required autoComplete="email" />
      </Field>
      <Field label="Password">
        <Input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "in" ? "current-password" : "new-password"}
        />
      </Field>
      <FormSubmitButton
        className="w-full"
        size="lg"
        pendingLabel={mode === "in" ? "Signing in…" : "Creating account…"}
      >
        {mode === "in" ? "Sign in" : "Create account"}
      </FormSubmitButton>
      <button
        type="button"
        className="w-full text-sm text-muted-foreground active:opacity-70"
        onClick={() => setMode(mode === "in" ? "up" : "in")}
      >
        {mode === "in" ? "Need the first account?" : "Already have an account?"}
      </button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {message && <p className="text-sm text-primary">{message}</p>}
    </form>
  );
}
