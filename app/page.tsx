import Link from "next/link";

import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    icon: "⚔️",
    title: "Quest Encounters",
    description:
      "Face live code encounters that test your skill. Earn XP, Gold, and Skill Points with every Critical Hit.",
    glow: "shadow-emerald-500/20",
  },
  {
    icon: "🌳",
    title: "Skill Branches",
    description:
      "Bind Skills to shape your build. Unlock passive buffs, active abilities, and bend the rules of combat.",
    glow: "shadow-sky-500/20",
  },
  {
    icon: "🛡️",
    title: "Relic Armory",
    description:
      "Acquire legendary Relics and bind them to your Avatar. Let your victories shine for all to see.",
    glow: "shadow-amber-500/20",
  },
];

const realmStats = [
  {
    value: "120+",
    label: "Quests Forged",
    detail: "Curated encounters await",
    icon: "📜",
  },
  {
    value: "8",
    label: "Skill Branches",
    detail: "Build-defining paths",
    icon: "🌿",
  },
  {
    value: "9",
    label: "Relic Slots",
    detail: "Avatar prestige layers",
    icon: "💎",
  },
];

const journeyChapters = [
  {
    chapter: "I",
    title: "Enter the Quest Arena",
    description: "Face live encounters. Drain the bug. Claim your rewards.",
    href: "/play",
    color: "border-emerald-500/40 hover:border-emerald-400/60",
    glow: "hover:shadow-emerald-500/10",
  },
  {
    chapter: "II",
    title: "Bind Skills",
    description: "Spend Bytes in the Skill Tree to shape your build.",
    href: "/skills",
    color: "border-sky-500/40 hover:border-sky-400/60",
    glow: "hover:shadow-sky-500/10",
  },
  {
    chapter: "III",
    title: "Claim Relics",
    description: "Visit the Armory. Acquire cosmetics. Show your victories.",
    href: "/armory",
    color: "border-amber-500/40 hover:border-amber-400/60",
    glow: "hover:shadow-amber-500/10",
  },
];

