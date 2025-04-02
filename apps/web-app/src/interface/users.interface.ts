interface IPotatoeUser {
  id: number;
  githubId: string;
  username: string;
  email: string | null;
  name: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface IWallet {
  id: number;
  userId: number;
  address: string;
  createdAt: string;
  updatedAt: string;
}

interface IPotatoeUserData {
  users: IPotatoeUser;
  wallets: IWallet;
}

export type { IPotatoeUser, IWallet, IPotatoeUserData };
