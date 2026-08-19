"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

export function AppSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const started = Date.now();
    function hide() {
      const wait = Math.max(0, 400 - (Date.now() - started));
      window.setTimeout(() => setVisible(false), wait);
    }
    hide();
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-5 bg-background"
      aria-label="Loading Scout"
    >
      <div className="flex size-20 items-center justify-center rounded-2xl bg-[#17181b]">
        <svg viewBox="0 0 32 32" className="size-12" aria-hidden>
          <path
            fill="#4ec9b0"
            d="M20.6 8.1h3.1v4.4L27.2 15.4H24.6V26H18.1v-6.2h-4.2V26H7.4V15.4H4.8L16 5.8l4.6 4Z"
          />
          <rect x="13.9" y="19.8" width="4.2" height="6.2" fill="#17181b" />
        </svg>
      </div>
      <p className="text-lg font-semibold tracking-tight">Scout</p>
      <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}
