import { skillCatalog } from "@/lib/skills/catalog";

const formatCost = (costs: number[]) =>
  costs.map((cost, index) => `Tier ${index + 1}: ${cost}`).join(" • ");

export default function SkillsPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background via-card to-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Skill Branches</p>
          <h1 className="text-3xl font-semibold">Study the Codex of Skills</h1>
          <p className="text-sm text-muted-foreground">
            Each Skill Branch upgrades your battlefield instincts. Bind Skill Points to unlock
            passive effects and sharpen your Quest runs.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {skillCatalog.map((skill) => (
            <div
              key={skill.id}
              className="rounded-2xl border border-border bg-card/80 p-5 shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {skill.branch} • Max Tier {skill.maxTier}
                  </p>
                  <h2 className="text-lg font-semibold text-foreground">{skill.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{skill.description}</p>
                </div>
                <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                  {skill.isPassive ? "Passive" : "Active"}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-semibold text-foreground">Costs:</span>{" "}
                  {formatCost(skill.costs)}
                </div>
                {skill.prerequisites?.length ? (
                  <div>
                    <span className="font-semibold text-foreground">Prerequisites:</span>{" "}
                    {skill.prerequisites
                      .map((req) => `Skill ${req.id} (Tier ${req.tier})`)
                      .join(", ")}
                  </div>
                ) : null}
                <div>
                  <span className="font-semibold text-foreground">Effects:</span>{" "}
                  {skill.effects
                    .map((effect) => {
                      const mode = effect.mode === "multiply" ? "x" : "+";
                      const value = effect.perTier ? `${effect.value} per tier` : `${effect.value}`;
                      return `${effect.type} ${mode}${value}`;
                    })
                    .join(" • ")}
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
