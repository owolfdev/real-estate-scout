"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type LightboxItem = {
  id: string;
  src: string;
  alt?: string;
};

export function ImageLightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onIndex: (index: number) => void;
}) {
  const item = items[index];
  const multiple = items.length > 1;
  const touchX = useRef(0);

  useEffect(() => {
    if (!item) {
      onClose();
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onIndex((index - 1 + items.length) % items.length);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onIndex((index + 1) % items.length);
      }
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [item, index, items.length, onClose, onIndex]);

  if (!item || typeof document === "undefined") return null;

  function go(delta: number) {
    onIndex((index + delta + items.length) % items.length);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={onClose}
      onTouchStart={(event) => {
        touchX.current = event.changedTouches[0]?.clientX ?? 0;
      }}
      onTouchEnd={(event) => {
        if (!multiple) return;
        const dx = (event.changedTouches[0]?.clientX ?? 0) - touchX.current;
        if (dx > 50) go(-1);
        if (dx < -50) go(1);
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm text-white/70">
          {index + 1} / {items.length}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 hover:text-white"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="size-5" />
        </Button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6">
        {multiple && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-3 z-10 size-11 text-white hover:bg-white/10 hover:text-white md:left-6"
            aria-label="Previous photo"
            onClick={(event) => {
              event.stopPropagation();
              go(-1);
            }}
          >
            <ChevronLeft className="size-7" />
          </Button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.alt || "Property photo"}
          className="max-h-full max-w-full object-contain"
          onClick={(event) => event.stopPropagation()}
        />
        {multiple && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 z-10 size-11 text-white hover:bg-white/10 hover:text-white md:right-6"
            aria-label="Next photo"
            onClick={(event) => {
              event.stopPropagation();
              go(1);
            }}
          >
            <ChevronRight className="size-7" />
          </Button>
        )}
      </div>
    </div>,
    document.body,
  );
}
