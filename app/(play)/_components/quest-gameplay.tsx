"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useServerHealth, type DrainModifier } from "@/lib/server-health";
import type {
  ExecutionApiResponse,
  ExecutionLanguage,
  ExecutionTestCase,
} from "@/lib/execution/types";

type QuestSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  language: string;
  bugTier: string;
  codexLink: string | null;
  createdAt: string;
};

type QuestDetail = QuestSummary & {
  starterCode: string;
  constraints: Record<string, unknown>;
  rewards: Record<string, unknown>;
  serverHealthDrainRate: number;
};

type QuestState = "ACTIVE" | "COMPLETED" | "LOCKED" | "SKIPPED";

type QuestStateEntry = {
  challengeId: string;
  status: QuestState;
  finalCode?: string | null;
};

type QuestStateResponse = {
  activeChallengeId: string | null;
  states: QuestStateEntry[];
};

type Wallet = {
  bytes: number;
  focus: number;
  commits: number;
  gold: number;
};

type ApiResponse<T> = {
  data: T | null;
  error: { code: string; message: string } | null;
};

const stripJsExports = (source: string) =>
  source.replace(/\bexport\s+(?=(function|const|let|class)\b)/g, "");

const normalizeLanguage = (language: string): ExecutionLanguage => {
  const key = language.toLowerCase();
  if (key === "ts" || key === "typescript") return "typescript";
  if (key === "js" || key === "javascript") return "javascript";
  if (key === "py" || key === "python") return "python";
  if (key === "cpp" || key === "c++") return "cpp";
  if (key === "c") return "c";
  if (key === "java") return "java";
  if (key === "go") return "go";
  return "typescript";
};

const questRunners: Record<
  string,
  {
    tests: ExecutionTestCase[];
    submitTests?: ExecutionTestCase[];
    buildCode: (code: string) => string;
  }
> = {
  "warmup-null-check": {
    tests: [{ id: "t1", input: '{"name":"aria"}', expectedOutput: "ARIA" }],
    submitTests: [
      { id: "t1", input: '{"name":"aria"}', expectedOutput: "ARIA" },
      { id: "t2", input: '{"name":"luna"}', expectedOutput: "LUNA", hidden: true },
    ],
    buildCode: (code: string) =>
      `${code}\nconst fs = require("fs");\nconst input = fs.readFileSync(0, "utf8").trim();\nconst payload = input ? JSON.parse(input) : {};\nconst result = getName(payload);\nconsole.log(result);\n`,
  },
};

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

const emptyWallet: Wallet = { bytes: 0, focus: 0, commits: 0, gold: 0 };

