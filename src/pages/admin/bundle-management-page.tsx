import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bundleService } from "../../services/bundle.service";
import { packageService } from "../../services/package.service";
import type { Bundle, Package, CreateBundleData } from "../../types/package";
import { SearchAndFilter } from "../../components/common";
import {
  FaCube,
  FaEdit,
  FaTrash,
  FaPlus,
  FaBuilding,
  FaDownload,
  FaRedo,
  FaCalendar,
  FaCheckCircle,
  FaDatabase,
  FaArrowLeft,
  FaTimesCircle,
  FaDollarSign,
} from "react-icons/fa";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Spinner,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "../../design-system";
import { useTheme } from "../../hooks/use-theme";
import { BundleCreationModal } from "../../components/products/BundleCreationModal";
import { PricingManagementModal } from "../../components/products/PricingManagementModal";
import { BulkPricingManagementModal } from "../../components/products/BulkPricingManagementModal";
import { useToast } from "../../design-system/components/toast";
import { getProviderColors } from "../../utils/provider-colors";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active", color: "text-[var(--color-success-icon)] bg-[var(--color-success-bg)]" },
  { value: "inactive", label: "Inactive", color: "text-[var(--color-error)] bg-[var(--color-failed-bg)]" },
];

const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "daily", label: "Daily", color: "text-[var(--color-primary-700)] bg-[var(--color-primary-100)]" },
  { value: "weekly", label: "Weekly", color: "text-[var(--color-info)] bg-[var(--color-primary-100)]" },
  { value: "monthly", label: "Monthly", color: "text-[var(--color-success-icon)] bg-[var(--color-success-bg)]" },
  {
    value: "unlimited",
    label: "Unlimited",
    color: "text-[var(--color-warning)] bg-[var(--color-pending-bg)]",
  },
  { value: "custom", label: "Custom", color: "text-[var(--color-secondary-text)] bg-[var(--color-control-bg)]" },
];

const dataUnitOptions = [
  { value: "", label: "All Units" },
  { value: "MB", label: "MB", color: "text-[var(--color-primary-700)] bg-[var(--color-primary-100)]" },
  { value: "GB", label: "GB", color: "text-[var(--color-success-icon)] bg-[var(--color-success-bg)]" },
  { value: "TB", label: "TB", color: "text-[var(--color-info)] bg-[var(--color-primary-100)]" },
];

