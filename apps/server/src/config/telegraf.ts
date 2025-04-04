import { Telegraf } from 'telegraf';
import { TELEGRAM_BOT_TOKEN } from '../constants';

const telegram_bot = new Telegraf(TELEGRAM_BOT_TOKEN);

let isBotLaunched = false;

const launchBot = async () => {
  if (!isBotLaunched) {
    try {
      await telegram_bot.launch();
      isBotLaunched = true;
      console.log('✅ Telegram bot launched successfully!');
    } catch (error) {
      console.error('🚫 Failed to launch Telegram bot:', error);
    }

    process.once('SIGINT', () => telegram_bot.stop('SIGINT'));
    process.once('SIGTERM', () => telegram_bot.stop('SIGTERM'));
  }
};

export { telegram_bot, launchBot };
