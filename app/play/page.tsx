import QuestGameplay from "@/app/(play)/_components/quest-gameplay";
import { Badge } from "@/components/ui/badge";

export default function PlayPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-card/20 to-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        {/* Header with RPG flair */}
        <header className="relative space-y-4">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -top-10 left-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center gap-4">
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-primary"
            >
              <span className=" mr-2">⚔️️</span>
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
                Quest Arena
              </span>
            </Badge>
            <span className="text-xs text-muted-foreground">⚔️ Live Encounter Zone</span>
          </div>

          <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
            <span className="text-foreground">Enter the </span>
            <span className="text-primary">Live Quest Arena</span>
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Face live code encounters, earn XP and Gold, and unlock the next sealed Quest. Every bug
            you vanquish brings you closer to mastery.
          </p>

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border/60 bg-card/40 px-5 py-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className="text-muted-foreground">Active Quest</span>
            </div>
            <div className="h-4 w-px bg-border/60" />
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className="text-muted-foreground">XP on clear</span>
            </div>
            <div className="h-4 w-px bg-border/60" />
            <div className="flex items-center gap-2">
              <span className="text-lg">🪙</span>
              <span className="text-muted-foreground">Gold rewards</span>
            </div>
          </div>
        </header>

        <QuestGameplay />
      </main>
    </div>
  );
}
