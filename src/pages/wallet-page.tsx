import { useState, useEffect, useCallback, useMemo } from "react";
import { useWallet } from "../hooks";
import { type WalletTransaction } from "../types/wallet";
import {
  FaWallet,
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaSync,
  FaMoneyBillAlt,
  FaTimes,
  FaReceipt,
} from "react-icons/fa";
import {
  Alert,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  Spinner,
  Pagination,
  Card,
  CardHeader,
  CardBody,
} from "../design-system";
import { useToast } from "../design-system/components/toast";
import { TopUpRequestModal } from "../components/wallet/TopUpRequestModal";
import { SearchAndFilter } from "../components/common/SearchAndFilter";
import { EarningsManager } from "../components/storefront/earnings-manager";

export const WalletPage = () => {
  const {
    walletBalance,
    refreshWallet,
    isLoading,
    error,
    getTransactionHistory,
    requestTopUp,
  } = useWallet();

  const { addToast } = useToast();

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Transaction history filters
  const [txTypeFilter, setTxTypeFilter] = useState<"credit" | "debit" | "">("");
  const [txStartDate, setTxStartDate] = useState("");
  const [txEndDate, setTxEndDate] = useState("");
  const [txSearch, setTxSearch] = useState("");

  const [activeTab, setActiveTab] = useState<
    "wallet" | "earnings"
  >("wallet");

  // Load transactions function
  const loadTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    try {
      const result = await getTransactionHistory(
        currentPage,
        20,
        txTypeFilter || undefined,
        txStartDate || undefined,
        txEndDate || undefined,
      );
      if (result) {
        setTransactions(result.transactions);
        setTotalPages(result.pagination.pages);
        setTotalTransactions(result.pagination.total);
      }
    } catch {
      // Failed to load transactions
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [
    currentPage,
    getTransactionHistory,
    txTypeFilter,
    txStartDate,
    txEndDate,
  ]);

  // Fetch transaction history on page load and when page changes or filters change
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [txTypeFilter, txStartDate, txEndDate]);

  // Listen for postMessage events from payment popups (Paystack)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from same origin
      if (event.origin !== window.location.origin) return;
      const data = event.data as
        | {
            type?: string;
            status?: string;
            reference?: string;
            message?: string;
          }
        | undefined;
      if (!data || data.type !== "PAYSTACK_TOPUP") return;

      if (data.status === "success") {
        addToast("Payment completed — wallet updated.", "success");
        // Refresh wallet and transactions
        refreshWallet();
        loadTransactions();
      } else {
        addToast(
          data.message || "Payment pending — webhook will reconcile.",
          "info",
        );
      }

      try {
        window.focus();
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [refreshWallet, loadTransactions, addToast]);

  // Listen for wallet balance changes and refresh transactions
  useEffect(() => {
    // Refresh transactions when wallet balance changes (indicating a transaction occurred)
    loadTransactions();
  }, [walletBalance, loadTransactions]);

  // Format date for display
  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  // Get transaction type styling
  const getTransactionTypeStyles = (type: string) => {
    switch (type) {
      case "credit":
        return {
          icon: <FaArrowUp className="text-[var(--color-success)]" />,
          bgColor: "bg-[var(--color-success-bg)]",
          borderColor: "border-[var(--color-border)]",
          textColor: "text-[var(--color-success)]",
          amountColor: "text-[var(--color-success)]",
          badgeBg: "bg-[var(--color-success-bg)]",
          badgeText: "text-[var(--color-success)]",
        };
      case "debit":
        return {
          icon: <FaArrowDown className="text-[var(--color-error)]" />,
          bgColor: "bg-[var(--color-failed-bg)]",
          borderColor: "border-[var(--color-border)]",
          textColor: "text-[var(--color-error)]",
          amountColor: "text-[var(--color-error)]",
          badgeBg: "bg-[var(--color-failed-bg)]",
          badgeText: "text-[var(--color-error)]",
        };
      default:
        return {
          icon: <FaWallet className="text-[var(--color-muted-text)]" />,
          bgColor: "bg-[var(--color-input-bg)]",
          borderColor: "border-[var(--color-border)]",
          textColor: "text-[var(--color-text)]",
          amountColor: "text-[var(--color-muted-text)]",
          badgeBg: "bg-[var(--color-control-bg)]",
          badgeText: "text-[var(--color-muted-text)]",
        };
    }
  };

  // Get connection status indicator

  const handleTopUpRequest = async (amount: number, description: string) => {
    setIsSubmittingRequest(true);
    try {
      await requestTopUp(amount, description);
      setSuccessMessage("Top-up request submitted successfully!");
      setShowTopUpModal(false);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      // Error is handled in the hook, but we can show it in the modal
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit top-up request";
      // The error will be displayed in the modal through the hook's error state
      console.error("Top-up request error:", errorMessage);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Client-side text search applied on top of the server-filtered transactions
  const filteredTransactions = useMemo(() => {
    if (!txSearch.trim()) return transactions;
    const q = txSearch.toLowerCase();
    return transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        (t.reference && t.reference.toLowerCase().includes(q)),
    );
  }, [transactions, txSearch]);

  // Summary stats for the filtered view
  const txSummary = useMemo(() => {
    const totalCredits = filteredTransactions
      .filter((t) => t.type === "credit")
      .reduce((s, t) => s + t.amount, 0);
    const totalDebits = filteredTransactions
      .filter((t) => t.type === "debit")
      .reduce((s, t) => s + t.amount, 0);
    return { totalCredits, totalDebits, net: totalCredits - totalDebits };
  }, [filteredTransactions]);

  const hasActiveFilters =
    txTypeFilter !== "" ||
    txStartDate !== "" ||
    txEndDate !== "" ||
    txSearch.trim() !== "";

  const clearTxFilters = () => {
    setTxTypeFilter("");
    setTxStartDate("");
    setTxEndDate("");
    setTxSearch("");
  };

  return (
    <>
      {/* Header */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-2">
              Wallet
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-muted-text)]">
              Manage your wallet balance and transactions
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="primary"
              size="md"
              leftIcon={<FaSync className={isLoading ? "animate-spin" : ""} />}
              onClick={() => refreshWallet()}
              isLoading={isLoading}
            >
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Sync</span>
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <Tabs
            value={activeTab}
            onValueChange={(v: string) =>
              setActiveTab(v as "wallet" | "earnings")
            }
          >
            <TabsList className="w-full">
              <TabsTrigger value="wallet" className="flex-1 min-w-0">
                <FaWallet className="inline shrink-0 mr-1.5" />
                Wallet
              </TabsTrigger>
              <TabsTrigger value="earnings" className="flex-1 min-w-0">
                <FaMoneyBillAlt className="inline shrink-0 mr-1.5" />
                Earnings
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === "wallet" ? (
        <>
          {/* Error Alert */}
          {error && (
            <Alert status="error" title="Error">
              {error}
            </Alert>
          )}

          {/* Success Message */}
          {successMessage && (
            <Alert status="success" title="Success">
              {successMessage}
            </Alert>
          )}

          {/* Wallet Balance Card (design-system) */}
          <Card className="mb-6">
            <CardHeader className="flex items-center justify-between pb-2">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-text)]">
                  Current Balance
                </h2>
              </div>
              <Button
                variant="success"
                size="md"
                leftIcon={<FaPlus />}
                onClick={() => setShowTopUpModal(true)}
                isLoading={isSubmittingRequest}
              >
                <span className="hidden sm:inline">Request Top-up</span>
                <span className="sm:hidden">Top-up</span>
              </Button>
            </CardHeader>
            <CardBody className="py-3">
              <div className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-1">
                {formatCurrency(walletBalance)}
              </div>
              <p className="text-sm text-[var(--color-muted-text)]">
                Available for transactions and purchases
              </p>
            </CardBody>
          </Card>

          {/* Transaction History */}
          <Card className="mb-6">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-text)]">
                    Transaction History
                  </h2>
                  {totalTransactions > 0 && (
                    <p className="text-xs text-[var(--color-muted-text)] mt-0.5">
                      {totalTransactions} transaction
                      {totalTransactions !== 1 ? "s" : ""} total
                      {hasActiveFilters &&
                        ` · ${filteredTransactions.length} shown`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={clearTxFilters}
                      className="flex items-center gap-1 text-xs text-[var(--color-error)] hover:text-[var(--color-error)] transition-colors"
                    >
                      <FaTimes className="text-xs" /> Clear filters
                    </button>
                  )}
                  <button
                    onClick={loadTransactions}
                    disabled={isLoadingTransactions}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-control-bg)] transition-colors disabled:opacity-50"
                  >
                    <FaSync
                      className={
                        isLoadingTransactions
                          ? "animate-spin text-xs"
                          : "text-xs"
                      }
                    />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>

              {/* Search & filters (transaction history) using shared SearchAndFilter component */}
              <div className="mt-3">
                <SearchAndFilter
                  searchTerm={txSearch}
                  onSearchChange={(v) => setTxSearch(v)}
                  searchPlaceholder="Search description or ref…"
                  debounceDelay={500}
                  minSearchLength={0}
                  enableAutoSearch={true}
                  filters={{
                    type: {
                      value: txTypeFilter,
                      label: "Type",
                      placeholder: "All types",
                      options: [
                        { value: "credit", label: "Credits only" },
                        { value: "debit", label: "Debits only" },
                      ],
                    },
                  }}
                  onFilterChange={(key, value) => {
                    if (key === "type")
                      setTxTypeFilter(value as "credit" | "debit" | "");
                  }}
                  dateRange={{ startDate: txStartDate, endDate: txEndDate }}
                  onDateRangeChange={(start, end) => {
                    setTxStartDate(start);
                    setTxEndDate(end);
                  }}
                  onSearch={(e) => {
                    e.preventDefault(); /* client-side search applied via txSearch */
                  }}
                  onClearFilters={() => clearTxFilters()}
                  showFilterToggle={true}
                  isLoading={isLoadingTransactions}
                  showSearchButton={false}
                  showClearButton={false}
                />
              </div>

              {/* Filter summary stats bar */}
              {filteredTransactions.length > 0 &&
                (hasActiveFilters || transactions.length > 0) && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-border)] grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-[var(--color-muted-text)]">
                        Total In
                      </p>
                      <p className="text-sm font-semibold text-[var(--color-success)]">
                        {formatCurrency(txSummary.totalCredits)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-muted-text)]">
                        Total Out
                      </p>
                      <p className="text-sm font-semibold text-[var(--color-error)]">
                        {formatCurrency(txSummary.totalDebits)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-muted-text)]">
                        Net
                      </p>
                      <p
                        className={`text-sm font-semibold ${txSummary.net >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}
                      >
                        {txSummary.net >= 0 ? "+" : ""}
                        {formatCurrency(txSummary.net)}
                      </p>
                    </div>
                  </div>
                )}
            </CardHeader>

            <CardBody>
              {isLoadingTransactions ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="lg" color="primary" />
                  <span className="ml-3 text-[var(--color-muted-text)]">
                    Loading transactions...
                  </span>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-muted-text)]">
                  <FaWallet className="text-4xl mx-auto mb-4 text-[var(--color-muted-text)]" />
                  <p>
                    {hasActiveFilters
                      ? "No transactions match your filters"
                      : "No transactions found"}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearTxFilters}
                      className="mt-2 text-sm text-[var(--color-primary-600)] hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {filteredTransactions.map((transaction) => {
                    const styles = getTransactionTypeStyles(transaction.type);
                    const orderRef =
                      typeof transaction.relatedOrder === "object" &&
                      transaction.relatedOrder !== null
                        ? (transaction.relatedOrder as { orderNumber?: string })
                            .orderNumber
                        : null;
                    return (
                      <div
                        key={transaction._id}
                        className={`p-3 sm:p-4 border rounded-xl hover:shadow-sm transition-all ${styles.borderColor} ${styles.bgColor}`}
                      >
                        {/* Top row: icon + description + amount */}
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--color-surface)] shadow-sm flex-shrink-0 mt-0.5">
                            {styles.icon}
                          </div>

                          {/* Description + badges */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${styles.badgeBg} ${styles.badgeText}`}
                              >
                                {transaction.type === "credit"
                                  ? "Credit"
                                  : "Debit"}
                              </span>
                              {transaction.status &&
                                transaction.status !== "completed" && (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      transaction.status === "pending"
                                        ? "bg-[var(--color-pending-bg)] text-[var(--color-pending-text)]"
                                        : "bg-[var(--color-failed-bg)] text-[var(--color-error)]"
                                    }`}
                                  >
                                    {transaction.status}
                                  </span>
                                )}
                              {orderRef && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[var(--color-control-bg)] text-[var(--color-muted-text)]">
                                  <FaReceipt className="text-xs" /> {orderRef}
                                </span>
                              )}
                            </div>
                            <p className="font-medium text-[var(--color-text)] text-sm truncate">
                              {transaction.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <p className="text-xs text-[var(--color-muted-text)]">
                                {formatDate(transaction.createdAt)}
                              </p>
                              {transaction.reference &&
                                !transaction.reference.startsWith("TXN") && (
                                  <p className="text-xs text-[var(--color-secondary-text)] font-mono truncate max-w-[180px]">
                                    Ref: {transaction.reference.slice(0, 24)}
                                  </p>
                                )}
                            </div>
                          </div>

                          {/* Amount (top-right) */}
                          <div className="text-right flex-shrink-0 ml-2">
                            <p
                              className={`font-bold text-base sm:text-lg leading-tight ${styles.amountColor}`}
                            >
                              {transaction.type === "credit" ? "+" : "−"}
                              {formatCurrency(transaction.amount)}
                            </p>
                          </div>
                        </div>

                        {/* Balance mini-timeline — always visible */}
                        {(() => {
                          const balanceBefore =
                            transaction.type === "credit"
                              ? transaction.balanceAfter - transaction.amount
                              : transaction.balanceAfter + transaction.amount;
                          return (
                            <div className="mt-2.5 ml-12 flex items-center gap-1.5 text-xs flex-wrap">
                              {/* Before */}
                              <div className="flex flex-col items-center">
                                <span className="text-[var(--color-secondary-text)] uppercase tracking-wide text-[10px] leading-none mb-0.5">
                                  Before
                                </span>
                                <span className="font-mono font-medium text-[var(--color-muted-text)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-1.5 py-0.5 whitespace-nowrap">
                                  {formatCurrency(balanceBefore)}
                                </span>
                              </div>
                              {/* arrow + delta */}
                              <div className="flex flex-col items-center">
                                <span className="text-[var(--color-muted-text)] text-[10px] leading-none mb-0.5">
                                  &nbsp;
                                </span>
                                <span
                                  className={`font-semibold whitespace-nowrap ${styles.amountColor}`}
                                >
                                  {transaction.type === "credit" ? "＋" : "－"}
                                  {formatCurrency(transaction.amount)} →
                                </span>
                              </div>
                              {/* After */}
                              <div className="flex flex-col items-center">
                                <span className="text-[var(--color-secondary-text)] uppercase tracking-wide text-[10px] leading-none mb-0.5">
                                  After
                                </span>
                                <span className="font-mono font-semibold text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-1.5 py-0.5 whitespace-nowrap shadow-sm">
                                  {formatCurrency(transaction.balanceAfter)}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 w-full">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalTransactions}
                    itemsPerPage={20}
                    onPageChange={(p) => setCurrentPage(p)}
                    variant="compact"
                  />
                </div>
              )}
            </CardBody>
          </Card>
        </>
          ) : (
        /* Earnings & Payouts Tab Content */
        <>
          <div className="mb-4 p-4 rounded-lg bg-[var(--color-primary-50)] border border-[var(--color-border)] text-sm text-[var(--color-primary-600)]">
            <strong>Your storefront earnings</strong> are stored securely in
            your account. You can request a payout at any time — even if your
            storefront is inactive or closed.
          </div>
          <EarningsManager />
        </>
      )}

      {/* Top-up Request Modal */}
      <TopUpRequestModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onSubmit={handleTopUpRequest}
        isSubmitting={isSubmittingRequest}
        error={error}
      />
    </>
  );
};
