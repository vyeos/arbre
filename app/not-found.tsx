import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-b from-background via-card/20 to-background px-6 text-center">
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-destructive/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      {/* Error code */}
      <p className="mb-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Realm Not Found
      </p>
      <h1 className="font-serif text-7xl font-bold tracking-tight text-foreground md:text-8xl">
        <span className="text-destructive">404</span>
      </h1>

      {/* Flavor text */}
      <div className="mt-6 max-w-md space-y-3">
        <p className="text-lg text-foreground">You have wandered into the Void.</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The path you seek does not exist in this realm. Perhaps it was sealed away, or maybe it
          never was. The mists reveal nothing here.
        </p>
      </div>

      {/* Stats display (RPG flavor) */}
      <div className="mt-8 flex items-center gap-6 rounded-xl border border-border/40 bg-card/30 px-6 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>💀</span>
          <span>HP: 0</span>
        </div>
        <div className="h-4 w-px bg-border/60" />
        <div className="flex items-center gap-2">
          <span>📍</span>
          <span>Location: Unknown</span>
        </div>
        <div className="h-4 w-px bg-border/60" />
        <div className="flex items-center gap-2">
          <span>⚠️</span>
          <span>Status: Lost</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Button
          asChild
          size="lg"
          className="bg-linear-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40"
        >
          <Link href="/">🏠 Return to Sanctuary</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="border-primary/40">
          <Link href="/play">⚔️ Enter Quest Arena</Link>
        </Button>
      </div>

      {/* Hint */}
      <p className="mt-12 text-xs text-muted-foreground/60">
        Tip: Check the path in your address bar. The Realm is case-sensitive.
      </p>
    </div>
  );
}
