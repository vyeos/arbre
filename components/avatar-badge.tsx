"use client";

import { useEffect, useState } from "react";

type CharacterVessel = {
  bodyType: string;
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeStyle: string | null;
};

type ArmoryState = {
  vessel: CharacterVessel | null;
};

type ApiResponse<T> = {
  data: T | null;
  error: { code: string; message: string } | null;
};

const skinPalette: Record<string, string> = {
  Dawn: "#f6d7c1",
  Bronze: "#d4a373",
  Umber: "#a47148",
  Onyx: "#6b4b3a",
  Ivory: "#f1e3d3",
};

const hairPalette: Record<string, string> = {
  Umber: "#4b3621",
  Ash: "#6b7280",
  Ember: "#b45309",
  Frost: "#e5e7eb",
  Obsidian: "#111827",
};

const eyePalette: Record<string, string> = {
  Ember: "#f97316",
  Aether: "#38bdf8",
  Verdant: "#22c55e",
  Storm: "#a855f7",
};

const defaultVessel: CharacterVessel = {
  bodyType: "Adventurer",
  skinTone: "Dawn",
  hairStyle: "Wanderer",
  hairColor: "Umber",
  eyeStyle: "Ember",
};

const hairLayouts: Record<string, number[]> = {
  wanderer: [
    0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 2, 3, 2, 3, 1, 1, 2, 2, 2, 2, 1, 0, 1,
    2, 2, 1, 0,
  ],
  braided: [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 2, 3, 2, 3, 1, 1, 2, 2, 2, 2, 1, 1, 1,
    1, 1, 1, 1,
  ],
  crested: [
    0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 2, 2, 2, 2, 1, 1, 2, 3, 2, 3, 1, 1, 2, 2, 2, 2, 1, 0, 0,
    1, 1, 0, 0,
  ],
  arcane: [
    1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 2, 3, 2, 3, 1, 1, 2, 2, 2, 2, 1, 1, 0,
    1, 1, 0, 1,
  ],
};

export default function AvatarBadge() {
  const [vessel, setVessel] = useState<CharacterVessel>(defaultVessel);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await fetch("/api/elysia/armory/inventory");
        const payload = (await response.json()) as ApiResponse<ArmoryState>;
        if (mounted && response.ok && !payload.error && payload.data?.vessel) {
          setVessel(payload.data.vessel);
        }
      } catch {
        // ignore
      }
    };

    void load();

    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<CharacterVessel>).detail;
      if (detail) {
        setVessel(detail);
      }
    };

    window.addEventListener("vessel:update", handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener("vessel:update", handleUpdate);
    };
  }, []);

  const skin = skinPalette[vessel.skinTone] ?? "#f6d7c1";
  const hair = hairPalette[vessel.hairColor] ?? "#4b3621";
  const eyes = vessel.eyeStyle ? (eyePalette[vessel.eyeStyle] ?? "#f97316") : "#f97316";
  const hairKey = vessel.hairStyle?.toLowerCase?.().trim?.() ?? "wanderer";
  const pixels = hairLayouts[hairKey] ?? hairLayouts.wanderer;

  return (
    <div className="rounded-md border border-border bg-background/70 p-1">
      <div
        className="grid h-10 w-10"
        style={{
          gridTemplateColumns: "repeat(6, 1fr)",
          gridTemplateRows: "repeat(6, 1fr)",
          gap: "1px",
        }}
      >
        {pixels.map((cell, index) => {
          const color = cell === 1 ? hair : cell === 2 ? skin : cell === 3 ? eyes : "transparent";
          return <div key={index} style={{ backgroundColor: color }} />;
        })}
      </div>
    </div>
  );
}
