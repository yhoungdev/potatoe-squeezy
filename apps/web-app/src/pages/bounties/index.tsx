import { useEffect, useState } from "react";
import DefaultDashboard from "@/layouts/dashboard";
import ApiClient from "@/util/api";
import API_ENDPOINTS from "@/enums/API_ENUM";
import { RefreshCw } from "lucide-react";

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

  const fetchBounties = async () => {
    setLoading(true);
    try {
      const rows = await ApiClient.get<Bounty[]>(
        `${API_ENDPOINTS.BOUNTIES}?limit=50`,
      );
      setBounties(rows);
    } catch (error) {
      console.error("Failed to fetch bounties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBounties();
  }, []);

  return (
    <DefaultDashboard>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Bounty Explorer
            </h1>
            <p className="text-sm text-gray-400">
              Verified bounty issues recognized automatically by Potatoe Squeezy
              Bot
            </p>
          </div>
        </div>

        {loading && (
          <div className="py-16 text-center border border-gray-800 rounded-xl bg-black/20 text-gray-400">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
            Loading bounties
          </div>
        )}

        {!loading && bounties.length === 0 && (
          <div className="py-16 text-center border border-gray-800 rounded-xl bg-black/20 text-gray-400">
            No verified bot-backed bounties found yet.
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-400">{bounty.repo}</p>
                    {bounty.status === "pending" && (
                      <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider text-yellow-500 uppercase bg-yellow-500/10 rounded-full border border-yellow-500/20">
                        Pending Escrow
                      </span>
                    )}
                    {bounty.status === "open" && (
                      <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider text-green-500 uppercase bg-green-500/10 rounded-full border border-green-500/20">
                        Open
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-medium text-white">
                    Issue #{bounty.issueNumber}
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <img
                        src={
                          bounty.creatorAvatarUrl ||
                          "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                        }
                        className="w-5 h-5 rounded-full"
                        alt={bounty.creatorUsername}
                      />
                      <span>{bounty.creatorUsername}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-400/10 rounded-full border border-gray-400/20">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Potatoe Bot Verified
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-white">
                    {bounty.amount} {bounty.token}
                  </p>
                  <p className="text-xs text-gray-400 uppercase">
                    {bounty.network}
                  </p>
                  <p className="text-xs text-gray-500">
                    {bounty.mergedContributions} merged contribution
                    {bounty.mergedContributions === 1 ? "" : "s"}
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
