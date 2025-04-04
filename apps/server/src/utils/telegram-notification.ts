import { telegram_bot } from '../config/telegraf';

const sendTelegramMessage = async (chatId: string, message: string) => {
  try {
    await telegram_bot.telegram.sendMessage(chatId, message);
  } catch (error) {
    console.error(`Failed to send message to chat ${chatId}:`, error);
  }
};

const sendTelegramNotification = async (chatId: string, message: string) => {
  try {
    await telegram_bot.telegram.sendMessage(chatId, message, {
      parse_mode: 'MarkdownV2',
    });
  } catch (error) {
    console.error(`Failed to send notification to chat ${chatId}:`, error);
  }
};

export { sendTelegramNotification, sendTelegramMessage };
