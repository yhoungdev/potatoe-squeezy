import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { bounties } from '../db/schema';

export interface EscrowService {
  lockFunds(bountyId: string, amount: number): Promise<string>;
  releaseFunds(bountyId: string, recipientAddress: string): Promise<string>;
  refundFunds(bountyId: string, creatorAddress: string): Promise<string>;
}

type Network = 'solana' | 'stellar';

const toNumber = (value: unknown) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return 0;
};

class BaseEscrowService implements EscrowService {
  private network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  async lockFunds(bountyId: string, amount: number): Promise<string> {
    return db.transaction(async (tx) => {
      const lockResult = await tx.execute(
        sql`select id, network, status, escrow_tx_hash from bounties where id = ${bountyId} for update`,
      );
      const bounty = lockResult.rows[0] as
        | {
            id: string;
            network: string;
            status: string;
            escrow_tx_hash: string | null;
          }
        | undefined;

      if (!bounty) {
        throw new Error('Bounty not found');
      }

      if (bounty.network !== this.network) {
        throw new Error('Invalid network for bounty');
      }

      if (bounty.escrow_tx_hash) {
        return bounty.escrow_tx_hash;
      }

      if (bounty.status !== 'pending') {
        throw new Error('Bounty cannot be opened before escrow lock');
      }

      const txHash = await this.performLock(amount);

      await tx
        .update(bounties)
        .set({
          escrowTxHash: txHash,
          status: 'open',
        })
        .where(eq(bounties.id, bountyId));

      return txHash;
    });
  }

  async releaseFunds(
    bountyId: string,
    recipientAddress: string,
  ): Promise<string> {
    return db.transaction(async (tx) => {
      const lockResult = await tx.execute(
        sql`select id, network, status, payout_tx_hash, escrow_tx_hash, amount from bounties where id = ${bountyId} for update`,
      );
      const bounty = lockResult.rows[0] as
        | {
            id: string;
            network: string;
            status: string;
            payout_tx_hash: string | null;
            escrow_tx_hash: string | null;
            amount: string | number;
          }
        | undefined;

      if (!bounty) {
        throw new Error('Bounty not found');
      }

      if (bounty.network !== this.network) {
        throw new Error('Invalid network for bounty');
      }

      if (bounty.payout_tx_hash) {
        return bounty.payout_tx_hash;
      }

      if (bounty.status !== 'open' || !bounty.escrow_tx_hash) {
        throw new Error('Bounty is not eligible for payout');
      }

      const txHash = await this.performRelease(
        recipientAddress,
        toNumber(bounty.amount),
      );

      const updated = await tx
        .update(bounties)
        .set({
          payoutTxHash: txHash,
          status: 'completed',
        })
        .where(
          and(
            eq(bounties.id, bountyId),
            eq(bounties.status, 'open'),
            sql`${bounties.payoutTxHash} is null`,
          ),
        )
        .returning({ payoutTxHash: bounties.payoutTxHash });

      if (!updated[0]?.payoutTxHash) {
        const current = await tx
          .select({ payoutTxHash: bounties.payoutTxHash })
          .from(bounties)
          .where(eq(bounties.id, bountyId));

        if (current[0]?.payoutTxHash) {
          return current[0].payoutTxHash;
        }

        throw new Error('Payout state update failed');
      }

      return updated[0].payoutTxHash;
    });
  }

  async refundFunds(bountyId: string, creatorAddress: string): Promise<string> {
    return db.transaction(async (tx) => {
      const lockResult = await tx.execute(
        sql`select id, network, status, payout_tx_hash, refund_tx_hash, amount from bounties where id = ${bountyId} for update`,
      );
      const bounty = lockResult.rows[0] as
        | {
            id: string;
            network: string;
            status: string;
            payout_tx_hash: string | null;
            refund_tx_hash: string | null;
            amount: string | number;
          }
        | undefined;

      if (!bounty) {
        throw new Error('Bounty not found');
      }

      if (bounty.network !== this.network) {
        throw new Error('Invalid network for bounty');
      }

      if (bounty.refund_tx_hash) {
        return bounty.refund_tx_hash;
      }

      if (bounty.status !== 'open' || bounty.payout_tx_hash) {
        throw new Error('Bounty is not eligible for refund');
      }

      const txHash = await this.performRefund(
        creatorAddress,
        toNumber(bounty.amount),
      );

      const updated = await tx
        .update(bounties)
        .set({
          refundTxHash: txHash,
          status: 'cancelled',
        })
        .where(
          and(
            eq(bounties.id, bountyId),
            eq(bounties.status, 'open'),
            sql`${bounties.payoutTxHash} is null`,
            sql`${bounties.refundTxHash} is null`,
          ),
        )
        .returning({ refundTxHash: bounties.refundTxHash });

      if (!updated[0]?.refundTxHash) {
        const current = await tx
          .select({ refundTxHash: bounties.refundTxHash })
          .from(bounties)
          .where(eq(bounties.id, bountyId));

        if (current[0]?.refundTxHash) {
          return current[0].refundTxHash;
        }

        throw new Error('Refund state update failed');
      }

      return updated[0].refundTxHash;
    });
  }

  protected async performLock(amount: number): Promise<string> {
    return `${this.network}-lock-${amount}-${crypto.randomUUID()}`;
  }

  protected async performRelease(
    recipientAddress: string,
    amount: number,
  ): Promise<string> {
    return `${this.network}-release-${recipientAddress}-${amount}-${crypto.randomUUID()}`;
  }

  protected async performRefund(
    creatorAddress: string,
    amount: number,
  ): Promise<string> {
    return `${this.network}-refund-${creatorAddress}-${amount}-${crypto.randomUUID()}`;
  }
}

export class SolanaEscrowService extends BaseEscrowService {
  constructor() {
    super('solana');
  }
}

export class StellarEscrowService extends BaseEscrowService {
  constructor() {
    super('stellar');
  }
}

export const getEscrowService = (network: string): EscrowService => {
  if (network === 'solana') {
    return new SolanaEscrowService();
  }

  if (network === 'stellar') {
    return new StellarEscrowService();
  }

  throw new Error('Unsupported network');
};
