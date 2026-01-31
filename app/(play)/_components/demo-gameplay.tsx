"use client";

import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";

const demoQuests = [
  {
    id: "null-check",
    title: "Null Check Warmup",
    description: "Patch a runtime crash caused by missing null safety.",
    language: "typescript",
    starterCode:
      "export function getName(user: { name?: string }) {\n  return user.name.toUpperCase();\n}\n",
    codexLink: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
    serverHealthDrainRate: 1,
  },
  {
    id: "py-loop",
    title: "Loop Rune Repair",
    description: "Restore the loop to return the correct total.",
    language: "python",
    starterCode:
      "def sum_numbers(items):\n    total = 0\n    for value in items:\n        total += value\n    return total\n",
    codexLink: "https://docs.python.org/3/tutorial/controlflow.html",
    serverHealthDrainRate: 1,
  },
  {
    id: "js-guard",
    title: "Guard the Gate",
    description: "Fix a logic bug before it breaks the spell.",
    language: "javascript",
    starterCode:
      "export function canEnterGate(player) {\n  if (player.rank > 3) {\n    return true;\n  }\n  return false;\n}\n",
    codexLink:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else",
    serverHealthDrainRate: 1,
  },
];

const logSeeds = [
  "Initializing encounter shards...",
  "Binding quest constraints...",
  "Verifying rune output...",
  "Reconciling codex guidance...",
  "Stability field fluctuating...",
];

type LogEntry = {
  id: number;
  message: string;
  tone: "neutral" | "success" | "danger";
};

export default function DemoGameplay() {
  const [questId, setQuestId] = useState(demoQuests[0].id);
  const quest = useMemo(() => demoQuests.find((item) => item.id === questId)!, [questId]);
  const [code, setCode] = useState(demoQuests[0].starterCode);
  const [health, setHealth] = useState(100);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, message: "Quest chamber sealed. Awaiting Player action.", tone: "neutral" },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [edits, setEdits] = useState(0);

  const resetQuestState = (nextQuestId: string) => {
    const nextQuest = demoQuests.find((item) => item.id === nextQuestId);
    if (!nextQuest) return;
    setQuestId(nextQuestId);
    setCode(nextQuest.starterCode);
    setLogs([{ id: 1, message: "Quest chamber sealed. Awaiting Player action.", tone: "neutral" }]);
    setHealth(100);
    setEdits(0);
  };

  useEffect(() => {
    const drain = quest.serverHealthDrainRate;
    const interval = setInterval(() => {
      setHealth((current) => {
        if (current <= 0) return current;
        return Math.max(0, current - drain);
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [quest.serverHealthDrainRate]);

  const status =
    health <= 0 ? "Crashed" : health <= 35 ? "Critical" : health <= 65 ? "Warning" : "Stable";

  const appendLog = (message: string, tone: LogEntry["tone"] = "neutral") => {
    setLogs((current) => [{ id: Date.now(), message, tone }, ...current].slice(0, 8));
  };

  const handleRun = async () => {
    if (health <= 0 || isRunning) return;
    setIsRunning(true);
    appendLog("Channeling runes...", "neutral");

    await new Promise((resolve) => setTimeout(resolve, 800));
    const hint = logSeeds[Math.floor(Math.random() * logSeeds.length)];
    appendLog(hint, "neutral");

    if (code.includes("TODO") || code === quest.starterCode) {
      appendLog("You took damage. Patch the flaw to stabilize.", "danger");
      setHealth((current) => Math.max(0, current - 12));
    } else {
      appendLog("Critical Hit! Output stabilized.", "success");
    }

    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (health <= 0 || isRunning) return;
    setIsRunning(true);
    appendLog("Submitting fix to the Tribunal...", "neutral");
    await new Promise((resolve) => setTimeout(resolve, 900));
    appendLog("Quest Cleared! Rewards stored in the Armory.", "success");
    setIsRunning(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-2xl border border-border bg-card/80 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Demo Quest</p>
            <h1 className="text-2xl font-semibold text-foreground">{quest.title}</h1>
            <p className="text-sm text-muted-foreground">{quest.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Stability: {status}
            </span>
            <div className="h-2 w-48 overflow-hidden rounded-full border border-border bg-background">
              <div
                className={`h-full transition-all ${
                  status === "Critical"
                    ? "bg-destructive"
                    : status === "Warning"
                      ? "bg-amber-400"
                      : "bg-primary"
                }`}
                style={{ width: `${health}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <label className="flex items-center gap-2">
            Quest
            <select
              value={questId}
              onChange={(event) => resetQuestState(event.target.value)}
              className="rounded-md border border-border bg-background/70 px-2 py-1 text-xs text-foreground"
            >
              {demoQuests.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <span>Edits used: {edits}</span>
          <a
            href={quest.codexLink}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:text-primary/80"
          >
            Open Codex Link
          </a>
        </div>

        <div className="relative mt-4 overflow-hidden rounded-2xl border border-border">
          {health <= 0 ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/70 text-center">
              <p className="text-lg font-semibold text-destructive">SERVER CRASHED</p>
              <p className="text-xs text-muted-foreground">Recover in the next run, Player.</p>
            </div>
          ) : null}
          <Editor
            height="420px"
            language={quest.language}
            value={code}
            onChange={(value) => {
              setCode(value ?? "");
              setEdits((count) => count + 1);
            }}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              readOnly: health <= 0,
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || health <= 0}
            className="rounded-lg border border-border bg-card/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRunning ? "Channeling..." : "Run"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isRunning || health <= 0}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={() => setHealth(100)}
            className="rounded-lg border border-border bg-background/70 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            Stabilize (Demo)
          </button>
        </div>
      </section>

      <aside className="rounded-2xl border border-border bg-card/80 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Encounter Logs</h2>
          <button
            type="button"
            onClick={() => setLogs([{ id: Date.now(), message: "Logs reset.", tone: "neutral" }])}
            className="text-xs text-muted-foreground transition hover:text-foreground"
          >
            Clear
          </button>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`rounded-lg border px-3 py-2 text-xs ${
                log.tone === "success"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : log.tone === "danger"
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-border bg-background/70 text-muted-foreground"
              }`}
            >
              {log.message}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
