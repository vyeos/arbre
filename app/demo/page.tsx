import DemoGameplay from "@/app/(play)/_components/demo-gameplay";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-card to-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Demo Arena</p>
          <h1 className="text-3xl font-semibold">Train with a Quest Encounter</h1>
          <p className="text-sm text-muted-foreground">
            Logged-out Players can practice here. Earn no XP, but learn the flow before stepping
            into ranked Quests.
          </p>
        </header>

        <DemoGameplay />
      </main>
    </div>
  );
}
