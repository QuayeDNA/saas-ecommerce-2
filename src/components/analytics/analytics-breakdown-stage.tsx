import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from "recharts";
import { Card, CardBody, CardHeader, Skeleton } from "../../design-system";
import { formatCurrency, formatNumber } from "./analytics-formatters";

interface UserTypeBreakdown {
    agents: number;
    super_agents: number;
    dealers: number;
    super_dealers: number;
    super_admins: number;
}

interface OrderTypeLeader {
    orderType: string;
    count: number;
    revenue: number;
}

interface AnalyticsBreakdownStageProps {
    loading: boolean;
    userTypeBreakdown: UserTypeBreakdown;
    orderTypeLeaders: OrderTypeLeader[];
}

export function AnalyticsBreakdownStage({
    loading,
    userTypeBreakdown,
    orderTypeLeaders,
}: AnalyticsBreakdownStageProps) {
    const chartColors = [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#6366f1",
    ];

    const userTypesData = [
        { name: "Agents", value: userTypeBreakdown.agents, color: chartColors[0], fill: chartColors[0] },
        { name: "Super Agents", value: userTypeBreakdown.super_agents, color: chartColors[1], fill: chartColors[1] },
        { name: "Dealers", value: userTypeBreakdown.dealers, color: chartColors[2], fill: chartColors[2] },
        { name: "Super Dealers", value: userTypeBreakdown.super_dealers, color: chartColors[3], fill: chartColors[3] },
        { name: "Super Admins", value: userTypeBreakdown.super_admins, color: chartColors[4], fill: chartColors[4] },
    ];

    const barData = orderTypeLeaders.map((item) => ({
        category: item.orderType.replace(/_/g, " "),
        orders: item.count,
        revenue: item.revenue,
    }));

    const maxLeaderCount = Math.max(...orderTypeLeaders.map((item) => item.count), 1);

    return (
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <Card className="rounded-3xl p-4 sm:p-5">
                <CardHeader className="pb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">User Type Distribution</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Distribution of users across platform roles.
                    </p>
                </CardHeader>

                <CardBody>
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton variant="rectangular" height="18rem" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="h-[18rem] w-full min-w-0 min-h-[18rem]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                                    <PieChart>
                                        <Pie
                                            data={userTypesData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={4}
                                            cornerRadius={12}
                                        />
                                        <Tooltip
                                            formatter={(value, _name, item) => {
                                                const numericValue = Number(value ?? 0);
                                                const userType = String(item?.payload?.name ?? "Users");
                                                return [formatNumber(numericValue), userType] as [string, string];
                                            }}
                                            contentStyle={{
                                                borderRadius: 12,
                                                borderColor: "rgba(148, 163, 184, 0.25)",
                                                backgroundColor: "#ffffff",
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {userTypesData.map((item) => (
                                    <div key={item.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                                                <p className="text-xs text-slate-500">{formatNumber(item.value)} users</p>
                                            </div>
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>

            <Card className="rounded-3xl p-4 sm:p-5">
                <CardHeader className="pb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">Order Type Performance</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Order volume and revenue by order category.
                    </p>
                </CardHeader>

                <CardBody className="space-y-4">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="space-y-2">
                                <Skeleton width="150px" height="0.875rem" />
                                <Skeleton variant="rectangular" height="0.5rem" />
                            </div>
                        ))
                    ) : orderTypeLeaders.length === 0 ? (
                        <p className="text-sm text-slate-500">No order type data available for this period.</p>
                    ) : (
                        <div className="space-y-4">
                            <div className="h-[22rem] w-full min-w-0 min-h-[22rem]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                                    <BarChart data={barData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <XAxis
                                            dataKey="category"
                                            tick={{ fill: "#475569", fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                            interval={0}
                                        />
                                        <YAxis
                                            tickFormatter={(value: number | string) => formatNumber(Number(value))}
                                            tick={{ fill: "#475569", fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            formatter={(value, name) => {
                                                const numericValue = Number(value ?? 0);
                                                const seriesName = String(name ?? "").toLowerCase();
                                                if (seriesName === "revenue") {
                                                    return [formatCurrency(numericValue), "Revenue"] as [string, string];
                                                }
                                                return [formatNumber(numericValue), "Orders"] as [string, string];
                                            }}
                                            contentStyle={{
                                                borderRadius: 12,
                                                borderColor: "rgba(148, 163, 184, 0.25)",
                                                backgroundColor: "#ffffff",
                                            }}
                                        />
                                        <Legend wrapperStyle={{ paddingBottom: 8, fontSize: 12 }} />
                                        <Bar dataKey="orders" name="Orders" fill="#3b82f6" radius={[12, 12, 0, 0]} />
                                        <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[12, 12, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="grid gap-3">
                                {orderTypeLeaders.map((row) => {
                                    const ratio = (row.count / maxLeaderCount) * 100;

                                    return (
                                        <div key={row.orderType} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 capitalize">
                                                        {row.orderType.replace(/_/g, " ")}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {formatNumber(row.count)} orders • {formatCurrency(row.revenue)}
                                                    </p>
                                                </div>
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                    {Math.round(ratio)}%
                                                </span>
                                            </div>
                                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                                <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.max(8, ratio)}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>
        </section>
    );
}
