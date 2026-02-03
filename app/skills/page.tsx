"use client";

import "reactflow/dist/style.css";

import { useEffect, useMemo, useState } from "react";
import type { Edge, Node, NodeProps } from "reactflow";
import ReactFlow, { Background } from "reactflow";

type ApiResponse<T> = {
  data: T | null;
  error: { code: string; message: string } | null;
};

type SkillEntry = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  maxTier: number;
  costGold: number;
  isPassive: boolean;
  effects: Record<string, unknown>;
};

type UnlockEntry = {
  id: string;
  tier: number;
};

const branchOrder = [
  "Stability",
  "Insight",
  "Rewards",
  "Combat",
  "Focus",
  "Flow",
  "Utility",
  "General",
];

const branchIcons: Record<string, string> = {
  Stability: "🛡️",
  Insight: "👁️",
  Rewards: "🪙",
  Combat: "⚔️",
  Focus: "🎯",
  Flow: "💨",
  Utility: "🔧",
  General: "✨",
};

const buildBranchAngles = (branches: string[]) => {
  const ordered = [
    ...branchOrder.filter((branch) => branches.includes(branch)),
    ...branches.filter((branch) => !branchOrder.includes(branch)),
  ];
  return ordered.map((branch, index) => ({
    branch,
    angle: (index / ordered.length) * Math.PI * 2,
  }));
};

const getSkillPrice = (skill: SkillEntry) => {
  return Math.max(1, Math.round(skill.costGold ?? 10));
};

