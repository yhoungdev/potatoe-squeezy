import { Hono } from 'hono';
import { db } from '../db';
import { addresses, transactionRecords, users } from '../db/schema';
import { desc, eq, or, sql } from 'drizzle-orm';
import { validateSolanaAddress } from '@potatoe/shared';
import { broadcastNotification } from '../services/realtime-notifications';
import type { Env } from '../types/env';
import type { User } from '../types';
import communicationChannel from '../services/communication';

const txRecordsRoute = new Hono<{
  Bindings: Env;
  Variables: {
    user: User | null;
  };
}>();

const findUserIdByAddress = async (address: string) => {
  const addressMatch = await db
    .select({ userId: addresses.userId })
    .from(addresses)
    .where(eq(addresses.address, address))
    .limit(1);

  if (addressMatch[0]?.userId) {
    return addressMatch[0].userId;
  }

  const userMatch = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.walletAddress, address))
    .limit(1);

  return userMatch[0]?.id ?? null;
};

txRecordsRoute.get('/', async (c) => {
  try {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const records = await db
      .select({
        id: transactionRecords.id,
        amount: transactionRecords.amount,
        senderAddress: transactionRecords.senderAddress,
        senderId: transactionRecords.senderId,
        recipientAddress: transactionRecords.recipientAddress,
        recipientId: transactionRecords.recipientId,
        txHash: transactionRecords.txHash,
        note: transactionRecords.note,
        createdAt: transactionRecords.createdAt,
        sender: {
          username: users.username,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(transactionRecords)
      .leftJoin(users, eq(users.id, transactionRecords.senderId))
      .where(
        or(
          eq(transactionRecords.senderId, user.id),
          eq(transactionRecords.recipientId, user.id),
        ),
      )
      .orderBy(desc(transactionRecords.createdAt))
      .limit(50);

    return c.json(records);
  } catch (error) {
    console.error('Error fetching transaction records:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

txRecordsRoute.get('/tippers', async (c) => {
  try {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const rows = await db
      .select({
        userId: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        totalAmount: sql<string>`coalesce(sum(${transactionRecords.amount}), 0)`,
        tipCount: sql<number>`cast(count(*) as int)`,
        lastTippedAt: sql<Date | null>`max(${transactionRecords.createdAt})`,
      })
      .from(transactionRecords)
      .innerJoin(users, eq(users.id, transactionRecords.senderId))
      .where(eq(transactionRecords.recipientId, user.id))
      .groupBy(users.id, users.username, users.displayName, users.avatarUrl)
      .orderBy(
        desc(sql`coalesce(sum(${transactionRecords.amount}), 0)`),
        desc(sql`max(${transactionRecords.createdAt})`),
      )
      .limit(20);

    return c.json(rows);
  } catch (error) {
    console.error('Error fetching tippers:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

txRecordsRoute.post('/', async (c) => {
  try {
    const authUser = c.get('user');
    const {
      amount,
      senderAddress,
      senderId,
      recipientAddress,
      recipientId,
      txHash,
      note,
    } = await c.req.json();

    if (!amount || !senderAddress || !recipientAddress) {
      return c.json(
        {
          error: 'Amount, sender address, and recipient address are required',
        },
        400,
      );
    }

    if (
      !validateSolanaAddress(senderAddress) ||
      !validateSolanaAddress(recipientAddress)
    ) {
      return c.json({ error: 'Invalid Solana wallet address' }, 400);
    }

    const resolvedSenderId =
      authUser?.id ?? senderId ?? (await findUserIdByAddress(senderAddress));
    const resolvedRecipientId =
      recipientId ?? (await findUserIdByAddress(recipientAddress));

    const newRecord = await db
      .insert(transactionRecords)
      .values({
        amount,
        senderAddress,
        senderId: resolvedSenderId,
        recipientAddress,
        recipientId: resolvedRecipientId,
        txHash: typeof txHash === 'string' ? txHash : null,
        note:
          typeof note === 'string' && note.trim().length > 0
            ? note.trim()
            : null,
      })
      .returning();

    const senderUser = resolvedSenderId
      ? await db
          .select({
            email: users.email,
            name: users.name,
            username: users.username,
            avatarUrl: users.avatarUrl,
          })
          .from(users)
          .where(eq(users.id, resolvedSenderId))
          .limit(1)
      : [];

    const recipientUser = resolvedRecipientId
      ? await db
          .select({
            email: users.email,
            name: users.name,
            username: users.username,
          })
          .from(users)
          .where(eq(users.id, resolvedRecipientId))
          .limit(1)
      : [];

    if (resolvedRecipientId) {
      broadcastNotification(resolvedRecipientId, {
        id: newRecord[0].id,
        title: 'Wallet funded',
        message: `You received ${newRecord[0].amount} SOL in your wallet.`,
        amount: String(newRecord[0].amount),
        senderAddress: newRecord[0].senderAddress,
        recipientAddress: newRecord[0].recipientAddress,
        txHash: newRecord[0].txHash ?? null,
        createdAt: newRecord[0].createdAt,
        sender: senderUser[0] ?? null,
      });

      if (recipientUser[0]?.email) {
        void communicationChannel
          .sendTipReceivedEmail({
            recipient: recipientUser[0],
            sender: senderUser[0] ?? null,
            amount: String(newRecord[0].amount),
            txHash: newRecord[0].txHash ?? null,
            note: newRecord[0].note ?? null,
          })
          .catch((error) => {
            console.error('Failed to send tip email:', error);
          });
      }
    }

    return c.json(newRecord[0]);
  } catch (error) {
    console.error('Error creating transaction record:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default txRecordsRoute;
