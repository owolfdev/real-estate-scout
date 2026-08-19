"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Shot = { file: File; url: string };

export async function openRearCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera is not available in this browser.");
  }
  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1920 },
      height: { ideal: 1440 },
    },
  });
}

export function CameraCapture({
  open,
  stream,
  error,
  onClose,
  onCapture,
}: {
  open: boolean;
  stream: MediaStream | null;
  error?: string | null;
  onClose: () => void;
  onCapture: (files: File[]) => void | Promise<void>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shotsRef = useRef<Shot[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(false);
  shotsRef.current = shots;

  useEffect(() => {
    if (!open) return;
    setShots([]);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      shotsRef.current.forEach((shot) => URL.revokeObjectURL(shot.url));
    };
  }, [open]);

  useEffect(() => {
    const video = videoRef.current;
    if (!open || !stream || !video) return;
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    void video.play();
    return () => {
      video.srcObject = null;
    };
  }, [open, stream]);

  if (!open || typeof document === "undefined") return null;

  function discard() {
    shots.forEach((shot) => URL.revokeObjectURL(shot.url));
    setShots([]);
    onClose();
  }

  function snap() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || saving) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `walkthrough-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setShots((current) => [...current, { file, url: URL.createObjectURL(blob) }]);
        setFlash(true);
        window.setTimeout(() => setFlash(false), 120);
        navigator.vibrate?.(20);
      },
      "image/jpeg",
      0.92,
    );
  }

  function removeShot(index: number) {
    setShots((current) => {
      const next = [...current];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  }

  async function finish() {
    if (!shots.length) {
      discard();
      return;
    }
    setSaving(true);
    try {
      const files = shots.map((shot) => shot.file);
      shots.forEach((shot) => URL.revokeObjectURL(shot.url));
      setShots([]);
      await onCapture(files);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-black text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 hover:text-white"
          aria-label="Cancel"
          onClick={discard}
          disabled={saving}
        >
          <X className="size-5" />
        </Button>
        <p className="text-sm text-white/70">
          {shots.length
            ? `${shots.length} photo${shots.length === 1 ? "" : "s"}`
            : "Tap shutter for each shot"}
        </p>
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 hover:text-white"
          onClick={finish}
          busy={saving}
          disabled={saving}
        >
          {!saving && <Check className="size-4" />}
          Done
        </Button>
      </div>

      <div className="relative min-h-0 flex-1 bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          muted
          playsInline
        />
        {flash && <div className="pointer-events-none absolute inset-0 bg-white/80" />}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-white/80">
            {error}
          </div>
        )}
      </div>

      <div className="space-y-4 px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {shots.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {shots.map((shot, index) => (
              <button
                key={shot.url}
                type="button"
                className="relative shrink-0"
                onClick={() => removeShot(index)}
                aria-label="Remove photo"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot.url}
                  alt=""
                  className="h-16 w-16 rounded-md object-cover"
                />
                <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-black/70">
                  <X className="size-3" />
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-center">
          <button
            type="button"
            aria-label="Take photo"
            disabled={!!error || saving || !stream}
            onClick={snap}
            className="cursor-pointer rounded-full border-4 border-white bg-white/90 shadow-sm active:scale-95 disabled:opacity-40"
            style={{ width: 72, height: 72 }}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
