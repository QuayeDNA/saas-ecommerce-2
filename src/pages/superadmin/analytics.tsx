import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  FaChartLine,
  FaUsers,
  FaShoppingCart,
  FaWallet,
  FaMoneyBillWave,
  FaStore,
  FaDownload,
  FaRedo,
} from "react-icons/fa";
import {
  AnalyticsActivityStage,
  AnalyticsBreakdownStage,
  AnalyticsCommandCenter,
  AnalyticsInsightsStage,
  AnalyticsKpiGrid,
  AnalyticsPageSkeleton,
  AnalyticsTrendStage,
} from "../../components/analytics";
import type { TrendMetric } from "../../components/analytics/analytics-trend-stage";
import { analyticsService, type AnalyticsData } from "../../services/analytics.service";
import {
  formatCurrency,
  formatNumber,
  growthText,
} from "../../components/analytics/analytics-formatters";
import {
  Button,
  Card,
  CardBody,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../design-system";

const TIME_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "365d", label: "Last year" },
];

const DEFAULT_METRIC: TrendMetric = "revenue";

function normalizeTrend(value?: string): "up" | "down" | "flat" {
  if (value === "up") return "up";
  if (value === "down") return "down";
  return "flat";
}

function toneFromTrend(value?: string): "success" | "warning" | "default" {
  if (value === "up") return "success";
  if (value === "down") return "warning";
  return "default";
}

