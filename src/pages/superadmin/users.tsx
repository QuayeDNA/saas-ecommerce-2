import { useEffect, useState, useCallback } from "react";
import { userService, type User, type UserStats } from "../../services/user.service";
import { SearchAndFilter } from "../../components/common";
import {
  FaCheck,
  FaTimes,
  FaUser,
  FaStore,
  FaShieldAlt,
  FaEye,
  FaDownload,
  FaRedo,
  FaPhone,
  FaEnvelope,
  FaCalendar,
  FaBuilding,
  FaIdCard,
  FaUserTie,
  FaUserShield,
  FaUserCheck,
  FaUserCog,
  FaList,
  FaTh,
  FaUsers,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Button } from "../../design-system/components/button";
import { StatCard } from "../../design-system/components/stats-card";
import { Pagination } from "../../design-system/components/pagination";
import { Skeleton, LoadingCard } from "../../design-system/components/loading";

const userTypeOptions = [
  { value: "", label: "All Users", icon: FaUser },
  { value: "agent", label: "Agents", icon: FaStore },
  { value: "super_agent", label: "Super Agents", icon: FaStore },
  { value: "dealer", label: "Dealers", icon: FaStore },
  { value: "super_dealer", label: "Super Dealers", icon: FaStore },
  { value: "super_admin", label: "Super Admins", icon: FaShieldAlt },
];

const statusOptions = [
  { value: "", label: "All Status" },
  {
    value: "pending",
    label: "Pending Approval",
    color: "text-[var(--color-warning)] bg-[var(--color-pending-bg)]",
  },
  {
    value: "active",
    label: "Active",
    color: "text-[var(--color-success)] bg-[var(--color-success-bg)]",
  },
  {
    value: "rejected",
    label: "Rejected",
    color: "text-[var(--color-error)] bg-[var(--color-failed-bg)]",
  }];
