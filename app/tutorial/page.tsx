import Link from "next/link";

const steps = [
  {
    title: "Bind your Sigil",
    detail: "Your Character Vessel is ready. Start by forging your first login sigil.",
  },
  {
    title: "Enter a Quest",
    detail: "Pick a Quest encounter and study its Codex link for guidance.",
  },
  {
    title: "Patch the breach",
    detail: "Run the code, read the logs, and apply a clean fix to earn XP.",
  },
  {
    title: "Claim your rewards",
    detail: "Quest Cleared grants XP, Gold, and Skill Points for progression.",
  },
];

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-card to-background text-foreground">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-14">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tutorial Quest</p>
          <h1 className="text-3xl font-semibold">Learn the Realm in One Guided Quest</h1>
          <p className="text-sm text-muted-foreground">
            Follow the steps below to understand the flow before entering ranked encounters.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border bg-card/80 p-6 shadow-lg"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Step {index + 1}
              </p>
              <h2 className="mt-2 text-xl font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{step.detail}</p>
            </div>
          ))}
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/demo"
            className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Start Tutorial Quest
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-border bg-card/70 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-card"
          >
            Forge Character Vessel
          </Link>
        </div>
      </main>
    </div>
  );
}