export default function SuperAdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeframe, setTimeframe] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState<TrendMetric>(DEFAULT_METRIC);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getSuperAdminAnalytics(timeframe);
      setAnalyticsData(data);
    } catch (fetchError) {
      console.error("Failed to load analytics", fetchError);
      setError("Unable to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const analytics = analyticsData;
  const overview = useMemo(
    () =>
      analytics?.overview ?? {
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCommissions: 0,
        totalWalletBalance: 0,
        activeProviders: 0,
        payoutLiability: 0,
        pendingPayouts: 0,
      },
    [analytics]
  );

  const userTypeBreakdown = useMemo(() => {
    const breakdown = analytics?.breakdowns?.userTypes;

    return {
      agents: breakdown?.agents ?? analytics?.users?.byType?.agents ?? 0,
      super_agents: breakdown?.super_agents ?? analytics?.users?.byType?.super_agents ?? 0,
      dealers: breakdown?.dealers ?? analytics?.users?.byType?.dealers ?? 0,
      super_dealers: breakdown?.super_dealers ?? analytics?.users?.byType?.super_dealers ?? 0,
      super_admins: breakdown?.super_admins ?? analytics?.users?.byType?.super_admins ?? 0,
    };
  }, [analytics]);

  const orderTypeLeaders = useMemo(() => {
    if (analytics?.topPerformers?.orderTypes?.length) {
      return [...analytics.topPerformers.orderTypes].sort((a, b) => b.count - a.count);
    }

    return Object.entries(analytics?.orders?.byType ?? {}).map(([orderType, count]) => ({
      orderType,
      count,
      revenue: 0,
    }));
  }, [analytics]);

  const activityFeed = useMemo(() => {
    if (analytics?.activityFeed?.length) {
      return analytics.activityFeed.map((item) => ({
        ...item,
        id: item.id,
        createdAt: item.createdAt,
      }));
    }

    return [];
  }, [analytics]);

  const topAgents = analytics?.topPerformers?.agents
    ? analytics.topPerformers.agents.map((agent) => ({
      userId: agent.userId,
      fullName: agent.fullName,
      userType: agent.userType,
      orders: agent.orders,
      revenue: agent.revenue,
    }))
    : [];

  const orderStatus = {
    completed: analytics?.charts?.orderStatus?.completed ?? analytics?.orders?.completed ?? 0,
    processing: analytics?.charts?.orderStatus?.processing ?? analytics?.orders?.processing ?? 0,
    pending: analytics?.charts?.orderStatus?.pending ?? analytics?.orders?.pending ?? 0,
    confirmed: analytics?.charts?.orderStatus?.confirmed ?? analytics?.orders?.confirmed ?? 0,
    failed: analytics?.charts?.orderStatus?.failed ?? analytics?.orders?.failed ?? 0,
    cancelled: analytics?.charts?.orderStatus?.cancelled ?? analytics?.orders?.cancelled ?? 0,
    partiallyCompleted:
      analytics?.charts?.orderStatus?.partiallyCompleted ?? analytics?.orders?.partiallyCompleted ?? 0,
  };

  const payoutQueueCount = analytics?.payouts?.queuedCount ?? analytics?.payouts?.thisPeriod?.count ?? 0;
  const pendingCommissionAmount = analytics?.commissions?.pendingAmount ?? 0;
  const netFlow = analytics?.earnings?.period?.netFlow ?? 0;

  const chartLabels = analytics?.charts?.labels ?? [];
  const trendSeries = useMemo(() => {
    if (!analytics?.charts) return [];

    if (selectedMetric === "revenue") return analytics.charts.revenue ?? [];
    if (selectedMetric === "orders") return analytics.charts.orders ?? [];
    if (selectedMetric === "users") return analytics.charts.userRegistrations ?? analytics.charts.orders ?? [];
    return analytics.charts.commissions ?? [];
  }, [analytics, selectedMetric]);

  const kpiCards = useMemo<Array<{ id: string; title: string; value: string; subtitle: string; icon: ReactNode; trend: "up" | "down" | "flat" }>>(
    () => [
      {
        id: "users",
        title: "Total Users",
        value: formatNumber(overview.totalUsers),
        subtitle: analytics?.growth?.users ? growthText(analytics.growth.users) : "vs previous period",
        icon: <FaUsers />,
        trend: normalizeTrend(analytics?.growth?.users?.trend),
      },
      {
        id: "orders",
        title: "Total Orders",
        value: formatNumber(overview.totalOrders),
        subtitle: analytics?.growth?.orders ? growthText(analytics.growth.orders) : "vs previous period",
        icon: <FaShoppingCart />,
        trend: normalizeTrend(analytics?.growth?.orders?.trend),
      },
      {
        id: "revenue",
        title: "Total Revenue",
        value: formatCurrency(overview.totalRevenue),
        subtitle: analytics?.growth?.revenue ? growthText(analytics.growth.revenue) : "vs previous period",
        icon: <FaMoneyBillWave />,
        trend: normalizeTrend(analytics?.growth?.revenue?.trend),
      },
      {
        id: "commissions",
        title: "Total Commissions",
        value: formatCurrency(overview.totalCommissions),
        subtitle: analytics?.growth?.commissions ? growthText(analytics.growth.commissions) : "vs previous period",
        icon: <FaChartLine />,
        trend: normalizeTrend(analytics?.growth?.commissions?.trend),
      },
      {
        id: "wallet",
        title: "Wallet Balance",
        value: formatCurrency(overview.totalWalletBalance),
        subtitle: "Available balance",
        icon: <FaWallet />,
        trend: "flat",
      },
      {
        id: "providers",
        title: "Active Providers",
        value: formatNumber(overview.activeProviders),
        subtitle: "Network providers",
        icon: <FaStore />,
        trend: "flat",
      },
    ],
    [analytics, overview]
  );

  type SnapshotTone = "success" | "warning" | "default" | "error" | "info" | "gray";

  const snapshots = useMemo<Array<{ label: string; value: string; tone: SnapshotTone }>>(
    () => [
      {
        label: "Active Users",
        value: formatNumber(overview.totalUsers),
        tone: toneFromTrend(analytics?.growth?.users?.trend),
      },
      {
        label: "Current Orders",
        value: formatNumber(overview.totalOrders),
        tone: toneFromTrend(analytics?.growth?.orders?.trend),
      },
      {
        label: "Revenue",
        value: formatCurrency(overview.totalRevenue),
        tone: toneFromTrend(analytics?.growth?.revenue?.trend),
      },
      {
        label: "Pending Commissions",
        value: formatCurrency(pendingCommissionAmount),
        tone: "info",
      },
      {
        label: "Queued Payouts",
        value: formatNumber(payoutQueueCount),
        tone: analytics?.payouts?.queuedCount ? "warning" : "default",
      },
    ],
    [analytics, overview, pendingCommissionAmount, payoutQueueCount]
  );

  const handleExport = () => {
    if (!analytics) {
      return;
    }
    void Promise.resolve();
  };

  if (!analytics && loading) {
    return <AnalyticsPageSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card className="rounded-3xl p-4 sm:p-6 shadow-sm">
        <CardBody>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Analytics Dashboard
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Comprehensive insights into platform performance and activity.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Select
                value={timeframe}
                onChange={setTimeframe}
                options={TIME_OPTIONS}
                className="min-w-[160px]"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={loadAnalytics}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                <FaRedo className={loading ? "mr-2 animate-spin" : "mr-2"} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={!analytics}
                className="w-full sm:w-auto"
              >
                <FaDownload className="mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {error ? (
        <Card className="rounded-3xl border border-rose-200 bg-rose-50 p-4">
          <CardBody>
            <p className="text-sm text-rose-800">{error}</p>
          </CardBody>
        </Card>
      ) : null}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdowns">Breakdowns</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsCommandCenter
            timeframe={timeframe}
            timeOptions={TIME_OPTIONS}
            onTimeframeChange={setTimeframe}
            onRefresh={loadAnalytics}
            onExport={handleExport}
            loading={loading}
            generatedAt={analytics?.generatedAt}
            source={analytics?.source}
            snapshots={snapshots}
          />
          <AnalyticsKpiGrid cards={kpiCards} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <AnalyticsTrendStage
            loading={loading}
            labels={chartLabels}
            selectedMetric={selectedMetric}
            onMetricChange={setSelectedMetric}
            trendSeries={trendSeries}
            orderStatus={orderStatus}
          />
        </TabsContent>

        <TabsContent value="breakdowns" className="space-y-6">
          <AnalyticsBreakdownStage
            loading={loading}
            userTypeBreakdown={userTypeBreakdown}
            orderTypeLeaders={orderTypeLeaders}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <AnalyticsActivityStage
            loading={loading}
            activityFeed={activityFeed}
            topAgents={topAgents}
            topStorefronts={[]}
            performanceTimeframe={timeframe}
            performanceTimeOptions={TIME_OPTIONS}
            onPerformanceTimeframeChange={setTimeframe}
            pendingCommissionAmount={pendingCommissionAmount}
            payoutQueueCount={payoutQueueCount}
            netFlow={netFlow}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <AnalyticsInsightsStage
            loading={loading}
            insights={analytics?.insights ?? []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
