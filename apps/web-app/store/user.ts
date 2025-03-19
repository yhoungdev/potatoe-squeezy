import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserData {
  id: number;
  githubId: string;
  username: string;
  email: string | null;
  name: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface WalletData {
  id: number;
  userId: number;
  address: string;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  users: UserData | null;
  wallets: WalletData | null;
  isAuthenticated: boolean;
  setUserData: (data: { users: UserData; wallets: WalletData }) => void;
  updateWallet: (wallet: WalletData) => void;
  clearUserData: () => void;
}

const initialState = {
  users: null,
  wallets: null,
  isAuthenticated: false,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,

      setUserData: (data) =>
        set({
          users: data.users,
          wallets: data.wallets,
          isAuthenticated: true,
        }),

      updateWallet: (wallet) => set((state) => ({ ...state, wallets: wallet })),

      clearUserData: () => set(initialState),
    }),
    {
      name: "user-storage",
    },
  ),
);
