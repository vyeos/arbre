import Link from "next/link";
import DemoGameplay from "@/app/(play)/_components/demo-gameplay";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-card to-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        {/* Demo Mode Banner */}
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-400"></span>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
                  Demo Mode
                </p>
              </div>
              <h1 className="mt-2 text-2xl font-semibold text-foreground">
                Play the full game — No account required
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Progress will NOT be saved. Complete the demo to unlock sign-up and persistent
                progression.
              </p>
            </div>
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Quest Arena Demo */}
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Demo Quest Arena
          </p>
          <h2 className="text-3xl font-semibold">Try the Quest Arena</h2>
          <p className="text-sm text-muted-foreground">
            Clear encounters, run tests, and fix bugs. Demo ends after completing all quests.
          </p>
        </header>

        <DemoGameplay />

        {/* Demo Limitations */}
        <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-lg">
          <h3 className="text-lg font-semibold">What&apos;s Missing in Demo Mode?</h3>
          <ul className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <li className="flex items-start gap-2">
              <span className="text-destructive">✗</span>
              <span>No persistent XP or Gold</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive">✗</span>
              <span>No Skill Tree unlocks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive">✗</span>
              <span>No Character Vessel customization</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive">✗</span>
              <span>No Relic Vault access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive">✗</span>
              <span>No Leaderboards or Achievements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive">✗</span>
              <span>No Boss encounters</span>
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Forge Character Vessel & Unlock Full Game
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-border bg-card/70 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-card"
            >
              Already Have an Account?
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
