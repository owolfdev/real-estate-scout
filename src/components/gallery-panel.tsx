"use client";

import { useCallback, useMemo, useState } from "react";
import { Camera, LoaderCircle, Trash2, Upload } from "lucide-react";
import { CameraCapture, openRearCamera } from "@/components/camera-capture";
import { ImageLightbox, type LightboxItem } from "@/components/image-lightbox";
import { Button } from "@/components/ui/button";
import { addMedia, deleteMedia } from "@/lib/actions/properties";
import { compressImage } from "@/lib/image";
import type { Media } from "@/lib/types";

function toLightbox(items: Media[], fallbackAlt: string): LightboxItem[] {
  return items.flatMap((item) =>
    item.signed_url
      ? [{ id: item.id, src: item.signed_url, alt: item.caption || fallbackAlt }]
      : [],
  );
}

export function GalleryPanel({
  propertyId,
  media,
  lat,
  lng,
  editing = false,
}: {
  propertyId: string;
  media: Media[];
  lat: number | null;
  lng: number | null;
  editing?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [view, setView] = useState<{ kind: "gallery" | "sign"; index: number } | null>(
    null,
  );
  const gallery = media.filter((item) => item.kind === "gallery");
  const signs = media.filter((item) => item.kind === "sign");
  const galleryItems = useMemo(
    () => toLightbox(media.filter((item) => item.kind === "gallery"), "Property photo"),
    [media],
  );
  const signItems = useMemo(
    () => toLightbox(media.filter((item) => item.kind === "sign"), "Sign"),
    [media],
  );
  const viewItems = view?.kind === "sign" ? signItems : galleryItems;
  const closeView = useCallback(() => setView(null), []);
  const moveView = useCallback((index: number) => {
    setView((current) => (current ? { ...current, index } : current));
  }, []);

  function closeCamera() {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    setCameraOpen(false);
    setCameraError(null);
  }

  async function startCamera() {
    setError(null);
    setCameraError(null);
    try {
      const stream = await openRearCamera();
      setCameraStream(stream);
      setCameraOpen(true);
    } catch (err) {
      setCameraOpen(true);
      setCameraError(
        err instanceof Error
          ? err.message
          : "Could not open the camera. Allow access and try again.",
      );
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this photo?")) return;
    setBusy(true);
    setError(null);
    try {
      if (view?.index != null && viewItems[view.index]?.id === id) {
        const remaining = viewItems.filter((item) => item.id !== id);
        if (!remaining.length) setView(null);
        else {
          setView({
            ...view,
            index: Math.min(view.index, remaining.length - 1),
          });
        }
      }
      const result = await deleteMedia(id, propertyId);
      if (result?.error) throw new Error(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove photo");
    } finally {
      setBusy(false);
    }
  }

  async function upload(files: File[] | FileList | null, kind: "gallery" | "sign") {
    const list = files ? Array.from(files) : [];
    if (!list.length) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("propertyId", propertyId);
      form.set("kind", kind);
      if (lat != null) form.set("lat", String(lat));
      if (lng != null) form.set("lng", String(lng));
      for (const file of list) {
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
        {editing ? (
          <div className="flex flex-wrap gap-2">
            <Button onClick={startCamera} disabled={busy}>
              <Camera className="size-4" />
              Take photos
            </Button>
            <label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  upload(e.target.files, "gallery");
                  e.target.value = "";
                }}
              />
              <span className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium active:bg-muted">
                {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
                From library
              </span>
            </label>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Edit to add or remove photos.</p>
        )}
      </div>

      {gallery.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          No walkthrough photos yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {gallery.map((item) => {
            const viewIndex = galleryItems.findIndex((photo) => photo.id === item.id);
            return (
              <figure
                key={item.id}
                className="group relative overflow-hidden rounded-lg bg-muted"
              >
                {item.signed_url ? (
                  <button
                    type="button"
                    className="block w-full cursor-pointer"
                    onClick={() =>
                      viewIndex >= 0 && setView({ kind: "gallery", index: viewIndex })
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.signed_url}
                      alt={item.caption || "Property photo"}
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                ) : (
                  <div className="aspect-square" />
                )}
                {editing && (
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-md bg-black/70 p-2 text-white active:scale-95"
                    aria-label="Remove photo"
                    disabled={busy}
                    onClick={() => remove(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </figure>
            );
          })}
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Sign captures</h3>
          {editing && (
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
          )}
        </div>
        {signs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sign photos attached.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto">
            {signs.map((item) => {
              const viewIndex = signItems.findIndex((photo) => photo.id === item.id);
              return item.signed_url ? (
                <div key={item.id} className="relative shrink-0">
                  <button
                    type="button"
                    className="cursor-pointer"
                    onClick={() =>
                      viewIndex >= 0 && setView({ kind: "sign", index: viewIndex })
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.signed_url}
                      alt="Sign"
                      className="h-32 rounded-xl object-cover"
                    />
                  </button>
                  {editing && (
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-md bg-black/70 p-1.5 text-white active:scale-95"
                      aria-label="Remove sign photo"
                      disabled={busy}
                      onClick={() => remove(item.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <CameraCapture
        open={cameraOpen}
        stream={cameraStream}
        error={cameraError}
        onClose={closeCamera}
        onCapture={(files) => upload(files, "gallery")}
      />
      {view && viewItems[view.index] && (
        <ImageLightbox
          items={viewItems}
          index={view.index}
          onClose={closeView}
          onIndex={moveView}
          onDelete={editing ? remove : undefined}
        />
      )}
    </div>
  );
}
