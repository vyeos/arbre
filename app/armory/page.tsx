"use client";

import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

type RelicCatalogEntry = {
  id: string;
  name: string;
  description: string;
  slot: string;
  rarity: string;
  priceGold: number;
  unlockCondition: string | null;
  requiresSkillId: string | null;
  isLimited: boolean;
  isAvailable: boolean;
  isSealed: boolean;
  owned: boolean;
  bound: boolean;
};

type WalletResponse = {
  data: { gold: number } | null;
  error: { code: string; message: string } | null;
};

type CatalogResponse = {
  data: RelicCatalogEntry[] | null;
  error: { code: string; message: string } | null;
};

const rarityConfig: Record<string, { color: string; glow: string; icon: string }> = {
  Common: { color: "text-muted", glow: "", icon: "◆" },
  Uncommon: { color: "text-primary", glow: "shadow-primary/10", icon: "◆" },
  Rare: { color: "text-chart-2", glow: "shadow-chart-2/10", icon: "◆◆" },
  Epic: { color: "text-accent", glow: "shadow-accent/20", icon: "◆◆◆" },
  Legendary: { color: "text-chart-1", glow: "shadow-chart-1/20", icon: "★" },
  Mythic: { color: "text-chart-3", glow: "shadow-chart-3/30", icon: "✦" },
};

const slotIcons: Record<string, string> = {
  Head: "👑",
  Face: "🎭",
  Body: "🧥",
  Hands: "🧤",
  Handheld: "⚔️",
  Back: "🦇",
  Background: "🌌",
  Frame: "🖼️",
  Aura: "✨",
};

