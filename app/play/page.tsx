import QuestGameplay from "@/app/(play)/_components/quest-gameplay";
import { Badge } from "@/components/ui/badge";

export default function PlayPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-card to-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <Badge className="w-fit text-xs uppercase tracking-[0.3em]">Quest Arena</Badge>
          <h1 className="text-3xl font-semibold">Enter the Live Quest Arena</h1>
          <p className="text-sm text-muted-foreground">
            Face live encounters, earn resources, and unlock the next sealed Quest.
          </p>
        </header>

        <QuestGameplay />
      </main>
    </div>
  );
}
