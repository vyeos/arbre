import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type HealthStatus = "stable" | "warning" | "critical" | "crashed";

export type DrainModifier = {
  id: string;
  label: string;
  multiplier: number;
  reason?: string;
};

export type HealthSnapshot = {
  value: number;
  status: HealthStatus;
  drainPerTick: number;
  maxHealth: number;
  crashed: boolean;
};

export type HealthEngineConfig = {
  baseDrain: number;
  modifiers?: DrainModifier[];
  maxHealth?: number;
  initialHealth?: number;
  tickMs?: number;
  onCrash?: (snapshot: HealthSnapshot) => void;
};

export const getHealthStatus = (value: number): HealthStatus => {
  if (value <= 0) return "crashed";
  if (value <= 35) return "critical";
  if (value <= 65) return "warning";
  return "stable";
};

export const calculateDrainPerTick = (baseDrain: number, modifiers: DrainModifier[] = []) => {
  const adjusted = modifiers.reduce(
    (current, modifier) => current * modifier.multiplier,
    baseDrain,
  );
  return Math.max(0, Number.isFinite(adjusted) ? adjusted : baseDrain);
};

const buildSnapshot = (value: number, maxHealth: number, drainPerTick: number): HealthSnapshot => {
  const status = getHealthStatus(value);
  return {
    value,
    status,
    drainPerTick,
    maxHealth,
    crashed: status === "crashed",
  };
};

export const useServerHealth = (config: HealthEngineConfig) => {
  const maxHealth = config.maxHealth ?? 100;
  const tickMs = config.tickMs ?? 1200;
  const [health, setHealth] = useState(config.initialHealth ?? maxHealth);
  const crashNotified = useRef(false);

  const drainPerTick = useMemo(
    () => calculateDrainPerTick(config.baseDrain, config.modifiers ?? []),
    [config.baseDrain, config.modifiers],
  );

  const status = getHealthStatus(health);

  useEffect(() => {
    if (tickMs <= 0 || drainPerTick <= 0) return;
    const interval = setInterval(() => {
      setHealth((current) => {
        if (current <= 0) return current;
        return Math.max(0, current - drainPerTick);
      });
    }, tickMs);

    return () => clearInterval(interval);
  }, [drainPerTick, tickMs]);

  useEffect(() => {
    if (health <= 0 && !crashNotified.current) {
      crashNotified.current = true;
      config.onCrash?.(buildSnapshot(health, maxHealth, drainPerTick));
    }

    if (health > 0 && crashNotified.current) {
      crashNotified.current = false;
    }
  }, [drainPerTick, health, maxHealth, config]);

  const applyDamage = useCallback((amount: number) => {
    const damage = Math.abs(amount);
    setHealth((current) => Math.max(0, current - damage));
  }, []);

  const restoreHealth = useCallback(
    (amount: number) => {
      const healing = Math.abs(amount);
      setHealth((current) => Math.min(maxHealth, current + healing));
    },
    [maxHealth],
  );

  const resetHealth = useCallback(
    (value?: number) => {
      crashNotified.current = false;
      setHealth(value ?? maxHealth);
    },
    [maxHealth],
  );

  return {
    health,
    status,
    crashed: status === "crashed",
    maxHealth,
    drainPerTick,
    applyDamage,
    restoreHealth,
    resetHealth,
  };
};
