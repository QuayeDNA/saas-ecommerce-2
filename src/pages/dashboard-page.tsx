import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "../hooks";
import { useOrder } from "../contexts/OrderContext";
import { useProvider } from "../hooks/use-provider";
import { useSiteStatus } from "../contexts/site-status-context";
import { orderService } from "../services/order.service";
import { packageService } from "../services/package.service";
import { Card, CardHeader, CardBody, Badge } from "../design-system";
import { StatsGrid } from "../design-system/components/stats-card";
import { Skeleton } from "../design-system/components/loading";
import {
  FaPhone,
  FaWallet,
  FaShoppingCart,
  FaStar,
  FaTimes,
  FaClock,
  FaArrowRight,
  FaChartLine,
} from "react-icons/fa";
import type { WalletTransaction } from "../types/wallet";
import type { Order } from "../types/order";
import type { Package } from "../types/package";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Add CSS keyframes for fade-in animation
const fadeInKeyframes = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject the CSS
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = fadeInKeyframes;
  document.head.appendChild(style);
}

export const DashboardPage = () => {
  const { getTransactionHistory } = useWallet();
  const { getAgentAnalytics } = useOrder();
  const { providers, loading: providersLoading } = useProvider();
  const { siteStatus } = useSiteStatus();

  // State for modals and data
  const [recentTransactions, setRecentTransactions] = useState<
    WalletTransaction[]
  >([]);
  const [analyticsData, setAnalyticsData] = useState({
    orders: {
      total: 0,
      completed: 0,
      pending: 0,
      processing: 0,
      confirmed: 0,
      failed: 0,
      cancelled: 0,
      partiallyCompleted: 0,
      successRate: 0,
      todayCounts: {
        total: 0,
        completed: 0,
        pending: 0,
        processing: 0,
        confirmed: 0,
        failed: 0,
        cancelled: 0,
        partiallyCompleted: 0,
      },
    },
    revenue: {
      total: 0,
      today: 0,
      orderCount: 0,
      averageOrderValue: 0,
    },
    wallet: {
      balance: 0,
    },
    charts: {
      labels: [] as string[],
      orders: [] as number[],
      revenue: [] as number[],
      completedOrders: [] as number[],
    },
  });
  const [loading, setLoading] = useState(true);
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("7d"); // default to Weekly
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());
  const [showSiteMessage, setShowSiteMessage] = useState(true);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [activeOrdersLoading, setActiveOrdersLoading] = useState(true);
  const [dashboardPackages, setDashboardPackages] = useState<Package[]>([]);
  const [dashboardPackagesLoading, setDashboardPackagesLoading] = useState(true);

  const navigate = useNavigate();

  // Auto-dismiss site message after 5 seconds
  useEffect(() => {
    if (!showSiteMessage || !siteStatus) return;
    const timer = setTimeout(() => setShowSiteMessage(false), 5000);
    return () => clearTimeout(timer);
  }, [showSiteMessage, siteStatus]);

  // Get site message
  const getSiteMessage = () => {
    if (!siteStatus) return "";
    return siteStatus.isSiteOpen
      ? "Hi! We are currently open for business! 🎉"
      : "Sorry, store is currently closed for business 😔";
  };

  // Get site status color
  const getSiteStatusColor = () => {
    return siteStatus?.isSiteOpen ? "text-green-600" : "text-red-600";
  };

  // Get site status background
  const getSiteStatusBg = () => {
    return siteStatus?.isSiteOpen ? "bg-green-50" : "bg-red-50";
  };

  // Handle quick link click
  const handleQuickLinkClick = (slug: string) => {
    navigate(`./packages/${slug}`);
  };

  // Get provider logo by provider code
  const getProviderLogo = (providerCode: string) => {
    const provider = providers.find((p) => p.code === providerCode);
    return provider?.logo;
  };

  // Get provider color by provider code
  const getProviderColor = (providerCode: string) => {
    const colorMap: Record<string, string> = {
      MTN: "bg-yellow-500",
      TELECEL: "bg-red-500",
      AT: "bg-blue-500",
      AFA: "bg-green-500",
    };
    return colorMap[providerCode] || "bg-gray-500";
  };

  // Fetch packages for quick actions
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setDashboardPackagesLoading(true);
        const response = await packageService.getPackages({
          isActive: true,
        });
        setDashboardPackages(response.packages || []);
      } catch {
        setDashboardPackages([]);
      } finally {
        setDashboardPackagesLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // Format transaction amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // Get transaction status color
  const getTransactionStatusColor = (type: string) => {
    return type === "credit" ? "success" : "error";
  };

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load recent transactions (last 5)
        const transactionData = await getTransactionHistory(1, 5);
        if (transactionData) {
          setRecentTransactions(transactionData.transactions);
        }

        // Load agent analytics
        try {
          const analytics = await getAgentAnalytics(analyticsTimeframe);
          if (analytics) {
            // Use the AgentAnalyticsData shape directly from the backend
            const data = analytics as {
              orders: {
                total: number;
                completed: number;
                pending: number;
                processing: number;
                confirmed: number;
                failed: number;
                cancelled: number;
                partiallyCompleted: number;
                successRate: number;
                todayCounts: {
                  total: number;
                  completed: number;
                  pending: number;
                  processing: number;
                  confirmed: number;
                  failed: number;
                  cancelled: number;
                  partiallyCompleted: number;
                };
              };
              revenue: {
                total: number;
                today: number;
                thisMonth: number;
                orderCount: number;
                averageOrderValue: number;
              };
              wallet: {
                balance: number;
              };
              charts: {
                labels: string[];
                orders: number[];
                revenue: number[];
                completedOrders: number[];
              };
            };

            setAnalyticsData({
              orders: {
                total: data.orders?.total || 0,
                completed: data.orders?.completed || 0,
                pending: data.orders?.pending || 0,
                processing: data.orders?.processing || 0,
                confirmed: data.orders?.confirmed || 0,
                failed: data.orders?.failed || 0,
                cancelled: data.orders?.cancelled || 0,
                partiallyCompleted: data.orders?.partiallyCompleted || 0,
                successRate: data.orders?.successRate || 0,
                todayCounts: {
                  total: data.orders?.todayCounts?.total || 0,
                  completed: data.orders?.todayCounts?.completed || 0,
                  pending: data.orders?.todayCounts?.pending || 0,
                  processing: data.orders?.todayCounts?.processing || 0,
                  confirmed: data.orders?.todayCounts?.confirmed || 0,
                  failed: data.orders?.todayCounts?.failed || 0,
                  cancelled: data.orders?.todayCounts?.cancelled || 0,
                  partiallyCompleted:
                    data.orders?.todayCounts?.partiallyCompleted || 0,
                },
              },
              revenue: {
                total: data.revenue?.total || 0,
                today: data.revenue?.today || 0,
                orderCount: data.revenue?.orderCount || 0,
                averageOrderValue: data.revenue?.averageOrderValue || 0,
              },
              wallet: {
                balance: data.wallet?.balance || 0,
              },
              charts: {
                labels: data.charts?.labels || [],
                orders: data.charts?.orders || [],
                revenue: data.charts?.revenue || [],
                completedOrders: data.charts?.completedOrders || [],
              },
            });
          } else {
            // Set default values if analytics fails
            setAnalyticsData({
              orders: {
                total: 0,
                completed: 0,
                pending: 0,
                processing: 0,
                confirmed: 0,
                failed: 0,
                cancelled: 0,
                partiallyCompleted: 0,
                successRate: 0,
                todayCounts: {
                  total: 0,
                  completed: 0,
                  pending: 0,
                  processing: 0,
                  confirmed: 0,
                  failed: 0,
                  cancelled: 0,
                  partiallyCompleted: 0,
                },
              },
              revenue: {
                total: 0,
                today: 0,
                orderCount: 0,
                averageOrderValue: 0,
              },
              wallet: { balance: 0 },
              charts: {
                labels: [],
                orders: [],
                revenue: [],
                completedOrders: [],
              },
            });
          }
        } catch (analyticsError) {
          console.error("Analytics error:", analyticsError);
          // Set default values if analytics fails
          setAnalyticsData({
            orders: {
              total: 0,
              completed: 0,
              pending: 0,
              processing: 0,
              confirmed: 0,
              failed: 0,
              cancelled: 0,
              partiallyCompleted: 0,
              successRate: 0,
              todayCounts: {
                total: 0,
                completed: 0,
                pending: 0,
                processing: 0,
                confirmed: 0,
                failed: 0,
                cancelled: 0,
                partiallyCompleted: 0,
              },
            },
            revenue: {
              total: 0,
              today: 0,
              orderCount: 0,
              averageOrderValue: 0,
            },
            wallet: { balance: 0 },
            charts: {
              labels: [],
              orders: [],
              revenue: [],
              completedOrders: [],
            },
          });
        }
      } catch (error) {
        console.error("Dashboard data loading error:", error);
        // Failed to load dashboard data
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [getTransactionHistory, getAgentAnalytics, analyticsTimeframe]);

  // Fetch active (pending/processing/confirmed) orders
  useEffect(() => {
    const loadActiveOrders = async () => {
      try {
        setActiveOrdersLoading(true);
        // Fetch pending orders first, then processing, then confirmed
        const [pendingRes, processingRes, confirmedRes] = await Promise.all([
          orderService.getOrders(
            { status: "pending" },
            { limit: 5, page: 1, sortBy: "createdAt", sortOrder: "desc" },
          ),
          orderService.getOrders(
            { status: "processing" },
            { limit: 5, page: 1, sortBy: "createdAt", sortOrder: "desc" },
          ),
          orderService.getOrders(
            { status: "confirmed" },
            { limit: 5, page: 1, sortBy: "createdAt", sortOrder: "desc" },
          ),
        ]);

        // Combine, sort by createdAt desc, take first 5
        const combined = [
          ...pendingRes.orders,
          ...processingRes.orders,
          ...confirmedRes.orders,
        ]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 5);

        setActiveOrders(combined);
      } catch (err) {
        console.error("Failed to load active orders:", err);
      } finally {
        setActiveOrdersLoading(false);
      }
    };

    loadActiveOrders();
  }, []);

  // Format time ago
  const getTimeAgo = (date: Date | string) => {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Get status badge color
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "confirmed":
        return "success";
      default:
        return "default";
    }
  };

  // Get timeframe display label
  const getTimeframeLabel = () => {
    switch (analyticsTimeframe) {
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "365d":
        return "Last 12 Months";
      default:
        return "Last 30 Days";
    }
  };

  const getSalesChartLabels = () => {
    switch (analyticsTimeframe) {
      case "7d":
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      case "30d":
        return Array.from({ length: 15 }, (_, index) => {
          const day = index * 2 + 1;
          if (day === 1) return "1st";
          if (day === 3) return "3rd";
          return `${day}th`;
        });
      case "365d":
        return [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
      default:
        return analyticsData.charts.labels || [];
    }
  };

  // Prepare sales chart data for the bar chart with timeframe-aware labels
  const prepareSalesChartData = () => {
    const revenueData = analyticsData.charts.revenue || [];
    const labels = getSalesChartLabels();

    if (analyticsTimeframe === "30d") {
      return labels.map((label, index) => {
        const firstDay = revenueData[index * 2] || 0;
        const secondDay = revenueData[index * 2 + 1] || 0;

        return {
          name: label,
          revenue: firstDay + secondDay,
        };
      });
    }

    return labels.map((label, index) => ({
      name: label,
      revenue: revenueData[index] || 0,
    }));
  };

  const salesChartData = prepareSalesChartData();

  // Prepare order analytics chart data - Order completion trends
  const prepareOrderAnalyticsChartData = () => {
    return [
      { name: "Total Orders", value: analyticsData.orders.total },
      { name: "Completed", value: analyticsData.orders.completed },
      { name: "Pending", value: analyticsData.orders.pending },
    ];
  };

  const orderAnalyticsChartData = prepareOrderAnalyticsChartData();

  return (
    <div className="dashboard-welcome space-y-4 sm:space-y-6">
      {/* Site Status Message - Glassmorphic design */}
      {showSiteMessage && siteStatus && (
        <div
          className="transform transition-all duration-1000 ease-in-out"
          style={{
            animation: "fadeIn 0.5s ease-in-out",
            opacity: showSiteMessage ? 1 : 0,
            transform: showSiteMessage ? "translateY(0)" : "translateY(-20px)",
          }}
        >
          <Card className="backdrop-blur-md border border-white/30 shadow-xl p-4">
            <CardBody className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div
                  className={`p-3 rounded-full ${getSiteStatusBg()} ${getSiteStatusColor()}`}
                >
                  <FaStar className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium text-gray-700">
                    {getSiteMessage()}
                  </p>
                </div>
                <button
                  onClick={() => setShowSiteMessage(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/20 rounded-full transition-all duration-200"
                  aria-label="Close message"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="mb-3 px-2 sm:px-0">
          <h2 className="text-lg font-medium text-gray-800">All Packages</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a package to browse and order bundles.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {dashboardPackagesLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Card
                key={`quick-action-skeleton-${idx}`}
                size="sm"
                className="overflow-hidden"
              >
                <CardBody className="text-center">
                  <Skeleton
                    variant="circular"
                    width={48}
                    height={48}
                    className="mx-auto mb-2"
                  />
                  <Skeleton
                    height="0.95rem"
                    width="65%"
                    className="mx-auto mb-1"
                  />
                  <Skeleton height="0.75rem" width="45%" className="mx-auto" />
                </CardBody>
              </Card>
            ))
          ) : dashboardPackages.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                No packages found
              </h3>
              <p className="text-sm text-gray-500">
                No packages are available at the moment.
              </p>
            </div>
          ) : (
            dashboardPackages.map((pkg) => {
              const providerLogo = getProviderLogo(pkg.provider);
              const providerColor = getProviderColor(pkg.provider);
              const key = pkg._id || pkg.slug;
              return (
                <Card
                  key={key}
                  variant="interactive"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => handleQuickLinkClick(pkg.slug)}
                >
                  <CardBody className="text-center">
                    <div
                      className={`${providerColor} text-white rounded-full mx-auto mb-2 w-12 h-12 flex items-center justify-center overflow-hidden`}
                    >
                      {providerLogo?.url &&
                      !failedLogos.has(pkg.provider) ? (
                        <img
                          src={providerLogo.url}
                          alt={providerLogo.alt || pkg.name}
                          className="w-12 h-12 object-cover rounded-full"
                          onError={() => {
                            setFailedLogos((prev) =>
                              new Set(prev).add(pkg.provider),
                            );
                          }}
                        />
                      ) : (
                        <FaPhone className="w-6 h-6" />
                      )}
                    </div>
                    <div className="font-semibold text-sm">{pkg.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Browse bundles
                    </div>
                  </CardBody>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Active Orders - Show pending/processing/confirmed */}
      <div className="active-orders">
        <div className="flex items-center justify-between mb-3 px-2 sm:px-0">
          <div>
            <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
              <FaClock className="text-orange-500" />
              Active Orders
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track pending orders at a glance.
            </p>
          </div>
          <Link
            to="./orders"
            className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all duration-200"
            style={{ color: "var(--color-primary-600)" }}
          >
            View all <FaArrowRight className="text-xs" />
          </Link>
        </div>

        {activeOrdersLoading ? (
          <Card>
            <CardBody>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={`active-order-skeleton-${idx}`}
                    className="rounded-lg border border-slate-100 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Skeleton
                          height="0.95rem"
                          width="40%"
                          className="mb-1"
                        />
                        <Skeleton height="0.75rem" width="60%" />
                      </div>
                      <Skeleton
                        height="1.25rem"
                        width={64}
                        className="rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ) : activeOrders.length === 0 ? (
          <Card>
            <CardBody className="text-center py-6">
              <FaShoppingCart className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No active orders</p>
              <p className="text-xs text-gray-400 mt-1">
                All your orders are completed or you haven't placed any yet
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="max-h-[184px] overflow-y-auto pr-1 scrollbar-thin">
            <div className="space-y-2">
              {activeOrders.map((order) => (
                <Link key={order._id} to={`./orders`} className="block">
                  <Card
                    variant="interactive"
                    size="sm"
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardBody>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm text-gray-900 truncate">
                              {order.orderNumber}
                            </span>
                            <span className="text-xs text-gray-500">
                              {order.items?.length || 0} item
                              {(order.items?.length || 0) !== 1
                                ? "s"
                                : ""} · {getTimeAgo(order.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant="subtle"
                            colorScheme={
                              getOrderStatusColor(order.status) as
                                | "warning"
                                | "info"
                                | "success"
                                | "default"
                            }
                            size="xs"
                          >
                            {order.status}
                          </Badge>
                          <span className="font-semibold text-sm text-gray-900">
                            ₵{order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
            {activeOrders.length > 2 && (
              <p className="text-[10px] text-gray-400 text-center mt-1">
                Scroll for more ({activeOrders.length} orders)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="account-overview">
        <div className="mb-3 px-2 sm:px-0">
          <h2 className="text-lg font-medium text-gray-800">
            Account Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            A quick summary of your performance and spending.
          </p>
        </div>
        <StatsGrid
          columns={3}
          gap="sm"
          stats={[
            {
              title: "Total Orders Today",
              value: analyticsData.orders.todayCounts.total,
              subtitle: `Total: ${analyticsData.orders.total}`,
              icon: <FaShoppingCart />,
              size: "sm",
              variant: "solid",
            },
            {
              title: "Today's Spending",
              value: `₵${analyticsData.revenue.today.toFixed(2)}`,
              icon: <FaWallet />,
              size: "sm",
              variant: "solid",
            },
            {
              title: "Total Sales Today",
              value: `₵${analyticsData.revenue.today.toFixed(2)}`,
              icon: <FaChartLine />,
              size: "sm",
              variant: "solid",
            },
          ]}
        />
      </div>

      {/* Sales Analytics Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">
              Sales Analytics
            </h3>
            <div className="flex gap-2">
              <select
                value={analyticsTimeframe}
                onChange={(e) => setAnalyticsTimeframe(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
              >
                <option value="7d">Weekly (Last 7 Days)</option>
                <option value="30d">Monthly (Last 30 Days)</option>
                <option value="365d">Yearly (Last 12 Months)</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="h-40 sm:h-48 rounded-lg border border-slate-100 p-3">
              <div className="h-full grid grid-cols-3 gap-3 items-end">
                <Skeleton height="60%" className="rounded-md" />
                <Skeleton height="85%" className="rounded-md" />
                <Skeleton height="45%" className="rounded-md" />
              </div>
            </div>
          ) : !salesChartData || salesChartData.length === 0 ? (
            <div className="bg-gray-50 h-40 sm:h-48 flex items-center justify-center rounded">
              <div className="text-center">
                <FaChartLine className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">
                  No sales data available for selected period
                </p>
              </div>
            </div>
          ) : (
            <div className="h-40 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesChartData}
                  margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickLine={{ stroke: "#d1d5db" }}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickLine={{ stroke: "#d1d5db" }}
                  />
                  <Tooltip
                    formatter={(value) => {
                      const numValue = typeof value === "number" ? value : 0;
                      return [`₵${numValue.toFixed(2)}`, "Revenue"];
                    }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#ffffff",
                    }}
                    labelStyle={{ color: "#374151" }}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-primary-500)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Order Analytics Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">
              Order Analytics ({getTimeframeLabel()})
            </h3>
            <Link
              to="./orders"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Orders
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="h-40 sm:h-48 rounded-lg border border-slate-100 p-3">
              <div className="h-full grid grid-cols-3 gap-3 items-end">
                <Skeleton height="60%" className="rounded-md" />
                <Skeleton height="85%" className="rounded-md" />
                <Skeleton height="45%" className="rounded-md" />
              </div>
            </div>
          ) : analyticsData.orders.total === 0 ? (
            <div className="bg-gray-50 h-40 sm:h-48 flex items-center justify-center rounded">
              <div className="text-center">
                <FaShoppingCart className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">No order data available</p>
              </div>
            </div>
          ) : (
            <div className="h-40 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={orderAnalyticsChartData}
                  margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickLine={{ stroke: "#d1d5db" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickLine={{ stroke: "#d1d5db" }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value ?? 0} orders`, "Count"]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#ffffff",
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Recent Transactions */}
      <Card className="recent-transactions">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">
              Recent Transactions
            </h3>
            <Link
              to="./wallet"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`tx-skeleton-${idx}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <Skeleton height="0.95rem" width="36%" className="mb-1" />
                    <Skeleton height="0.75rem" width="68%" className="mb-1" />
                    <Skeleton height="0.7rem" width="28%" />
                  </div>
                  <Skeleton height="1rem" width={76} />
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaWallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                No transactions
              </h3>
              <p className="text-sm text-gray-500">
                You don't have any wallet transactions yet.
              </p>
            </div>
          ) : (
            <div className="max-h-[240px] overflow-y-auto pr-1 scrollbar-thin">
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize text-sm">
                          {transaction.type}
                        </span>
                        <Badge
                          variant="subtle"
                          colorScheme={getTransactionStatusColor(
                            transaction.type,
                          )}
                          size="xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {formatAmount(transaction.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
