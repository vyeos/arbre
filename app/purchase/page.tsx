import Link from "next/link";

const perks = [
  "Full Quest Vault access",
  "Ranked quest rewards and XP",
  "Armory progression and Relic binding",
  "Skill Branch unlocks",
];

export default function PurchasePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-card to-background text-foreground">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Relic Paywall</p>
          <h1 className="text-4xl font-semibold">Unlock the Full Realm</h1>
          <p className="text-sm text-muted-foreground">
            The demo is free. Bind the Relic to access every Quest, the Armory, and your permanent
            progression.
          </p>
        </header>

        <section className="mx-auto w-full max-w-3xl rounded-3xl border border-border bg-card/80 p-8 shadow-2xl">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Founder Relic</h2>
            <p className="text-sm text-muted-foreground">
              A one-time binding to unlock all current and future Quest arcs.
            </p>
            <ul className="grid gap-3 text-sm text-muted-foreground">
              {perks.map((perk) => (
                <li
                  key={perk}
                  className="rounded-lg border border-border bg-background/70 px-4 py-3"
                >
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Essence Cost
              </p>
              <p className="text-3xl font-semibold">$49</p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                Acquire Relic
              </button>
              <Link
                href="/demo"
                className="rounded-lg border border-border bg-card/70 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-card"
              >
                Return to Demo
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
