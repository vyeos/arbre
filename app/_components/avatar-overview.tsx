"use client";

import { useEffect, useMemo, useState } from "react";

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

const bodyTypes = ["Adventurer", "Sage", "Rogue", "Guardian"];
const skinTones = ["Dawn", "Bronze", "Umber", "Onyx", "Ivory"];
const hairStyles = ["Wanderer", "Braided", "Crested", "Arcane"];
const hairColors = ["Umber", "Ash", "Ember", "Frost", "Obsidian"];
const eyeStyles = ["Ember", "Aether", "Verdant", "Storm", "None"];

const defaultVessel = {
  bodyType: bodyTypes[0] ?? "Adventurer",
  skinTone: skinTones[0] ?? "Dawn",
  hairStyle: hairStyles[0] ?? "Wanderer",
  hairColor: hairColors[0] ?? "Umber",
  eyeStyle: eyeStyles[0] ?? "Ember",
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

const outfitPalette: Record<string, string> = {
  Adventurer: "#1f2937",
  Sage: "#0f766e",
  Rogue: "#7f1d1d",
  Guardian: "#1d4ed8",
};

export default function CharacterOverview() {
  const [vessel, setVessel] = useState<CharacterVessel | null>(null);
  const [form, setForm] = useState(defaultVessel);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const preview = useMemo(() => {
    return {
      ...form,
      eyeStyle: form.eyeStyle === "None" ? "None" : form.eyeStyle,
    };
  }, [form]);

  const pixelColors = useMemo(() => {
    const skin = skinPalette[preview.skinTone] ?? "#f6d7c1";
    const hair = hairPalette[preview.hairColor] ?? "#4b3621";
    const eyes =
      preview.eyeStyle !== "None" ? (eyePalette[preview.eyeStyle] ?? "#f97316") : "#1f2937";
    const outfit = outfitPalette[preview.bodyType] ?? "#1f2937";

    return { skin, hair, eyes, outfit };
  }, [preview.bodyType, preview.eyeStyle, preview.hairColor, preview.skinTone]);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/elysia/armory/inventory");
      const payload = (await response.json()) as ApiResponse<ArmoryState>;
      if (!response.ok || payload.error) {
        if (response.status === 404 || payload.error?.code === "NOT_FOUND") {
          setVessel(null);
          setForm(defaultVessel);
          return;
        }
        setError(payload.error?.message ?? "The system destabilized.");
        return;
      }
      if (payload.data?.vessel) {
        const nextVessel = payload.data.vessel;
        setVessel(nextVessel);
        setForm({
          bodyType: nextVessel.bodyType,
          skinTone: nextVessel.skinTone,
          hairStyle: nextVessel.hairStyle,
          hairColor: nextVessel.hairColor,
          eyeStyle: nextVessel.eyeStyle ?? "None",
        });
      } else {
        setVessel(null);
        setForm(defaultVessel);
      }
    } catch {
      setError("The system destabilized.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setStatus(null);
    try {
      const body = JSON.stringify({
        ...form,
        eyeStyle: form.eyeStyle === "None" ? null : form.eyeStyle,
      });
      const send = async (method: "POST" | "PUT") =>
        fetch("/api/elysia/armory/vessel", {
          method,
          headers: { "Content-Type": "application/json" },
          body,
        });

      let response = await send(vessel ? "PUT" : "POST");
      let payload = (await response.json()) as ApiResponse<CharacterVessel>;

      if (!response.ok || payload.error) {
        if (response.status === 409 && payload.error?.code === "VESSEL_EXISTS") {
          response = await send("PUT");
          payload = (await response.json()) as ApiResponse<CharacterVessel>;
        }
      }

      if (!response.ok || payload.error) {
        setError(payload.error?.message ?? "The system destabilized.");
        return;
      }
      const updated = payload.data ?? {
        bodyType: form.bodyType,
        skinTone: form.skinTone,
        hairStyle: form.hairStyle,
        hairColor: form.hairColor,
        eyeStyle: form.eyeStyle === "None" ? null : form.eyeStyle,
      };
      setVessel(updated);
      window.dispatchEvent(new CustomEvent("vessel:update", { detail: updated }));
      setStatus(vessel ? "Avatar updated." : "Avatar forged.");
      await load();
    } catch {
      setError("The system destabilized.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-card/20 to-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        {/* Header */}
        <header className="relative space-y-4">
          <div className="pointer-events-none absolute -top-10 left-0 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-1.5">
              <span className="text-lg">🎭</span>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                Character Vessel
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {vessel ? "Forged" : "Unforged"} Avatar
            </span>
          </div>

          <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
            <span className="text-foreground">Forge and Refine </span>
            <span className="text-accent">Your Avatar</span>
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Your Avatar is your identity in the realm. Customize your vessel here, then bind Relics
            in the Armory for ultimate prestige.
          </p>
        </header>

        {/* Status Messages */}
        {error ? (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-3 text-sm text-destructive">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        ) : null}
        {status ? (
          <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-5 py-3 text-sm text-primary">
            <span>✨</span>
            <span>{status}</span>
          </div>
        ) : null}

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Forge Panel */}
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-linear-to-b from-card/80 to-card/40 p-6 shadow-xl">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span>🔮</span>
                    <span>Vessel Forge</span>
                  </div>
                  <h2 className="mt-2 font-serif text-xl font-semibold">Choose Your Base Form</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {vessel
                      ? "Refine your existing vessel without losing progress."
                      : "Forge your first vessel to begin your ascent."}
                  </p>
                </div>
                <div
                  className={`rounded-lg border px-3 py-1.5 text-xs ${
                    vessel
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/40 bg-background/40 text-muted-foreground"
                  }`}
                >
                  {isLoading ? "Loading..." : vessel ? "✓ Forged" : "Unforged"}
                </div>
              </div>

              <div className="mt-6 grid gap-4 text-sm">
                {[
                  { key: "bodyType", label: "Body Type", icon: "🧍", options: bodyTypes },
                  { key: "skinTone", label: "Skin Tone", icon: "🎨", options: skinTones },
                  { key: "hairStyle", label: "Hair Style", icon: "💇", options: hairStyles },
                  { key: "hairColor", label: "Hair Color", icon: "🖌️", options: hairColors },
                  { key: "eyeStyle", label: "Eye Style", icon: "👁️", options: eyeStyles },
                ].map((field) => (
                  <label key={field.key} className="space-y-1.5">
                    <span className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                      <span>{field.icon}</span>
                      <span>{field.label}</span>
                    </span>
                    <select
                      value={form[field.key as keyof typeof form]}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, [field.key]: event.target.value }))
                      }
                      className="w-full rounded-lg border border-border/60 bg-background/60 px-4 py-2.5 text-sm text-foreground transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="mt-6 w-full rounded-lg bg-linear-to-r from-accent to-accent/80 px-5 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition hover:shadow-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "⏳ Channeling essence..."
                  : vessel
                    ? "🔮 Save Vessel Changes"
                    : "🛡️ Forge Avatar"}
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-linear-to-b from-card/80 to-card/40 p-6 shadow-xl">
            <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-chart-1/10 blur-2xl" />

            <div className="relative">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <span>👤</span>
                <span>Vessel Preview</span>
              </div>

              <div className="mt-4 flex flex-col gap-6 rounded-xl border border-border/40 bg-background/40 p-6">
                {/* Pixel Avatar */}
                <div className="flex items-center justify-center">
                  <div className="rounded-2xl border border-border/60 bg-linear-to-b from-background/90 to-background/70 p-5 shadow-lg">
                    <div
                      className="grid h-44 w-36"
                      style={{
                        gridTemplateColumns: "repeat(12, 1fr)",
                        gridTemplateRows: "repeat(16, 1fr)",
                        gap: "2px",
                      }}
                    >
                      {[
                        // Head + hair (rows 1-4)
                        0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0,
                        1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0,
                        // Eyes row
                        0, 1, 2, 2, 3, 2, 2, 3, 2, 2, 1, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0,
                        // Neck
                        0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0,
                        // Torso
                        0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0,
                        4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0,
                        // Belt
                        0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0,
                        // Legs
                        0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0, 0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0, 0,
                        0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0,
                        // Boots
                        0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0, 0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0,
                      ].map((cell, index) => {
                        const color =
                          cell === 1
                            ? pixelColors.hair
                            : cell === 2
                              ? pixelColors.skin
                              : cell === 3
                                ? pixelColors.eyes
                                : cell === 4
                                  ? pixelColors.outfit
                                  : "transparent";
                        return (
                          <div
                            key={index}
                            className="transition-colors duration-300"
                            style={{ backgroundColor: color }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Stats Display */}
                <div className="grid gap-3">
                  {[
                    { label: "Body", value: preview.bodyType, icon: "🧍" },
                    { label: "Skin", value: preview.skinTone, icon: "🎨" },
                    {
                      label: "Hair",
                      value: `${preview.hairStyle} • ${preview.hairColor}`,
                      icon: "💇",
                    },
                    { label: "Eyes", value: preview.eyeStyle, icon: "👁️" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between rounded-lg border border-border/30 bg-background/30 px-4 py-2.5 text-sm"
                    >
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span>{stat.icon}</span>
                        <span>{stat.label}</span>
                      </span>
                      <span className="font-medium text-foreground">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relic Slots Preview */}
              <div className="mt-6 rounded-xl border border-chart-1/20 bg-chart-1/5 p-4">
                <div className="flex items-center gap-2 text-xs text-chart-1">
                  <span>💎</span>
                  <span>Relic Slots Available</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Visit the Armory to bind cosmetic Relics to your Avatar.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
