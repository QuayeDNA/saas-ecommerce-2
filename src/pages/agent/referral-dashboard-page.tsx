import { useState, useEffect } from "react";
import { referralService } from "../../services/referral.service";
import type { ReferralTreeNode } from "../../types/referral";
import { ReferralTree } from "./referral-tree";

export const ReferralDashboardPage = () => {
  const [tree, setTree] = useState<ReferralTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [treeDepth] = useState(3);
  const [treeLoading, setTreeLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setTreeLoading(true);
      try {
        const referralTree = await referralService.getReferralTree(treeDepth);
        setTree(referralTree);
      } catch (err) {
        console.error("Failed to load referral data", err);
      } finally {
        setLoading(false);
        setTreeLoading(false);
      }
    };
    fetch();
  }, [treeDepth]);

  if (loading) return <div className="p-6">Loading referral dashboard...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Referral Dashboard</h1>

      <ReferralTree tree={tree} loading={treeLoading} />
    </div>
  );
};

export default ReferralDashboardPage;
