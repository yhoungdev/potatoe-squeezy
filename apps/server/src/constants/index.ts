export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const DATABASE_URL = process.env.DATABASE_URL!;
export const GITHUB_CALLBACK_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://potatoe-app-production.up.railway.app/auth/callback'
    : 'http://localhost:3000/auth/callback';
export const FRONTEND_APP_URL = process.env.FRONTEND_APP_URL!;
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
export const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
