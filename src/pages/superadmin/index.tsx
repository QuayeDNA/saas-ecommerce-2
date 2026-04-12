import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaBuilding,
  FaClipboardList,
  FaWallet,
  FaCog,
  FaMoneyBillWave,
  FaBox,
  FaChartLine,
  FaUserTie,
  FaUserShield,
  FaUserCheck,
  FaUserCog,
  FaCrown,
  FaChevronDown,
} from "react-icons/fa";
import { Card, CardHeader, CardBody, Button } from "../../design-system";
import {
  userService,
  type DashboardStats,
} from "../../services/user.service";

const quickLinks = [
  {
    to: "/superadmin/users",
    label: "Manage Users",
    icon: (
      <FaUsers
        className="text-xl sm:text-2xl"
        style={{ color: "var(--color-primary-600)" }}
      />
    ),
  },
  {
    to: "/superadmin/providers",
    label: "Manage Providers",
    icon: <FaBuilding className="text-green-600 text-xl sm:text-2xl" />,
  },
  {
    to: "/superadmin/packages",
    label: "Manage Packages",
    icon: <FaBox className="text-orange-600 text-xl sm:text-2xl" />,
  },
  {
    to: "/superadmin/orders",
    label: "View Orders",
    icon: <FaClipboardList className="text-yellow-600 text-xl sm:text-2xl" />,
  },
  {
    to: "/superadmin/wallet/top-ups",
    label: "Wallet & Transactions",
    icon: <FaWallet className="text-purple-600 text-xl sm:text-2xl" />,
  },
  {
    to: "/superadmin/settings",
    label: "Settings",
    icon: <FaCog className="text-gray-600 text-xl sm:text-2xl" />,
  },
];

// Skeleton loading components
const MetricCardSkeleton = () => (
  <Card
    className="animate-pulse"
    style={{
      backgroundColor: "var(--color-primary-500)",
      borderColor: "var(--color-primary-600)",
    }}
  >
    <CardBody className="p-3 sm:p-4 md:p-6">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <div className="h-3 sm:h-4 bg-gray-300 rounded w-16 sm:w-24 mb-1 sm:mb-2"></div>
          <div className="h-5 sm:h-6 md:h-8 bg-gray-300 rounded w-12 sm:w-16 mb-1"></div>
          <div className="h-2 sm:h-3 bg-gray-300 rounded w-14 sm:w-20"></div>
        </div>
        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
      </div>
    </CardBody>
  </Card>
);

const StatsCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardBody>
      <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    </CardBody>
  </Card>
);

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [snapshotOpen, setSnapshotOpen] = useState(false);

  // User type carousel data
  const userTypeCarousel = [
    {
      key: "agents",
      label: "Active Agents",
      icon: <FaUserTie className="text-white text-sm sm:text-lg lg:text-xl" />,
      color: "text-gray-300",
      bgColor: "bg-secondary-500/20",
    },
    {
      key: "super_agents",
      label: "Super Agents",
      icon: (
        <FaUserShield className="text-white text-sm sm:text-lg lg:text-xl" />
      ),
      color: "text-gray-300",
      bgColor: "bg-secondary-500/20",
    },
    {
      key: "dealers",
      label: "Dealers",
      icon: (
        <FaUserCheck className="text-white text-sm sm:text-lg lg:text-xl" />
      ),
      color: "text-gray-300",
      bgColor: "bg-secondary-500/20",
    },
    {
      key: "super_dealers",
      label: "Super Dealers",
      icon: <FaUserCog className="text-white text-sm sm:text-lg lg:text-xl" />,
      color: "text-gray-300",
      bgColor: "bg-secondary-500/20",
    },
    {
      key: "super_admins",
      label: "Super Admins",
      icon: <FaCrown className="text-white text-sm sm:text-lg lg:text-xl" />,
      color: "text-gray-300",
      bgColor: "bg-secondary-500/20",
    },
  ];

  const getUserTypeCount = (key: string): number => {
    if (!stats?.users?.byType) return 0;
    return (stats.users.byType as Record<string, number>)[key] || 0;
  };

  // Carousel timer
  useEffect(() => {
    if (!stats) return;

    const interval = setInterval(() => {
      setCarouselIndex(
        (prevIndex) => (prevIndex + 1) % userTypeCarousel.length
      );
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [stats, userTypeCarousel.length]);

  // Load stats first (faster to load)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        setError(null);
        const statsData = await userService.fetchDashboardStats();
        setStats(statsData);
      } catch {
        setError("Failed to load dashboard stats");
        // Stats error
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  // Chart configurations
  if (error && !stats) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      {/* Today's Snapshot */}
      <div className="space-y-3">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 overflow-hidden">
          <button
            type="button"
            className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-slate-900 text-white text-left"
            onClick={() => setSnapshotOpen((prev) => !prev)}
            aria-expanded={snapshotOpen}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-slate-100">
                <FaChartLine className="h-5 w-5" />
              </span>
              <p className="text-sm sm:text-base font-semibold text-white">Today's Snapshot</p>
            </div>

            <div className="mt-3 overflow-hidden">
              <div className="inline-block animate-marquee whitespace-nowrap text-sm text-slate-100/80">
                Orders: {stats ? stats.orders.today.total : '...'} • Revenue: {stats ? formatCurrency(stats.revenue.today) : '...'} • New Users: {stats ? stats.users.newThisWeek : '...'} • Success: {stats ? `${stats.orders.successRate}%` : '...'}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-300">{new Date().toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}</span>
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 ${snapshotOpen ? 'rotate-180' : 'rotate-0'}`}
              >
                <FaChevronDown className="text-white" />
              </span>
            </div>
          </button>

          <div
            className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-out ${snapshotOpen ? 'max-h-[1200px] opacity-100 mt-0' : 'max-h-0 opacity-0 mt-0'}`}
            style={{ willChange: 'max-height, opacity' }}
          >
            <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-5">
              {loadingStats || !stats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-3xl border border-slate-200 bg-slate-50 p-3 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Orders Today</p>
                    <p className="text-xl font-semibold text-slate-900">{stats.orders.today.total}</p>
                    <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-600">
                      {stats.orders.today.completed > 0 && <span className="rounded-full bg-emerald-100 px-2 py-0.5">{stats.orders.today.completed} completed</span>}
                      {stats.orders.today.pending > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5">{stats.orders.today.pending} pending</span>}
                      {stats.orders.today.processing > 0 && <span className="rounded-full bg-sky-100 px-2 py-0.5">{stats.orders.today.processing} processing</span>}
                      {stats.orders.today.failed > 0 && <span className="rounded-full bg-rose-100 px-2 py-0.5">{stats.orders.today.failed} failed</span>}
                      {stats.orders.today.cancelled > 0 && <span className="rounded-full bg-slate-100 px-2 py-0.5">{stats.orders.today.cancelled} cancelled</span>}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Revenue Today</p>
                    <p className="text-xl font-semibold text-emerald-700">{formatCurrency(stats.revenue.today)}</p>
                    <p className="mt-1 text-[10px] text-slate-500">This month: {formatCurrency(stats.revenue.thisMonth)}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">New Users This Week</p>
                    <p className="text-xl font-semibold text-sky-700">{stats.users.newThisWeek}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{stats.users.total} total users</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Success Rate</p>
                    <p className="text-xl font-semibold" style={{ color: stats.orders.successRate >= 90 ? '#16a34a' : stats.orders.successRate >= 70 ? '#ca8a04' : '#dc2626' }}>{stats.orders.successRate}%</p>
                    <p className="mt-1 text-[10px] text-slate-500">{stats.orders.completed.toLocaleString()} of {stats.orders.total.toLocaleString()} orders</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {loadingStats ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : stats ? (
          <>
            {/* Total Users */}
            <Card
              className="transition-colors duration-200"
              style={{
                backgroundColor: "var(--color-primary-500)",
                borderColor: "var(--color-primary-600)",
              }}
            >
              <CardBody>
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] xs:text-xs sm:text-sm font-medium text-gray-300 mb-1 truncate">
                      Total Users
                    </p>
                    <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight truncate">
                      {stats.users.total.toLocaleString()}
                    </p>
                    <p className="text-[9px] xs:text-xs text-green-400 mt-0.5 sm:mt-1 truncate">
                      +{stats.users.newThisWeek} this week
                    </p>
                  </div>
                  <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center">
                    <FaUsers className="text-white text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Total Revenue */}
            <Card
              className="transition-colors duration-200"
              style={{
                backgroundColor: "var(--color-primary-500)",
                borderColor: "var(--color-primary-600)",
              }}
            >
              <CardBody>
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] xs:text-xs sm:text-sm font-medium text-gray-300 mb-1 truncate">
                      Total Revenue
                    </p>
                    <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight truncate">
                      {formatCurrency(stats.revenue.total)}
                    </p>
                    <p className="text-[9px] xs:text-xs text-green-400 mt-0.5 sm:mt-1 truncate">
                      +{formatCurrency(stats.revenue.total)} total
                    </p>
                  </div>
                  <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center">
                    <FaMoneyBillWave className="text-white text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Total Orders */}
            <Card
              className="transition-colors duration-200"
              style={{
                backgroundColor: "var(--color-primary-500)",
                borderColor: "var(--color-primary-600)",
              }}
            >
              <CardBody>
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] xs:text-xs sm:text-sm font-medium text-gray-300 mb-1 truncate">
                      Total Orders
                    </p>
                    <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight truncate">
                      {stats.orders.total.toLocaleString()}
                    </p>
                    <p className="text-[9px] xs:text-xs text-blue-400 mt-0.5 sm:mt-1 truncate">
                      {stats.orders.successRate}% success rate
                    </p>
                  </div>
                  <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center">
                    <FaClipboardList className="text-white text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* User Types Carousel */}
            <Card
              className="transition-colors duration-200 relative overflow-hidden"
              style={{
                backgroundColor: "var(--color-primary-500)",
                borderColor: "var(--color-primary-600)",
              }}
            >
              <CardBody>
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] xs:text-xs sm:text-sm font-medium text-gray-300 mb-1 truncate">
                      {userTypeCarousel[carouselIndex].label}
                    </p>
                    <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight truncate">
                      {getUserTypeCount(userTypeCarousel[carouselIndex].key)}
                    </p>
                    <p
                      className={`text-[9px] xs:text-xs mt-0.5 sm:mt-1 truncate ${userTypeCarousel[carouselIndex].color}`}
                    >
                      {getUserTypeCount(userTypeCarousel[carouselIndex].key)}{" "}
                      total
                    </p>
                  </div>
                  <div
                    className={`p-2 sm:p-2.5 md:p-3 lg:p-4 ${userTypeCarousel[carouselIndex].bgColor} rounded-full flex-shrink-0 flex items-center justify-center`}
                  >
                    {userTypeCarousel[carouselIndex].icon}
                  </div>
                </div>
                {/* Carousel Indicators */}
                <div className="flex justify-center mt-2 sm:mt-3 space-x-1">
                  {userTypeCarousel.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCarouselIndex(index)}
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors duration-200 ${index === carouselIndex ? "bg-white" : "bg-white/30"
                        }`}
                      aria-label={`Go to ${userTypeCarousel[index].label}`}
                    />
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Total Commissions */}
            <Card
              className="transition-colors duration-200"
              style={{
                backgroundColor: "var(--color-primary-500)",
                borderColor: "var(--color-primary-600)",
              }}
            >
              <CardBody>
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] xs:text-xs sm:text-sm font-medium text-gray-300 mb-1 truncate">
                      Total Commissions
                    </p>
                    <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight truncate">
                      {formatCurrency(stats.commissions.totalEarned)}
                    </p>
                    <p className="text-[9px] xs:text-xs text-yellow-400 mt-0.5 sm:mt-1 truncate">
                      Paid: {formatCurrency(stats.commissions.totalPaid)} | {stats.commissions.pendingCount} pending
                    </p>
                  </div>
                  <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center">
                    <FaMoneyBillWave className="text-white text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Active Providers */}
            <Card
              className="transition-colors duration-200"
              style={{
                backgroundColor: "var(--color-primary-500)",
                borderColor: "var(--color-primary-600)",
              }}
            >
              <CardBody>
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] xs:text-xs sm:text-sm font-medium text-gray-300 mb-1 truncate">
                      Active Providers
                    </p>
                    <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight truncate">
                      {stats.providers.active}
                    </p>
                    <p className="text-[9px] xs:text-xs text-indigo-400 mt-0.5 sm:mt-1 truncate">
                      {stats.providers.newThisMonth} new this month
                    </p>
                  </div>
                  <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center">
                    <FaBuilding className="text-white text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </>
        ) : null}
      </div>

      {/* Quick Actions - Mobile-first design */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Quick Actions</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
              >
                {link.icon}
                <span className="font-medium text-xs">{link.label}</span>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Analytics Preview */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Analytics Summary</h3>
            <p className="text-sm text-gray-500 max-w-2xl">
              A quick overview of your top business KPIs. See the full analytics dashboard for detailed trends and breakdowns.
            </p>
          </div>
          <Link to="/superadmin/analytics" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            See more
          </Link>
        </div>
      </div>

      {/* Analytics Details */}
      {loadingStats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaClipboardList className="text-yellow-600" />
                Order Statistics
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex justify-between items-center">
                  <span>Completed Orders</span>
                  <span className="font-semibold">{stats.orders.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pending Orders</span>
                  <span className="font-semibold">{stats.orders.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Failed Orders</span>
                  <span className="font-semibold">{stats.orders.failed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Orders</span>
                  <span className="font-semibold">{stats.orders.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Success Rate</span>
                  <span className="font-semibold">{stats.orders.successRate}%</span>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaMoneyBillWave className="text-green-600" />
                Revenue Statistics
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex justify-between items-center">
                  <span>Total Revenue</span>
                  <span className="font-semibold">{formatCurrency(stats.revenue.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Revenue</span>
                  <span className="font-semibold">{formatCurrency(stats.revenue.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg Order Value</span>
                  <span className="font-semibold">{formatCurrency(stats.revenue.averageOrderValue)}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      ) : null}
      {loadingStats ? (
        <Card className="animate-pulse">
          <CardBody>
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
                  <div className="space-y-2">
                    {[...Array(5)].map((_, j) => (
                      <div
                        key={j}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-12"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null} 
    </div>
  );
}