const SkillNode = ({
  data,
}: NodeProps<{
  label: string;
  description: string;
  price: number;
  locked: boolean;
  owned: boolean;
  canBuy: boolean;
  category: string;
}>) => (
  <div
    className={`group relative cursor-pointer rounded-xl border-2 px-4 py-3 text-xs shadow-lg transition-all ${
      data.owned
        ? "border-primary/60 bg-linear-to-br from-primary/25 to-primary/10 text-foreground shadow-primary/20"
        : data.canBuy
          ? "animate-pulse border-emerald-400/60 bg-linear-to-br from-emerald-500/20 to-emerald-500/5 text-foreground shadow-emerald-500/20"
          : data.locked
            ? "border-border/30 bg-background/30 text-muted-foreground opacity-60 grayscale"
            : "border-border/50 bg-linear-to-br from-card/80 to-card/40 text-foreground"
    }`}
  >
    {/* Glow effect for purchasable */}
    {data.canBuy && !data.owned && (
      <div className="absolute inset-0 -z-10 rounded-xl bg-emerald-500/20 blur-md" />
    )}

    <div className="flex items-center gap-2">
      <span className="text-base">{branchIcons[data.category] ?? "✨"}</span>
      <span className="font-semibold">{data.label}</span>
    </div>
    <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
      <span>💠</span>
      <span>{data.price} Bytes</span>
      {data.owned && <span className="ml-1 text-primary">✓</span>}
    </div>

    {/* Tooltip */}
    <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-56 -translate-x-1/2 rounded-xl border border-border/60 bg-card/95 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground opacity-0 shadow-2xl backdrop-blur-sm transition-opacity group-hover:opacity-100">
      <p className="mb-1 font-medium text-foreground">{data.label}</p>
      <p>{data.description || "No Codex entry yet."}</p>
      {data.canBuy && !data.owned && (
        <p className="mt-2 text-emerald-400">⚡ Click to bind this Skill</p>
      )}
    </div>
  </div>
);

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [unlocks, setUnlocks] = useState<UnlockEntry[]>([]);
  const [bytes, setBytes] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [skillsRes, unlocksRes] = await Promise.all([
        fetch("/api/elysia/skills"),
        fetch("/api/elysia/skills/unlocks"),
      ]);

      const skillsPayload = (await skillsRes.json()) as ApiResponse<SkillEntry[]>;
      if (skillsRes.ok && !skillsPayload.error) {
        setSkills(skillsPayload.data ?? []);
      }

      if (unlocksRes.ok) {
        const unlocksPayload = (await unlocksRes.json()) as ApiResponse<{
          unlocks: UnlockEntry[];
          bytes: number;
        }>;
        setUnlocks(unlocksPayload.data?.unlocks ?? []);
        setBytes(unlocksPayload.data?.bytes ?? 0);
      }
    };

    void load();
  }, []);

  const { nodes, edges, canBuyById } = useMemo(() => {
    if (!skills.length) {
      return { nodes: [] as Node[], edges: [] as Edge[], canBuyById: new Map<string, boolean>() };
    }

    const unlockedIds = new Set(unlocks.map((unlock) => unlock.id));
    const sortedSkills = [...skills].sort((a, b) => a.name.localeCompare(b.name));
    const rootSkill =
      sortedSkills.find((skill) => skill.category.toLowerCase() === "general") ?? sortedSkills[0];

    const branches = Array.from(new Set(sortedSkills.map((skill) => skill.category)));
    const branchAngles = buildBranchAngles(branches);
    const branchLookup = new Map(branchAngles.map((entry) => [entry.branch, entry.angle]));
    const branchIndices = new Map<string, number>();

    const parentById = new Map<string, string>();

    const grouped = new Map<string, SkillEntry[]>();
    for (const skill of sortedSkills) {
      const list = grouped.get(skill.category) ?? [];
      list.push(skill);
      grouped.set(skill.category, list);
    }

    for (const [, list] of grouped.entries()) {
      const ordered = list.filter((skill) => skill.id !== rootSkill.id);
      ordered.sort((a, b) => a.name.localeCompare(b.name));
      ordered.forEach((skill, index) => {
        if (index === 0) {
          parentById.set(skill.id, rootSkill.id);
        } else {
          parentById.set(skill.id, ordered[index - 1].id);
        }
      });
    }

    const graphNodes: Node[] = sortedSkills.map((skill) => {
      if (skill.id === rootSkill.id) {
        const price = getSkillPrice(skill);
        const owned = unlockedIds.has(skill.id);
        const canBuy = !owned && bytes >= price;
        return {
          id: skill.id,
          position: { x: 0, y: 0 },
          data: {
            label: skill.name,
            description: skill.description ?? "",
            price,
            locked: !owned,
            owned,
            canBuy,
            category: skill.category,
          },
          type: "skill",
        };
      }

      const currentIndex = branchIndices.get(skill.category) ?? 0;
      branchIndices.set(skill.category, currentIndex + 1);
      const angle = branchLookup.get(skill.category) ?? 0;
      const radius = 220 + currentIndex * 120;
      const offset = currentIndex % 2 === 0 ? 0.18 : -0.18;
      const finalAngle = angle + offset;
      const x = Math.cos(finalAngle) * radius;
      const y = Math.sin(finalAngle) * radius;

      const parentId = parentById.get(skill.id);
      const isVisible = parentId ? unlockedIds.has(parentId) : false;
      const price = getSkillPrice(skill);
      const owned = unlockedIds.has(skill.id);
      const isLocked = !owned;
      const canBuy = isVisible && !owned && bytes >= price;

      return {
        id: skill.id,
        position: { x, y },
        data: {
          label: skill.name,
          description: skill.description ?? "",
          price,
          locked: isLocked,
          owned,
          canBuy,
          category: skill.category,
        },
        type: "skill",
        hidden: !isVisible,
      };
    });

    const graphEdges: Edge[] = [];
    for (const skill of sortedSkills) {
      if (skill.id === rootSkill.id) continue;
      const parentId = parentById.get(skill.id);
      if (!parentId) continue;
      const targetHidden = graphNodes.find((node) => node.id === skill.id)?.hidden;
      const sourceOwned = unlockedIds.has(parentId);
      graphEdges.push({
        id: `${parentId}-${skill.id}`,
        source: parentId,
        target: skill.id,
        type: "smoothstep",
        style: {
          stroke: sourceOwned ? "rgba(120, 200, 120, 0.5)" : "rgba(148, 163, 184, 0.3)",
          strokeWidth: sourceOwned ? 2 : 1.2,
        },
        hidden: Boolean(targetHidden),
      });
    }

    const buyMap = new Map<string, boolean>();
    for (const node of graphNodes) {
      const data = node.data as { canBuy?: boolean } | undefined;
      if (data?.canBuy) {
        buyMap.set(node.id, true);
      }
    }

    return { nodes: graphNodes, edges: graphEdges, canBuyById: buyMap };
  }, [skills, unlocks, bytes]);

  const handleBuy = async (id: string) => {
    if (!canBuyById.get(id)) return;
    const response = await fetch("/api/elysia/skills/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) return;
    const payload = (await response.json()) as ApiResponse<{
      id: string;
      tier: number;
      remainingBytes: number;
    }>;
    if (payload.error) return;
    setUnlocks((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, tier: payload.data?.tier ?? item.tier } : item,
        );
      }
      return [...prev, { id, tier: payload.data?.tier ?? 1 }];
    });
    if (payload.data?.remainingBytes !== undefined) {
      setBytes(payload.data.remainingBytes);
      window.dispatchEvent(
        new CustomEvent("wallet:update", { detail: { bytes: payload.data.remainingBytes } }),
      );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-card/20 to-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        {/* Header */}
        <header className="relative space-y-4">
          <div className="pointer-events-none absolute -top-10 left-0 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/10 px-4 py-1.5">
              <span className="text-lg">🌳</span>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-sky-300">
                Skill Tree
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Passive buffs • Active abilities</span>
          </div>

          <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
            <span className="text-foreground">Bind Skills to </span>
            <span className="text-sky-400">Shape Your Build</span>
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Spend Bytes to unlock passive buffs and active abilities. Each Skill Branch defines your
            path. Glowing Skills are ready to bind.
          </p>
        </header>

        {/* Bytes Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-linear-to-r from-card/60 to-card/40 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-sky-500/40 bg-sky-500/10">
              <span className="text-2xl">💠</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Available Bytes
              </p>
              <p className="text-2xl font-bold text-sky-300">{bytes.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{unlocks.length} Skills Bound</span>
            <span className="h-4 w-px bg-border/60" />
            <span>{skills.length} Total Skills</span>
          </div>
        </div>

        {/* Skill Tree Visualization */}
        <div className="relative h-[70vh] w-full overflow-hidden rounded-3xl border border-border/60 bg-linear-to-b from-card/60 to-card/30 shadow-2xl">
          {/* Corner decorations */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-sky-500/5 blur-3xl" />

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={{ skill: SkillNode }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            onNodeClick={(_, node) => handleBuy(node.id)}
            panOnDrag
            zoomOnScroll
            fitView
            fitViewOptions={{ padding: 0.25 }}
          >
            <Background gap={40} size={1} color="rgba(148, 163, 184, 0.1)" />
          </ReactFlow>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary/60" />
            <span>Bound Skill</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-500/60" />
            <span>Ready to Bind</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-border/40" />
            <span>Locked</span>
          </div>
          <span className="text-muted-foreground/60">|</span>
          <span>Click a glowing Skill to bind it</span>
        </div>
      </main>
    </div>
  );
}
