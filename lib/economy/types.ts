export type CurrencyKind = "bytes" | "focus" | "commits";

export type RewardContext = {
  bugTier: string;
  performance: number;
  modifiers?: {
    combo?: number;
    critical?: boolean;
    flawless?: boolean;
  };
};

export type RewardResult = {
  bytes: number;
  focus: number;
  commits: number;
};
