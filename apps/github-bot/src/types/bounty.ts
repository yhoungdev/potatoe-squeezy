export type BountyStatus = 'open' | 'claimed' | 'paid' | 'cancelled' | 'expired';

export interface Bounty {
  id: string;
  issueId: number;
  repositoryId: number;
  amount: number;
  currency: string;
  status: BountyStatus;
  createdAt: Date;
  expiresAt?: Date;
  claimedBy?: string;
  paidTo?: string;
  transactionId?: string;
  network: 'mainnet' | 'devnet';
}

export interface BountyCommand {
  amount: number;
  currency: string;
  duration?: number;
  network?: 'mainnet' | 'devnet';
}

export interface WalletLink {
  githubId: string;
  walletAddress: string;
  createdAt: Date;
  verified: boolean;
} 