"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useServerHealth, type DrainModifier } from "@/lib/server-health";
import type { ExecutionApiResponse, ExecutionTestCase } from "@/lib/execution/types";

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

const stripJsExports = (source: string) =>
  source.replace(/\bexport\s+(?=(function|const|let|class)\b)/g, "");

type LogEntry = {
  id: number;
  message: string;
  tone: "neutral" | "success" | "danger";
};

const demoQuestRunners: Record<
  string,
  {
    tests: ExecutionTestCase[];
    submitTests?: ExecutionTestCase[];
    buildCode: (code: string) => string;
  }
> = {
  "null-check": {
    tests: [{ id: "t1", input: '{"name":"aria"}', expectedOutput: "ARIA" }],
    submitTests: [
      { id: "t1", input: '{"name":"aria"}', expectedOutput: "ARIA" },
      { id: "t2", input: '{"name":"luna"}', expectedOutput: "LUNA", hidden: true },
    ],
    buildCode: (code: string) =>
      `${code}\nconst fs = require("fs");\nconst input = fs.readFileSync(0, "utf8").trim();\nconst payload = input ? JSON.parse(input) : {};\nconst result = getName(payload);\nconsole.log(result);\n`,
  },
  "py-loop": {
    tests: [{ id: "t1", input: "[1,2,3]", expectedOutput: "6" }],
    submitTests: [
      { id: "t1", input: "[1,2,3]", expectedOutput: "6" },
      { id: "t2", input: "[10,5]", expectedOutput: "15", hidden: true },
    ],
    buildCode: (code: string) =>
      `${code}\nimport sys, json\nraw = sys.stdin.read()\npayload = json.loads(raw) if raw else []\nprint(sum_numbers(payload))\n`,
  },
  "js-guard": {
    tests: [{ id: "t1", input: '{"rank":4}', expectedOutput: "true" }],
    submitTests: [
      { id: "t1", input: '{"rank":4}', expectedOutput: "true" },
      { id: "t2", input: '{"rank":2}', expectedOutput: "false", hidden: true },
    ],
    buildCode: (code: string) =>
      `${code}\nconst fs = require("fs");\nconst input = fs.readFileSync(0, "utf8").trim();\nconst payload = input ? JSON.parse(input) : {};\nconst result = canEnterGate(payload);\nconsole.log(result ? "true" : "false");\n`,
  },
};

