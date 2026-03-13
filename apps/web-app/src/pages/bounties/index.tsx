import { useEffect, useState } from 'react';
import DefaultDashboard from '@/layouts/dashboard';
import ApiClient from '@/util/api';
import API_ENDPOINTS from '@/enums/API_ENUM';

type Bounty = {
  id: string;
  repo: string;
  issueNumber: number;
  amount: string;
  token: string;
  network: string;
  status: string;
  mergedContributions: number;
  creatorUsername: string;
  creatorAvatarUrl: string | null;
  createdAt: string;
};

function BountyExplorerPage() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const rows = await ApiClient.get<Bounty[]>(`${API_ENDPOINTS.BOUNTIES}?status=open&limit=50`);
        setBounties(rows);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <DefaultDashboard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Bounty Explorer</h1>
          <p className="text-sm text-gray-400">Open escrowed bounties across Solana and Stellar</p>
        </div>

        {loading && (
          <div className="py-16 text-center border border-gray-800 rounded-xl bg-black/20 text-gray-400">
            Loading bounties
          </div>
        )}

        {!loading && bounties.length === 0 && (
          <div className="py-16 text-center border border-gray-800 rounded-xl bg-black/20 text-gray-400">
            No open bounties found
          </div>
        )}

        <div className="grid gap-4">
          {bounties.map((bounty) => (
            <a
              key={bounty.id}
              href={`https://github.com/${bounty.repo}/issues/${bounty.issueNumber}`}
              target="_blank"
              rel="noreferrer"
              className="p-4 border rounded-xl border-gray-800 bg-black/30 hover:border-gray-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">{bounty.repo}</p>
                  <h2 className="text-lg font-medium text-white">Issue #{bounty.issueNumber}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <img
                      src={bounty.creatorAvatarUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}
                      className="w-5 h-5 rounded-full"
                    />
                    <span>{bounty.creatorUsername}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-white">
                    {bounty.amount} {bounty.token}
                  </p>
                  <p className="text-xs text-gray-400 uppercase">{bounty.network}</p>
                  <p className="text-xs text-gray-500">
                    {bounty.mergedContributions} merged contribution
                    {bounty.mergedContributions === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </DefaultDashboard>
  );
}

export default BountyExplorerPage;
