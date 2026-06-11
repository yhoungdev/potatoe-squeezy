import { Hono } from 'hono';
import { db } from '../db';
import { addresses, transactionRecords, users } from '../db/schema';
import { desc, eq, or, sql } from 'drizzle-orm';
import { validateSolanaAddress } from '@potatoe/shared';
import { broadcastNotification } from '../services/realtime-notifications';
import type { Env } from '../types/env';
import type { User } from '../types';
import communicationChannel from '../services/communication';
import { TELEGRAM_CHAT_ID } from '../constants';
import { sendTelegramMessage } from '../utils/telegram-notification';

const txRecordsRoute = new Hono<{
  Bindings: Env;
  Variables: {
    user: User | null;
  };
}>();

type SettlementSender = {
  email: string | null;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
};

type SettlementRecipient = {
  email: string | null;
  name: string | null;
  username: string | null;
};

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

const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeSenderType = (value: unknown) => {
  if (value === 'human' || value === 'agent') {
    return value;
  }

  return null;
};

const normalizePaymentProtocol = (value: unknown) => {
  if (value === 'wallet' || value === 'x402' || value === 'mpp') {
    return value;
  }

  return null;
};

const normalizeUrl = (value: unknown) => {
  const raw = normalizeOptionalText(value);

  if (!raw) {
    return null;
  }

  try {
    return new URL(raw).toString();
  } catch {
    return null;
  }
};

const normalizeOptionalInteger = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const getPrimaryAddressForUser = async (userId: number) => {
  const addressMatch = await db
    .select({ address: addresses.address })
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .limit(1);

  if (addressMatch[0]?.address) {
    return addressMatch[0].address;
  }

  const userMatch = await db
    .select({ walletAddress: users.walletAddress })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return userMatch[0]?.walletAddress ?? null;
};

const findUserByUsername = async (username: string) => {
  const userMatch = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return userMatch[0] ?? null;
};

const getAgentSettlementSecret = () =>
  normalizeOptionalText(process.env.AGENT_SETTLEMENT_SECRET);

const isAuthorizedAgentSettlement = (c: {
  req: {
    header: (name: string) => string | undefined;
  };
}) => {
  const expectedSecret = getAgentSettlementSecret();

  if (!expectedSecret) {
    return { ok: false as const, reason: 'disabled' as const };
  }

  const providedSecret =
    normalizeOptionalText(c.req.header('x-agent-settlement-secret')) ??
    normalizeOptionalText(c.req.header('x-settlement-secret'));

  if (!providedSecret || providedSecret !== expectedSecret) {
    return { ok: false as const, reason: 'unauthorized' as const };
  }

  return { ok: true as const };
};

const buildFallbackSender = (record: typeof transactionRecords.$inferSelect) =>
  record.senderName
    ? {
        email: null,
        name: record.senderName,
        username: record.senderName,
        avatarUrl: record.senderAvatarUrl ?? null,
      }
    : null;

const notifyRecipientOfTip = async ({
  record,
  senderUser,
  recipientUser,
}: {
  record: typeof transactionRecords.$inferSelect;
  senderUser: SettlementSender | null;
  recipientUser: SettlementRecipient | null;
}) => {
  if (!record.recipientId) {
    return;
  }

  const sender = senderUser ?? buildFallbackSender(record);

  broadcastNotification(record.recipientId, {
    id: record.id,
    title: 'Wallet funded',
    message: `You received ${record.amount} SOL in your wallet.`,
    amount: String(record.amount),
    senderAddress: record.senderAddress,
    recipientAddress: record.recipientAddress,
    txHash: record.txHash ?? null,
    createdAt: record.createdAt,
    sender,
  });

  if (recipientUser?.email) {
    void communicationChannel
      .sendTipReceivedEmail({
        recipient: recipientUser,
        sender,
        amount: String(record.amount),
        txHash: record.txHash ?? null,
        note: record.note ?? null,
      })
      .catch((error) => {
        console.error('Failed to send tip email:', error);
      });
  }
};

