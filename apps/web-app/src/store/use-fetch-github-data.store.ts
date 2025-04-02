import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface GithubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  email: string | null;
  bio: string | null;
}

interface GithubDataState {
  githubUser: GithubUser | null;
  setGithubUser: (user: GithubUser) => void;
  clearGithubUser: () => void;
}

export const useFetchGithubDataStore = create<GithubDataState>()(
  devtools(
    persist(
      (set) => ({
        githubUser: null,
        setGithubUser: (user) =>
          set({ githubUser: user }, false, "setGithubUser"),
        clearGithubUser: () =>
          set({ githubUser: null }, false, "clearGithubUser"),
      }),
      {
        name: "github-user-storage",
        partialize: (state) => ({
          githubUser: state.githubUser,
        }),
      },
    ),
    {
      name: "FetchGithubDataStore",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);
