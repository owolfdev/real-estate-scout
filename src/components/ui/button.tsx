import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        size === "sm" && "h-8 px-3",
        size === "md" && "h-9 px-4",
        size === "lg" && "h-10 px-6",
        size === "icon" && "size-9",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "secondary" &&
          "border border-border bg-background hover:bg-muted",
        variant === "ghost" && "hover:bg-muted hover:text-foreground",
        variant === "danger" &&
          "bg-destructive text-white hover:bg-destructive/90",
        className,
      )}
      {...props}
    />
  );
}
