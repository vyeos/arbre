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
}>) => (
  <div
    className={`group relative rounded-2xl border px-3 py-2 text-xs transition ${
      data.owned
        ? "border-primary/60 bg-primary/20 text-foreground"
        : data.canBuy
          ? "border-emerald-400/60 bg-emerald-500/10 text-foreground"
          : data.locked
            ? "border-border/40 bg-background/40 text-muted-foreground grayscale"
            : "border-border/60 bg-background/80 text-foreground"
    }`}
  >
    <div className="font-semibold">{data.label}</div>
    <div className="text-[10px] text-muted-foreground">Cost: {data.price} Bytes</div>
    <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-48 -translate-x-1/2 rounded-lg border border-border bg-background/90 px-3 py-2 text-[11px] text-muted-foreground opacity-0 shadow-lg transition group-hover:opacity-100">
      {data.description || "No Codex entry yet."}
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
      graphEdges.push({
        id: `${parentId}-${skill.id}`,
        source: parentId,
        target: skill.id,
        type: "smoothstep",
        style: { stroke: "rgba(148, 163, 184, 0.4)", strokeWidth: 1.2 },
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
    <div className="min-h-screen bg-linear-to-b from-background via-card to-background text-foreground">
      <main className="mx-auto flex h-[80vh] w-full max-w-6xl px-6 py-12">
        <div className="h-full w-full overflow-hidden rounded-3xl border border-border/60 bg-card/60 shadow-2xl">
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
            fitViewOptions={{ padding: 0.2 }}
          >
            <Background gap={32} size={1} color="rgba(148, 163, 184, 0.2)" />
          </ReactFlow>
        </div>
      </main>
    </div>
  );
}
