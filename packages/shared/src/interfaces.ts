export interface IGithubUserData {
  provider_id: string;
  user_name: string;
  email: string;
  avatar_url: string;
}

export interface IPotatoeUser {
  id: number;
  githubId: string;
  username: string;
  email: string | null;
  name: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  twitterUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IWallet {
  id: number;
  userId: number;
  chain: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPotatoeUserData {
  users: IPotatoeUser;
  wallets: IWallet;
}
