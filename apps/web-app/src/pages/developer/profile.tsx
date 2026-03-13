import { useEffect, useState } from 'react';
import DefaultDashboard from '@/layouts/dashboard';
import ApiClient from '@/util/api';

type ProfileResponse = {
  user: {
    id: number;
    username: string;
    avatarUrl: string | null;
    walletAddress: string | null;
    network: string | null;
    createdAt: string;
  };
  stats: {
    totalEarnedUSD: string;
    totalTipsUSD: string;
    bountiesCompleted: number;
    consecutiveDays: number;
    totalPoints: string;
    updatedAt: string | null;
  };
  badges: {
    id: string;
    name: string;
    description: string;
    earnedAt: string;
  }[];
  recentContributions: {
    id: string;
    prNumber: number;
    merged: boolean;
    difficulty: number;
    repo: string;
    issueNumber: number;
    amount: string;
    token: string;
    network: string;
    createdAt: string;
  }[];
  createdBounties: {
    id: string;
    repo: string;
    issueNumber: number;
    amount: string;
    token: string;
    network: string;
    status: string;
    createdAt: string;
  }[];
  earnedNetworks: string[];
};

function DeveloperProfilePage({ username }: { username: string }) {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const result = await ApiClient.get<ProfileResponse>(`/users/${username}/profile`);
        setData(result);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [username]);

  return (
    <DefaultDashboard>
      {loading && (
        <div className="py-16 text-center border border-gray-800 rounded-xl bg-black/20 text-gray-400">
          Loading profile
        </div>
      )}

      {!loading && !data && (
        <div className="py-16 text-center border border-gray-800 rounded-xl bg-black/20 text-gray-400">
          Profile not found
        </div>
      )}

      {!loading && data && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={data.user.avatarUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-semibold text-white">{data.user.username}</h1>
              <p className="text-sm text-gray-400">
                {data.user.network || 'network not set'}
                {data.user.walletAddress ? ` · ${data.user.walletAddress}` : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="p-4 border rounded-xl border-gray-800 bg-black/30">
              <p className="text-xs text-gray-400">Total Points</p>
              <p className="text-xl font-semibold text-white">{Number(data.stats.totalPoints).toFixed(2)}</p>
            </div>
            <div className="p-4 border rounded-xl border-gray-800 bg-black/30">
              <p className="text-xs text-gray-400">Total Earned</p>
              <p className="text-xl font-semibold text-white">${Number(data.stats.totalEarnedUSD).toFixed(2)}</p>
            </div>
            <div className="p-4 border rounded-xl border-gray-800 bg-black/30">
              <p className="text-xs text-gray-400">Merged Bounties</p>
              <p className="text-xl font-semibold text-white">{data.stats.bountiesCompleted}</p>
            </div>
            <div className="p-4 border rounded-xl border-gray-800 bg-black/30">
              <p className="text-xs text-gray-400">Current Streak</p>
              <p className="text-xl font-semibold text-white">{data.stats.consecutiveDays}</p>
            </div>
          </div>

          <div className="p-4 border rounded-xl border-gray-800 bg-black/30">
            <h2 className="mb-3 text-lg font-medium text-white">Badges</h2>
            <div className="flex flex-wrap gap-2">
              {data.badges.length === 0 && <p className="text-sm text-gray-500">No badges earned yet</p>}
              {data.badges.map((badge) => (
                <div key={badge.id} className="px-3 py-2 text-sm rounded-md bg-gray-800 text-gray-100">
                  {badge.name}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border rounded-xl border-gray-800 bg-black/30">
            <h2 className="mb-3 text-lg font-medium text-white">Recent Contributions</h2>
            <div className="space-y-2">
              {data.recentContributions.length === 0 && (
                <p className="text-sm text-gray-500">No contributions yet</p>
              )}
              {data.recentContributions.map((contribution) => (
                <a
                  key={contribution.id}
                  href={`https://github.com/${contribution.repo}/pull/${contribution.prNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3 rounded-lg bg-black/40 hover:bg-black/60"
                >
                  <p className="text-sm text-white">
                    {contribution.repo} · PR #{contribution.prNumber}
                  </p>
                  <p className="text-xs text-gray-400">
                    {contribution.amount} {contribution.token} · {contribution.network}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </DefaultDashboard>
  );
}

export default DeveloperProfilePage;
