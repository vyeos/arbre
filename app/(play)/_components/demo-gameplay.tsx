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

type QuestState = "ACTIVE" | "COMPLETED" | "LOCKED" | "SKIPPED";

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
  const questOrder = useMemo(() => demoQuests.map((item) => item.id), []);
  const [questId, setQuestId] = useState(demoQuests[0].id);
  const quest = useMemo(() => demoQuests.find((item) => item.id === questId)!, [questId]);
  const [code, setCode] = useState(demoQuests[0].starterCode);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, message: "Quest chamber sealed. Awaiting Player action.", tone: "neutral" },
  ]);
  const logCounter = useRef(1);

  const [bytes, setBytes] = useState(0);
  const [focus, setFocus] = useState(0);
  const [commits, setCommits] = useState(0);
  const [gold, setGold] = useState(0);
  const [questStates, setQuestStates] = useState<Record<string, QuestState>>(() => {
    const initial: Record<string, QuestState> = {};
    demoQuests.forEach((item, index) => {
      initial[item.id] = index === 0 ? "ACTIVE" : "LOCKED";
    });
    return initial;
  });
  const [skipQueue, setSkipQueue] = useState<string[]>([]);
  const [finalCodeByQuest, setFinalCodeByQuest] = useState<Record<string, string>>({});
  const skipCost = 15;
  const skillGateCost = 10;
  const [demoSkillPurchased, setDemoSkillPurchased] = useState(false);
  const [skillGateActive, setSkillGateActive] = useState(false);
  const [armoryIntroActive, setArmoryIntroActive] = useState(false);
  const [rewardBanner, setRewardBanner] = useState<{
    bytes: number;
    focus: number;
    commits: number;
    gold: number;
  } | null>(null);

  const onboardingSteps = [
    {
      title: "The Editor",
      body: "This is your forge. Edit the runes to repair the quest code.",
    },
    {
      title: "The Bug",
      body: "The script is cursed. Find the error and restore the logic.",
    },
    {
      title: "Server Health",
      body: "Stability drains over time. Act before the core collapses.",
    },
    {
      title: "Victory or Crash",
      body: "Fix the code to clear the quest. Fail, and the server crashes.",
    },
  ];
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingSeen, setOnboardingSeen] = useState(false);

  const [isRunning, setIsRunning] = useState(false);

  const drainModifiers = useMemo<DrainModifier[]>(() => {
    if (!demoSkillPurchased) return [];
    return [
      {
        id: "focus-flow",
        label: "Focus Flow",
        multiplier: 0.85,
        reason: "Passive focus aura",
      },
    ];
  }, [demoSkillPurchased]);

  const appendLog = useCallback((message: string, tone: LogEntry["tone"] = "neutral") => {
    logCounter.current += 1;
    const id = logCounter.current;
    setLogs((current) => [{ id, message, tone }, ...current].slice(0, 8));
  }, []);

  const questState = questStates[questId] ?? "LOCKED";
  const onboardingActive = questId === demoQuests[0].id && !onboardingSeen;
  const dialogActive = onboardingActive && onboardingStep < onboardingSteps.length;
  const isPlayable = questState === "ACTIVE" && !dialogActive && !skillGateActive;
  const isReadOnly = questState === "COMPLETED";

  const { health, status, crashed, resetHealth, applyDamage } = useServerHealth({
    baseDrain: isPlayable ? quest.serverHealthDrainRate : 0,
    modifiers: drainModifiers,
    onCrash: () => appendLog("The system destabilized. Core crashed.", "danger"),
  });

  const resetQuestState = (nextQuestId: string) => {
    const nextQuest = demoQuests.find((item) => item.id === nextQuestId);
    if (!nextQuest) return;
    const nextState = questStates[nextQuestId] ?? "LOCKED";
    if (nextState === "LOCKED" || nextState === "SKIPPED") return;
    setQuestId(nextQuestId);
    const finalCode = finalCodeByQuest[nextQuestId];
    setCode(finalCode ?? nextQuest.starterCode);
    setLogs([{ id: 1, message: "Quest chamber sealed. Awaiting Player action.", tone: "neutral" }]);
    resetHealth();
  };

  const showRewards = (reward: { bytes: number; focus: number; commits: number; gold: number }) => {
    setRewardBanner(reward);
    window.setTimeout(() => setRewardBanner(null), 2200);
  };

  const getNextQuestId = (currentId: string) => {
    const index = questOrder.indexOf(currentId);
    if (index === -1) return null;
    return questOrder[index + 1] ?? null;
  };

  const unlockAfterSuccess = (currentId: string) => {
    const nextSkipped = skipQueue[0];
    if (nextSkipped) {
      setSkipQueue((prev) => prev.slice(1));
    }

    setQuestStates((prev) => {
      const updated = { ...prev, [currentId]: "COMPLETED" as QuestState };

      if (nextSkipped) {
        Object.keys(updated).forEach((id) => {
          if (updated[id] === "ACTIVE") updated[id] = "LOCKED";
        });
        updated[nextSkipped] = "ACTIVE";
        return updated;
      }

      const nextId = getNextQuestId(currentId);
      if (nextId && updated[nextId] === "LOCKED") {
        updated[nextId] = "ACTIVE";
      }
      return updated;
    });
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
    if (crashed || isRunning || !isPlayable) return;
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
    if (crashed || isRunning || !isPlayable) return;
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
        const questIndex = questOrder.indexOf(questId);
        const reward = {
          bytes: 12 + questIndex * 4,
          focus: 4 + questIndex * 2,
          commits: 3 + questIndex,
          gold: questIndex >= 2 ? 5 : 0,
        };
        setBytes((prev) => prev + reward.bytes);
        setFocus((prev) => prev + reward.focus);
        setCommits((prev) => prev + reward.commits);
        setGold((prev) => prev + reward.gold);
        showRewards(reward);
        setFinalCodeByQuest((prev) => ({ ...prev, [questId]: code }));

        if (questId === demoQuests[0].id && !demoSkillPurchased) {
          setSkillGateActive(true);
        } else {
          unlockAfterSuccess(questId);
        }

        if (reward.gold > 0 && gold === 0) {
          setArmoryIntroActive(true);
        }
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

  const handleSkip = () => {
    if (crashed || isRunning || !isPlayable) return;
    if (bytes < skipCost) {
      appendLog("Not enough Bytes to bend fate.", "danger");
      return;
    }

    const nextId = getNextQuestId(questId);
    if (!nextId) return;

    setBytes((prev) => prev - skipCost);
    setQuestStates((prev) => ({
      ...prev,
      [questId]: "SKIPPED",
      [nextId]: prev[nextId] === "LOCKED" ? "ACTIVE" : prev[nextId],
    }));
    setSkipQueue((prev) => (prev.includes(questId) ? prev : [...prev, questId]));
    appendLog("Fate bent. Quest skipped; the seal remains.", "neutral");
    resetQuestState(nextId);
  };

  const handleSkillGatePurchase = () => {
    if (bytes < skillGateCost) {
      appendLog("Not enough Bytes to bind your first Skill.", "danger");
      return;
    }
    setBytes((prev) => prev - skillGateCost);
    setDemoSkillPurchased(true);
    setSkillGateActive(false);
    unlockAfterSuccess(demoQuests[0].id);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="relative rounded-2xl border border-border bg-card/80 p-6 shadow-xl">
        {dialogActive ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-6">
            <div className="max-w-md rounded-2xl border border-border bg-background/95 p-6 text-sm text-foreground shadow-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                First Quest Briefing
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                {onboardingSteps[onboardingStep]?.title}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {onboardingSteps[onboardingStep]?.body}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Step {onboardingStep + 1} / {onboardingSteps.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextStep = onboardingStep + 1;
                    if (nextStep >= onboardingSteps.length) {
                      setOnboardingSeen(true);
                      setOnboardingStep(0);
                    } else {
                      setOnboardingStep(nextStep);
                    }
                  }}
                  className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  {onboardingStep + 1 >= onboardingSteps.length ? "Enter the Quest" : "Next"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {skillGateActive ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-6">
            <div className="max-w-md rounded-2xl border border-border bg-background/95 p-6 text-sm text-foreground shadow-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Skill Tree Unlocked
              </p>
              <h2 className="mt-2 text-xl font-semibold">Bind Your First Skill</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Skills reshape your power. Spend Bytes to bind a Skill and open the next Quest.
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Cost: {skillGateCost} Bytes</span>
                <button
                  type="button"
                  onClick={handleSkillGatePurchase}
                  disabled={bytes < skillGateCost}
                  className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Bind Skill
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {armoryIntroActive ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-6">
            <div className="max-w-md rounded-2xl border border-border bg-background/95 p-6 text-sm text-foreground shadow-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Armory Unsealed
              </p>
              <h2 className="mt-2 text-xl font-semibold">Cosmetic Relics Awakened</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                You earned Gold. The Armory now offers purely cosmetic relics — style, no power.
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setArmoryIntroActive(false)}
                  className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Enter the Armory
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {rewardBanner ? (
          <div className="absolute inset-x-6 top-6 z-10 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200 shadow-lg">
            <span className="font-semibold">Quest Rewards:</span> +{rewardBanner.bytes} Bytes, +
            {rewardBanner.focus} Focus, +{rewardBanner.commits} Commits
            {rewardBanner.gold ? `, +${rewardBanner.gold} Gold` : ""}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Demo Quest</p>
            <h1 className="text-2xl font-semibold text-foreground">{quest.title}</h1>
            <p className="text-sm text-muted-foreground">{quest.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {isReadOnly ? "Review Mode" : `Stability: ${statusLabel}`}
            </span>
            {isReadOnly ? null : (
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
            )}
          </div>
        </div>

        {!dialogActive ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <label className="flex items-center gap-2">
              Quest
              <select
                value={questId}
                onChange={(event) => resetQuestState(event.target.value)}
                className="rounded-md border border-border bg-background/70 px-2 py-1 text-xs text-foreground"
              >
                {demoQuests.map((item) => {
                  const state = questStates[item.id] ?? "LOCKED";
                  const labelSuffix =
                    state === "COMPLETED"
                      ? " (Completed)"
                      : state === "SKIPPED"
                        ? " (Skipped)"
                        : state === "LOCKED"
                          ? " (Locked)"
                          : "";
                  return (
                    <option
                      key={item.id}
                      value={item.id}
                      disabled={state === "LOCKED" || state === "SKIPPED"}
                    >
                      {item.title}
                      {labelSuffix}
                    </option>
                  );
                })}
              </select>
            </label>
            <div className="rounded-md border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground">
              Bytes: <span className="font-semibold text-foreground">{bytes}</span>
            </div>
            <div className="rounded-md border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground">
              Focus: <span className="font-semibold text-foreground">{focus}</span>
            </div>
            <div className="rounded-md border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground">
              Commits: <span className="font-semibold text-foreground">{commits}</span>
            </div>
            <div className="rounded-md border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground">
              Gold: <span className="font-semibold text-amber-300">{gold}</span>
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
        ) : null}

        <div className="relative mt-4 overflow-hidden rounded-2xl border border-border">
          {crashed && isPlayable ? (
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
              readOnly: crashed || isReadOnly || dialogActive || skillGateActive,
            }}
          />
        </div>

        {isReadOnly ? (
          <div className="mt-3 rounded-xl border border-border bg-background/70 px-4 py-3 text-xs text-muted-foreground">
            This quest has already been resolved. You may review it, but not modify it.
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || crashed || !isPlayable}
            className="rounded-lg border border-border bg-card/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRunning ? "Channeling..." : "Run"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isRunning || crashed || !isPlayable}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleSkip}
            disabled={isRunning || crashed || !isPlayable || bytes < skipCost}
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
