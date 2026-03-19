type NotificationSocket = {
  send: (data: string) => void;
};

type RealtimeNotificationPayload = {
  id: number;
  title: string;
  message: string;
  amount: string;
  senderAddress: string;
  recipientAddress: string;
  txHash: string | null;
  createdAt: Date | string | null;
  sender: {
    username: string | null;
    avatarUrl: string | null;
  } | null;
};

const socketsByUserId = new Map<number, Set<NotificationSocket>>();

export const addNotificationSocket = (
  userId: number,
  socket: NotificationSocket,
) => {
  const sockets = socketsByUserId.get(userId) ?? new Set<NotificationSocket>();
  sockets.add(socket);
  socketsByUserId.set(userId, sockets);
};

export const removeNotificationSocket = (
  userId: number,
  socket: NotificationSocket,
) => {
  const sockets = socketsByUserId.get(userId);

  if (!sockets) {
    return;
  }

  sockets.delete(socket);

  if (sockets.size === 0) {
    socketsByUserId.delete(userId);
  }
};

export const broadcastNotification = (
  userId: number,
  notification: RealtimeNotificationPayload,
) => {
  const sockets = socketsByUserId.get(userId);

  if (!sockets || sockets.size === 0) {
    return;
  }

  const message = JSON.stringify({
    type: 'notification.created',
    notification: {
      ...notification,
      createdAt: notification.createdAt
        ? new Date(notification.createdAt).toISOString()
        : null,
    },
  });

  for (const socket of sockets) {
    try {
      socket.send(message);
    } catch (error) {
      console.error('Failed to send realtime notification:', error);
    }
  }
};
