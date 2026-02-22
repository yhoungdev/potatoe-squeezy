import { Hono } from 'hono';
import { LeaderboardService } from '../services/leaderboard';

const leaderboardRoute = new Hono();
const leaderboardService = new LeaderboardService();

const parseLimit = (value: string | undefined, fallback = 20) => {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(Math.trunc(parsed), 1), 100);
};

leaderboardRoute.get('/global', async (c) => {
  const limit = parseLimit(c.req.query('limit'));
  const data = await leaderboardService.getGlobalLeaderboard(limit);
  return c.json(data);
});

leaderboardRoute.get('/weekly', async (c) => {
  const limit = parseLimit(c.req.query('limit'));
  const data = await leaderboardService.getWeeklyLeaderboard(limit);
  return c.json(data);
});

leaderboardRoute.get('/streaks', async (c) => {
  const limit = parseLimit(c.req.query('limit'));
  const data = await leaderboardService.getStreakLeaderboard(limit);
  return c.json(data);
});

export default leaderboardRoute;
