import Link from "next/link";

const highlights = [
  {
    title: "Quest Encounters",
    description:
      "Face code encounters that reward XP, Gold, and mastery. Every fix is a Critical Hit or a lesson learned.",
  },
  {
    title: "Skill Branch Progression",
    description: "Unlock Skill Branches, shape your build, and bend the rules of the battlefield.",
  },
  {
    title: "Armory & Relic Vault",
    description: "Acquire Relics, bind them to your Character Vessel, and let your victories show.",
  },
];

const relicSlots = [
  "Head",
  "Face",
  "Body",
  "Hands",
  "Handheld",
  "Back",
  "Background",
  "Frame",
  "Aura",
];

export default function Page() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-card to-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary"></span>
              Forging the next generation of learning RPGs
            </div>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Master the debug battlefield and evolve your Character Vessel.
            </h1>
            <p className="text-base text-muted-foreground md:text-lg">
              Arbre turns coding challenges into Quest encounters. Earn XP, unlock Skill Branches,
              and acquire Relics in the Armory — all while proving mastery under pressure.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/play"
                className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Enter the Quest Arena
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Forge Character Vessel
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-border bg-card/70 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-card"
              >
                Enter the Gate
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-2xl">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Character Vessel Blueprint
              </p>
              <div className="grid gap-3 text-sm">
                <div className="rounded-lg border border-border bg-background/70 px-4 py-3">
                  <p className="text-muted-foreground">Base Vessel</p>
                  <p className="font-semibold">Body • Skin • Hair • Eye Style</p>
                </div>
                <div className="rounded-lg border border-border bg-background/70 px-4 py-3">
                  <p className="text-muted-foreground">Prestige Layer</p>
                  <p className="font-semibold">Relics bound per slot, no stat boosts</p>
                </div>
                <div className="rounded-lg border border-border bg-background/70 px-4 py-3">
                  <p className="text-muted-foreground">Gold Economy</p>
                  <p className="font-semibold">Earned only through Quests and bosses</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {highlights.map((highlight) => (
            <div
              key={highlight.title}
              className="rounded-2xl border border-border bg-card/80 p-6 shadow-lg"
            >
              <h2 className="text-lg font-semibold">{highlight.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{highlight.description}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-border bg-card/80 p-8 shadow-2xl">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Chronicle of the First Steps
              </p>
              <h2 className="text-2xl font-semibold">Your story begins in the Quest Arena.</h2>
              <p className="text-sm text-muted-foreground">
                Follow the chapters below and you will never wonder what to do next. Every step
                grants XP, Skill Points, and the power to shape your build.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/play"
                  className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  Enter the Quest Arena
                </Link>
                <Link
                  href="/play"
                  className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Chapter I: Quest Arena
                </Link>
                <Link
                  href="/skills"
                  className="rounded-lg border border-border bg-card/70 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-card"
                >
                  Chapter II: Skill Tree
                </Link>
              </div>
            </div>
            <div className="grid gap-3 text-sm">
              <div className="rounded-2xl border border-border bg-background/70 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Chapter I
                </p>
                <h3 className="mt-2 text-lg font-semibold">Enter the Quest Arena</h3>
                <p className="mt-2 text-muted-foreground">
                  Clear live encounters, earn Gold, and sharpen your combo streak.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Chapter II
                </p>
                <h3 className="mt-2 text-lg font-semibold">Bind Skills</h3>
                <p className="mt-2 text-muted-foreground">
                  Spend Skill Points in the Skill Tree to shape your build.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Chapter III
                </p>
                <h3 className="mt-2 text-lg font-semibold">Claim Relics</h3>
                <p className="mt-2 text-muted-foreground">
                  Visit the Relic Vault to acquire cosmetics and show your victories.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card/80 p-8 shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold">Armory-ready Relic slots</h2>
              <p className="text-sm text-muted-foreground">
                Bind one Relic per slot. Sealed Relics reveal their unlock conditions upfront so
                Players always know the next milestone.
              </p>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
              {relicSlots.map((slot) => (
                <div
                  key={slot}
                  className="rounded-full border border-border bg-background/70 px-3 py-1 text-center"
                >
                  {slot}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