export default function ArmoryPage() {
  const [catalog, setCatalog] = useState<RelicCatalogEntry[]>([]);
  const [gold, setGold] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const loadArmory = async () => {
    setError(null);
    const [catalogRes, walletRes] = await Promise.all([
      fetch("/api/elysia/armory/catalog"),
      fetch("/api/elysia/economy/wallet"),
    ]);

    const catalogPayload = (await catalogRes.json()) as CatalogResponse;
    setCatalog(catalogPayload.data ?? []);

    if (walletRes.ok) {
      const walletPayload = (await walletRes.json()) as WalletResponse;
      setGold(walletPayload.data?.gold ?? 0);
    }
  };

  useEffect(() => {
    void loadArmory();
  }, []);

  const handleAcquire = async (relicId: string) => {
    setIsBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/elysia/armory/acquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relicId }),
      });
      const payload = (await response.json()) as { error?: { message: string } };
      if (!response.ok) {
        setError(payload.error?.message ?? "The system destabilized.");
      }
      await loadArmory();
    } catch {
      setError("The system destabilized.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleBind = async (relicId: string) => {
    setIsBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/elysia/armory/bind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relicId }),
      });
      const payload = (await response.json()) as { error?: { message: string } };
      if (!response.ok) {
        setError(payload.error?.message ?? "The system destabilized.");
      }
      await loadArmory();
    } catch {
      setError("The system destabilized.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-card/20 to-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        {/* Header */}
        <header className="relative space-y-4">
          <div className="pointer-events-none absolute -top-10 left-0 h-32 w-32 rounded-full bg-chart-1/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center gap-4">
            <Badge className="border border-chart-1/40 bg-chart-1/10 px-4 py-1.5">
              <span className=" mr-2">🛡️</span>
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-chart-1">
                Relic Armory
              </span>
            </Badge>
            <span className="text-xs text-muted-foreground">Cosmetics • No stat boosts</span>
          </div>

          <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
            <span className="text-foreground">Acquire and Bind </span>
            <span className="text-chart-1">Legendary Relics</span>
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Spend your hard-earned Gold on prestigious cosmetics. Relics never alter your power —
            only your prestige. Let your victories shine.
          </p>
        </header>

        {/* Vault Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-linear-to-r from-card/60 to-card/40 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-chart-1/40 bg-chart-1/10">
              <span className="text-2xl">🪙</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Vault Gold</p>
              <p className="text-2xl font-bold text-chart-1">{gold.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{catalog.filter((r) => r.owned).length} Relics Owned</span>
            <span className="h-4 w-px bg-border/60" />
            <span>{catalog.filter((r) => r.bound).length} Relics Bound</span>
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-3 text-sm text-destructive">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        ) : null}

        {/* Relic Grid */}
        <section className="grid gap-5 md:grid-cols-2">
          {catalog.map((relic) => {
            const canAcquire = !relic.owned && !relic.isSealed && relic.isAvailable;
            const config = rarityConfig[relic.rarity] ?? rarityConfig.Common;
            const slotIcon = slotIcons[relic.slot] ?? "💎";

            return (
              <div
                key={relic.id}
                className={`group relative overflow-hidden rounded-2xl border p-6 transition-all hover:shadow-xl ${
                  relic.owned
                    ? `border-primary/40 bg-linear-to-br from-primary/10 to-primary/5 ${config.glow}`
                    : relic.isSealed
                      ? "border-border/30 bg-card/30"
                      : `border-border/60 bg-linear-to-br from-card/80 to-card/40 hover:border-primary/30 ${config.glow}`
                }`}
              >
                {/* Decorative corner */}
                {relic.rarity === "Legendary" || relic.rarity === "Mythic" ? (
                  <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-chart-1/10 blur-2xl" />
                ) : null}

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Rarity & Slot */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium uppercase tracking-[0.15em] ${config.color}`}
                      >
                        {config.icon} {relic.rarity}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {slotIcon} {relic.slot}
                      </span>
                    </div>

                    {/* Name */}
                    <h2
                      className={`mt-2 text-lg font-semibold ${relic.isSealed ? "text-muted-foreground" : "text-foreground"}`}
                    >
                      {relic.name}
                    </h2>

                    {/* Description */}
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {relic.description}
                    </p>

                    {/* Unlock condition */}
                    {relic.unlockCondition ? (
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>🔒</span>
                        <span>Sealed: {relic.unlockCondition}</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Price tag */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 rounded-lg border border-chart-1/30 bg-chart-1/10 px-3 py-1.5">
                      <span className="text-sm">🪙</span>
                      <span className="text-sm font-semibold text-chart-1">
                        {relic.priceGold.toLocaleString()}
                      </span>
                    </div>
                    {relic.isLimited ? (
                      <span className="text-xs text-chart-3">⏳ Limited</span>
                    ) : null}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-wrap gap-3">
                  {relic.isSealed ? (
                    <span className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/40 px-4 py-2 text-xs text-muted-foreground">
                      🔒 Sealed Relic
                    </span>
                  ) : relic.owned ? (
                    <button
                      type="button"
                      disabled={isBusy || relic.bound}
                      onClick={() => handleBind(relic.id)}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        relic.bound
                          ? "border border-primary/40 bg-primary/10 text-primary"
                          : "border border-border/60 bg-background/60 text-foreground hover:border-primary/40 hover:bg-primary/10"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {relic.bound ? "✓ Bound to Avatar" : "Bind Relic"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isBusy || !canAcquire || gold < relic.priceGold}
                      onClick={() => handleAcquire(relic.id)}
                      className="rounded-lg bg-linear-to-r from-chart-1 to-chart-1/80 px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-chart-1/20 transition hover:shadow-chart-1/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Acquire Relic
                    </button>
                  )}

                  {!relic.owned && gold < relic.priceGold && !relic.isSealed ? (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>💰</span>
                      <span>Need {(relic.priceGold - gold).toLocaleString()} more Gold</span>
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </section>

        {catalog.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/40 bg-card/40 py-16 text-center">
            <span className="text-4xl">🏛️</span>
            <p className="text-muted-foreground">The Armory awaits your first visit.</p>
            <p className="text-sm text-muted-foreground">Complete Quests to earn Gold.</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
