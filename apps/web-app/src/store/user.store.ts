import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface Wallet {
  id: number;
  userId: number;
  chain: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  githubId: string;
  username: string;
  email: string | null;
  name: string | null;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  user: User | null;
  authUser: any | null;
  wallet: Wallet | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  setAuthUser: (user: any) => void;
  setWallet: (wallet: Wallet | null) => void;
  clearUser: () => void;
  setLoading: (status: boolean) => void;
  updateWalletAddress: (address: string) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        authUser: null,
        wallet: null,
        isLoading: false,
        setUser: (user) => set({ user }, false, "setUser"),
        setAuthUser: (authUser) => set({ authUser }, false, "setAuthUser"),
        setWallet: (wallet) => set({ wallet }, false, "setWallet"),
        clearUser: () =>
          set({ user: null, authUser: null, wallet: null }, false, "clearUser"),
        setLoading: (status) => set({ isLoading: status }, false, "setLoading"),
        updateWalletAddress: (address: string) =>
          set(
            (state) => ({
              wallet: state.wallet
                ? {
                    ...state.wallet,
                    address,
                    updatedAt: new Date().toISOString(),
                  }
                : null,
            }),
            false,
            "updateWalletAddress",
          ),
      }),
      {
        name: "user-storage",
        partialize: (state) => ({
          user: state.user,
          authUser: state.authUser,
          wallet: state.wallet,
        }),
      },
    ),
    {
      name: "UserStore",
      enabled: import.meta.env.NODE_ENV === "development",
    },
  ),
);