const insertTransactionRecord = async ({
  amount,
  senderAddress,
  senderId,
  senderType,
  senderName,
  senderAvatarUrl,
  paymentProtocol,
  recipientAddress,
  recipientId,
  txHash,
  note,
}: {
  amount: unknown;
  senderAddress: string;
  senderId: number | null;
  senderType: 'human' | 'agent' | null;
  senderName: string | null;
  senderAvatarUrl: string | null;
  paymentProtocol: 'wallet' | 'x402' | 'mpp';
  recipientAddress: string;
  recipientId: number | null;
  txHash: unknown;
  note: unknown;
}) => {
  const newRecord = await db
    .insert(transactionRecords)
    .values({
      amount,
      senderAddress,
      senderId,
      senderType,
      senderName,
      senderAvatarUrl,
      paymentProtocol,
      recipientAddress,
      recipientId,
      txHash: typeof txHash === 'string' ? txHash : null,
      note:
        typeof note === 'string' && note.trim().length > 0 ? note.trim() : null,
    })
    .returning();

  return newRecord[0];
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
        senderType: transactionRecords.senderType,
        senderName: transactionRecords.senderName,
        senderAvatarUrl: transactionRecords.senderAvatarUrl,
        paymentProtocol: transactionRecords.paymentProtocol,
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
        identityKey: sql<string>`coalesce(cast(${transactionRecords.senderId} as text), ${transactionRecords.senderAddress})`,
        userId: users.id,
        username: sql<string>`coalesce(${users.username}, ${transactionRecords.senderName}, concat('wallet:', left(${transactionRecords.senderAddress}, 4), '...', right(${transactionRecords.senderAddress}, 4)))`,
        profileUsername: users.username,
        displayName: sql<
          string | null
        >`coalesce(${users.displayName}, ${transactionRecords.senderName})`,
        avatarUrl: sql<
          string | null
        >`coalesce(${users.avatarUrl}, ${transactionRecords.senderAvatarUrl})`,
        senderType: sql<string>`coalesce(${transactionRecords.senderType}, 'human')`,
        senderAddress: transactionRecords.senderAddress,
        totalAmount: sql<string>`coalesce(sum(${transactionRecords.amount}), 0)`,
        tipCount: sql<number>`cast(count(*) as int)`,
        lastTippedAt: sql<Date | null>`max(${transactionRecords.createdAt})`,
      })
      .from(transactionRecords)
      .leftJoin(users, eq(users.id, transactionRecords.senderId))
      .where(eq(transactionRecords.recipientId, user.id))
      .groupBy(
        users.id,
        users.username,
        users.displayName,
        users.avatarUrl,
        transactionRecords.senderId,
        transactionRecords.senderAddress,
        transactionRecords.senderName,
        transactionRecords.senderAvatarUrl,
        transactionRecords.senderType,
      )
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