export default function QuestGameplay() {
  const [questList, setQuestList] = useState<QuestSummary[]>([]);
  const [questSlug, setQuestSlug] = useState<string | null>(null);
  const [questDetail, setQuestDetail] = useState<QuestDetail | null>(null);
  const [questStates, setQuestStates] = useState<Record<string, QuestState>>({});
  const [finalCodeByQuest, setFinalCodeByQuest] = useState<Record<string, string>>({});
  const [wallet, setWallet] = useState<Wallet>(emptyWallet);
  const [authRequired, setAuthRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [code, setCode] = useState("");
  const [logs, setLogs] = useState<
    { id: number; message: string; tone: "neutral" | "success" | "danger" }[]
  >([{ id: 1, message: "Quest chamber sealed. Awaiting Player action.", tone: "neutral" }]);
  const logCounter = useRef(1);
  const [isRunning, setIsRunning] = useState(false);

  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingSeen, setOnboardingSeen] = useState(false);
  const [skillGateActive, setSkillGateActive] = useState(false);
  const [armoryIntroActive, setArmoryIntroActive] = useState(false);
  const [rewardBanner, setRewardBanner] = useState<{
    bytes: number;
    focus: number;
    commits: number;
    gold: number;
  } | null>(null);

  const skipCost = 15;

  const questId = questDetail?.id ?? null;
  const questState = questId ? (questStates[questId] ?? "LOCKED") : "LOCKED";

  const dialogActive = !onboardingSeen && questSlug === questList[0]?.slug;
  const isPlayable = questState === "ACTIVE" && !dialogActive && !skillGateActive;
  const isReadOnly = questState === "COMPLETED";

  const drainModifiers = useMemo<DrainModifier[]>(() => {
    if (!skillGateActive) return [];
    return [];
  }, [skillGateActive]);

  const { health, status, crashed, resetHealth, applyDamage } = useServerHealth({
    baseDrain: isPlayable && questDetail ? questDetail.serverHealthDrainRate : 0,
    modifiers: drainModifiers,
    onCrash: () => appendLog("The system destabilized. Core crashed.", "danger"),
  });

  const appendLog = useCallback(
    (message: string, tone: "neutral" | "success" | "danger" = "neutral") => {
      logCounter.current += 1;
      const id = logCounter.current;
      setLogs((current) => [{ id, message, tone }, ...current].slice(0, 8));
    },
    [],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem("quest-onboarding-seen");
    if (saved === "true") setOnboardingSeen(true);
  }, []);

  useEffect(() => {
    if (onboardingSeen) {
      window.localStorage.setItem("quest-onboarding-seen", "true");
    }
  }, [onboardingSeen]);

  const showRewards = (reward: Wallet) => {
    setRewardBanner(reward);
    window.setTimeout(() => setRewardBanner(null), 2200);
  };

  const loadWallet = async () => {
    try {
      const response = await fetch("/api/elysia/economy/wallet");
      if (!response.ok) return;
      const payload = (await response.json()) as ApiResponse<Wallet>;
      if (payload.data) setWallet(payload.data);
    } catch {
      // ignore
    }
  };

  const loadQuestState = async (list: QuestSummary[]) => {
    try {
      const response = await fetch("/api/elysia/quests/state");
      if (response.status === 401) {
        setAuthRequired(true);
        return;
      }
      const payload = (await response.json()) as ApiResponse<QuestStateResponse>;
      if (!payload.data) return;

      const nextStates: Record<string, QuestState> = {};
      const finalCodes: Record<string, string> = {};
      payload.data.states.forEach((entry) => {
        nextStates[entry.challengeId] = entry.status;
        if (entry.finalCode) finalCodes[entry.challengeId] = entry.finalCode;
      });

      setQuestStates(nextStates);
      setFinalCodeByQuest(finalCodes);

      const activeId = payload.data.activeChallengeId;
      const activeQuest = list.find((item) => item.id === activeId) ?? list[0];
      setQuestSlug(activeQuest?.slug ?? null);
    } catch {
      // ignore
    }
  };

  const loadSkillGate = useCallback(
    async (firstQuestId: string | null) => {
      if (!firstQuestId) return;
      const isFirstCompleted = questStates[firstQuestId] === "COMPLETED";
      if (!isFirstCompleted) {
        setSkillGateActive(false);
        return;
      }

      try {
        const response = await fetch("/api/elysia/skills/unlocks");
        if (!response.ok) return;
        const payload = (await response.json()) as ApiResponse<{
          unlocks: { id: string; tier: number }[];
        }>;
        const count = payload.data?.unlocks?.length ?? 0;
        setSkillGateActive(count === 0);
      } catch {
        // ignore
      }
    },
    [questStates],
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/elysia/challenges");
        const payload = (await response.json()) as ApiResponse<QuestSummary[]>;
        const list = payload.data ?? [];
        if (!mounted) return;
        setQuestList(list);
        await Promise.all([loadQuestState(list), loadWallet()]);
      } catch {
        // ignore
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const loadDetail = async () => {
      if (!questSlug) return;
      try {
        const response = await fetch(`/api/elysia/challenges/${questSlug}`);
        if (!response.ok) return;
        const payload = (await response.json()) as ApiResponse<QuestDetail>;
        if (!payload.data) return;
        setQuestDetail(payload.data);
        const completedCode = finalCodeByQuest[payload.data.id];
        setCode(completedCode ?? payload.data.starterCode);
        resetHealth();
      } catch {
        // ignore
      }
    };

    void loadDetail();
  }, [questSlug, finalCodeByQuest, resetHealth]);

  useEffect(() => {
    if (!questList.length) return;
    const firstQuestId = questList[0]?.id ?? null;
    void loadSkillGate(firstQuestId);
  }, [questList, loadSkillGate]);

  useEffect(() => {
    if (wallet.gold > 0) return;
    if (rewardBanner?.gold) setArmoryIntroActive(true);
  }, [rewardBanner, wallet.gold]);

  const handleQuestChange = (nextSlug: string) => {
    const target = questList.find((quest) => quest.slug === nextSlug);
    if (!target) return;
    const state = questStates[target.id] ?? "LOCKED";
    if (state === "LOCKED" || state === "SKIPPED") return;
    setQuestSlug(nextSlug);
    setLogs([{ id: 1, message: "Quest chamber sealed. Awaiting Player action.", tone: "neutral" }]);
  };

  const handleRun = async () => {
    if (crashed || isRunning || !isPlayable || !questDetail) return;
    setIsRunning(true);
    appendLog("Channeling runes...", "neutral");

    await new Promise((resolve) => setTimeout(resolve, 800));
    const runner = questRunners[questDetail.slug];
    if (!runner) {
      appendLog("No trial script bound for this quest.", "danger");
      setIsRunning(false);
      return;
    }

    const preparedCode =
      normalizeLanguage(questDetail.language) === "javascript" ||
      normalizeLanguage(questDetail.language) === "typescript"
        ? stripJsExports(code)
        : code;

    try {
      const response = await fetch("/api/elysia/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: normalizeLanguage(questDetail.language),
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
    if (crashed || isRunning || !isPlayable || !questDetail || !questId) return;
    setIsRunning(true);
    appendLog("Submitting fix to the Tribunal...", "neutral");

    const runner = questRunners[questDetail.slug];
    if (!runner) {
      appendLog("No trial script bound for this quest.", "danger");
      setIsRunning(false);
      return;
    }

    const preparedCode =
      normalizeLanguage(questDetail.language) === "javascript" ||
      normalizeLanguage(questDetail.language) === "typescript"
        ? stripJsExports(code)
        : code;

    try {
      const response = await fetch("/api/elysia/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: normalizeLanguage(questDetail.language),
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
        const completeResponse = await fetch("/api/elysia/quests/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeId: questId, finalCode: code }),
        });
        const completePayload = (await completeResponse.json()) as ApiResponse<{
          wallet: Wallet;
          reward: Wallet;
        }>;

        if (!completeResponse.ok || completePayload.error || !completePayload.data) {
          appendLog(completePayload.error?.message ?? "The system destabilized.", "danger");
          setIsRunning(false);
          return;
        }

        appendLog("Quest Cleared! Rewards stored in the Armory.", "success");
        setWallet(completePayload.data.wallet);
        showRewards(completePayload.data.reward);
        await loadQuestState(questList);
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

  const handleSkip = async () => {
    if (crashed || isRunning || !isPlayable || !questId) return;
    if (wallet.bytes < skipCost) {
      appendLog("Not enough Bytes to bend fate.", "danger");
      return;
    }

    try {
      const response = await fetch("/api/elysia/quests/skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: questId, cost: skipCost }),
      });
      const payload = (await response.json()) as ApiResponse<{
        wallet: Wallet;
      }>;

      if (!response.ok || payload.error || !payload.data) {
        appendLog(payload.error?.message ?? "The system destabilized.", "danger");
        return;
      }

      setWallet(payload.data.wallet);
      appendLog("Fate bent. Quest skipped; the seal remains.", "neutral");
      await loadQuestState(questList);
    } catch {
      appendLog("The system destabilized.", "danger");
    }
  };

  const handleStabilize = () => {
    resetHealth();
    appendLog("Stability restored. Core rebooted.", "success");
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card/80 p-6 text-sm text-muted-foreground">
        Summoning the Quest Arena...
      </div>
    );
  }

  if (authRequired) {
    return (
      <div className="rounded-2xl border border-border bg-card/80 p-6 text-sm text-muted-foreground">
        The gate is sealed.{" "}
        <Link href="/login" className="text-primary">
          Sign in
        </Link>{" "}
        to enter the live Quest Arena.
      </div>
    );
  }

  if (!questDetail) {
    return (
      <div className="rounded-2xl border border-border bg-card/80 p-6 text-sm text-muted-foreground">
        No quests are bound yet.
      </div>
    );
  }

  const statusLabel =
    status === "crashed"
      ? "Crashed"
      : status === "critical"
        ? "Critical"
        : status === "warning"
          ? "Warning"
          : "Stable";

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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOnboardingSeen(true);
                      setOnboardingStep(0);
                    }}
                    className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                  >
                    Skip Briefing
                  </button>
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
                Skills reshape your power. Bind a Skill to open the next Quest.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/skills"
                  className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Open Skill Tree
                </Link>
                <button
                  type="button"
                  onClick={() => loadSkillGate(questList[0]?.id ?? null)}
                  className="rounded-md border border-border bg-background/70 px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                >
                  I Bound a Skill
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
                <Link
                  href="/armory"
                  className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Enter the Armory
                </Link>
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
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Quest</p>
            <h1 className="text-2xl font-semibold text-foreground">{questDetail.title}</h1>
            <p className="text-sm text-muted-foreground">{questDetail.description}</p>
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
                value={questSlug ?? ""}
                onChange={(event) => handleQuestChange(event.target.value)}
                className="rounded-md border border-border bg-background/70 px-2 py-1 text-xs text-foreground"
              >
                {questList.map((item) => {
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
                      value={item.slug}
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
              Bytes: <span className="font-semibold text-foreground">{wallet.bytes}</span>
            </div>
            <div className="rounded-md border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground">
              Focus: <span className="font-semibold text-foreground">{wallet.focus}</span>
            </div>
            <div className="rounded-md border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground">
              Commits: <span className="font-semibold text-foreground">{wallet.commits}</span>
            </div>
            <div className="rounded-md border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground">
              Gold: <span className="font-semibold text-amber-300">{wallet.gold}</span>
            </div>
            {questDetail.codexLink ? (
              <a
                href={questDetail.codexLink}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:text-primary/80"
              >
                Open Codex Link
              </a>
            ) : null}
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
            language={normalizeLanguage(questDetail.language)}
            value={code}
            onChange={(value) => {
              setCode(value ?? "");
            }}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              readOnly: crashed || isReadOnly || skillGateActive,
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
            disabled={isRunning || crashed || !isPlayable || wallet.bytes < skipCost}
            className="rounded-lg border border-amber-400/60 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Skip Quest ({skipCost} Bytes)
          </button>
          <button
            type="button"
            onClick={handleStabilize}
            className="rounded-lg border border-border bg-background/70 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            Stabilize Core
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
