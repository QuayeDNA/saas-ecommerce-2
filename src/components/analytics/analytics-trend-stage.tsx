import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Card, CardBody, CardHeader, Select, Skeleton } from "../../design-system";
import { formatCurrency, formatNumber } from "./analytics-formatters";

export type TrendMetric = "revenue" | "orders" | "users" | "commissions";

interface OrderStatusSnapshot {
    completed: number;
    processing: number;
    pending: number;
    confirmed: number;
    failed: number;
    cancelled: number;
    partiallyCompleted: number;
}

interface AnalyticsTrendStageProps {
    loading: boolean;
    labels: string[];
    selectedMetric: TrendMetric;
    onMetricChange: (value: TrendMetric) => void;
    trendSeries: number[];
    orderStatus: OrderStatusSnapshot;
}

const metricOptions = [
    { value: "revenue", label: "Revenue" },
    { value: "orders", label: "Orders" },
    { value: "users", label: "Users" },
    { value: "commissions", label: "Commissions" },
];

const trendLabelMap: Record<TrendMetric, string> = {
    revenue: "Revenue (GHS)",
    orders: "Orders",
    users: "Users",
    commissions: "Commissions (GHS)",
};

export function AnalyticsTrendStage({
    loading,
    labels,
    selectedMetric,
    onMetricChange,
    trendSeries,
    orderStatus,
}: AnalyticsTrendStageProps) {
    const trendData = labels.map((label, index) => ({
        label,
        value: trendSeries[index] ?? 0,
    }));

    const formatTrendValue = (value: number) => {
        if (selectedMetric === "revenue" || selectedMetric === "commissions") {
            return formatCurrency(value);
        }

        return formatNumber(value);
    };

    const statusLabels = [
        "Completed",
        "Processing",
        "Pending",
        "Confirmed",
        "Failed",
        "Cancelled",
        "Partial",
    ];
    const statusValues = [
        orderStatus.completed,
        orderStatus.processing,
        orderStatus.pending,
        orderStatus.confirmed,
        orderStatus.failed,
        orderStatus.cancelled,
        orderStatus.partiallyCompleted,
    ];

    const orderStatusData = statusLabels.map((label, index) => ({
        status: label,
        value: statusValues[index],
    }));

    const totalStatusOrders = statusValues.reduce((sum, value) => sum + value, 0);

    return (
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            <Card className="xl:col-span-2 rounded-3xl p-4 sm:p-5">
                <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base sm:text-lg font-semibold text-slate-900">Performance Trend</h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Compare revenue, orders, users, and commissions over time.
                        </p>
                    </div>
                    <Select
                        value={selectedMetric}
                        onChange={(value) => onMetricChange(value as TrendMetric)}
                        options={metricOptions}
                        className="min-w-[160px] w-full sm:w-auto"
                    />
                </CardHeader>

                <CardBody>
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton width="180px" height="1rem" />
                            <Skeleton variant="rectangular" height="18rem" />
                        </div>
                    ) : (
                        <div className="h-[18rem] w-full min-w-0 min-h-[18rem]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                                <AreaChart data={trendData} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0891b2" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#0891b2" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fill: "#475569", fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        minTickGap={20}
                                    />
                                    <YAxis
                                        tickFormatter={(value: number | string) => formatTrendValue(Number(value))}
                                        tick={{ fill: "#475569", fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        width={70}
                                    />
                                    <Tooltip
                                        formatter={(value) => {
                                            const numericValue = Number(value ?? 0);
                                            return [formatTrendValue(numericValue), trendLabelMap[selectedMetric]] as [string, string];
                                        }}
                                        labelFormatter={(label) => `Period: ${String(label)}`}
                                        contentStyle={{
                                            borderRadius: 12,
                                            borderColor: "rgba(148, 163, 184, 0.25)",
                                            backgroundColor: "#ffffff",
                                        }}
                                    />
                                    <Legend wrapperStyle={{ paddingBottom: 6, fontSize: 12 }} />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        name={trendLabelMap[selectedMetric]}
                                        stroke="#0e7490"
                                        strokeWidth={2.5}
                                        fill="url(#trendFill)"
                                        dot={{ r: 2, fill: "#0e7490" }}
                                        activeDot={{ r: 5 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardBody>
            </Card>

            <Card className="rounded-3xl p-4 sm:p-5">
                <CardHeader className="pb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">Order Status Breakdown</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Distribution of order outcomes for the selected period.
                    </p>
                </CardHeader>

                <CardBody className="space-y-4">
                    {loading ? (
                        <>
                            <Skeleton variant="rectangular" height="14rem" />
                            <Skeleton height="1rem" />
                            <Skeleton height="1rem" />
                        </>
                    ) : (
                        <>
                            <div className="h-[14rem] w-full min-w-0 min-h-[14rem]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                                    <BarChart data={orderStatusData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <XAxis
                                            dataKey="status"
                                            tick={false}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tick={{ fill: "#64748b", fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            formatter={(value) => [formatNumber(Number(value ?? 0)), "Orders"] as [string, string]}
                                            labelFormatter={(label) => `Status: ${String(label)}`}
                                            contentStyle={{
                                                borderRadius: 12,
                                                borderColor: "rgba(148, 163, 184, 0.25)",
                                                backgroundColor: "#ffffff",
                                            }}
                                        />
                                        <Bar dataKey="value" name="Orders" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-3">
                                {statusLabels.map((label, index) => {
                                    const value = statusValues[index];
                                    const ratio = totalStatusOrders > 0 ? (value / totalStatusOrders) * 100 : 0;

                                    return (
                                        <div key={label} className="space-y-2">
                                            <div className="flex items-center justify-between text-xs text-slate-600">
                                                <span>{label}</span>
                                                <span>{value.toLocaleString()} ({ratio.toFixed(1)}%)</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-sky-500"
                                                    style={{ width: `${Math.min(100, ratio)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </CardBody>
            </Card>
        </section>
    );
}
