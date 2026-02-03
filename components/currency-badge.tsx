"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { usePlayerStore, playerStoreDefaults, type Wallet } from "@/lib/stores/player-store";
import { cn } from "@/lib/utils";

type ApiResponse<T> = {
  data: T | null;
  error: { code: string; message: string } | null;
};

export default function CurrencyBadge({
  className,
  showOnMobile = false,
}: {
  className?: string;
  showOnMobile?: boolean;
}) {
  const wallet = usePlayerStore((state) => state.wallet);
  const setWallet = usePlayerStore((state) => state.setWallet);

  const walletQuery = useQuery<Wallet>({
    queryKey: ["economy", "wallet"],
    queryFn: async () => {
      const response = await fetch("/api/elysia/economy/wallet");
      const payload = (await response.json()) as ApiResponse<Wallet>;
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? "Wallet fetch failed");
      }
      return payload.data ?? playerStoreDefaults.emptyWallet;
    },
  });

  useEffect(() => {
    if (walletQuery.data) {
      setWallet(walletQuery.data);
    }
  }, [setWallet, walletQuery.data]);

  return (
    <div
      className={cn(
        showOnMobile ? "flex" : "hidden lg:flex",
        "items-center gap-3 rounded-lg border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground",
        className,
      )}
    >
      <span>
        Bytes: <span className="font-semibold text-foreground">{wallet.bytes}</span>
      </span>
      <span>
        Focus: <span className="font-semibold text-foreground">{wallet.focus}</span>
      </span>
      <span>
        Commits: <span className="font-semibold text-foreground">{wallet.commits}</span>
      </span>
      <span>
        Gold: <span className="font-semibold text-chart-1">{wallet.gold}</span>
      </span>
    </div>
  );
}
