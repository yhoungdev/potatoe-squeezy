import { Telegraf } from 'telegraf';
import { TELEGRAM_BOT_TOKEN } from '../constants';

const globalForBot = global as unknown as {
  telegram_bot: Telegraf | undefined;
  isBotLaunched: boolean;
};

const telegram_bot =
  globalForBot.telegram_bot || new Telegraf(TELEGRAM_BOT_TOKEN);

if (process.env.NODE_ENV !== 'production') {
  globalForBot.telegram_bot = telegram_bot;
}

const launchBot = async () => {
  if (process.env.DISABLE_TELEGRAM_BOT === 'true') {
    console.log('Telegram bot launch skipped (DISABLE_TELEGRAM_BOT=true)');
    return;
  }

  if (!globalForBot.isBotLaunched) {
    try {
      await telegram_bot.telegram.deleteWebhook({ drop_pending_updates: true });

      await telegram_bot.launch();
      globalForBot.isBotLaunched = true;
      console.log('Telegram bot launched successfully!');
    } catch (error: any) {
      if (error.response?.error_code === 409) {
        console.warn(
          'Telegram bot conflict (another instance is polling). Skipping local launch.',
        );
        globalForBot.isBotLaunched = true;
      } else {
        console.error('Failed to launch Telegram bot:', error);
      }
    }

    const stopBot = (signal: string) => {
      if (globalForBot.isBotLaunched) {
        telegram_bot.stop(signal);
        globalForBot.isBotLaunched = false;
        console.log(`Telegram bot stopped (${signal})`);
      }
    };

    process.once('SIGINT', () => stopBot('SIGINT'));
    process.once('SIGTERM', () => stopBot('SIGTERM'));
  }
};

export { telegram_bot, launchBot };
