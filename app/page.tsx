import Link from "next/link";

import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    title: "Armory",
    description: "Acquire Relics, bind them to your Avatar, and let your victories show.",
  },
];

const realmStats = [
  {
    label: "Quests Forged",
    value: "120+",
    detail: "Curated Quest encounters",
  },
  {
    label: "Skill Branches",
    value: "8",
    detail: "Build-defining paths",
  },
  {
    label: "Relic Slots",
    value: "9",
    detail: "Avatar prestige layers",
  },
];

const journeySteps = [
  {
    title: "Enter the Quest Arena",
    description: "Patch the bug, survive the drain, claim your rewards.",
  },
  {
    title: "Bind Skills",
    description: "Spend Bytes to unlock passive buffs and active actions.",
  },
  {
    title: "Claim Relics",
    description: "Acquire cosmetics in the Armory to show your victories.",
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
            <Badge variant="outline" className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary"></span>
              Forge your mind. Earn your power.
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Master the debug battlefield and evolve your Avatar.
            </h1>
            <p className="text-base text-muted-foreground md:text-lg">
              Arbre turns coding quests into Quest encounters. Earn XP, unlock Skill Branches, and
              acquire Relics in the Armory — all while proving mastery under pressure.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-500">
                <Link href="/play">Enter the Quest Arena</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Forge Avatar</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Enter the Gate</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {realmStats.map((stat) => (
                <Card key={stat.label} className="bg-background/70">
                  <CardHeader className="py-4">
                    <CardDescription>{stat.label}</CardDescription>
                    <CardTitle className="text-2xl">{stat.value}</CardTitle>
                    <CardDescription className="text-xs">{stat.detail}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-card/80 shadow-2xl">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Avatar</p>
              <CardDescription>Avatar mastery displays growth and prestige.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <Card className="bg-background/70">
                <CardHeader className="py-3">
                  <CardDescription>Base Vessel</CardDescription>
                  <CardTitle className="text-sm">Body • Skin • Hair • Eye Style</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-background/70">
                <CardHeader className="py-3">
                  <CardDescription>Prestige Layer</CardDescription>
                  <CardTitle className="text-sm">Relics bound per slot, no stat boosts</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-background/70">
                <CardHeader className="py-3">
                  <CardDescription>Gold Economy</CardDescription>
                  <CardTitle className="text-sm">Earned only through Quests and bosses</CardTitle>
                </CardHeader>
              </Card>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {highlights.map((highlight) => (
            <Card key={highlight.title} className="bg-card/80 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">{highlight.title}</CardTitle>
                <CardDescription>{highlight.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.55fr_1fr]">
          <Card className="bg-card/80 shadow-xl">
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                Quest Flow
              </Badge>
              <CardTitle className="text-2xl">Your ascent, step by step.</CardTitle>
              <CardDescription>
                No menus at the start. One Quest, one outcome, one climb.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Each Quest is either ACTIVE, COMPLETED, LOCKED, or SKIPPED.</p>
              <p>Complete a Quest to unlock the next. Skipped Quests return later.</p>
              <p>Rewards trigger instantly. No replay farming, ever.</p>
            </CardContent>
          </Card>
          <div className="grid gap-3">
            {journeySteps.map((step, index) => (
              <Card key={step.title} className="bg-background/70">
                <CardHeader className="py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Step {index + 1}
                  </p>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
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
                <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-500">
                  <Link href="/play">Enter the Quest Arena</Link>
                </Button>
                <Button asChild>
                  <Link href="/play">Chapter I: Quest Arena</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/skills">Chapter II: Skill Tree</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-3 text-sm">
              <Card className="bg-background/70">
                <CardHeader className="py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Chapter I
                  </p>
                  <CardTitle className="text-lg">Enter the Quest Arena</CardTitle>
                  <CardDescription>
                    Clear live encounters, earn Gold, and sharpen your combo streak.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-background/70">
                <CardHeader className="py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Chapter II
                  </p>
                  <CardTitle className="text-lg">Bind Skills</CardTitle>
                  <CardDescription>
                    Spend Skill Points in the Skill Tree to shape your build.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-background/70">
                <CardHeader className="py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Chapter III
                  </p>
                  <CardTitle className="text-lg">Claim Relics</CardTitle>
                  <CardDescription>
                    Visit the Armory to acquire cosmetics and show your victories.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <Card className="bg-card/80 p-8 shadow-xl">
          <CardContent className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <CardTitle className="text-2xl">Armory-ready Relic slots</CardTitle>
              <CardDescription>
                Bind one Relic per slot. Sealed Relics reveal their unlock conditions upfront so
                Players always know the next milestone.
              </CardDescription>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
              {relicSlots.map((slot) => (
                <Badge key={slot} variant="outline" className="justify-center">
                  {slot}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
