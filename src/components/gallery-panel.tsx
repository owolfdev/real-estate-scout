"use client";

import { useState } from "react";
import { LoaderCircle, Trash2, Upload } from "lucide-react";
import { addMedia, deleteMedia } from "@/lib/actions/properties";
import { compressImage } from "@/lib/image";
import type { Media } from "@/lib/types";

export function GalleryPanel({
  propertyId,
  media,
  lat,
  lng,
}: {
  propertyId: string;
  media: Media[];
  lat: number | null;
  lng: number | null;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gallery = media.filter((item) => item.kind === "gallery");
  const signs = media.filter((item) => item.kind === "sign");

  async function upload(files: FileList | null, kind: "gallery" | "sign") {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("propertyId", propertyId);
      form.set("kind", kind);
      if (lat != null) form.set("lat", String(lat));
      if (lng != null) form.set("lng", String(lng));
      for (const file of Array.from(files)) {
        form.append("files", await compressImage(file));
      }
      const result = await addMedia(form);
      if (result.error) throw new Error(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Condition photos only. Sign shots stay in their own strip so they are
          not mixed with walkthrough images.
        </p>
        <label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => upload(e.target.files, "gallery")}
          />
          <span className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Add photos
          </span>
        </label>
      </div>

      {gallery.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          No walkthrough photos yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {gallery.map((item) => (
            <figure key={item.id} className="group relative overflow-hidden rounded-lg bg-muted">
              {item.signed_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.signed_url}
                  alt={item.caption || "Property photo"}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="aspect-square" />
              )}
              <button
                type="button"
                className="absolute right-2 top-2 rounded-md bg-foreground/70 p-2 text-primary-foreground opacity-0 transition group-hover:opacity-100"
                onClick={() => deleteMedia(item.id, propertyId)}
              >
                <Trash2 className="size-4" />
              </button>
            </figure>
          ))}
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Sign captures</h3>
          <label className="text-sm text-primary underline">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => upload(e.target.files, "sign")}
            />
            Add another sign
          </label>
        </div>
        {signs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sign photos attached.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto">
            {signs.map((item) =>
              item.signed_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={item.id}
                  src={item.signed_url}
                  alt="Sign"
                  className="h-32 rounded-xl object-cover"
                />
              ) : null,
            )}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
