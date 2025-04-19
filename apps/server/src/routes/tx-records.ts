import { Hono } from 'hono';
import { db } from '../db';
import { transactionRecords, users } from '../db/schema';
import { desc, eq } from 'drizzle-orm';

const txRecordsRoute = new Hono();

txRecordsRoute.get('/', async (c) => {
  try {
    const records = await db
      .select({
        id: transactionRecords.id,
        amount: transactionRecords.amount,
        senderAddress: transactionRecords.senderAddress,
        recipientAddress: transactionRecords.recipientAddress,
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
    const { amount, senderAddress, senderId, recipientAddress, recipientId } = await c.req.json();

    if (!amount || !senderAddress || !recipientAddress) {
      return c.json({ 
        error: 'Amount, sender address, and recipient address are required' 
      }, 400);
    }

    const newRecord = await db
      .insert(transactionRecords)
      .values({
        amount,
        senderAddress,
        senderId,
        recipientAddress,
        recipientId,
      })
      .returning();

    return c.json(newRecord[0]);
  } catch (error) {
    console.error('Error creating transaction record:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default txRecordsRoute;