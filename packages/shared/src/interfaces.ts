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
  name: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface IWallet {
  id: number;
  userId: number;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPotatoeUserData {
  users: IPotatoeUser;
  wallets: IWallet;
}
