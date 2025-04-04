import { Telegraf } from 'telegraf';
import { TELEGRAM_BOT_TOKEN } from '../constants';

const telegram_bot = new Telegraf(TELEGRAM_BOT_TOKEN);

export { telegram_bot };