export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("");
  const [status, setStatus] = useState(""); // Changed from 'pending' to '' to show all users
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statusCarouselIndex, setStatusCarouselIndex] = useState(0);
  const [userTypeCarouselIndex, setUserTypeCarouselIndex] = useState(0);
  const navigate = useNavigate();

  // Filter options for the reusable component
  const filterOptions = {
    userType: {
      value: userType,
      options: userTypeOptions,
      label: "User Type",
      placeholder: "All Users",
    },
    status: {
      value: status,
      options: statusOptions,
      label: "Status",
      placeholder: "All Status",
    },
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getUsers({
        userType,
        status: status || undefined, // Only send if status is not empty
        search: search.trim() || undefined,
        page: currentPage,
        limit: itemsPerPage,
      });
      setUsers(response.users);
      setTotalItems(response.pagination.total);
      setTotalPages(response.pagination.pages);
    } catch {
      setError("Failed to fetch users");
      // Error fetching users
    } finally {
      setLoading(false);
    }
  }, [userType, status, search, currentPage, itemsPerPage]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const statsData = await userService.getUserStats();
      setStats(statsData);
    } catch {
      // Silently fail for stats, don't show error
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  // Add debounced search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchUsers();
    }, 500); // 500ms delay for debounced search

    return () => clearTimeout(delayedSearch);
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is now automatic via useEffect, no need to call fetchUsers manually
  };

  const handleClearFilters = () => {
    setSearch("");
    setUserType("");
    setStatus(""); // Clear status filter
    // fetchUsers will be called automatically by useEffect when state changes
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "userType") {
      setUserType(value);
    } else if (filterKey === "status") {
      setStatus(value);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingUser(id);
    try {
      await userService.updateAgentStatus(id, "active");
      await fetchUsers();
    } catch {
      setError("Failed to approve user");
      // Error approving user
    } finally {
      setProcessingUser(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingUser(id);
    try {
      await userService.updateAgentStatus(id, "rejected");
      await fetchUsers();
    } catch {
      setError("Failed to reject user");
      // Error rejecting user
    } finally {
      setProcessingUser(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-[var(--color-warning)] bg-[var(--color-pending-bg)]";
      case "active":
        return "text-[var(--color-success)] bg-[var(--color-success-bg)]";
      case "rejected":
        return "text-[var(--color-error)] bg-[var(--color-failed-bg)]";
      default:
        return "text-[var(--color-secondary-text)] bg-[var(--color-control-bg)]";
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleViewModeChange = (mode: "card" | "list") => {
    setViewMode(mode);
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "agent":
        return <FaStore className="text-[var(--color-primary-600)]" />;
      case "super_agent":
        return <FaStore className="text-[var(--color-secondary-text)]" />;
      case "dealer":
        return <FaStore className="text-[var(--color-success)]" />;
      case "super_dealer":
        return <FaStore className="text-[var(--color-info)]" />;
      case "super_admin":
        return <FaShieldAlt className="text-[var(--color-warning)]" />;
      default:
        return <FaUser className="text-[var(--color-secondary-text)]" />;
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case "agent":
        return "Agent";
      case "super_agent":
        return "Super Agent";
      case "dealer":
        return "Dealer";
      case "super_dealer":
        return "Super Dealer";
      case "super_admin":
        return "Super Admin";
      default:
        return "User";
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  // Status carousel data
  const statusCarousel = [
    {
      key: "pending",
      label: "Pending",
      color: "text-[var(--color-warning)]",
      bgColor: "bg-[var(--color-pending-bg)]",
      iconColor: "text-[var(--color-warning)]",
    },
    {
      key: "active",
      label: "Active",
      color: "text-[var(--color-success)]",
      bgColor: "bg-[var(--color-success-bg)]",
      iconColor: "text-[var(--color-success)]",
    },
    {
      key: "rejected",
      label: "Rejected",
      color: "text-[var(--color-error)]",
      bgColor: "bg-[var(--color-failed-bg)]",
      iconColor: "text-[var(--color-error)]",
    },
  ];

  // User type carousel data
  const userTypeCarousel = [
    {
      key: "totalAgents",
      label: "Agents",
      icon: <FaUserTie className="text-white text-sm sm:text-lg lg:text-xl" />,
      color: "text-[var(--color-secondary-text)]",
      bgColor: "bg-[var(--color-primary-50)]",
    },
    {
      key: "superAgents",
      label: "Super Agents",
      icon: <FaUserShield className="text-white text-sm sm:text-lg lg:text-xl" />,
      color: "text-[var(--color-secondary-text)]",
      bgColor: "bg-[var(--color-primary-50)]",
    },
    {
      key: "dealers",
      label: "Dealers",
      icon: <FaUserCheck className="text-white text-sm sm:text-lg lg:text-xl" />,
      color: "text-[var(--color-secondary-text)]",
      bgColor: "bg-[var(--color-primary-50)]",
    },
    {
      key: "superDealers",
      label: "Super Dealers",
      icon: <FaUserCog className="text-white text-sm sm:text-lg lg:text-xl" />,
      color: "text-[var(--color-secondary-text)]",
      bgColor: "bg-[var(--color-primary-50)]",
    },
  ];

  const getUserTypeCount = (key: string): number => {
    if (!stats) return 0;
    const typed = stats as unknown as Record<string, number | undefined>;
    return typed[key] ?? 0;
  };

  // --- Local carousel StatCard components (follow OrderAnalytics pattern) ---
  const StatusCarouselStatCard: React.FC = () => {
    // Auto-rotate inside the component (keeps behavior local and testable)
    useEffect(() => {
      const interval = setInterval(() => {
        setStatusCarouselIndex((prev) => (prev + 1) % statusCarousel.length);
      }, 4000);
      return () => clearInterval(interval);
    }, []);

    const current = statusCarousel[statusCarouselIndex];
    const count =
      current.key === "pending"
        ? stats?.pendingUsers || 0
        : current.key === "active"
          ? stats?.activeUsers || 0
          : stats?.rejectedUsers || 0;

    return (
      <div className="col-span-2 h-full relative">
        <StatCard
          title="Total Users"
          value={stats!.totalUsers}
          subtitle={`${current.label}: ${count}`}
          icon={<FaUsers />}
          size="lg"
        />


        {/* Indicators centered inside the StatCard (bottom) */}
        <div className="absolute left-0 right-0 bottom-3 flex justify-center pointer-events-auto">
          <div className="flex gap-2">
            {statusCarousel.map((_, i) => (
              <button
                key={i}
                onClick={() => setStatusCarouselIndex(i)}
                aria-label={`Show ${statusCarousel[i].label}`}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${i === statusCarouselIndex
                  ? statusCarousel[i].key === "pending"
                    ? "bg-[var(--color-warning)]"
                    : statusCarousel[i].key === "active"
                      ? "bg-[var(--color-success)]"
                      : "bg-[var(--color-error)]"
                  : "bg-[var(--color-border)]"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const UserTypeCarouselStatCard: React.FC = () => {
    // Auto-rotate regardless of stats presence (keeps behavior predictable)
    useEffect(() => {
      const interval = setInterval(() => {
        setUserTypeCarouselIndex((p) => (p + 1) % userTypeCarousel.length);
      }, 3000);
      return () => clearInterval(interval);
    }, []);

    const item = userTypeCarousel[userTypeCarouselIndex];
    return (
      <div className="relative h-full">
        <StatCard
          title={item.label}
          value={getUserTypeCount(item.key)}
          subtitle={`${getUserTypeCount(item.key)} total`}
          icon={item.icon}
          size="lg"
        />

        {/* Indicators centered inside the StatCard */}
        <div className="absolute left-0 right-0 bottom-3 flex justify-center pointer-events-auto">
          <div className="flex gap-2">
            {userTypeCarousel.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setUserTypeCarouselIndex(idx)}
                aria-label={`Go to ${userTypeCarousel[idx].label}`}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${idx === userTypeCarouselIndex ? "bg-[var(--color-text)]" : "bg-[var(--color-text)]/40"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };



  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[var(--color-surface)] rounded-lg shadow p-4 sm:p-6 border border-[var(--color-border)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2 text-[var(--color-text)]">
              User Management
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-secondary-text)]">
              Manage agent registrations and user accounts
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                fetchUsers();
                fetchStats();
              }}
              disabled={loading}
              size="sm"
            >
              <FaRedo className="mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <FaDownload className="mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {(statsLoading || stats) && (
        <div className="space-y-6">
          {/* Statistics Cards with Carousel */}
          <div className="grid grid-cols-2 gap-4 auto-rows-fr">
            {statsLoading ? (
              // Loading skeletons
              <>
                {/* Full-width carousel skeleton */}
                <div className="col-span-2 bg-[var(--color-control-bg)] rounded-lg shadow p-4 sm:p-6 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-[var(--color-gray-300)] rounded w-24 mb-2"></div>
                      <div className="h-8 bg-[var(--color-gray-300)] rounded w-20 mb-2"></div>
                      <div className="h-3 bg-[var(--color-gray-300)] rounded w-16"></div>
                    </div>
                    <div className="w-12 h-12 bg-[var(--color-gray-300)] rounded-full"></div>
                  </div>
                </div>
                {/* Other card skeletons */}
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index + 1} className="bg-[var(--color-surface)] rounded-lg shadow p-4 sm:p-6">
                    <div className="animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="h-4 bg-[var(--color-gray-200)] rounded w-20 mb-2"></div>
                          <div className="h-8 bg-[var(--color-gray-200)] rounded w-16 mb-2"></div>
                          <div className="h-3 bg-[var(--color-gray-200)] rounded w-24"></div>
                        </div>
                        <div className="w-8 h-8 bg-[var(--color-gray-200)] rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {/* Total Users (StatCard with status carousel) */}
                <StatusCarouselStatCard />

                {/* User Types (StatCard carousel) */}
                <UserTypeCarouselStatCard />

                {/* Active Users (StatCard component) */}
                <div>
                  <StatCard
                    title="Active Users"
                    value={stats!.activeUsers}
                    subtitle={`${stats!.totalUsers > 0 ? Math.round((stats!.activeUsers / stats!.totalUsers) * 100) : 0}% of total`}
                    icon={<FaUserCheck />}
                    size="md"
                  />
                </div>


              </>
            )}
          </div>
        </div>
      )}

      {/* View Mode Toggle and Search */}
      <div className="bg-[var(--color-surface)] rounded-lg shadow p-4 sm:p-6 border border-[var(--color-border)]">
        <div className="grid grid-cols-1 gap-4">
          {/* View Mode Toggle (top-right) */}
          <div className="flex justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-secondary-text)]">View:</span>
              <div className="flex bg-[var(--color-control-bg)] rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange("card")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "card"
                    ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
                    : "text-[var(--color-secondary-text)] hover:text-[var(--color-text)]"
                    }`}
                >
                  <FaTh className="w-4 h-4" />
                  Cards
                </button>
                <button
                  onClick={() => handleViewModeChange("list")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "list"
                    ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
                    : "text-[var(--color-secondary-text)] hover:text-[var(--color-text)]"
                    }`}
                >
                  <FaList className="w-4 h-4" />
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="w-full">
            <SearchAndFilter
              searchTerm={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search by name, email, or phone..."
              enableAutoSearch={true}
              debounceDelay={500}
              filters={filterOptions}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              onClearFilters={handleClearFilters}
              isLoading={loading}
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-[var(--color-failed-bg)] border border-[var(--color-error)] rounded-lg p-4">
          <p className="text-[var(--color-failed-text)] text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Users List */}
      <div className="bg-[var(--color-surface)] rounded-lg shadow overflow-hidden border border-[var(--color-border)]">
        {loading ? (
          <div className="p-4 sm:p-6">
            {viewMode === "card" ? (
              // Card view skeleton
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: itemsPerPage }).map((_, index) => (
                  <LoadingCard key={index} lines={4} showAvatar={true} />
                ))}
              </div>
            ) : (
              // List view skeleton
              <div className="bg-[var(--color-surface)] rounded-lg shadow overflow-hidden border border-[var(--color-border)]">
                {/* Table Header Skeleton */}
                <div className="bg-[var(--color-surface)] px-4 sm:px-6 py-3 border-b border-[var(--color-border)]">
                  <div className="grid grid-cols-12 gap-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton key={index} height="1rem" width="80%" />
                    ))}
                  </div>
                </div>

                {/* Table Body Skeleton */}
                <div className="divide-y divide-[var(--color-border)]">
                  {Array.from({ length: itemsPerPage }).map((_, index) => (
                    <div key={index} className="px-4 sm:px-6 py-4">
                      {/* Mobile Skeleton */}
                      <div className="md:hidden space-y-3">
                        <div className="flex items-center space-x-3">
                          <Skeleton variant="circular" width={40} height={40} />
                          <div className="flex-1 space-y-1">
                            <Skeleton height="1rem" width="60%" />
                            <Skeleton height="0.75rem" width="40%" />
                          </div>
                          <Skeleton height="1.5rem" width="60%" className="rounded-full" />
                        </div>
                        <div className="space-y-1">
                          <Skeleton height="0.75rem" width="80%" />
                          <Skeleton height="0.75rem" width="70%" />
                          <Skeleton height="0.75rem" width="50%" />
                        </div>
                        <div className="flex gap-2 justify-end pt-2 border-t border-[var(--color-border)]">
                          <Skeleton width={60} height={28} className="rounded" />
                          <Skeleton width={60} height={28} className="rounded" />
                        </div>
                      </div>

                      {/* Desktop Skeleton */}
                      <div className="hidden md:block">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-4 flex items-center space-x-3">
                            <Skeleton variant="circular" width={40} height={40} />
                            <div className="flex-1 space-y-1">
                              <Skeleton height="1rem" width="60%" />
                              <Skeleton height="0.75rem" width="40%" />
                              <Skeleton height="0.75rem" width="50%" />
                            </div>
                          </div>
                          <div className="col-span-3 space-y-1">
                            <Skeleton height="0.75rem" width="80%" />
                            <Skeleton height="0.75rem" width="70%" />
                            <Skeleton height="0.75rem" width="60%" />
                          </div>
                          <div className="col-span-2">
                            <Skeleton height="1rem" width="70%" />
                          </div>
                          <div className="col-span-2">
                            <Skeleton height="1.5rem" width="60%" className="rounded-full" />
                          </div>
                          <div className="col-span-1 flex gap-1 justify-end">
                            <Skeleton width={24} height={24} className="rounded" />
                            <Skeleton width={24} height={24} className="rounded" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <FaUser className="mx-auto text-[var(--color-secondary-text)] text-3xl sm:text-4xl mb-4" />
            <p className="text-sm sm:text-base text-[var(--color-secondary-text)]">
              No users found matching your criteria.
            </p>
          </div>
        ) : viewMode === "list" ? (
          // List View - Table-like layout
          <div className="bg-[var(--color-surface)] rounded-lg shadow overflow-hidden border border-[var(--color-border)]">
            {/* Table Header */}
            <div className="bg-[var(--color-control-bg)] px-4 sm:px-6 py-3 border-b border-[var(--color-border)] hidden md:block">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-[var(--color-secondary-text)] uppercase tracking-wider">
                <div className="col-span-4">User</div>
                <div className="col-span-3">Contact</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-[var(--color-border)]">
              {users.map((user) => (
                <div key={user._id} className="px-4 sm:px-6 py-4 hover:bg-[var(--color-control-bg)] transition-colors">
                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-[var(--color-primary-500)] rounded-full flex items-center justify-center text-[var(--color-surface)] font-semibold text-sm">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--color-text)] truncate">
                          {user.fullName}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {getUserTypeIcon(user.userType)}
                          <span className="text-xs text-[var(--color-secondary-text)] font-medium">
                            {getUserTypeLabel(user.userType)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {user.status === "pending"
                            ? "Pending"
                            : user.status.charAt(0).toUpperCase() +
                            user.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-[var(--color-secondary-text)]">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone className="w-4 h-4 flex-shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                      {user.agentCode && (
                        <div className="flex items-center gap-2">
                          <FaIdCard className="w-4 h-4 flex-shrink-0" />
                          <span>{user.agentCode}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-[var(--color-secondary-text)]">
                        <FaCalendar className="w-3 h-3" />
                        <span>Joined {formatDate(user.createdAt || "")}</span>
                        {user.businessName && (
                          <>
                            <span>•</span>
                            <FaBuilding className="w-3 h-3 ml-1" />
                            <span>{user.businessName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-[var(--color-border)]">
                      {user.userType === "agent" &&
                        user.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleApprove(user._id)}
                              disabled={processingUser === user._id}
                              className="text-xs"
                            >
                              {processingUser === user._id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <FaCheck className="mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleReject(user._id)}
                              disabled={processingUser === user._id}
                              className="text-xs"
                            >
                              {processingUser === user._id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <FaTimes className="mr-1" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(`/superadmin/users/${user._id}`)
                        }
                        className="text-xs"
                      >
                        <FaEye className="mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* User Info */}
                      <div className="col-span-4 flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-[var(--color-primary-500)] rounded-full flex items-center justify-center text-[var(--color-surface)] font-semibold text-sm">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[var(--color-text)] truncate">
                            {user.fullName}
                          </div>
                          <div className="text-xs text-[var(--color-secondary-text)] truncate">
                            Joined {formatDate(user.createdAt || "")}
                          </div>
                          {user.businessName && (
                            <div className="text-xs text-[var(--color-secondary-text)] truncate flex items-center gap-1">
                              <FaBuilding className="w-3 h-3" />
                              {user.businessName}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="col-span-3 space-y-1">
                        <div className="flex items-center gap-1 text-xs text-[var(--color-secondary-text)]">
                          <FaEnvelope className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[var(--color-secondary-text)]">
                          <FaPhone className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{user.phone}</span>
                        </div>
                        {user.agentCode && (
                          <div className="flex items-center gap-1 text-xs text-[var(--color-secondary-text)]">
                            <FaIdCard className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{user.agentCode}</span>
                          </div>
                        )}
                      </div>

                      {/* User Type */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          {getUserTypeIcon(user.userType)}
                          <span className="text-xs font-medium text-[var(--color-text)]">
                            {getUserTypeLabel(user.userType)}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {user.status === "pending"
                            ? "Pending"
                            : user.status.charAt(0).toUpperCase() +
                            user.status.slice(1)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex gap-1 justify-end">
                        {user.userType === "agent" &&
                          user.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleApprove(user._id)}
                                disabled={processingUser === user._id}
                                className="text-xs p-1"
                                title="Approve"
                              >
                                {processingUser === user._id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : (
                                  <FaCheck className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleReject(user._id)}
                                disabled={processingUser === user._id}
                                className="text-xs p-1"
                                title="Reject"
                              >
                                {processingUser === user._id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : (
                                  <FaTimes className="w-3 h-3" />
                                )}
                              </Button>
                            </>
                          )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(`/superadmin/users/${user._id}`)
                          }
                          className="text-xs p-1"
                          title="View Details"
                        >
                          <FaEye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Card View (default)
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-5 border-b border-[var(--color-border)]">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--color-primary-500)] rounded-full flex items-center justify-center text-[var(--color-surface)] font-semibold text-sm sm:text-base">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text)] truncate">
                          {user.fullName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getUserTypeIcon(user.userType)}
                          <span className="text-xs sm:text-sm text-[var(--color-secondary-text)] font-medium">
                            {getUserTypeLabel(user.userType)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {user.status === "pending"
                            ? "Pending"
                            : user.status.charAt(0).toUpperCase() +
                            user.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 space-y-3">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-[var(--color-secondary-text)]">
                        <FaEnvelope className="w-4 h-4 flex-shrink-0 text-[var(--color-muted-text)]" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--color-secondary-text)]">
                        <FaPhone className="w-4 h-4 flex-shrink-0 text-[var(--color-muted-text)]" />
                        <span className="truncate">{user.phone}</span>
                      </div>
                      {user.agentCode && (
                        <div className="flex items-center gap-2 text-sm text-[var(--color-secondary-text)]">
                          <FaIdCard className="w-4 h-4 flex-shrink-0 text-[var(--color-muted-text)]" />
                          <span className="truncate">{user.agentCode}</span>
                        </div>
                      )}
                    </div>

                    {/* Business Name */}
                    {user.businessName && (
                      <div className="flex items-center gap-2 text-sm text-[var(--color-secondary-text)]">
                        <FaBuilding className="w-4 h-4 flex-shrink-0 text-[var(--color-muted-text)]" />
                      </div>
                    )}

                    {/* Registration Date */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--color-secondary-text)]">
                      <FaCalendar className="w-3 h-3 flex-shrink-0 text-[var(--color-muted-text)]" />
                      <span>Joined {formatDate(user.createdAt || "")}</span>
                    </div>
                  </div>

                  {/* Card Footer - Actions */}
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                    <div className="flex flex-col gap-2">
                      {user.userType === "agent" &&
                        user.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleApprove(user._id)}
                              disabled={processingUser === user._id}
                              className="flex-1 text-xs sm:text-sm"
                            >
                              {processingUser === user._id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mx-auto"></div>
                              ) : (
                                <>
                                  <FaCheck className="mr-1 sm:mr-2" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleReject(user._id)}
                              disabled={processingUser === user._id}
                              className="flex-1 text-xs sm:text-sm"
                            >
                              {processingUser === user._id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mx-auto"></div>
                              ) : (
                                <>
                                  <FaTimes className="mr-1 sm:mr-2" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(`/superadmin/users/${user._id}`)
                        }
                        className="w-full text-xs sm:text-sm"
                      >
                        <FaEye className="mr-1 sm:mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            showInfo={true}
            showPerPageSelector={true}
            perPageOptions={[10, 20, 30, 50]}
          />
        </div>
      )}
    </div>
  );
}
