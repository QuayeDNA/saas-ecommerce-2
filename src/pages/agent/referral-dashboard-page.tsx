import { useState, useEffect } from "react";
import { referralService } from "../../services/referral.service";
import type { ReferralDashboard, LeaderboardEntry, ReferralTreeNode } from "../../types/referral";

export const ReferralDashboardPage = () => {
  const [dashboard, setDashboard] = useState<ReferralDashboard | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tree, setTree] = useState<ReferralTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "all">("monthly");
  const [treeDepth] = useState(3);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [dash, board, referralTree] = await Promise.all([
          referralService.getDashboard(),
          referralService.getLeaderboard(timeframe),
          referralService.getReferralTree(treeDepth),
        ]);
        setDashboard(dash);
        setLeaderboard(board);
        setTree(referralTree);
      } catch (err) {
        console.error("Failed to load referral data", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [timeframe, treeDepth]);

  if (loading) return <div className="p-6">Loading referral dashboard...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Referral Dashboard</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">Referral Dashboard</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(dashboard, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">
          Leaderboard ({timeframe})
        </h2>
        <div className="flex gap-2 mb-2">
          {(["weekly", "monthly", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded text-sm ${
                timeframe === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(leaderboard, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Referral Tree</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(tree, null, 2)}
        </pre>
      </section>
    </div>
  );
};

export default ReferralDashboardPage;
