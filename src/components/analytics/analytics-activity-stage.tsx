import { useMemo, useState } from "react";
import {
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    Select,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from "../../design-system";
import { formatCurrency, formatDateTime, formatNumber } from "./analytics-formatters";

interface ActivityFeedItem {
    id: string;
    type: string;
    message: string;
    createdAt: string;
    value?: number;
}

interface TopAgentItem {
    userId: string;
    fullName: string;
    userType: string;
    orders: number;
    revenue: number;
}

interface TopStorefrontItem {
    storefrontId: string;
    storefrontName: string;
    businessName?: string;
    agentName?: string;
    totalOrders?: number;
    netProfit?: number;
    grossRevenue?: number;
    orders: number;
    revenue: number;
}

interface SelectOption {
    value: string;
    label: string;
}

interface AnalyticsActivityStageProps {
    loading: boolean;
    performanceLoading?: boolean;
    activityFeed: ActivityFeedItem[];
    topAgents: TopAgentItem[];
    topStorefronts?: TopStorefrontItem[];
    performanceTimeframe: string;
    performanceTimeOptions: SelectOption[];
    onPerformanceTimeframeChange: (value: string) => void;
    pendingCommissionAmount: number;
    payoutQueueCount: number;
    netFlow: number;
}

type PerformanceMode = "agents" | "storefronts";

interface PerformerRow {
    id: string;
    primary: string;
    secondary: string;
    orders: number;
    value: number;
}

function getRankStyle(rank: number) {
    if (rank === 1) {
        return {
            label: "Gold",
            badgeClass: "bg-[var(--color-pending-bg)] text-[var(--color-pending-text)] border border-[var(--color-pending-icon)]",
            rowClass: "border-[var(--color-pending-icon)]/30 bg-[var(--color-pending-bg)]",
        };
    }

    if (rank === 2) {
        return {
            label: "Silver",
            badgeClass: "bg-[var(--color-gray-100)] text-[var(--color-gray-900)] border border-[var(--color-gray-200)]",
            rowClass: "border-[var(--color-gray-200)] bg-[var(--color-gray-100)]",
        };
    }

    if (rank === 3) {
        return {
            label: "Bronze",
            badgeClass: "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border border-[var(--color-warning-icon)]",
            rowClass: "border-[var(--color-warning-icon)]/30 bg-[var(--color-warning-bg)]",
        };
    }

    return {
        label: "",
        badgeClass: "bg-[var(--color-gray-100)] text-[var(--color-gray-900)] border border-[var(--color-gray-200)]",
        rowClass: "border-[var(--color-gray-200)] bg-[var(--color-gray-100)]",
    };
}

export function AnalyticsActivityStage({
    loading,
    performanceLoading = false,
    activityFeed,
    topAgents,
    topStorefronts = [],
    performanceTimeframe,
    performanceTimeOptions,
    onPerformanceTimeframeChange,
    pendingCommissionAmount,
    payoutQueueCount,
    netFlow,
}: AnalyticsActivityStageProps) {
    const [performanceMode, setPerformanceMode] = useState<PerformanceMode>("agents");
    const [topPerformersCount, setTopPerformersCount] = useState<number>(5);

    const rankedTopAgents = useMemo(
        () =>
            [...topAgents].sort((a, b) => {
                const orderDiff = (b.orders || 0) - (a.orders || 0);
                if (orderDiff !== 0) {
                    return orderDiff;
                }

                return (b.revenue || 0) - (a.revenue || 0);
            }),
        [topAgents]
    );

    const rankedTopStorefronts = useMemo(
        () =>
            [...topStorefronts].sort((a, b) => {
                const orderDiff = (b.orders || 0) - (a.orders || 0);
                if (orderDiff !== 0) {
                    return orderDiff;
                }

                return (b.revenue || 0) - (a.revenue || 0);
            }),
        [topStorefronts]
    );

    const currentRows = useMemo<PerformerRow[]>(() => {
        if (performanceMode === "storefronts") {
            return rankedTopStorefronts.map((storefront) => ({
                id: storefront.storefrontId,
                primary: storefront.storefrontName,
                secondary: storefront.agentName
                    ? `Owner: ${storefront.agentName}`
                    : storefront.businessName || "Storefront",
                orders: storefront.totalOrders ?? storefront.orders ?? 0,
                value: storefront.netProfit ?? storefront.revenue ?? 0,
            }));
        }

        return rankedTopAgents.map((agent) => ({
            id: agent.userId,
            primary: agent.fullName,
            secondary: String(agent.userType || "user").replace(/_/g, " "),
            orders: agent.orders,
            value: agent.revenue,
        }));
    }, [performanceMode, rankedTopAgents, rankedTopStorefronts]);

    const valueColumnLabel =
        performanceMode === "agents" ? "Revenue" : "Net Profit";

    const ordersColumnLabel =
        performanceMode === "agents" ? "Orders" : "Completed Orders";

    const performanceEmptyText =
        performanceMode === "agents"
            ? "No top agents in this period."
            : "No storefront performance in this period.";

    const isPerformanceLoading = performanceLoading || loading;

    return (
        <section className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
            <Card className="xl:col-span-2 p-4 sm:p-5">
                <CardHeader className="pb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">Recent Activity</h3>
                    <p className="text-xs sm:text-sm text-[var(--color-muted-text)] mt-1">
                        Latest events across users, orders, payouts, and commissions.
                    </p>
                </CardHeader>

                <CardBody>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="space-y-2">
                                    <Skeleton width="70%" height="0.95rem" />
                                    <Skeleton width="45%" height="0.8rem" />
                                </div>
                            ))}
                        </div>
                    ) : activityFeed.length === 0 ? (
                        <p className="text-sm text-[var(--color-secondary-text)]">No recent activity available.</p>
                    ) : (
                        <div className="space-y-3">
                            {activityFeed.slice(0, 10).map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 flex items-start justify-between gap-3"
                                >
                                    <div className="space-y-1 min-w-0">
                                        <p className="text-sm font-medium text-[var(--color-text)]">{item.message}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="subtle" colorScheme="info" className="text-[10px] uppercase">
                                                {item.type.replace(/_/g, " ")}
                                            </Badge>
                                            <p className="text-xs text-[var(--color-secondary-text)]">{formatDateTime(item.createdAt)}</p>
                                        </div>
                                    </div>
                                    {typeof item.value === "number" ? (
                                        <p className="text-xs font-semibold text-[var(--color-text)] shrink-0">
                                            {formatCurrency(item.value)}
                                        </p>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            <div>
                <Card className="rounded-3xl p-4 sm:p-5">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col gap-4 sm:items-start sm:justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">Performance Leaderboard</h3>
                                    <Badge variant="subtle" colorScheme="info">
                                        {performanceMode === "agents" ? "Agents" : "Storefronts"}
                                    </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-[var(--color-muted-text)] mt-1">
                                    Track the top performers for both agents and storefronts.
                                </p>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2 min-w-[180px]">
                                <Select
                                    value={performanceTimeframe}
                                    onChange={onPerformanceTimeframeChange}
                                    options={performanceTimeOptions}
                                />
                                <Select
                                    value={topPerformersCount.toString()}
                                    onChange={(value) => setTopPerformersCount(Number(value))}
                                    options={[
                                        { value: "5", label: "Top 5" },
                                        { value: "10", label: "Top 10" },
                                        { value: "1000", label: "All" },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant={performanceMode === "agents" ? "primary" : "outline"}
                                className="min-w-[110px]"
                                onClick={() => setPerformanceMode("agents")}
                            >
                                Agents
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={performanceMode === "storefronts" ? "primary" : "outline"}
                                className="min-w-[110px]"
                                onClick={() => setPerformanceMode("storefronts")}
                            >
                                Storefronts
                            </Button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        {isPerformanceLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: topPerformersCount }).map((_, index) => (
                                    <Skeleton key={index} height="3rem" />
                                ))}
                            </div>
                        ) : currentRows.length === 0 ? (
                            <p className="text-sm text-[var(--color-secondary-text)]">{performanceEmptyText}</p>
                        ) : (
                            <>
                                <div className="space-y-3 sm:hidden">
                                    {currentRows.slice(0, topPerformersCount).map((row, index) => {
                                        const rank = index + 1;
                                        const rankStyle = getRankStyle(rank);

                                        return (
                                            <article
                                                key={row.id}
                                                className={`rounded-3xl border p-4 ${rankStyle.rowClass}`}
                                            >
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-gray-100)] text-sm font-semibold text-[var(--color-text)]">
                                                            {rank}
                                                        </span>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-[var(--color-text)] truncate">{row.primary}</p>
                                                            <p className="text-xs text-[var(--color-secondary-text)] truncate">{row.secondary}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1 text-right">
                                                        <span className="text-sm font-semibold text-[var(--color-text)]">{formatCurrency(row.value)}</span>
                                                        <span className="text-xs text-[var(--color-secondary-text)]">{ordersColumnLabel}: {formatNumber(row.orders)}</span>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>

                                <div className="hidden sm:block overflow-x-auto">
                                    <Table className="min-w-full">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHeaderCell>Rank</TableHeaderCell>
                                                <TableHeaderCell>Name</TableHeaderCell>
                                                <TableHeaderCell>{ordersColumnLabel}</TableHeaderCell>
                                                <TableHeaderCell>{valueColumnLabel}</TableHeaderCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentRows.slice(0, topPerformersCount).map((row, index) => {
                                                const rank = index + 1;
                                                const rankStyle = getRankStyle(rank);

                                                return (
                                                    <TableRow key={row.id} className={rankStyle.rowClass}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-gray-100)] text-sm font-semibold text-[var(--color-text)]">
                                                                    {rank}
                                                                </span>
                                                                {rankStyle.label ? (
                                                                    <Badge
                                                                        variant="solid"
                                                                        colorScheme={rank === 1 ? "warning" : rank === 2 ? "gray" : "info"}
                                                                        className="text-[11px]"
                                                                    >
                                                                        {rankStyle.label}
                                                                    </Badge>
                                                                ) : null}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold text-[var(--color-text)] truncate">{row.primary}</p>
                                                                <p className="text-xs text-[var(--color-secondary-text)] truncate">{row.secondary}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{formatNumber(row.orders)}</TableCell>
                                                        <TableCell>{formatCurrency(row.value)}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </CardBody>
                </Card>
            </div>
            <Card className="p-4 sm:p-5">
                <CardHeader className="pb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">Financial Summary</h3>
                </CardHeader>

                <CardBody className="space-y-3 text-sm">
                    {loading ? (
                        <>
                            <Skeleton height="1rem" />
                            <Skeleton height="1rem" />
                            <Skeleton height="1rem" />
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[var(--color-secondary-text)]">Pending commission</span>
                                <span className="font-semibold text-[var(--color-text)]">
                                    {formatCurrency(pendingCommissionAmount)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[var(--color-secondary-text)]">Payout queue</span>
                                <span className="font-semibold text-[var(--color-text)]">
                                    {formatNumber(payoutQueueCount)} requests
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[var(--color-secondary-text)]">Period net flow</span>
                                <span className="font-semibold text-[var(--color-text)]">{formatCurrency(netFlow)}</span>
                            </div>
                        </>
                    )}
                </CardBody>
            </Card>
        </section>
    );
}
