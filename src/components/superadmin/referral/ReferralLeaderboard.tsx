import { useState } from "react";
import { FaTrophy, FaTh, FaList, FaUser } from "react-icons/fa";
import type { LeaderboardEntry } from "../../../types/referral";
import { Button, Card, CardBody, Badge, Spinner, Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from "../../../design-system";

const TIMEFRAMES = [
  { value: "all", label: "All Time" },
  { value: "monthly", label: "This Month" },
  { value: "weekly", label: "This Week" },
] as const;

interface ReferralLeaderboardProps {
  data: LeaderboardEntry[];
  loading: boolean;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
}

const rankColor = (rank: number) => {
  if (rank === 1) return "#FFD700";
  if (rank === 2) return "#C0C0C0";
  if (rank === 3) return "#CD7F32";
  return undefined;
};

export const ReferralLeaderboard = ({
  data, loading, timeframe, onTimeframeChange,
}: ReferralLeaderboardProps) => {
  const [viewMode, setViewMode] = useState<"card" | "table">("table");

  return (
    <Card variant="outlined">
      <CardBody>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
            <FaTrophy className="w-4 h-4" style={{ color: "var(--color-primary-500)" }} />
            Top Referrers
            <Badge variant="subtle" colorScheme="info" size="sm">{data.length}</Badge>
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 flex-wrap">
              {TIMEFRAMES.map((tf) => (
                <Button
                  key={tf.value}
                  type="button"
                  onClick={() => onTimeframeChange(tf.value)}
                  variant={timeframe === tf.value ? "outline" : "ghost"}
                  size="sm"
                >
                  {tf.label}
                </Button>
              ))}
            </div>
            <div className="flex rounded-lg p-0.5 shrink-0" style={{ background: "var(--color-control-bg)" }}>
              <Button
                onClick={() => setViewMode("card")}
                variant={viewMode === "card" ? "outline" : "ghost"}
                size="sm"
              >
                <FaTh className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </Button>
              <Button
                onClick={() => setViewMode("table")}
                variant={viewMode === "table" ? "outline" : "ghost"}
                size="sm"
              >
                <FaList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8" style={{ color: "var(--color-muted-text)" }}>
            <FaTrophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No referrers found</p>
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.map((entry, idx) => (
              <Card key={entry.referrerId} variant="outlined">
                <CardBody>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: rankColor(idx) ? `${rankColor(idx)}33` : "var(--color-control-bg)",
                          color: rankColor(idx) || "var(--color-secondary-text)",
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{entry.fullName}</span>
                    </div>
                    <Badge variant="subtle" colorScheme="info" size="sm">{entry.referralCode}</Badge>
                  </div>
                  <p className="text-lg font-bold" style={{ color: "var(--color-text)" }}>GHS {entry.commissionsEarned.toFixed(2)}</p>
                  <div className="flex gap-4 mt-1.5 text-xs" style={{ color: "var(--color-muted-text)" }}>
                    <span>{entry.totalOrders} orders</span>
                    <span>{entry.totalReferred} referred</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table variant="striped" size="sm">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>#</TableHeaderCell>
                  <TableHeaderCell>Agent</TableHeaderCell>
                  <TableHeaderCell>Code</TableHeaderCell>
                  <TableHeaderCell>Commission Earned</TableHeaderCell>
                  <TableHeaderCell>Orders</TableHeaderCell>
                  <TableHeaderCell>Referred</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((entry, idx) => (
                  <TableRow key={entry.referrerId}>
                    <TableCell>
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: rankColor(idx) ? `${rankColor(idx)}33` : "transparent",
                          color: rankColor(idx) || "var(--color-secondary-text)",
                        }}
                      >
                        {idx + 1}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FaUser className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--color-muted-text)" }} />
                        <span style={{ color: "var(--color-text)" }}>{entry.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="subtle" colorScheme="info" size="sm">{entry.referralCode}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold" style={{ color: "var(--color-success-icon)" }}>
                      +GHS {entry.commissionsEarned.toFixed(2)}
                    </TableCell>
                    <TableCell>{entry.totalOrders}</TableCell>
                    <TableCell>{entry.totalReferred}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
