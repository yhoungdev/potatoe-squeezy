import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export type Network = 'mainnet' | 'devnet';

export class SolanaService {
  private connection: Connection;
  private token: Token;

  constructor(network: Network) {
    const rpcUrl = network === 'mainnet' 
      ? process.env.SOLANA_RPC_URL 
      : process.env.SOLANA_DEVNET_RPC_URL;
    
    if (!rpcUrl) {
      throw new Error(`Missing Solana RPC URL for ${network}`);
    }

    this.connection = new Connection(rpcUrl);
  }

  async createPaymentTransaction(
    fromWallet: PublicKey,
    toWallet: PublicKey,
    amount: number,
    tokenMint?: PublicKey
  ): Promise<Transaction> {
    const transaction = new Transaction();

    if (tokenMint) {
      // USDC or other SPL token transfer
      const fromTokenAccount = await this.token.getAccountInfo(fromWallet);
      const toTokenAccount = await this.token.getAccountInfo(toWallet);

      transaction.add(
        this.token.transfer(
          fromTokenAccount,
          toTokenAccount,
          fromWallet,
          amount
        )
      );
    } else {
      // SOL transfer
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: fromWallet,
          toPubkey: toWallet,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
    }

    return transaction;
  }

  async verifyTransaction(signature: string): Promise<boolean> {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      return status.value?.confirmationStatus === 'confirmed';
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return false;
    }
  }

  async getBalance(wallet: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(wallet);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }
} 