import { Hono } from 'hono';
import { db } from '../db';
import { addresses, transactionRecords, users } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { validateSolanaAddress } from '@potatoe/shared';
import { broadcastNotification } from '../services/realtime-notifications';

const txRecordsRoute = new Hono();

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
      .orderBy(desc(transactionRecords.createdAt))
      .limit(50);

    return c.json(records);
  } catch (error) {
    console.error('Error fetching transaction records:', error);
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
            username: users.username,
            avatarUrl: users.avatarUrl,
          })
          .from(users)
          .where(eq(users.id, resolvedSenderId))
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
    }

    return c.json(newRecord[0]);
  } catch (error) {
    console.error('Error creating transaction record:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default txRecordsRoute;
