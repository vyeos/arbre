"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

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

const emptyWallet: Wallet = { bytes: 0, focus: 0, commits: 0, gold: 0 };

export default function CurrencyBadge({
  className,
  showOnMobile = false,
}: {
  className?: string;
  showOnMobile?: boolean;
}) {
  const [wallet, setWallet] = useState<Wallet>(emptyWallet);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await fetch("/api/elysia/economy/wallet");
        const payload = (await response.json()) as ApiResponse<Wallet>;
        if (mounted && response.ok && !payload.error) {
          setWallet(payload.data ?? emptyWallet);
        }
      } catch {
        // ignore
      }
    };

    void load();

    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<Partial<Wallet>>).detail;
      if (!detail) return;
      setWallet((prev) => ({ ...prev, ...detail }));
    };

    window.addEventListener("wallet:update", handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener("wallet:update", handleUpdate);
    };
  }, []);

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
        Gold: <span className="font-semibold text-amber-300">{wallet.gold}</span>
      </span>
    </div>
  );
}
