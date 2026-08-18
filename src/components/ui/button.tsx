"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  busy?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  busy = false,
  disabled,
  children,
  onTouchStart,
  ...props
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,background-color,opacity,transform,box-shadow] outline-none select-none touch-manipulation focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        size === "sm" && "h-8 px-3",
        size === "md" && "h-9 px-4",
        size === "lg" && "h-10 px-6",
        size === "icon" && "size-9",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        variant === "secondary" &&
          "border border-border bg-background hover:bg-muted active:bg-muted",
        variant === "ghost" &&
          "hover:bg-muted hover:text-foreground active:bg-muted",
        variant === "danger" &&
          "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80",
        className,
      )}
      {...props}
      onTouchStart={(event) => {
        onTouchStart?.(event);
      }}
    >
      {busy ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden />
      ) : null}
      {children}
    </button>
  );
}

export function FormSubmitButton({
  pendingLabel,
  children,
  ...props
}: Props & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" busy={pending} {...props}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