export default function DemoGameplay() {
  const [questId, setQuestId] = useState(demoQuests[0].id);
  const quest = useMemo(() => demoQuests.find((item) => item.id === questId)!, [questId]);
  const [code, setCode] = useState(demoQuests[0].starterCode);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, message: "Quest chamber sealed. Awaiting Player action.", tone: "neutral" },
  ]);
  const logCounter = useRef(1);

  const [bytes, setBytes] = useState(40);
  const [skippedQuestIds, setSkippedQuestIds] = useState<string[]>([]);
  const skipCost = 15;

  const [isRunning, setIsRunning] = useState(false);

  const drainModifiers = useMemo<DrainModifier[]>(
    () => [
      {
        id: "focus-flow",
        label: "Focus Flow",
        multiplier: 0.9,
        reason: "Passive focus aura",
      },
    ],
    [],
  );

  const appendLog = useCallback((message: string, tone: LogEntry["tone"] = "neutral") => {
    logCounter.current += 1;
    const id = logCounter.current;
    setLogs((current) => [{ id, message, tone }, ...current].slice(0, 8));
  }, []);

  const { health, status, crashed, resetHealth, applyDamage } = useServerHealth({
    baseDrain: quest.serverHealthDrainRate,
    modifiers: drainModifiers,
    onCrash: () => appendLog("The system destabilized. Core crashed.", "danger"),
  });

  const resetQuestState = (nextQuestId: string) => {
    const nextQuest = demoQuests.find((item) => item.id === nextQuestId);
    if (!nextQuest) return;
    setQuestId(nextQuestId);
    setCode(nextQuest.starterCode);
    setLogs([{ id: 1, message: "Quest chamber sealed. Awaiting Player action.", tone: "neutral" }]);
    resetHealth();
  };

  const handleSkip = () => {
    if (crashed || isRunning) return;
    if (bytes < skipCost) {
      appendLog("Not enough Bytes to bend fate.", "danger");
      return;
    }

    const currentIndex = demoQuests.findIndex((item) => item.id === questId);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % demoQuests.length;
    const nextQuest = demoQuests[nextIndex];

    setBytes((prev) => prev - skipCost);
    setSkippedQuestIds((prev) => (prev.includes(questId) ? prev : [...prev, questId]));
    appendLog("Fate bent. Quest skipped; the seal remains.", "neutral");
    resetQuestState(nextQuest.id);
  };

  const statusLabel =
    status === "crashed"
      ? "Crashed"
      : status === "critical"
        ? "Critical"
        : status === "warning"
          ? "Warning"
          : "Stable";

  const handleRun = async () => {
    if (crashed || isRunning) return;
    setIsRunning(true);
    appendLog("Channeling runes...", "neutral");

    await new Promise((resolve) => setTimeout(resolve, 800));
    const hint = logSeeds[Math.floor(Math.random() * logSeeds.length)];
    appendLog(hint, "neutral");

    const runner = demoQuestRunners[quest.id as keyof typeof demoQuestRunners];
    if (!runner) {
      appendLog("No trial script bound for this quest.", "danger");
      setIsRunning(false);
      return;
    }

    const preparedCode = quest.language === "javascript" ? stripJsExports(code) : code;

    try {
      const response = await fetch("/api/elysia/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: quest.language,
          code: runner.buildCode(preparedCode),
          tests: runner.tests,
          timeoutMs: 2000,
        }),
      });
      const payload = (await response.json()) as ExecutionApiResponse;

      if (!response.ok || payload.error || !payload.data) {
        appendLog(payload.error?.message ?? "The system destabilized.", "danger");
        applyDamage(10);
        setIsRunning(false);
        return;
      }

      const { status: runStatus, tests, stderr } = payload.data;
      const passedCount = tests.filter((test) => test.passed).length;
      appendLog(
        `Trials cleared: ${passedCount}/${tests.length}.`,
        passedCount === tests.length ? "success" : "danger",
      );

      if (runStatus === "passed") {
        appendLog("Critical Hit! Output stabilized.", "success");
      } else if (runStatus === "failed") {
        appendLog("You took damage. Some trials faltered.", "danger");
        applyDamage(8);
      } else if (runStatus === "compile_error") {
        appendLog("You took damage. Compile runes shattered.", "danger");
        if (stderr) appendLog("Rune feedback recorded.", "neutral");
        applyDamage(12);
      } else if (runStatus === "runtime_error") {
        appendLog("You took damage. The spell backfired.", "danger");
        applyDamage(12);
      } else if (runStatus === "timeout") {
        appendLog("You took damage. The ritual timed out.", "danger");
        applyDamage(15);
      } else {
        appendLog("The system destabilized.", "danger");
        applyDamage(10);
      }
    } catch {
      appendLog("The system destabilized.", "danger");
      applyDamage(10);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (crashed || isRunning) return;
    setIsRunning(true);
    appendLog("Submitting fix to the Tribunal...", "neutral");

    const runner = demoQuestRunners[quest.id as keyof typeof demoQuestRunners];
    if (!runner) {
      appendLog("No trial script bound for this quest.", "danger");
      setIsRunning(false);
      return;
    }

    const preparedCode = quest.language === "javascript" ? stripJsExports(code) : code;

    try {
      const response = await fetch("/api/elysia/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: quest.language,
          code: runner.buildCode(preparedCode),
          tests: runner.submitTests ?? runner.tests,
          timeoutMs: 2000,
        }),
      });
      const payload = (await response.json()) as ExecutionApiResponse;

      if (!response.ok || payload.error || !payload.data) {
        appendLog(payload.error?.message ?? "The system destabilized.", "danger");
        applyDamage(12);
        setIsRunning(false);
        return;
      }

      const { status: runStatus, tests } = payload.data;
      const passedCount = tests.filter((test) => test.passed).length;
      appendLog(
        `Trials cleared: ${passedCount}/${tests.length}.`,
        passedCount === tests.length ? "success" : "danger",
      );

      if (runStatus === "passed") {
        appendLog("Quest Cleared! Rewards stored in the Armory.", "success");
      } else {
        appendLog("You took damage. The Tribunal demands more precision.", "danger");
        applyDamage(15);
      }
    } catch {
      appendLog("The system destabilized.", "danger");
      applyDamage(12);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStabilize = () => {
    resetHealth();
    appendLog("Stability restored. Core rebooted.", "success");
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
              Stability: {statusLabel}
            </span>
            <div className="h-2 w-48 overflow-hidden rounded-full border border-border bg-background">
              <div
                className={`h-full transition-all ${
                  status === "critical"
                    ? "bg-destructive"
                    : status === "warning"
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
                  {skippedQuestIds.includes(item.id) ? " (Skipped)" : ""}
                </option>
              ))}
            </select>
          </label>
          <div className="rounded-md border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground">
            Bytes: <span className="font-semibold text-foreground">{bytes}</span>
          </div>
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
          {crashed ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/70 text-center">
              <p className="text-lg font-semibold text-destructive">SERVER CRASHED</p>
              <p className="text-xs text-muted-foreground">Recover in the next run, Player.</p>
              <button
                type="button"
                onClick={handleStabilize}
                className="rounded-md border border-destructive/40 bg-destructive/20 px-3 py-1 text-xs font-semibold text-destructive transition hover:bg-destructive/30"
              >
                Reboot Core
              </button>
            </div>
          ) : null}
          <Editor
            height="420px"
            language={quest.language}
            value={code}
            onChange={(value) => {
              setCode(value ?? "");
            }}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              readOnly: crashed,
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || crashed}
            className="rounded-lg border border-border bg-card/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRunning ? "Channeling..." : "Run"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isRunning || crashed}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleSkip}
            disabled={isRunning || crashed || bytes < skipCost}
            className="rounded-lg border border-amber-400/60 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Skip Quest ({skipCost} Bytes)
          </button>
          <button
            type="button"
            onClick={handleStabilize}
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
            onClick={() => {
              logCounter.current += 1;
              setLogs([{ id: logCounter.current, message: "Logs reset.", tone: "neutral" }]);
            }}
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
