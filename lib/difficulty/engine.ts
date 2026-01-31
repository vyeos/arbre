type DifficultyProfile = {
  label: "Initiate" | "Adept" | "Veteran" | "Elite" | "Mythic";
  drainMultiplier: number;
  rewardMultiplier: number;
};

export const calculateDifficulty = ({
  rank,
  bugTier,
}: {
  rank: number;
  bugTier: string;
}): DifficultyProfile => {
  const tierBonus = bugTier === "logic" ? 0.15 : bugTier === "runtime" ? 0.1 : 0.05;
  const normalizedRank = Math.max(1, rank);

  if (normalizedRank < 5) {
    return { label: "Initiate", drainMultiplier: 1 + tierBonus, rewardMultiplier: 1.0 };
  }
  if (normalizedRank < 10) {
    return { label: "Adept", drainMultiplier: 1.1 + tierBonus, rewardMultiplier: 1.08 };
  }
  if (normalizedRank < 20) {
    return { label: "Veteran", drainMultiplier: 1.2 + tierBonus, rewardMultiplier: 1.15 };
  }
  if (normalizedRank < 30) {
    return { label: "Elite", drainMultiplier: 1.35 + tierBonus, rewardMultiplier: 1.25 };
  }

  return { label: "Mythic", drainMultiplier: 1.5 + tierBonus, rewardMultiplier: 1.4 };
};
