import { useEffect, useMemo, useState } from 'react';
import DefaultDashboard from '@/layouts/dashboard';
import ApiClient from '@/util/api';
import API_ENDPOINTS from '@/enums/API_ENUM';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@tanstack/react-router';

type LeaderboardBadge = {
  id: string;
  name: string;
  description: string;
};

type LeaderboardRow = {
  rank: number;
  userId: number;
  username: string;
  avatarUrl: string | null;
  totalPoints: number;
  totalEarnedUSD: number;
  mergedPRCount: number;
  consecutiveDays: number;
  difficultySum: number;
  badges: LeaderboardBadge[];
};

const medalByRank: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

const tableHeader = [
  'Rank',
  'Developer',
  'Points',
  'Earnings',
  'Badges',
] as const;

function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800 bg-black/30">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-gray-800 text-gray-400">
            {tableHeader.map((item) => (
              <th key={item} className="px-4 py-3 font-medium">
                {item}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.userId}-${row.rank}`} className="border-b border-gray-900">
              <td className="px-4 py-3 font-semibold text-white">
                {medalByRank[row.rank] ?? `#${row.rank}`}
              </td>
              <td className="px-4 py-3">
                <Link
                  to="/app/dev/$username"
                  params={{ username: row.username }}
                  className="flex items-center gap-3"
                >
                  <img
                    src={row.avatarUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}
                    className="object-cover w-8 h-8 rounded-full"
                  />
                  <span className="font-medium text-white">{row.username}</span>
                </Link>
              </td>
              <td className="px-4 py-3 text-white">{row.totalPoints.toFixed(2)}</td>
              <td className="px-4 py-3 text-white">${row.totalEarnedUSD.toFixed(2)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {row.badges.slice(0, 3).map((badge) => (
                    <span
                      key={badge.id}
                      className="px-2 py-1 text-xs font-medium rounded-md bg-gray-800 text-gray-200"
                    >
                      {badge.name}
                    </span>
                  ))}
                  {row.badges.length === 0 && (
                    <span className="text-xs text-gray-500">No badges</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeaderboardPage() {
  const [globalRows, setGlobalRows] = useState<LeaderboardRow[]>([]);
  const [weeklyRows, setWeeklyRows] = useState<LeaderboardRow[]>([]);
  const [streakRows, setStreakRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [global, weekly, streaks] = await Promise.all([
          ApiClient.get<LeaderboardRow[]>(API_ENDPOINTS.LEADERBOARD_GLOBAL),
          ApiClient.get<LeaderboardRow[]>(API_ENDPOINTS.LEADERBOARD_WEEKLY),
          ApiClient.get<LeaderboardRow[]>(API_ENDPOINTS.LEADERBOARD_STREAKS),
        ]);

        setGlobalRows(global);
        setWeeklyRows(weekly);
        setStreakRows(streaks);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const emptyState = useMemo(
    () => (
      <div className="py-16 text-center border border-gray-800 rounded-xl bg-black/20 text-gray-400">
        No leaderboard data yet
      </div>
    ),
    [],
  );

  return (
    <DefaultDashboard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Leaderboard</h1>
          <p className="text-sm text-gray-400">Global, weekly, and streak rankings</p>
        </div>

        <Tabs defaultValue="global" className="space-y-4">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            {loading ? emptyState : globalRows.length > 0 ? <LeaderboardTable rows={globalRows} /> : emptyState}
          </TabsContent>

          <TabsContent value="weekly">
            {loading ? emptyState : weeklyRows.length > 0 ? <LeaderboardTable rows={weeklyRows} /> : emptyState}
          </TabsContent>

          <TabsContent value="streaks">
            {loading ? emptyState : streakRows.length > 0 ? <LeaderboardTable rows={streakRows} /> : emptyState}
          </TabsContent>
        </Tabs>
      </div>
    </DefaultDashboard>
  );
}

export default LeaderboardPage;
