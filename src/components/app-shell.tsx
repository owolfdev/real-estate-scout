import Link from "next/link";
import { Camera, LayoutGrid } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { FormSubmitButton } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppShell({
  email,
  children,
}: {
  email?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:px-8">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight transition-opacity hover:opacity-80"
          >
            Scout
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground sm:flex">
            <Link href="/" className="hover:text-foreground">
              Prospects
            </Link>
            <Link href="/capture" className="hover:text-foreground">
              Capture
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground md:inline">
              {email}
            </span>
            <ThemeToggle />
            <form action={signOut}>
              <FormSubmitButton variant="ghost" size="sm" pendingLabel="Signing out…">
                Sign out
              </FormSubmitButton>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 pb-24 md:px-8">
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-6 py-2 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-sm items-center justify-around">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-xs text-muted-foreground"
          >
            <LayoutGrid className="size-5" />
            Prospects
          </Link>
          <Link
            href="/capture"
            className="-mt-5 flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm"
          >
            <Camera className="size-5" />
          </Link>
          <span className="w-12" />
        </div>
      </nav>
    </div>
  );
}