export const BundleManagementPage: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [allBundles, setAllBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editBundle, setEditBundle] = useState<Bundle | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBundle, setDeleteBundle] = useState<Bundle | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingBundle, setPricingBundle] = useState<Bundle | null>(null);
  const [showBulkPricingModal, setShowBulkPricingModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter states
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [dataUnit, setDataUnit] = useState("");
  const [search, setSearch] = useState("");
  const { themeMode } = useTheme();

  const packageProviderColors = getProviderColors(pkg?.provider, themeMode);

  // Filter options for the reusable component
  const filterOptions = {
    status: {
      value: status,
      options: statusOptions,
      label: "Status",
      placeholder: "All Status",
    },
    category: {
      value: category,
      options: categoryOptions,
      label: "Category",
      placeholder: "All Categories",
    },
    dataUnit: {
      value: dataUnit,
      options: dataUnitOptions,
      label: "Data Unit",
      placeholder: "All Units",
    },
  };

  const fetchBundles = async () => {
    if (!packageId) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch all bundles for this package without filters
      const response = await bundleService.getBundlesByPackage(packageId, {
        page: 1,
        limit: 1000, // Get all bundles for this package
      });

      const fetchedBundles = response.bundles || [];
      setAllBundles(fetchedBundles); // Store all bundles for filtering

      // Apply current filters to the fetched bundles
      applyFiltersToBundles(fetchedBundles);
    } catch {
      setError("Failed to fetch bundles");
      addToast("Failed to fetch bundles", "error");
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersToBundles = (bundlesToFilter: Bundle[]) => {
    let filteredBundles = bundlesToFilter;

    // Filter by status
    if (status) {
      filteredBundles = filteredBundles.filter((bundle) =>
        status === "active" ? bundle.isActive : !bundle.isActive
      );
    }

    // Filter by category
    if (category) {
      filteredBundles = filteredBundles.filter(
        (bundle) => bundle.category === category
      );
    }

    // Filter by data unit
    if (dataUnit) {
      filteredBundles = filteredBundles.filter(
        (bundle) => bundle.dataUnit === dataUnit
      );
    }

    // Filter by search term
    if (search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      filteredBundles = filteredBundles.filter(
        (bundle) =>
          bundle.name.toLowerCase().includes(searchTerm) ||
          bundle.description?.toLowerCase().includes(searchTerm) ||
          (bundle.dataVolume &&
            bundle.dataVolume.toString().includes(searchTerm)) ||
          (bundle.dataUnit &&
            bundle.dataUnit.toLowerCase().includes(searchTerm))
      );
    }

    setBundles(filteredBundles);

    if (
      filteredBundles.length === 0 &&
      (status || category || dataUnit || search.trim())
    ) {
      addToast("No bundles found matching your criteria", "info");
    }
  };

  const fetchPackage = async () => {
    if (!packageId) return;
    try {
      const packageData = await packageService.getPackage(packageId);
      setPkg(packageData);
    } catch {
      setError("Failed to fetch package details");
    }
  };

  useEffect(() => {
    fetchPackage();
  }, [packageId]);

  useEffect(() => {
    fetchBundles();
  }, [packageId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
    if (search.trim()) {
      addToast(`Searching for bundles matching "${search}"`, "info");
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setCategory("");
    setDataUnit("");
    applyFilters();
    addToast("Filters cleared", "info");
  };

  const applyFilters = () => {
    if (!allBundles) return;
    applyFiltersToBundles(allBundles);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "status") {
      setStatus(value);
    } else if (filterKey === "category") {
      setCategory(value);
    } else if (filterKey === "dataUnit") {
      setDataUnit(value);
    }
    // Apply filters immediately when filter changes
    setTimeout(() => applyFilters(), 0);
  };

  const handleCreate = () => {
    setEditBundle(null);
    setShowFormModal(true);
  };

  const handleEdit = (bundle: Bundle) => {
    setEditBundle(bundle);
    setShowFormModal(true);
  };

  const handleDelete = (bundle: Bundle) => {
    setDeleteBundle(bundle);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteBundle?._id) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await bundleService.deleteBundle(deleteBundle._id);
      setShowDeleteModal(false);
      setDeleteBundle(null);
      await fetchBundles();
      addToast("Bundle deleted successfully", "success");
    } catch {
      setActionError("Failed to delete bundle");
      addToast("Failed to delete bundle", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePricingManagement = (bundle: Bundle) => {
    setPricingBundle(bundle);
    setShowPricingModal(true);
  };

  const handlePricingUpdated = async () => {
    await fetchBundles();
    setShowPricingModal(false);
    setPricingBundle(null);
    addToast("Pricing updated successfully", "success");
  };

  const handleBulkPricing = () => {
    if (bundles.length === 0) {
      addToast("No bundles available for pricing management", "warning");
      return;
    }
    setShowBulkPricingModal(true);
  };

  const handleBulkPricingUpdated = async () => {
    await fetchBundles();
    setShowBulkPricingModal(false);
    addToast("Bulk pricing updated successfully", "success");
  };

  const handleFormSubmit = async (data: Bundle) => {
    setActionLoading(true);
    setActionError(null);
    try {
      if (editBundle?._id) {
        // For updates, handle providerId properly
        let providerIdValue: string | undefined = data.providerId;
        if (typeof data.providerId === "object" && data.providerId !== null) {
          const providerObj = data.providerId as { _id?: string; id?: string };
          providerIdValue = providerObj._id || providerObj.id;
        }

        const finalUpdateData: Partial<Bundle> = {
          name: data.name,
          description: data.description,
          price: data.price,
          currency: data.currency,
          features: data.features,
          isActive: data.isActive,
          bundleCode: data.bundleCode,
          category: data.category,
          tags: data.tags,
        };

        // Only include data fields for non-AFA bundles
        const isAfaBundle = pkg?.provider === "AFA";
        if (!isAfaBundle) {
          finalUpdateData.dataVolume = data.dataVolume;
          finalUpdateData.dataUnit = data.dataUnit;
          finalUpdateData.validity = data.validity;
          finalUpdateData.validityUnit = data.validityUnit;
        }

        // Include AFA-specific fields if applicable
        if (isAfaBundle) {
          finalUpdateData.requiresGhanaCard = data.requiresGhanaCard;
          finalUpdateData.afaRequirements = data.afaRequirements;
        }

        // Only add providerId if we have a valid value
        if (providerIdValue) {
          finalUpdateData.providerId = String(providerIdValue);
        }

        await bundleService.updateBundle(editBundle._id, finalUpdateData);
        addToast("Bundle updated successfully", "success");
      } else {
        // For creation, only send providerCode, not providerId
        if (!pkg?.provider) {
          throw new Error("Package provider information is missing");
        }

        const createData: CreateBundleData = {
          name: data.name,
          description: data.description,
          price: data.price,
          currency: data.currency,
          features: data.features,
          isActive: data.isActive,
          bundleCode: data.bundleCode,
          category: data.category,
          tags: data.tags,
          packageId: packageId || "",
          providerCode: pkg.provider, // Only send providerCode for creation
        };

        // Only include data fields for non-AFA bundles
        const isAfaBundle = pkg?.provider === "AFA";
        if (!isAfaBundle) {
          createData.dataVolume = data.dataVolume;
          createData.dataUnit = data.dataUnit;
          createData.validity = data.validity;
          createData.validityUnit = data.validityUnit;
        }

        // Include AFA-specific fields if applicable
        if (isAfaBundle) {
          createData.requiresGhanaCard = data.requiresGhanaCard;
          createData.afaRequirements = data.afaRequirements;
        }

        await bundleService.createBundle(createData);
        addToast("Bundle created successfully", "success");
      }
      setShowFormModal(false);
      setEditBundle(null);
      await fetchBundles();
    } catch (error) {
      console.error("Bundle save error:", error);
      setActionError("Failed to save bundle");
      addToast("Failed to save bundle", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "daily":
        return "text-[var(--color-primary-500)] bg-[var(--color-primary-100)]";
      case "weekly":
        return "text-[var(--color-info)] bg-[var(--color-primary-100)]";
      case "monthly":
        return "text-[var(--color-success-icon)] bg-[var(--color-success-bg)]";
      case "unlimited":
        return "text-[var(--color-warning)] bg-[var(--color-pending-bg)]";
      case "custom":
        return "text-[var(--color-secondary-text)] bg-[var(--color-control-bg)]";
      default:
        return "text-[var(--color-secondary-text)] bg-[var(--color-control-bg)]";
    }
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number, currency: string = "GHS") => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Calculate statistics
  const stats = {
    total: bundles.length,
    active: bundles.filter((b) => b.isActive).length,
    inactive: bundles.filter((b) => !b.isActive).length,
    totalValue: bundles.reduce((sum, b) => sum + (b.price || 0), 0),
  };

  if (loading && !pkg) {
    return (
      <div className="p-6 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-[var(--color-secondary-text)]">Loading package details...</span>
        </div>
      </div>
    );
  }

  if (error && !pkg) {
    return (
      <div className="p-6">
        <div className="rounded-lg p-4" style={{ background: 'var(--color-failed-bg)', border: '1px solid var(--color-border)' }}>
          <p className="text-[var(--color-error)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <FaArrowLeft />
                Back
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold mb-2">
                  Bundle Management
                </h1>
                <p className="text-sm sm:text-base text-[var(--color-secondary-text)]">
                  Managing bundles for:{" "}
                  <span className="font-semibold">{pkg?.name}</span>
                </p>
                {pkg?.description && (
                  <p className="text-sm text-[var(--color-muted-text)] mt-1">
                    {pkg.description}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:flex gap-2 w-full lg:w-auto">
              <Button
                variant="outline"
                onClick={fetchBundles}
                disabled={loading}
                size="sm"
                className="w-full"
              >
                <FaRedo className="mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                colorScheme="success"
                onClick={handleBulkPricing}
                disabled={loading || bundles.length === 0}
                size="sm"
                className="w-full"
              >
                <FaDollarSign className="mr-2" />
                Bulk Pricing
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <FaDownload className="mr-2" />
                Export
              </Button>
              <Button onClick={handleCreate} size="sm" className="col-span-2 sm:col-span-1 w-full">
                <FaPlus className="mr-2" />
                Create Bundle
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[var(--color-secondary-text)]">
                  Total Bundles
                </p>
                <p className="text-lg sm:text-2xl font-bold text-[var(--color-text)]">
                  {stats.total}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-[var(--color-primary-100)]">
                <FaCube className="text-[var(--color-primary-500)] text-lg sm:text-xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[var(--color-secondary-text)]">
                  Active
                </p>
                <p className="text-lg sm:text-2xl font-bold text-[var(--color-success-icon)]">
                  {stats.active}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-[var(--color-success-bg)]">
                <FaCheckCircle className="text-[var(--color-success-icon)] text-lg sm:text-xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[var(--color-secondary-text)]">
                  Inactive
                </p>
                <p className="text-lg sm:text-2xl font-bold text-[var(--color-error)]">
                  {stats.inactive}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-[var(--color-failed-bg)]">
                <FaTimesCircle className="text-[var(--color-error)] text-lg sm:text-xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[var(--color-secondary-text)]">
                  Total Value
                </p>
                <p className="text-lg sm:text-2xl font-bold text-[var(--color-info)]">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-full bg-[var(--color-control-bg)]">
                <FaDatabase className="text-[var(--color-info)] text-lg sm:text-xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[var(--color-secondary-text)]">
                  Provider
                </p>
                <p
                  className="text-lg sm:text-2xl font-bold"
                  style={{
                    color: packageProviderColors.primary,
                  }}
                >
                  {pkg?.provider || "N/A"}
                </p>
              </div>
              <div
                className="p-2 sm:p-3 rounded-full"
                style={{
                  backgroundColor: packageProviderColors.background,
                }}
              >
                <FaBuilding
                  className="text-lg sm:text-xl"
                  style={{ color: packageProviderColors.primary }}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Bulk Pricing Info Banner */}
      {bundles.length > 0 && (
        <Card className="border border-[var(--color-border)] bg-[var(--color-success-bg)]">
          <CardBody>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg flex-shrink-0 bg-[var(--color-success-bg)]">
                <FaDollarSign className="text-[var(--color-success-icon)] text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1">
                  💡 Bulk Pricing Management Available
                </h3>
                <p className="text-xs text-[var(--color-secondary-text)] mb-2">
                  Manage pricing for all {bundles.length} bundles across
                  multiple user types (Customer, Agent, Super Agent, Dealer,
                  Super Dealer) in one place. Click "Bulk Pricing" to open the
                  management table.
                </p>
                <Button size="sm" colorScheme="success" onClick={handleBulkPricing}>
                  <FaDollarSign className="mr-2" />
                  Open Bulk Pricing Manager
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Search and Filters */}
      <SearchAndFilter
        searchTerm={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, description, or data volume..."
        enableAutoSearch={true}
        debounceDelay={500}
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        isLoading={loading}
      />

      {/* Error Message */}
      {error && (
        <Card>
          <CardBody>
            <p className="text-[var(--color-error)] text-sm sm:text-base">{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Action Error */}
      {actionError && (
        <Card>
          <CardBody>
            <p className="text-[var(--color-error)] text-sm sm:text-base">{actionError}</p>
          </CardBody>
        </Card>
      )}

      {/* Bundles Grid */}
      <Card>
        <CardBody>
          {loading ? (
            <div className="p-6 sm:p-8 text-center">
              <Spinner size="lg" />
              <span className="ml-3 text-sm sm:text-base text-[var(--color-secondary-text)]">
                Loading bundles...
              </span>
            </div>
          ) : bundles.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <FaCube className="mx-auto text-[var(--color-secondary-text)] text-3xl sm:text-4xl mb-4" />
              <p className="text-sm sm:text-base text-[var(--color-secondary-text)]">
                No bundles found matching your criteria.
              </p>
              <Button onClick={handleCreate} className="mt-4">
                <FaPlus className="mr-2" />
                Create Your First Bundle
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 lg:hidden">
                {bundles.map((bundle) => {
                  const providerColors = getProviderColors(pkg?.provider, themeMode);
                  return (
                    <Card
                      key={bundle._id}
                      className="border border-[var(--color-border)]"
                      style={{
                        borderTop: `4px solid ${providerColors.primary}`,
                        backgroundColor: providerColors.background,
                      }}
                    >
                      <CardBody className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-[var(--color-text)] truncate">
                              {bundle.name}
                            </h3>
                            <p className="text-xs text-[var(--color-secondary-text)] mt-0.5">
                              {pkg?.provider || "N/A"}
                            </p>
                          </div>
                          <Badge
                            colorScheme={bundle.isActive ? "success" : "error"}
                            size="sm"
                            className="shrink-0"
                          >
                            {bundle.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        {bundle.description && (
                          <p className="text-xs text-[var(--color-secondary-text)] mt-3 line-clamp-2">
                            {bundle.description}
                          </p>
                        )}

                        <div className="mt-3 rounded-lg bg-[var(--color-surface)]/70 border border-[var(--color-border)] p-3 space-y-2">
                          {pkg?.provider === "AFA" ? (
                            <>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[var(--color-secondary-text)]">Type</span>
                                <span className="font-medium text-[var(--color-text)]">AFA Registration Service</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[var(--color-secondary-text)]">Ghana Card</span>
                                <span className="font-medium text-[var(--color-text)]">
                                  {bundle.requiresGhanaCard ? "Required" : "Optional"}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[var(--color-secondary-text)]">Data</span>
                                <span className="font-medium text-[var(--color-text)]">
                                  {bundle.dataVolume} {bundle.dataUnit}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[var(--color-secondary-text)]">Validity</span>
                                <span className="font-medium text-[var(--color-text)]">
                                  {bundle.validity === "unlimited" ||
                                    bundle.validityUnit === "unlimited"
                                    ? "Unlimited"
                                    : `${bundle.validity} ${bundle.validityUnit}`}
                                </span>
                              </div>
                            </>
                          )}

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--color-secondary-text)]">Price</span>
                            <span className="font-semibold text-[var(--color-text)]">
                              {formatCurrency(bundle.price, bundle.currency)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {bundle.category && (
                            <Badge variant="outline" size="sm" className={getCategoryColor(bundle.category)}>
                              {bundle.category}
                            </Badge>
                          )}
                          <Badge variant="outline" size="sm" className="bg-[var(--color-control-bg)] text-[var(--color-secondary-text)]">
                            <FaCalendar className="w-3 h-3 mr-1" />
                            {formatDate(bundle.createdAt || "")}
                          </Badge>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[var(--color-border)] space-y-2">
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="success"
                            onClick={() => handlePricingManagement(bundle)}
                            disabled={actionLoading}
                            className="w-full text-sm"
                          >
                            <FaDollarSign className="mr-2" />
                            Manage Pricing
                          </Button>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(bundle)}
                              disabled={actionLoading}
                              className="w-full text-xs"
                            >
                              <FaEdit className="mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(bundle)}
                              disabled={actionLoading}
                              className="w-full text-xs"
                            >
                              <FaTrash className="mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>

              <div className="hidden lg:block overflow-x-auto">
                <Table size="sm" colorScheme="gray" className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Bundle</TableHeaderCell>
                      <TableHeaderCell>Type / Data</TableHeaderCell>
                      <TableHeaderCell>Validity</TableHeaderCell>
                      <TableHeaderCell>Price</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Created</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bundles.map((bundle) => (
                      <TableRow key={bundle._id}>
                        <TableCell>
                          <div className="text-sm font-semibold text-[var(--color-text)]">{bundle.name}</div>
                          <div className="text-xs text-[var(--color-secondary-text)]">{pkg?.provider || "N/A"}</div>
                        </TableCell>
                        <TableCell>
                          {pkg?.provider === "AFA" ? (
                            <div className="text-xs text-[var(--color-secondary-text)]">
                              AFA Registration Service
                            </div>
                          ) : (
                            <div className="text-xs text-[var(--color-secondary-text)]">
                              {bundle.dataVolume} {bundle.dataUnit}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-[var(--color-secondary-text)]">
                            {bundle.validity === "unlimited" || bundle.validityUnit === "unlimited"
                              ? "Unlimited"
                              : `${bundle.validity} ${bundle.validityUnit}`}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold text-[var(--color-text)]">
                            {formatCurrency(bundle.price, bundle.currency)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge colorScheme={bundle.isActive ? "success" : "error"} size="sm">
                            {bundle.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-[var(--color-secondary-text)]">{formatDate(bundle.createdAt || "")}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handlePricingManagement(bundle)}
                              disabled={actionLoading}
                              colorScheme="success"
                            >
                              <FaDollarSign className="w-3 h-3" />
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handleEdit(bundle)}
                              disabled={actionLoading}
                            >
                              <FaEdit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="xs"
                              variant="danger"
                              onClick={() => handleDelete(bundle)}
                              disabled={actionLoading}
                            >
                              <FaTrash className="w-3 h-3" />
                            </Button>
                          </div>
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

      {/* Create/Edit Modal */}
      <BundleCreationModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditBundle(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editBundle}
        packageId={packageId}
        providerId={pkg?.provider}
        providerCode={pkg?.provider}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteBundle(null);
        }}
        mode="bottom-sheet"
        size="md"
      >
        <DialogHeader>
          <h2 className="text-lg font-bold">Delete Bundle</h2>
        </DialogHeader>
        <DialogBody>
          <p className="text-[var(--color-secondary-text)]">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{deleteBundle?.name}</span>? This
            action cannot be undone.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteBundle(null);
            }}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={actionLoading}
          >
            {actionLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Pricing Management Modal */}
      {showPricingModal && pricingBundle && (
        <PricingManagementModal
          bundleId={pricingBundle._id!}
          bundleName={pricingBundle.name}
          isOpen={showPricingModal}
          onClose={() => {
            setShowPricingModal(false);
            setPricingBundle(null);
          }}
          onPricingUpdated={handlePricingUpdated}
        />
      )}

      {/* Bulk Pricing Management Modal */}
      {showBulkPricingModal && (
        <BulkPricingManagementModal
          packageId={packageId!}
          packageName={pkg?.name || "Package"}
          bundles={bundles}
          isOpen={showBulkPricingModal}
          onClose={() => setShowBulkPricingModal(false)}
          onPricingUpdated={handleBulkPricingUpdated}
        />
      )}
    </div>
  );
};

export default BundleManagementPage;
