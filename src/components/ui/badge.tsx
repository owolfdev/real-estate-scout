import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: "muted" | "forest" | "brass" | "clay";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
        tone === "muted" && "bg-muted text-muted-foreground",
        tone === "forest" && "bg-primary/10 text-primary",
        tone === "brass" && "bg-accent/10 text-accent",
        tone === "clay" && "bg-destructive/10 text-destructive",
        className,
      )}
    >
      {children}
    </span>
  );
}
