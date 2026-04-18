import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userService, type User } from "../../services/user.service";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaUserShield,
  FaUserCheck,
  FaUserTimes,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaCalendar,
  FaWallet,
  FaShoppingCart,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser,
  FaIdCard,
} from "react-icons/fa";
import { orderService } from "../../services/order.service";
import { authService } from "../../services/auth.service";
import { PageLoader } from "../../components/page-loader";
import type { Order } from "../../types/order";
import { Modal } from "../../design-system/components/modal";
import {
  Alert,
  Button,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Input,
  Select,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  useToast,
} from "../../design-system";

export default function SuperAdminUserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<
    Partial<User & { subscriptionPlan?: string; subscriptionStatus?: string }>
  >({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const { addToast } = useToast();
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [impersonateLoading, setImpersonateLoading] = useState(false);

  const startEdit = () => {
    if (!user) return;
    setEditData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      businessName: user.businessName,
      businessCategory: user.businessCategory,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
    });
    setEditMode(true);
    setEditError(null);
    addToast("Edit mode enabled", "info");
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const updateEditField = (field: string, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const userTypeOptions = [
    { value: "agent", label: "Agent" },
    { value: "super_agent", label: "Super Agent" },
    { value: "dealer", label: "Dealer" },
    { value: "super_dealer", label: "Super Dealer" },
    { value: "super_admin", label: "Super Admin" },
  ];

  const businessCategoryOptions = [
    { value: "", label: "Select Category" },
    { value: "electronics", label: "Electronics" },
    { value: "fashion", label: "Fashion" },
    { value: "food", label: "Food" },
    { value: "services", label: "Services" },
    { value: "other", label: "Other" },
  ];

  const subscriptionPlanOptions = [
    { value: "", label: "Select Plan" },
    { value: "basic", label: "Basic" },
    { value: "premium", label: "Premium" },
    { value: "enterprise", label: "Enterprise" },
  ];

  const subscriptionStatusOptions = [
    { value: "", label: "Select Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
  ];

  const saveEdit = async () => {
    if (!user) return;
    setEditLoading(true);
    setEditError(null);
    try {
      await userService.updateUser(user._id, editData);
      setEditMode(false);
      fetchUser();
      addToast("User updated successfully", "success");
    } catch (e) {
      if (e instanceof Error) {
        setEditError(e.message || "Failed to update user");
        addToast(e.message || "Failed to update user", "error");
      } else {
        setEditError("Failed to update user");
        addToast("Failed to update user", "error");
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await userService.updateUser(user._id, { isActive: false });
      fetchUser();
      addToast("User deactivated successfully", "success");
    } catch {
      addToast("Failed to deactivate user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await userService.updateUser(user._id, { isActive: true });
      fetchUser();
      addToast("User reactivated successfully", "success");
    } catch {
      addToast("Failed to reactivate user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      if (id) {
        const data = await userService.fetchUserById(id);
        setUser(data);
        // Fetch recent orders for this user
        await fetchUserOrders(id);
      }
    } catch {
      setError("Failed to fetch user");
      addToast("Failed to fetch user details", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async (userId: string) => {
    setOrdersLoading(true);
    try {
      const recentOrders = await orderService.getOrdersByUserId(userId, 10);
      setOrders(recentOrders);
    } catch (error) {
      console.error("Failed to fetch user orders:", error);
      addToast("Failed to load user orders", "error");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, [id]);

  const handleApprove = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await userService.updateAgentStatus(user._id, "active");
      fetchUser();
      addToast("Agent approved successfully", "success");
    } catch {
      addToast("Failed to approve agent", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await userService.updateAgentStatus(user._id, "rejected");
      fetchUser();
      addToast("Agent rejected successfully", "success");
    } catch {
      addToast("Failed to reject agent", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    setResetLoading(true);
    setResetError(null);
    try {
      await userService.resetUserPassword(user._id, resetPassword);
      setShowResetModal(false);
      setResetPassword("");
      addToast("Password reset successfully", "success");
    } catch (e) {
      if (e instanceof Error) {
        setResetError(e.message || "Failed to reset password");
        addToast(e.message || "Failed to reset password", "error");
      } else {
        setResetError("Failed to reset password");
        addToast("Failed to reset password", "error");
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    setDeleteLoading(true);
    try {
      await userService.deleteUser(user._id);
      addToast("User deleted successfully", "success");
      navigate(-1);
    } catch (e) {
      if (e instanceof Error) {
        addToast(e.message || "Failed to delete user", "error");
      } else {
        addToast("Failed to delete user", "error");
      }
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleImpersonate = async () => {
    if (!user) return;
    setImpersonateLoading(true);
    try {
      // Get current admin data from auth service
      const adminToken = authService.getToken();
      const adminUser = authService.getCurrentUser();

      if (!adminToken || !adminUser) {
        throw new Error("No admin authentication data found");
      }

      // Call the impersonation API (now returns refreshToken too)
      const { token, refreshToken, user: impersonatedUser } =
        await userService.impersonateUser(user._id);

      // Use the impersonation service to start impersonation
      const ImpersonationService = (await import("../../utils/impersonation"))
        .default;
      ImpersonationService.startImpersonation(
        adminToken,
        adminUser,
        impersonatedUser,
        token,
        refreshToken
      );

      // Show success message
      addToast(`Now impersonating ${impersonatedUser.fullName}`, "success");

      // Redirect based on user type
      if (impersonatedUser.userType === "agent") {
        window.location.href = "/agent/dashboard";
      } else if (
        ["dealer", "super_dealer", "super_agent"].includes(
          impersonatedUser.userType
        )
      ) {
        window.location.href = "/agent/dashboard";
      } else if (impersonatedUser.userType === "super_admin") {
        window.location.href = "/superadmin";
      } else {
        // Fallback to home page
        window.location.href = "/";
      }
    } catch (e) {
      if (e instanceof Error) {
        addToast(e.message || "Failed to impersonate user", "error");
      } else {
        addToast("Failed to impersonate user", "error");
      }
    } finally {
      setImpersonateLoading(false);
    }
  };

  const handleViewOrder = (orderId: string) => {
    try {
      // Find the order to get its order number
      const order = orders.find((o) => o._id === orderId);
      if (order && order.orderNumber) {
        // Navigate to orders page with order number as search parameter
        navigate(
          `/superadmin/orders?search=${encodeURIComponent(order.orderNumber)}`
        );
        addToast("Navigating to order", "info");
      } else {
        addToast("Order not found", "error");
      }
    } catch {
      addToast("Failed to navigate to order", "error");
    }
  };

  const getStatusBadgeScheme = (
    status: string
  ): "success" | "warning" | "error" | "gray" => {
    switch (status) {
      case "active":
      case "completed":
      case "confirmed":
        return "success";
      case "pending":
      case "processing":
      case "partiallyCompleted":
        return "warning";
      case "rejected":
      case "failed":
      case "cancelled":
        return "error";
      default:
        return "gray";
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "agent":
        return <FaUserShield className="text-blue-600" />;
      case "customer":
        return <FaUser className="text-green-600" />;
      case "super_admin":
        return <FaUserCheck className="text-purple-600" />;
      default:
        return <FaUser className="text-gray-600" />;
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case "agent":
        return "Agent";
      case "customer":
        return "Customer";
      case "super_admin":
        return "Super Admin";
      default:
        return userType;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  if (loading) {
    return <PageLoader text="Loading user details..." />;
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-500 text-3xl sm:text-4xl mx-auto mb-4" />
          <p className="text-red-600 text-base sm:text-lg">
            {error || "User not found"}
          </p>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mt-4"
            size="sm"
          >
            <FaArrowLeft className="mr-2" />
            <span className="hidden sm:inline">Go Back</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              size="sm"
              className="flex items-center"
            >
              <FaArrowLeft className="mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                User Details
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage user account and permissions
              </p>
            </div>
          </div>
        </div>

        {/* User Information Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div className="flex sm:items-center space-y-3 sm:space-y-0 space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {user.fullName}
                  </h2>
                  <div className="flex flex-row sm:items-center gap-2 sm:gap-2 text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      {getUserTypeIcon(user.userType)}
                      <span>{getUserTypeLabel(user.userType)}</span>
                      {user.agentCode && (
                        <span className="text-xs text-gray-500">
                          ({user.agentCode})
                        </span>
                      )}
                    </div>
                    <Badge
                      variant="subtle"
                      colorScheme={getStatusBadgeScheme(user.status)}
                    >
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startEdit}
                  disabled={editMode}
                  className="w-full"
                >
                  <FaEdit className="mr-2" />
                  <span className="">Edit</span>
                </Button>
                {user.userType !== "super_admin" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleImpersonate}
                    isLoading={impersonateLoading}
                    className="w-full"
                  >
                    <FaUserShield className="mr-2" />
                    <span>Impersonate</span>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <FaIdCard className="mr-2 text-blue-600" />
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <FaEnvelope className="text-gray-400 w-4 h-4 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500">Email</p>
                      <p className="text-sm sm:text-base text-gray-900 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaPhone className="text-gray-400 w-4 h-4 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500">Phone</p>
                      <p className="text-sm sm:text-base text-gray-900">
                        {user.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaCalendar className="text-gray-400 w-4 h-4 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500">
                        Registered
                      </p>
                      <p className="text-sm sm:text-base text-gray-900">
                        {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaWallet className="text-gray-400 w-4 h-4 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500">
                        Wallet Balance
                      </p>
                      <p className="text-sm sm:text-base text-gray-900">
                        {formatCurrency(user.walletBalance || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information (for agents) */}
              {user.userType === "agent" && (
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                    <FaBuilding className="mr-2 text-green-600" />
                    Business Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <FaBuilding className="text-gray-400 w-4 h-4 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-500">
                          Business Name
                        </p>
                        <p className="text-sm sm:text-base text-gray-900 truncate">
                          {user.businessName || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaUserShield className="text-gray-400 w-4 h-4 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-500">
                          Business Category
                        </p>
                        <p className="text-sm sm:text-base text-gray-900 capitalize">
                          {user.businessCategory || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaCheckCircle className="text-gray-400 w-4 h-4 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-500">
                          Subscription Plan
                        </p>
                        <p className="text-sm sm:text-base text-gray-900 capitalize">
                          {user.subscriptionPlan || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaClock className="text-gray-400 w-4 h-4 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-500">
                          Subscription Status
                        </p>
                        <p className="text-sm sm:text-base text-gray-900 capitalize">
                          {user.subscriptionStatus || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                {user.userType === "agent" && user.status === "pending" && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleApprove}
                      isLoading={actionLoading}
                      className="w-full sm:w-auto"
                    >
                      <FaUserCheck className="mr-2" />
                      <span className="hidden sm:inline">Approve Agent</span>
                      <span className="sm:hidden">Approve</span>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleReject}
                      isLoading={actionLoading}
                      className="w-full sm:w-auto"
                    >
                      <FaUserTimes className="mr-2" />
                      <span className="hidden sm:inline">Reject Agent</span>
                      <span className="sm:hidden">Reject</span>
                    </Button>
                  </>
                )}
                {user.isActive ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDeactivate}
                    isLoading={actionLoading}
                    className="w-full sm:w-auto"
                  >
                    <FaUserTimes className="mr-2" />
                    <span className="hidden sm:inline">Deactivate</span>
                    <span className="sm:hidden">Deactivate</span>
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleReactivate}
                    isLoading={actionLoading}
                    className="w-full sm:w-auto"
                  >
                    <FaUserCheck className="mr-2" />
                    <span className="hidden sm:inline">Reactivate</span>
                    <span className="sm:hidden">Reactivate</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetModal(true)}
                  className="w-full sm:w-auto"
                >
                  <FaEdit className="mr-2" />
                  <span className="hidden sm:inline">Reset Password</span>
                  <span className="sm:hidden">Reset</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  isLoading={deleteLoading}
                  className="w-full sm:w-auto"
                >
                  <FaTrash className="mr-2" />
                  <span className="hidden sm:inline">Delete User</span>
                  <span className="sm:hidden">Delete</span>
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Edit Form */}
        {editMode && (
          <Card>
            <CardHeader>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Edit User Information
              </h3>
            </CardHeader>
            <CardBody>
              {editError && (
                <Alert status="error" variant="left-accent" className="mb-4" title="Update failed">
                  {editError}
                </Alert>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="fullName"
                  value={editData.fullName || ""}
                  onChange={handleEditChange}
                />
                <Input
                  label="Email"
                  name="email"
                  value={editData.email || ""}
                  onChange={handleEditChange}
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={editData.phone || ""}
                  onChange={handleEditChange}
                />
                <Select
                  label="User Type"
                  value={String(editData.userType || "agent")}
                  onChange={(value) => updateEditField("userType", value)}
                  options={userTypeOptions}
                />
                {["agent", "super_agent", "dealer", "super_dealer"].includes(
                  editData.userType || user.userType
                ) && (
                    <>
                      <Input
                        label="Business Name"
                        name="businessName"
                        value={editData.businessName || ""}
                        onChange={handleEditChange}
                      />
                      <Select
                        label="Business Category"
                        value={String(editData.businessCategory || "")}
                        onChange={(value) => updateEditField("businessCategory", value)}
                        options={businessCategoryOptions}
                      />
                      <Select
                        label="Subscription Plan"
                        value={String(editData.subscriptionPlan || "")}
                        onChange={(value) => updateEditField("subscriptionPlan", value)}
                        options={subscriptionPlanOptions}
                      />
                      <Select
                        label="Subscription Status"
                        value={String(editData.subscriptionStatus || "")}
                        onChange={(value) => updateEditField("subscriptionStatus", value)}
                        options={subscriptionStatusOptions}
                      />
                    </>
                  )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  variant="primary"
                  onClick={saveEdit}
                  isLoading={editLoading}
                  size="sm"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditMode(false);
                    addToast("Edit mode cancelled", "info");
                  }}
                  disabled={editLoading}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <FaShoppingCart className="mr-2 text-blue-600" />
                Recent Orders
              </h3>
              <div className="text-xs sm:text-sm text-gray-500">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {ordersLoading ? (
              <div className="text-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm sm:text-base text-gray-600">
                  Loading orders...
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <FaShoppingCart className="text-gray-400 text-3xl sm:text-4xl mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-500">
                  No orders found for this user.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 sm:hidden">
                  {orders.map((order) => (
                    <div key={order._id || order.orderNumber} className="rounded-2xl border border-gray-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {order.orderNumber || order._id}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(order.total || 0)}
                          </span>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleViewOrder(order._id || "")}
                          >
                            <FaEye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-xs text-gray-500">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </p>
                        <Badge variant="subtle" colorScheme={getStatusBadgeScheme(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden sm:block overflow-x-auto">
                  <Table size="sm" colorScheme="gray" className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Order</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Total</TableHeaderCell>
                        <TableHeaderCell className="hidden sm:table-cell">Created</TableHeaderCell>
                        <TableHeaderCell>Actions</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order._id || order.orderNumber}>
                          <TableCell>
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                              {order.orderNumber || order._id}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.items.length} item
                              {order.items.length !== 1 ? "s" : ""}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="subtle" colorScheme={getStatusBadgeScheme(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(order.total || 0)}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {order.createdAt ? formatDate(order.createdAt) : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handleViewOrder(order._id || "")}
                            >
                              <FaEye className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        {/* Modals */}
        {showResetModal && (
          <Modal
            isOpen={showResetModal}
            onClose={() => setShowResetModal(false)}
            title="Reset Password"
          >
            <div className="space-y-4">
              <p className="text-sm sm:text-base text-gray-600">
                Enter a new password for this user.
              </p>
              <Input
                label="New Password"
                name="newPassword"
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                minLength={6}
                required
              />
              {resetError && (
                <Alert status="error" variant="left-accent" title="Reset failed">
                  {resetError}
                </Alert>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  onClick={handleResetPassword}
                  isLoading={resetLoading}
                  size="sm"
                >
                  Reset Password
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResetModal(false);
                    addToast("Password reset cancelled", "info");
                  }}
                  disabled={resetLoading}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {showDeleteConfirm && (
          <Modal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            title="Delete User"
          >
            <div className="space-y-4">
              <Alert
                status="error"
                variant="left-accent"
                title="Warning"
                icon={<FaExclamationTriangle className="w-4 h-4" />}
              >
                Are you sure you want to delete this user? This action cannot
                be undone and will permanently remove all user data.
              </Alert>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  onClick={handleDeleteUser}
                  isLoading={deleteLoading}
                  size="sm"
                >
                  Delete User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    addToast("Delete action cancelled", "info");
                  }}
                  disabled={deleteLoading}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
