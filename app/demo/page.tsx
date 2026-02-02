import Link from "next/link";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-card to-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Realm Update</p>
          <h1 className="mt-2 text-3xl font-semibold">Demo Mode Has Closed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The Quest Arena is now fully live. Bind your account to enter the full realm.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/play"
              className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Enter the Quest Arena
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-border bg-card/70 px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/60"
            >
              Forge Character Vessel
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
