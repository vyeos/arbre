"use client";

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

const rarityStyles: Record<string, string> = {
  Common: "text-muted-foreground",
  Uncommon: "text-emerald-300",
  Rare: "text-sky-300",
  Epic: "text-purple-300",
  Legendary: "text-amber-300",
  Mythic: "text-pink-300",
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
    <div className="min-h-screen bg-linear-to-b from-background via-card to-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Armory / Relic Vault
          </p>
          <h1 className="text-3xl font-semibold">Bind Relics to your Character Vessel</h1>
          <p className="text-sm text-muted-foreground">
            Acquire cosmetics with Gold earned from Quests. Relics never alter gameplay power — only
            prestige.
          </p>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm">
          <div>
            <span className="text-muted-foreground">Vault Gold:</span>{" "}
            <span className="font-semibold text-amber-300">{gold}</span>
          </div>
          {error ? <span className="text-xs text-destructive">{error}</span> : null}
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          {catalog.map((relic) => {
            const canAcquire = !relic.owned && !relic.isSealed && relic.isAvailable;
            return (
              <div
                key={relic.id}
                className="rounded-2xl border border-border bg-card/80 p-5 shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`text-xs uppercase tracking-[0.2em] ${rarityStyles[relic.rarity] ?? "text-muted-foreground"}`}
                    >
                      {relic.rarity} • {relic.slot}
                    </p>
                    <h2 className="text-lg font-semibold text-foreground">{relic.name}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{relic.description}</p>
                  </div>
                  <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                    {relic.priceGold} Gold
                  </span>
                </div>

                {relic.unlockCondition ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Sealed Condition: {relic.unlockCondition}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {relic.isSealed ? (
                    <span className="rounded-md border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                      Sealed Relic
                    </span>
                  ) : null}
                  {relic.owned ? (
                    <button
                      type="button"
                      disabled={isBusy || relic.bound}
                      onClick={() => handleBind(relic.id)}
                      className="rounded-md border border-border bg-background/70 px-3 py-1 text-xs font-semibold text-foreground transition hover:border-primary/70 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {relic.bound ? "Bound" : "Bind Relic"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isBusy || !canAcquire || gold < relic.priceGold}
                      onClick={() => handleAcquire(relic.id)}
                      className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Acquire Relic
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
