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
    <div className="min-h-screen bg-linear-to-b from-background via-card to-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Avatar Overview
          </p>
          <h1 className="text-3xl font-semibold">Forge and refine your Avatar</h1>
          <p className="text-sm text-muted-foreground">
            Your Avatar is your identity. Customize it here at any time, then bind Relics in the
            Armory for prestige.
          </p>
        </header>

        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-xs text-destructive">
            {error}
          </div>
        ) : null}
        {status ? (
          <div className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-xs text-primary">
            {status}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Vessel Forge
                </p>
                <h2 className="mt-2 text-xl font-semibold">Choose your base form</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {vessel
                    ? "Refine your existing vessel without losing progress."
                    : "Forge your first vessel to begin your ascent."}
                </p>
              </div>
              <div className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                {isLoading ? "Loading" : vessel ? "Forged" : "Unforged"}
              </div>
            </div>

            <div className="mt-6 grid gap-4 text-sm">
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Body Type
                </span>
                <select
                  value={form.bodyType}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, bodyType: event.target.value }))
                  }
                  className="w-full rounded-md border border-border bg-background/70 px-3 py-2 text-sm text-foreground"
                >
                  {bodyTypes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Skin Tone
                </span>
                <select
                  value={form.skinTone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, skinTone: event.target.value }))
                  }
                  className="w-full rounded-md border border-border bg-background/70 px-3 py-2 text-sm text-foreground"
                >
                  {skinTones.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Hair Style
                </span>
                <select
                  value={form.hairStyle}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, hairStyle: event.target.value }))
                  }
                  className="w-full rounded-md border border-border bg-background/70 px-3 py-2 text-sm text-foreground"
                >
                  {hairStyles.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Hair Color
                </span>
                <select
                  value={form.hairColor}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, hairColor: event.target.value }))
                  }
                  className="w-full rounded-md border border-border bg-background/70 px-3 py-2 text-sm text-foreground"
                >
                  {hairColors.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Eye Style
                </span>
                <select
                  value={form.eyeStyle}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, eyeStyle: event.target.value }))
                  }
                  className="w-full rounded-md border border-border bg-background/70 px-3 py-2 text-sm text-foreground"
                >
                  {eyeStyles.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="mt-5 w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Channeling..." : vessel ? "Save Vessel Changes" : "Forge Avatar"}
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Vessel Preview
            </p>
            <div className="mt-4 grid gap-6 rounded-2xl border border-border bg-background/70 p-6 md:grid-cols-[200px_1fr] md:items-center">
              <div className="flex items-center justify-center">
                <div className="rounded-2xl border border-border bg-background/90 p-4 shadow-lg">
                  <div
                    className="grid h-40 w-32"
                    style={{
                      gridTemplateColumns: "repeat(12, 1fr)",
                      gridTemplateRows: "repeat(16, 1fr)",
                      gap: "2px",
                    }}
                  >
                    {[
                      // Head + hair (rows 1-4)
                      0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1,
                      1, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0,
                      // Eyes row
                      0, 1, 2, 2, 3, 2, 2, 3, 2, 2, 1, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0,
                      // Neck
                      0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0,
                      // Torso
                      0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 4,
                      4, 4, 4, 4, 4, 4, 4, 4, 4, 0,
                      // Belt
                      0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0,
                      // Legs
                      0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0, 0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0, 0, 0,
                      4, 4, 4, 0, 0, 4, 4, 4, 0, 0,
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
                          className="bg-transparent"
                          style={{ backgroundColor: color }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Body</span>
                <span className="font-semibold text-foreground">{preview.bodyType}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Skin</span>
                <span className="font-semibold text-foreground">{preview.skinTone}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hair</span>
                <span className="font-semibold text-foreground">
                  {preview.hairStyle} • {preview.hairColor}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Eyes</span>
                <span className="font-semibold text-foreground">{preview.eyeStyle}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
