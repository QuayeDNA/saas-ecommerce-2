import { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUndo,
  FaToggleOn,
  FaToggleOff,
  FaChartBar,
} from "react-icons/fa";
import { useProvider } from "../../hooks/use-provider";
import { ProviderFormModal } from "../../components/products/ProviderFormModal";
import { SearchAndFilter } from "../../components/common/SearchAndFilter";
import type { Provider } from "../../types/package";
import type { ProviderFormData } from "../../components/products/ProviderFormModal";
import {
  Button,
  Badge,
  Card,
  CardBody,
  Pagination,
  Skeleton,
} from "../../design-system";

export default function SuperAdminProvidersPage() {
  const {
    providers,
    loading,
    error,
    pagination,
    filters,
    fetchProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    restoreProvider,
    setFilters,
  } = useProvider();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Calculate statistics
  const stats = {
    total: providers.length,
    active: providers.filter((p) => p.isActive && !p.isDeleted).length,
    inactive: providers.filter((p) => !p.isActive && !p.isDeleted).length,
    deleted: providers.filter((p) => p.isDeleted).length,
    mtn: providers.filter((p) => p.code === "MTN" && !p.isDeleted).length,
    telecel: providers.filter((p) => p.code === "TELECEL" && !p.isDeleted)
      .length,
    at: providers.filter((p) => p.code === "AT" && !p.isDeleted).length,
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = {
      ...filters,
      search: searchTerm,
      isActive: statusFilter === "" ? undefined : statusFilter === "active",
      includeDeleted: showDeleted,
    };
    setFilters(newFilters);
    fetchProviders(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Auto-search when search term changes
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
      handleSearch(fakeEvent);
    }, 300); // Debounce for better UX
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "status") {
      setStatusFilter(value);
    } else if (filterKey === "showDeleted") {
      setShowDeleted(value === "true");
    }
    // Auto-search when filters change
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
      handleSearch(fakeEvent);
    }, 100);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setShowDeleted(false);
    setFilters({
      search: "",
      isActive: undefined,
      includeDeleted: false,
    });
    fetchProviders();
  };

  const handleModalSubmit = async (data: ProviderFormData) => {
    const providerData: Partial<Provider> = {
      ...data,
      code: data.code === "" ? undefined : data.code,
    };

    if (modalMode === "create") {
      await createProvider(providerData);
    } else if (selectedProvider?._id) {
      await updateProvider(selectedProvider._id, providerData);
    }
    setShowModal(false);
  };

  const handleCreateNew = () => {
    setModalMode("create");
    setSelectedProvider(null);
    setShowModal(true);
  };

  const handleEdit = (provider: Provider) => {
    setModalMode("edit");
    setSelectedProvider(provider);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this provider?")) {
      await deleteProvider(id);
    }
  };

  const handleRestore = async (id: string) => {
    if (window.confirm("Are you sure you want to restore this provider?")) {
      await restoreProvider(id);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await updateProvider(id, { isActive: !currentStatus });
  };

  const getStatusColorScheme = (isActive: boolean, isDeleted: boolean) => {
    if (isDeleted) return "error" as const;
    return isActive ? "success" as const : "warning" as const;
  };

  const getStatusText = (isActive: boolean, isDeleted: boolean) => {
    if (isDeleted) return "Deleted";
    return isActive ? "Active" : "Inactive";
  };

  const getProviderColorScheme = (code: string) => {
    switch (code) {
      case "MTN":
        return "warning" as const;
      case "TELECEL":
        return "error" as const;
      case "AT":
        return "info" as const;
      default:
        return "gray" as const;
    }
  };

  const getProviderCardStyle = (code: string) => {
    switch (code) {
      case "MTN":
        return {
          cardBg: "bg-yellow-50",
          cardBorder: "border-yellow-200",
          textColor: "text-yellow-900",
        };
      case "TELECEL":
        return {
          cardBg: "bg-red-50",
          cardBorder: "border-red-200",
          textColor: "text-red-900",
        };
      case "AT":
        return {
          cardBg: "bg-sky-50",
          cardBorder: "border-sky-200",
          textColor: "text-sky-900",
        };
      default:
        return {
          cardBg: "bg-slate-50",
          cardBorder: "border-slate-200",
          textColor: "text-slate-900",
        };
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div
        className="rounded-xl p-4 sm:p-6 text-white"
        style={{ background: "linear-gradient(to right, var(--color-primary-500), var(--color-primary-700))" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <FaChartBar className="text-xl sm:text-2xl" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Provider Management</h1>
              <p className="text-xs sm:text-sm text-white/70 mt-0.5">
                Manage telecom service providers and configurations
              </p>
            </div>
          </div>
          <Button
            onClick={handleCreateNew}
            leftIcon={<FaPlus />}
            className="self-start sm:self-auto"
            variant="secondary"
          >
            Add Provider
          </Button>
        </div>

        {/* Inline stats */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Total", value: stats.total, icon: <FaChartBar /> },
            { label: "Active", value: stats.active, icon: <FaToggleOn /> },
            { label: "Inactive", value: stats.inactive, icon: <FaToggleOff /> },
            { label: "Deleted", value: stats.deleted, icon: <FaTrash /> },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg px-3 py-2.5 flex items-center gap-2 bg-white/15">
              <span className="text-white/70 text-sm flex-shrink-0">{stat.icon}</span>
              <div className="min-w-0">
                <p className="text-white/70 text-[10px] font-medium uppercase tracking-wide truncate">{stat.label}</p>
                <p className="text-white font-bold text-sm sm:text-base leading-tight truncate">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by name, code, or description..."
        enableAutoSearch={true}
        debounceDelay={500}
        filters={{
          status: {
            value: statusFilter,
            options: [
              { value: "", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
            label: "Status",
            placeholder: "All Status",
          },
          showDeleted: {
            value: showDeleted ? "true" : "false",
            options: [
              { value: "false", label: "Hide Deleted" },
              { value: "true", label: "Show Deleted" },
            ],
            label: "Deleted Providers",
            placeholder: "Hide Deleted",
          },
        }}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        showSearchButton={true}
        showClearButton={true}
        isLoading={loading}
      />

      {/* Providers List */}
      <Card noPadding>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card
                  key={i}
                  className="border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <CardBody className="space-y-4">
                    <div className="flex justify-center">
                      <Skeleton variant="circular" width={80} height={80} />
                    </div>
                    <div className="space-y-3">
                      <Skeleton height="1.25rem" width="60%" />
                      <Skeleton height="1rem" width="80%" />
                      <Skeleton height="1rem" width="50%" />
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                      <Skeleton height={36} width={90} variant="rectangular" />
                      <Skeleton height={36} width={90} variant="rectangular" />
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">
              No providers found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {providers.map((provider) => {
                const { cardBg, cardBorder, textColor } = getProviderCardStyle(provider.code);
                return (
                  <Card
                    key={provider._id}
                    className={`border ${cardBorder} ${cardBg} shadow-sm hover:shadow-md transition-shadow duration-200`}
                  >
                    <CardBody>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex justify-center">
                            {provider.logo?.url ? (
                              <img
                                src={provider.logo.url}
                                alt={provider.logo.alt || provider.name}
                                className="h-20 w-20 rounded-full object-cover border border-white/80 shadow-sm"
                              />
                            ) : (
                              <div className="h-20 w-20 rounded-full bg-white/80 flex items-center justify-center text-2xl text-gray-500 shadow-sm">
                                <FaChartBar />
                              </div>
                            )}
                          </div>
                          <div className="mt-5 text-center">
                            <p className={`text-base font-semibold ${textColor}`}>{provider.name}</p>
                            {provider.description && (
                              <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                                {provider.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                        <Badge colorScheme={getProviderColorScheme(provider.code)} size="xs">
                          {provider.code}
                        </Badge>
                        <Badge colorScheme={getStatusColorScheme(provider.isActive, provider.isDeleted)} size="xs">
                          {getStatusText(provider.isActive, provider.isDeleted)}
                        </Badge>
                        <span className="text-xs text-slate-500">Sales {provider.salesCount || 0}</span>
                      </div>

                      <div className="mt-5 flex flex-wrap justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(provider)}>
                          <FaEdit className="mr-1" /> Edit
                        </Button>
                        {!provider.isDeleted ? (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleToggleStatus(provider._id, provider.isActive)}>
                              {provider.isActive ? (
                                <><FaToggleOff className="mr-1" /> Disable</>
                              ) : (
                                <><FaToggleOn className="mr-1" /> Enable</>
                              )}
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(provider._id)}>
                              <FaTrash className="mr-1" /> Delete
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleRestore(provider._id)}>
                            <FaUndo className="mr-1" /> Restore
                          </Button>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {pagination.pages > 1 && (
        <div className="border-t px-4 py-3">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={(page) => fetchProviders(filters, { page })}
            onItemsPerPageChange={() => { }}
          />
        </div>
      )}

      {/* Provider Form Modal */}
      {showModal && (
        <ProviderFormModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleModalSubmit}
          provider={selectedProvider}
          mode={modalMode}
          loading={loading}
        />
      )}
    </div>
  );
}
