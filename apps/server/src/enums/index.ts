enum NOTIFICATION_TYPE {
  NEW_USER = '🎉 A new user has signed up.',
  NEW_MESSAGE = '📩 You have received a new message.',
  TRANSACTION_NOTIFICATION = '💳 Your transaction has been processed successfully.',
  TIP_NOTIFICATION = '💰 You have received a new tip.',
  REMINDER = '⏰ This is a reminder for your upcoming event.',
}

enum NOTIFICATION_STATUS {
  SENT = 'sent',
  FAILED = 'failed',
  PENDING = 'pending',
}

export { NOTIFICATION_TYPE, NOTIFICATION_STATUS };
