import { create } from "zustand";

export type Wallet = {
  bytes: number;
  focus: number;
  commits: number;
  gold: number;
};

const emptyWallet: Wallet = { bytes: 0, focus: 0, commits: 0, gold: 0 };

type PlayerState = {
  wallet: Wallet;
  setWallet: (wallet: Wallet) => void;
  updateWallet: (partial: Partial<Wallet>) => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  wallet: emptyWallet,
  setWallet: (wallet) => set({ wallet }),
  updateWallet: (partial) =>
    set((state) => ({
      wallet: { ...state.wallet, ...partial },
    })),
}));

export const playerStoreDefaults = {
  emptyWallet,
};
