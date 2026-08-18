"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Camera, FileText, LoaderCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { PropertyForm } from "@/components/property-form";
import { useGeolocation } from "@/hooks/use-geolocation";
import { createProperty } from "@/lib/actions/properties";
import { compressImage, fileToDataUrl } from "@/lib/image";
import { draftFromExtract } from "@/lib/map-extract";
import type { PropertyExtract } from "@/lib/schemas";
import { emptyDraft, type PropertyDraft } from "@/lib/types";
import { formatCoords } from "@/lib/format";

export function CaptureStudio() {
  const router = useRouter();
  const { fix, setFix, error: geoError, capture } = useGeolocation(true);
  const [text, setText] = useState("");
  const [signFile, setSignFile] = useState<File | null>(null);
  const [signPreview, setSignPreview] = useState<string | null>(null);
  const [draft, setDraft] = useState<PropertyDraft | null>(null);
  const [busy, setBusy] = useState<"extract" | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSign(file: File | null) {
    if (!file) {
      setSignFile(null);
      setSignPreview(null);
      return;
    }
    const compressed = await compressImage(file);
    setSignFile(compressed);
    setSignPreview(await fileToDataUrl(compressed));
    capture();
  }

  async function interpret() {
    setBusy("extract");
    setError(null);
    try {
      const form = new FormData();
      form.set("text", text);
      if (fix.lat != null) form.set("lat", String(fix.lat));
      if (fix.lng != null) form.set("lng", String(fix.lng));
      if (signFile) form.set("image", signFile);
      const res = await fetch("/api/extract", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not interpret input");
      const extract = json.extract as PropertyExtract;
      setDraft(
        draftFromExtract(extract, {
          ...fix,
          source: signFile ? "device" : fix.source,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Interpretation failed");
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    if (!draft) return;
    setBusy("save");
    setError(null);
    try {
      const form = new FormData();
      form.set("draft", JSON.stringify(draft));
      if (signFile) form.set("sign", signFile);
      const result = await createProperty(form);
      if ("error" in result && result.error) throw new Error(result.error);
      router.push(`/properties/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header>
        <p className="text-xs text-muted-foreground">Field intake</p>
        <h1 className="font-semibold tracking-tight text-3xl text-foreground">New prospect</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Type anything, photograph a sign, or both. Location is captured now and
          stays editable before you save.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          GPS {formatCoords(fix.lat, fix.lng)}
          {fix.accuracy_m != null && ` · ±${fix.accuracy_m}m`}
          {geoError && ` · ${geoError}`}
        </p>
      </header>

      {!draft ? (
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <FileText className="size-3.5" />
              Notes or listing text
            </span>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="3-bed shophouse near Ari, 8.5M, needs kitchen, good for rental…"
              className="min-h-36"
            />
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-4 py-10 text-center">
            {signPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={signPreview}
                alt="Sign preview"
                className="max-h-72 rounded-xl object-contain"
              />
            ) : (
              <>
                <Camera className="size-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Photograph the sign</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Thai text is translated. The original photo is kept.
                  </p>
                </div>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => onSign(e.target.files?.[0] ?? null)}
            />
          </label>

          <Button
            size="lg"
            className="w-full"
            disabled={busy === "extract" || (!text.trim() && !signFile)}
            onClick={interpret}
          >
            {busy === "extract" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Interpret and preview
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {signPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={signPreview}
              alt="Captured sign"
              className="max-h-56 w-full rounded-lg object-cover"
            />
          )}
          <PropertyForm
            draft={draft}
            onChange={setDraft}
            onRecaptureLocation={() => {
              navigator.geolocation?.getCurrentPosition((position) => {
                const next = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  accuracy_m: Math.round(position.coords.accuracy),
                  source: "device" as const,
                };
                setFix(next);
                setDraft((current) =>
                  current
                    ? {
                        ...current,
                        lat: next.lat,
                        lng: next.lng,
                        location_accuracy_m: next.accuracy_m,
                        location_source: "device",
                      }
                    : current,
                );
              });
            }}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDraft(null)}
            >
              Back to input
            </Button>
            <Button
              className="flex-1"
              disabled={busy === "save"}
              onClick={save}
            >
              {busy === "save" && <LoaderCircle className="size-4 animate-spin" />}
              Save prospect
            </Button>
          </div>
          <button
            type="button"
            className="text-sm text-muted-foreground underline"
            onClick={() => setDraft(emptyDraft(fix))}
          >
            Start from a blank record instead
          </button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