const relicSlots = [
  { name: "Head", icon: "👑" },
  { name: "Face", icon: "🎭" },
  { name: "Body", icon: "🧥" },
  { name: "Hands", icon: "🧤" },
  { name: "Handheld", icon: "⚔️" },
  { name: "Back", icon: "🦇" },
  { name: "Background", icon: "🌌" },
  { name: "Frame", icon: "🖼️" },
  { name: "Aura", icon: "✨" },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-card/20 to-background text-foreground">
      {/* Hero Section */}
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 py-16">
        <section className="relative">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -top-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div className="space-y-8">
              <Badge
                variant="outline"
                className="inline-flex items-center gap-2 border-primary/40 px-4 py-1.5 text-xs uppercase tracking-[0.2em]"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                Forge your mind. Earn your power.
              </Badge>

              <h1 className="font-serif text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
                <span className="bg-linear-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                  Master the Debug Realm
                </span>
                <br />
                <span className="text-primary">and Evolve Your Avatar</span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Enter the Quest Arena where every line of code is a battle. Earn XP, unlock Skill
                Branches, and acquire legendary Relics — all while proving mastery under pressure.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="group relative overflow-hidden bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
                >
                  <Link href="/play">
                    <span className="relative z-10 flex items-center gap-2">
                      ⚔️ Enter Quest Arena
                    </span>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary/40">
                  <Link href="/signup">🛡️ Forge Avatar</Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="text-muted-foreground">
                  <Link href="/login">Enter the Gate →</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid gap-4 pt-4 sm:grid-cols-3">
                {realmStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card/40 px-4 py-3 transition-all hover:border-primary/30 hover:bg-card/60"
                  >
                    <span className="text-2xl">{stat.icon}</span>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Avatar Preview Card */}
            <Card className="relative overflow-hidden border-border/60 bg-linear-to-b from-card/90 to-card/60 shadow-2xl">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-amber-500/5" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-amber-500/40 text-amber-300">
                    ✨ Character Vessel
                  </Badge>
                  <span className="text-xs text-muted-foreground">Prestige System</span>
                </div>
                <CardDescription className="pt-2">
                  Your Avatar displays growth, mastery, and earned prestige.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-3">
                {[
                  { icon: "🎭", label: "Base Vessel", value: "Body • Skin • Hair • Eyes" },
                  { icon: "💎", label: "Relic Layer", value: "9 slots • Pure cosmetics" },
                  { icon: "🪙", label: "Gold Economy", value: "Earned through Quests only" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/50 px-4 py-3"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="space-y-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              The Three Pillars
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Your Path to Mastery</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((highlight) => (
              <Card
                key={highlight.title}
                className={`group relative overflow-hidden border-border/60 bg-linear-to-b from-card/80 to-card/40 transition-all hover:border-primary/30 hover:shadow-xl ${highlight.glow}`}
              >
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <CardHeader className="relative">
                  <span className="mb-2 text-4xl">{highlight.icon}</span>
                  <CardTitle className="text-xl">{highlight.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {highlight.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Chronicle / Journey */}
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-card/80 via-card/60 to-card/40 p-8 shadow-2xl md:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div className="space-y-6">
              <Badge variant="outline" className="border-primary/40">
                📖 Chronicle of the First Steps
              </Badge>
              <h2 className="font-serif text-3xl font-bold">Your Legend Begins Here</h2>
              <p className="text-muted-foreground">
                Follow the chapters below. Every step grants XP, Skill Points, and the power to
                shape your destiny. Never wonder what to do next.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  className="bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                >
                  <Link href="/play">⚔️ Begin Chapter I</Link>
                </Button>
                <Button asChild variant="outline" className="border-primary/40">
                  <Link href="/demo">🎮 Try Demo Quest</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {journeyChapters.map((chapter) => (
                <Link key={chapter.chapter} href={chapter.href} className="block">
                  <Card
                    className={`group border-2 bg-background/50 transition-all hover:bg-background/80 hover:shadow-lg ${chapter.color} ${chapter.glow}`}
                  >
                    <CardHeader className="py-4">
                      <div className="flex items-center gap-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card text-sm font-bold text-muted-foreground">
                          {chapter.chapter}
                        </span>
                        <div>
                          <CardTitle className="text-lg transition-colors group-hover:text-primary">
                            {chapter.title}
                          </CardTitle>
                          <CardDescription>{chapter.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Quest Flow Explanation */}
        <section className="grid gap-8 lg:grid-cols-2">
          <Card className="border-border/60 bg-linear-to-b from-card/80 to-card/40 shadow-xl">
            <CardHeader>
              <Badge variant="outline" className="w-fit border-emerald-500/40 text-emerald-300">
                ⚡ Quest Flow
              </Badge>
              <CardTitle className="mt-4 font-serif text-2xl">
                One Quest. One Outcome. One Climb.
              </CardTitle>
              <CardDescription>
                No grinding. No replays. Pure progression through mastery.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-emerald-400">●</span>
                <p>Each Quest is either ACTIVE, COMPLETED, LOCKED, or SKIPPED.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-sky-400">●</span>
                <p>Complete a Quest to unlock the next. Skipped Quests return later.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-amber-400">●</span>
                <p>Rewards trigger instantly. No replay farming, ever.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-linear-to-b from-card/80 to-card/40 shadow-xl">
            <CardHeader>
              <Badge variant="outline" className="w-fit border-amber-500/40 text-amber-300">
                💎 Relic Slots
              </Badge>
              <CardTitle className="mt-4 font-serif text-2xl">Armory-Ready Prestige</CardTitle>
              <CardDescription>
                Bind one Relic per slot. Sealed Relics reveal their unlock conditions upfront.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {relicSlots.map((slot) => (
                  <div
                    key={slot.name}
                    className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-sm"
                  >
                    <span>{slot.icon}</span>
                    <span className="text-muted-foreground">{slot.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden rounded-2xl border border-primary/30 bg-linear-to-r from-primary/10 via-card/60 to-amber-500/10 p-8 text-center shadow-2xl md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,200,120,0.05)_0%,transparent_70%)]" />
          <div className="relative space-y-6">
            <h2 className="font-serif text-3xl font-bold md:text-4xl">
              Ready to Begin Your Ascent?
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              The Quest Arena awaits. Every line of code you fix brings you closer to mastery. Your
              legend starts now.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
              >
                <Link href="/play">⚔️ Enter Quest Arena</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary/40">
                <Link href="/signup">🛡️ Create Your Avatar</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