txRecordsRoute.post('/agent-settlements', async (c) => {
  try {
    const auth = isAuthorizedAgentSettlement(c);

    if (!auth.ok) {
      return c.json(
        {
          error:
            auth.reason === 'disabled'
              ? 'Agent settlement callbacks are disabled'
              : 'Unauthorized agent settlement callback',
        },
        auth.reason === 'disabled' ? 503 : 401,
      );
    }

    const {
      amount,
      senderAddress,
      senderName,
      senderAvatarUrl,
      recipientId,
      recipientUsername,
      recipientAddress,
      txHash,
      note,
      paymentProtocol,
    } = await c.req.json();

    const normalizedSenderName = normalizeOptionalText(senderName);
    const normalizedSenderAvatarUrl = normalizeUrl(senderAvatarUrl);
    const normalizedRecipientUsername =
      normalizeOptionalText(recipientUsername);
    const normalizedRecipientId = normalizeOptionalInteger(recipientId);
    const normalizedPaymentProtocol = normalizePaymentProtocol(paymentProtocol);
    const normalizedRecipientAddress = normalizeOptionalText(recipientAddress);

    if (!amount || !senderAddress) {
      return c.json({ error: 'Amount and sender address are required' }, 400);
    }

    if (!validateSolanaAddress(senderAddress)) {
      return c.json({ error: 'Invalid Solana sender wallet address' }, 400);
    }

    if (!normalizedSenderName) {
      return c.json(
        { error: 'Sender name is required for agent settlements' },
        400,
      );
    }

    if (normalizedSenderName.length > 80) {
      return c.json(
        { error: 'Sender name must be 80 characters or fewer' },
        400,
      );
    }

    if (
      senderAvatarUrl !== undefined &&
      senderAvatarUrl !== null &&
      normalizedSenderAvatarUrl === null
    ) {
      return c.json({ error: 'Sender avatar URL must be a valid URL' }, 400);
    }

    if (!normalizedPaymentProtocol || normalizedPaymentProtocol === 'wallet') {
      return c.json(
        { error: 'Agent settlements must use paymentProtocol x402 or mpp' },
        400,
      );
    }

    if (
      normalizedRecipientId === null &&
      !normalizedRecipientUsername &&
      !normalizedRecipientAddress
    ) {
      return c.json(
        {
          error:
            'Provide recipientId, recipientUsername, or recipientAddress for agent settlements',
        },
        400,
      );
    }

    if (
      normalizedRecipientAddress &&
      !validateSolanaAddress(normalizedRecipientAddress)
    ) {
      return c.json({ error: 'Invalid Solana recipient wallet address' }, 400);
    }

    let resolvedRecipientId = normalizedRecipientId;
    let recipientUser: SettlementRecipient | null = null;

    if (normalizedRecipientUsername) {
      const matchedUser = await findUserByUsername(normalizedRecipientUsername);

      if (!matchedUser) {
        return c.json({ error: 'Recipient username not found' }, 404);
      }

      resolvedRecipientId = matchedUser.id;
      recipientUser = {
        email: matchedUser.email,
        name: matchedUser.name,
        username: matchedUser.username,
      };
    }

    if (resolvedRecipientId && !recipientUser) {
      const recipientRows = await db
        .select({
          email: users.email,
          name: users.name,
          username: users.username,
        })
        .from(users)
        .where(eq(users.id, resolvedRecipientId))
        .limit(1);

      if (!recipientRows[0]) {
        return c.json({ error: 'Recipient user not found' }, 404);
      }

      recipientUser = recipientRows[0];
    }

    const resolvedRecipientAddress =
      normalizedRecipientAddress ??
      (resolvedRecipientId
        ? await getPrimaryAddressForUser(resolvedRecipientId)
        : null);

    if (!resolvedRecipientAddress) {
      return c.json(
        { error: 'Recipient does not have a payout wallet configured' },
        400,
      );
    }

    if (!validateSolanaAddress(resolvedRecipientAddress)) {
      return c.json(
        { error: 'Resolved recipient wallet address is invalid' },
        400,
      );
    }

    if (!resolvedRecipientId) {
      resolvedRecipientId = await findUserIdByAddress(resolvedRecipientAddress);
    }

    const senderId = await findUserIdByAddress(senderAddress);
    const record = await insertTransactionRecord({
      amount,
      senderAddress,
      senderId,
      senderType: senderId ? 'human' : 'agent',
      senderName: senderId ? null : normalizedSenderName,
      senderAvatarUrl: senderId ? null : normalizedSenderAvatarUrl,
      paymentProtocol: normalizedPaymentProtocol,
      recipientAddress: resolvedRecipientAddress,
      recipientId: resolvedRecipientId,
      txHash,
      note,
    });

    const senderUser = senderId
      ? ((
          await db
            .select({
              email: users.email,
              name: users.name,
              username: users.username,
              avatarUrl: users.avatarUrl,
            })
            .from(users)
            .where(eq(users.id, senderId))
            .limit(1)
        )[0] ?? null)
      : null;

    await notifyRecipientOfTip({
      record,
      senderUser,
      recipientUser,
    });

    return c.json({
      ...record,
      recipientUsername: recipientUser?.username ?? null,
      settlement: {
        protocol: normalizedPaymentProtocol,
        callback: true,
      },
    });
  } catch (error) {
    console.error('Error creating agent settlement record:', error);
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
      senderType,
      senderName,
      senderAvatarUrl,
      paymentProtocol,
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
    const normalizedSenderType = normalizeSenderType(senderType);
    const normalizedSenderName = normalizeOptionalText(senderName);
    const normalizedSenderAvatarUrl = normalizeUrl(senderAvatarUrl);
    const normalizedPaymentProtocol = normalizePaymentProtocol(paymentProtocol);

    if (
      senderType !== undefined &&
      senderType !== null &&
      normalizedSenderType === null
    ) {
      return c.json(
        { error: 'Sender type must be either human or agent' },
        400,
      );
    }

    if (
      paymentProtocol !== undefined &&
      paymentProtocol !== null &&
      normalizedPaymentProtocol === null
    ) {
      return c.json(
        { error: 'Payment protocol must be wallet, x402, or mpp' },
        400,
      );
    }

    if (
      senderName !== undefined &&
      senderName !== null &&
      normalizedSenderName === null
    ) {
      return c.json({ error: 'Sender name cannot be empty' }, 400);
    }

    if (normalizedSenderName && normalizedSenderName.length > 80) {
      return c.json(
        { error: 'Sender name must be 80 characters or fewer' },
        400,
      );
    }

    if (
      senderAvatarUrl !== undefined &&
      senderAvatarUrl !== null &&
      normalizedSenderAvatarUrl === null
    ) {
      return c.json({ error: 'Sender avatar URL must be a valid URL' }, 400);
    }

    const newRecord = await insertTransactionRecord({
      amount,
      senderAddress,
      senderId: resolvedSenderId,
      senderType: resolvedSenderId
        ? 'human'
        : (normalizedSenderType ?? (normalizedSenderName ? 'agent' : null)),
      senderName: resolvedSenderId ? null : normalizedSenderName,
      senderAvatarUrl: resolvedSenderId ? null : normalizedSenderAvatarUrl,
      paymentProtocol: normalizedPaymentProtocol ?? 'wallet',
      recipientAddress,
      recipientId: resolvedRecipientId,
      txHash,
      note,
    });

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

      console.log(" Checking notification for new transaction record: ", newRecord);
    await sendTelegramMessage(TELEGRAM_CHAT_ID, "New transaction record created: ");

    await notifyRecipientOfTip({
      record: newRecord,
      senderUser: senderUser[0] ?? null,
      recipientUser: recipientUser[0] ?? null,
    });

    return c.json(newRecord);
  } catch (error) {
    console.error('Error creating transaction record:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default txRecordsRoute;
