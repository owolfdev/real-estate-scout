"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavigationProgress() {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (pathRef.current === pathname) return;
    pathRef.current = pathname;
    const done = window.setTimeout(() => setActive(false), 250);
    return () => window.clearTimeout(done);
  }, [pathname]);

  useEffect(() => {
    if (!active) return;
    const stuck = window.setTimeout(() => setActive(false), 8000);
    return () => window.clearTimeout(stuck);
  }, [active]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor || (anchor.target && anchor.target !== "_self")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      setActive(true);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[190] h-0.5 overflow-hidden transition-opacity",
        active ? "opacity-100" : "opacity-0",
      )}
      aria-hidden={!active}
    >
      <div
        className={cn(
          "h-full w-1/3 bg-primary",
          active && "animate-[scout-progress_1s_ease-in-out_infinite]",
        )}
      />
    </div>
  );
}
