import { AppShell } from "@/components/app-shell";

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export function PageSkeleton({
  variant,
}: {
  variant: "list" | "property" | "capture" | "login";
}) {
  if (variant === "login") {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-16">
        <Pulse className="h-3 w-24" />
        <Pulse className="mt-4 h-10 w-40" />
        <Pulse className="mt-6 h-48 w-full rounded-lg" />
      </div>
    );
  }

  const inner =
    variant === "property" ? (
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <Pulse className="h-56 w-full rounded-lg md:h-72" />
        <Pulse className="h-8 w-2/3" />
        <Pulse className="h-5 w-40" />
        <Pulse className="h-10 w-full" />
        <Pulse className="h-40 w-full" />
      </div>
    ) : variant === "capture" ? (
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <Pulse className="h-3 w-24" />
        <Pulse className="h-9 w-56" />
        <Pulse className="h-36 w-full" />
        <Pulse className="h-48 w-full rounded-lg" />
        <Pulse className="h-10 w-full" />
      </div>
    ) : (
      <div className="space-y-6">
        <div className="space-y-2">
          <Pulse className="h-3 w-20" />
          <Pulse className="h-8 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Pulse className="h-56 w-full rounded-lg" />
          <Pulse className="h-56 w-full rounded-lg" />
        </div>
      </div>
    );

  return <AppShell>{inner}</AppShell>;
}
