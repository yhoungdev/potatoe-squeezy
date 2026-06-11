import { Hono } from 'hono';
import { and, desc, eq, gt, inArray, or } from 'drizzle-orm';
import { db } from '../db';
import { addresses, transactionRecords, users } from '../db/schema';
import type { Env } from '../types/env';
import type { User } from '../types';

const notificationsRoute = new Hono<{
  Bindings: Env;
  Variables: {
    user: User | null;
  };
}>();

notificationsRoute.get('/', async (c) => {
  try {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userWallets = await db
      .select({ address: addresses.address })
      .from(addresses)
      .where(eq(addresses.userId, user.id));

    const walletAddresses = userWallets.map((wallet) => wallet.address);
    const recipientCondition = or(
      eq(transactionRecords.recipientId, user.id),
      walletAddresses.length > 0
        ? inArray(transactionRecords.recipientAddress, walletAddresses)
        : eq(transactionRecords.recipientId, user.id),
    );
    const visibilityCondition = user.notificationsClearedAt
      ? and(
          recipientCondition,
          gt(transactionRecords.createdAt, user.notificationsClearedAt),
        )
      : recipientCondition;

    const rows = await db
      .select({
        id: transactionRecords.id,
        amount: transactionRecords.amount,
        senderAddress: transactionRecords.senderAddress,
        recipientAddress: transactionRecords.recipientAddress,
        txHash: transactionRecords.txHash,
        createdAt: transactionRecords.createdAt,
        sender: {
          username: users.username,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(transactionRecords)
      .leftJoin(users, eq(users.id, transactionRecords.senderId))
      .where(visibilityCondition)
      .orderBy(desc(transactionRecords.createdAt))
      .limit(20);

    const notifications = rows.map((row) => ({
      id: row.id,
      title: 'Wallet funded',
      message: `You received ${row.amount} SOL in your wallet.`,
      amount: row.amount,
      senderAddress: row.senderAddress,
      recipientAddress: row.recipientAddress,
      txHash: row.txHash,
      createdAt: row.createdAt,
      sender: row.sender,
    }));

    return c.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

notificationsRoute.delete('/', async (c) => {
  try {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const clearedAt = new Date();

    const updated = await db
      .update(users)
      .set({
        notificationsClearedAt: clearedAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning({
        notificationsClearedAt: users.notificationsClearedAt,
      });

    return c.json({
      success: true,
      notificationsClearedAt: updated[0]?.notificationsClearedAt ?? clearedAt,
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default notificationsRoute;
