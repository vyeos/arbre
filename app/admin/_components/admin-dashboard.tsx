"use client";

import { useEffect, useState } from "react";

type ApiResponse<T> = {
  data: T | null;
  error: { code: string; message: string } | null;
};

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  createdAt: string;
};

type AdminChallenge = {
  id: string;
  slug: string;
  title: string;
  language: string;
  bugTier: string;
  createdAt: string;
};

type AdminSkill = {
  id: string;
  name: string;
  category: string;
  maxTier: number;
  isPassive: boolean;
  createdAt: string;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [skills, setSkills] = useState<AdminSkill[]>([]);
  const [challenges, setChallenges] = useState<AdminChallenge[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [questForm, setQuestForm] = useState({
    title: "",
    slug: "",
    language: "typescript",
    bugTier: "runtime",
    starterCode: "",
    description: "",
    codexLink: "",
    serverHealthDrainRate: "1",
    constraints: "{}",
    rewards: "{}",
  });
  const [skillForm, setSkillForm] = useState({
    name: "",
    category: "general",
    maxTier: "1",
    isPassive: true,
    effects: "{}",
  });

  const languageOptions = [
    { value: "typescript", label: "TypeScript" },
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "go", label: "Go" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "c", label: "C" },
  ];

  const bugTierOptions = [
    { value: "syntax", label: "Syntax" },
    { value: "runtime", label: "Runtime" },
    { value: "logic", label: "Logic" },
  ];

  const skillTypeOptions = [
    { value: "general", label: "General" },
    { value: "stability", label: "Stability" },
    { value: "insight", label: "Insight" },
    { value: "rewards", label: "Rewards" },
    { value: "combat", label: "Combat" },
  ];

  const starterCodeByLanguage: Record<string, string> = {
    typescript: "export function solve(input: string): string {\n  return input;\n}\n",
    javascript: "export function solve(input) {\n  return input;\n}\n",
    python: "def solve(input: str) -> str:\n    return input\n",
    go: "package main\n\nfunc solve(input string) string {\n\treturn input\n}\n",
    java: "public class Main {\n  public static String solve(String input) {\n    return input;\n  }\n}\n",
    cpp: "#include <string>\n\nstd::string solve(const std::string& input) {\n    return input;\n}\n",
    c: "#include <stdio.h>\n\nconst char* solve(const char* input) {\n    return input;\n}\n",
  };

  const load = async () => {
    setError(null);
    try {
      const [usersRes, skillsRes, challengesRes] = await Promise.all([
        fetch("/api/elysia/admin/users"),
        fetch("/api/elysia/admin/skills"),
        fetch("/api/elysia/admin/challenges"),
      ]);

      const usersPayload = (await usersRes.json()) as ApiResponse<AdminUser[]>;
      const skillsPayload = (await skillsRes.json()) as ApiResponse<AdminSkill[]>;
      const challengesPayload = (await challengesRes.json()) as ApiResponse<AdminChallenge[]>;

      if (usersPayload.error || skillsPayload.error || challengesPayload.error) {
        setError(
          usersPayload.error?.message ??
            skillsPayload.error?.message ??
            challengesPayload.error?.message ??
            "The system destabilized.",
        );
        return;
      }

      setUsers(usersPayload.data ?? []);
      setSkills(skillsPayload.data ?? []);
      setChallenges(challengesPayload.data ?? []);
    } catch {
      setError("The system destabilized.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreateQuest = async () => {
    setIsSaving(true);
    setError(null);
    let parsedConstraints: Record<string, unknown> = {};
    let parsedRewards: Record<string, unknown> = {};

    try {
      parsedConstraints = JSON.parse(questForm.constraints || "{}");
      parsedRewards = JSON.parse(questForm.rewards || "{}");
    } catch {
      setError("Quest JSON is invalid. Repair constraints or rewards.");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/elysia/admin/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: questForm.slug.trim(),
          title: questForm.title.trim(),
          description: questForm.description.trim() || undefined,
          language: questForm.language.trim(),
          bugTier: questForm.bugTier.trim(),
          starterCode: questForm.starterCode,
          codexLink: questForm.codexLink.trim() || undefined,
          serverHealthDrainRate: Number(questForm.serverHealthDrainRate || 1),
          constraints: parsedConstraints,
          rewards: parsedRewards,
        }),
      });
      const payload = (await response.json()) as ApiResponse<AdminChallenge>;
      if (!response.ok || payload.error) {
        setError(payload.error?.message ?? "The system destabilized.");
      } else {
        setQuestForm({
          title: "",
          slug: "",
          language: "typescript",
          bugTier: "runtime",
          starterCode: "",
          description: "",
          codexLink: "",
          serverHealthDrainRate: "1",
          constraints: "{}",
          rewards: "{}",
        });
        await load();
      }
    } catch {
      setError("The system destabilized.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSkill = async () => {
    setIsSaving(true);
    setError(null);
    let parsedEffects: Record<string, unknown> = {};

    try {
      parsedEffects = JSON.parse(skillForm.effects || "{}");
    } catch {
      setError("Skill effects JSON is invalid.");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/elysia/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: skillForm.name.trim(),
          category: skillForm.category.trim(),
          maxTier: Number(skillForm.maxTier || 1),
          isPassive: skillForm.isPassive,
          effects: parsedEffects,
        }),
      });
      const payload = (await response.json()) as ApiResponse<AdminSkill>;
      if (!response.ok || payload.error) {
        setError(payload.error?.message ?? "The system destabilized.");
      } else {
        setSkillForm({
          name: "",
          category: "general",
          maxTier: "1",
          isPassive: true,
          effects: "{}",
        });
        await load();
      }
    } catch {
      setError("The system destabilized.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-card to-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Admin Sanctum</p>
          <h1 className="text-3xl font-semibold">Oversee the Realm</h1>
          <p className="text-sm text-muted-foreground">
            Review Players, Quests, and Skill Branches. Updates are logged as Admin actions.
          </p>
        </header>

        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-lg">
            <h2 className="text-lg font-semibold">Players</h2>
            <p className="text-xs text-muted-foreground">Registered Avatars</p>
            <div className="mt-4 space-y-3 text-xs">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-lg border border-border/60 bg-background/70 p-3"
                >
                  <div className="font-semibold text-foreground">{user.name ?? "Player"}</div>
                  <div className="text-muted-foreground">{user.email}</div>
                  <div className="text-muted-foreground">Role: {user.role ?? "player"}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-lg">
            <h2 className="text-lg font-semibold">Quests</h2>
            <p className="text-xs text-muted-foreground">Active Quest definitions</p>
            <div className="mt-4 space-y-3 rounded-xl border border-border/60 bg-background/60 p-3 text-xs">
              <div className="grid gap-2">
                <input
                  value={questForm.title}
                  onChange={(event) =>
                    setQuestForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Quest title"
                  className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-foreground"
                />
                <input
                  value={questForm.slug}
                  onChange={(event) =>
                    setQuestForm((prev) => ({ ...prev, slug: event.target.value }))
                  }
                  placeholder="quest-slug"
                  className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-foreground"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={questForm.language}
                    onChange={(event) => {
                      const language = event.target.value;
                      setQuestForm((prev) => ({
                        ...prev,
                        language,
                        starterCode: starterCodeByLanguage[language] ?? prev.starterCode,
                      }));
                    }}
                    className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-foreground"
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={questForm.bugTier}
                    onChange={(event) =>
                      setQuestForm((prev) => ({ ...prev, bugTier: event.target.value }))
                    }
                    className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-foreground"
                  >
                    {bugTierOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={questForm.starterCode}
                  onChange={(event) =>
                    setQuestForm((prev) => ({ ...prev, starterCode: event.target.value }))
                  }
                  placeholder="Starter code"
                  rows={4}
                  className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-foreground"
                />
                <textarea
                  value={questForm.description}
                  onChange={(event) =>
                    setQuestForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Quest description"
                  rows={2}
                  className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-foreground"
                />
                <input
                  value={questForm.codexLink}
                  onChange={(event) =>
                    setQuestForm((prev) => ({ ...prev, codexLink: event.target.value }))
                  }
                  placeholder="Codex link"
                  className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-foreground"
                />
                <input
                  value={questForm.serverHealthDrainRate}
                  onChange={(event) =>
                    setQuestForm((prev) => ({ ...prev, serverHealthDrainRate: event.target.value }))
                  }
                  placeholder="Health drain rate"
                  className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-foreground"
                />
                <textarea
                  value={questForm.constraints}
                  onChange={(event) =>
                    setQuestForm((prev) => ({ ...prev, constraints: event.target.value }))
                  }
                  placeholder='Constraints JSON (e.g. {"maxEdits": 12})'
                  rows={2}
                  className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-foreground"
                />
                <textarea
                  value={questForm.rewards}
                  onChange={(event) =>
                    setQuestForm((prev) => ({ ...prev, rewards: event.target.value }))
                  }
                  placeholder='Rewards JSON (e.g. {"bytes": 50})'
                  rows={2}
                  className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-foreground"
                />
              </div>
              <button
                type="button"
                onClick={handleCreateQuest}
                disabled={isSaving}
                className="mt-2 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Forge Quest
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="rounded-lg border border-border/60 bg-background/70 p-3"
                >
                  <div className="font-semibold text-foreground">{challenge.title}</div>
                  <div className="text-muted-foreground">{challenge.slug}</div>
                  <div className="text-muted-foreground">
                    {challenge.language} • {challenge.bugTier}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-lg">
            <h2 className="text-lg font-semibold">Skill Branches</h2>
            <p className="text-xs text-muted-foreground">Catalog monitoring</p>
            <div className="mt-4 space-y-3 rounded-xl border border-border/60 bg-background/60 p-3 text-xs">
              <div className="grid gap-2">
                <input
                  value={skillForm.name}
                  onChange={(event) =>
                    setSkillForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Skill name"
                  className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-foreground"
                />
                <select
                  value={skillForm.category}
                  onChange={(event) =>
                    setSkillForm((prev) => ({ ...prev, category: event.target.value }))
                  }
                  className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-foreground"
                >
                  {skillTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={skillForm.maxTier}
                    onChange={(event) =>
                      setSkillForm((prev) => ({ ...prev, maxTier: event.target.value }))
                    }
                    placeholder="Max tier"
                    className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-foreground"
                  />
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={skillForm.isPassive}
                      onChange={(event) =>
                        setSkillForm((prev) => ({ ...prev, isPassive: event.target.checked }))
                      }
                      className="h-4 w-4 rounded border-border bg-background text-primary"
                    />
                    Passive
                  </label>
                </div>
                <textarea
                  value={skillForm.effects}
                  onChange={(event) =>
                    setSkillForm((prev) => ({ ...prev, effects: event.target.value }))
                  }
                  placeholder='Effects JSON (e.g. {"health_drain_multiplier": -0.1})'
                  rows={2}
                  className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-foreground"
                />
              </div>
              <button
                type="button"
                onClick={handleCreateSkill}
                disabled={isSaving}
                className="mt-2 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Forge Skill
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="rounded-lg border border-border/60 bg-background/70 p-3"
                >
                  <div className="font-semibold text-foreground">{skill.name}</div>
                  <div className="text-muted-foreground">
                    {skill.category} • Tier {skill.maxTier}
                  </div>
                  <div className="text-muted-foreground">
                    {skill.isPassive ? "Passive" : "Active"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
