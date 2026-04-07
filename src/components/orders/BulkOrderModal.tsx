// src/components/orders/BulkOrderModal.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaWifi,
  FaClock,
  FaCheckCircle,
  FaFileUpload,
  FaDownload,
  FaPlus,
  FaBox,
  FaExclamationCircle,
  FaDatabase,
  FaMoneyBillWave,
} from "react-icons/fa";
import { useOrder } from "../../contexts/OrderContext";
import { useSiteStatus } from "../../contexts/site-status-context";
import { useAuth } from "../../hooks/use-auth";
import { bundleService } from "../../services/bundle.service";
import { getProviderColors } from "../../utils/provider-colors";
import {
  getPriceForUserType,
  formatCurrency,
} from "../../utils/pricingHelpers";
import { DuplicateOrderWarningModal } from "./DuplicateOrderWarningModal";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Card,
  CardBody,
  Badge,
  Alert,
  Spinner,
  CardHeader,
  useToast,
} from "../../design-system";
import type { Bundle } from "../../types/package";
import type { DuplicateCheckResult } from "../../types/order";

interface BulkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  packageId: string;
  provider: string; // provider code for validation
  providerName: string; // provider name for display
}

interface BulkOrderItem {
  customerPhone: string;
  dataVolume: number;
  dataUnit: "MB" | "GB";
  bundle?: Bundle;
  phoneError?: string;
  dataError?: string;
}

export const BulkOrderModal: React.FC<BulkOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  packageId,
  provider,
  providerName,
}) => {
  const { loading, createBulkOrder } = useOrder();
  const { siteStatus } = useSiteStatus();
  const { authState } = useAuth();
  const { addToast } = useToast();
  const userType = authState.user?.userType;
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const navigate = useNavigate();
  const [bulkText, setBulkText] = useState("");
  const [orderItems, setOrderItems] = useState<BulkOrderItem[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importMethod, setImportMethod] = useState<"file" | "manual">("manual");
  const [duplicateCheckResult, setDuplicateCheckResult] =
    useState<DuplicateCheckResult | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  // Get provider colors for branding
  const providerColors = getProviderColors(provider);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setBulkText("");
      setOrderItems([]);
      setShowSummary(false);
      setError(null);
      setImportMethod("manual");
      setDuplicateCheckResult(null);
      setShowDuplicateWarning(false);
    }
  }, [isOpen]);

  // Fetch bundles for the selected packageId - get all bundles without pagination
  useEffect(() => {
    if (isOpen && packageId) {
      bundleService
        .getBundlesByPackage(packageId, { limit: 1000 })
        .then((resp) => setBundles(resp.bundles || []))
        .catch(() => setBundles([]));
    }
  }, [isOpen, packageId]);

  // Get available bundles for this package
  const availableBundles: Bundle[] = Array.isArray(bundles)
    ? bundles.filter((bundle: Bundle) => bundle.isActive)
    : [];

  // Validate phone number (expects already-normalized 10-digit string)
  const validatePhone = (phone: string): string | null => {
    if (!/^\d{10}$/.test(phone)) {
      return "Phone number must be exactly 10 digits starting with 0";
    }
    if (!phone.startsWith("0")) {
      return "Phone number must start with 0";
    }
    return null;
  };

  // Only accept numbers (assume GB) in the textarea input
  const parseBulkText = (text: string): BulkOrderItem[] => {
    const lines = text.trim().split("\n");
    const items: BulkOrderItem[] = [];
    for (const element of lines) {
      const line = element.trim();
      if (!line) continue;
      // Parse format: "Number 10" (assume GB)
      // Last token is the GB value; everything before it joined = phone (handles spaces within phone)
      const parts = line.split(/\s+/);
      if (parts.length < 2) continue;
      const gbValue = parts[parts.length - 1];
      // Normalize phone: join all non-GB tokens, strip spaces, convert +233/233 to 0
      const phoneNum = parts
        .slice(0, -1)
        .join("")
        .replace(/^\+?233/, "0");
      // Check for non-numeric characters (other than .) in gbValue
      if (/[^0-9.]/.test(gbValue)) {
        items.push({
          customerPhone: phoneNum,
          dataVolume: 0,
          dataUnit: "GB",
          bundle: undefined,
          dataError: "Do not include GB or MB, just enter the number (e.g. 10)",
        });
        continue;
      }
      const gbVolume = parseFloat(gbValue);
      if (isNaN(gbVolume)) continue;
      // Find matching bundle (always in GB) - skip AFA bundles which don't have dataVolume
      const foundBundle = availableBundles.find(
        (bundle) =>
          bundle.dataVolume === gbVolume &&
          bundle.dataUnit?.toUpperCase() === "GB"
      );
      items.push({
        customerPhone: phoneNum,
        dataVolume: gbVolume,
        dataUnit: "GB",
        bundle: foundBundle,
      });
    }
    return items;
  };

  // Validate all order items, but allow continue even if some are invalid
  const validateOrderItems = (): {
    valid: BulkOrderItem[];
    invalid: BulkOrderItem[];
  } => {
    const validatedItems = orderItems.map((item) => {
      const phoneError = validatePhone(item.customerPhone);
      const dataError = !item.bundle
        ? "Data volume not available in this package"
        : undefined;
      return { ...item, phoneError: phoneError ?? undefined, dataError };
    });
    const valid = validatedItems.filter(
      (item) => !item.phoneError && !item.dataError
    );
    const invalid = validatedItems.filter(
      (item) => item.phoneError || item.dataError
    );
    setOrderItems(validatedItems);
    return { valid, invalid };
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const items = parseBulkText(csv);
        setOrderItems(items);
        setError(null);
        addToast(
          `Successfully parsed ${items.length} orders from CSV file`,
          "success"
        );
      } catch {
        setError("Failed to parse CSV file. Please check the format.");
        addToast("Failed to parse CSV file. Please check the format.", "error");
      }
    };
    reader.readAsText(file);
  };

  // Handle bulk text change
  const handleBulkTextChange = (text: string) => {
    setBulkText(text);
    const items = parseBulkText(text);
    setOrderItems(items);
  };

  // Handle continue to summary (always allow)
  const [validOrders, setValidOrders] = useState<BulkOrderItem[]>([]);
  const [invalidOrders, setInvalidOrders] = useState<BulkOrderItem[]>([]);
  const handleContinue = () => {
    const { valid, invalid } = validateOrderItems();
    setValidOrders(valid);
    setInvalidOrders(invalid);
    setShowSummary(true);
  };

  // Handle confirm order (only send valid orders)
  const handleConfirmOrder = async (forceOverride = false) => {
    try {
      setError(null);

      // Check if site is closed
      if (siteStatus?.isSiteOpen === false) {
        setError(
          `Site is currently under maintenance: ${siteStatus.customMessage}`
        );
        addToast("Site is currently under maintenance", "error");
        return;
      }

      const items = validOrders.map(
        (item) => `${item.customerPhone},${item.dataVolume}GB`
      );
      const orderData = { items, packageId, forceOverride };
      await createBulkOrder(orderData);
      addToast(
        "Bulk order created successfully! Amount deducted from wallet. Automatic refund if order fails or is cancelled.",
        "success"
      );
      onSuccess();
      onClose();
      navigate("/agent/dashboard/orders");
    } catch (err: unknown) {
      // Check if this is a duplicate order error
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        err.code === "DUPLICATE_ORDER_DETECTED" &&
        "duplicateInfo" in err
      ) {
        setDuplicateCheckResult(err.duplicateInfo as DuplicateCheckResult);
        setShowDuplicateWarning(true);
        addToast(
          "Duplicate orders detected. Please review and confirm.",
          "warning"
        );
        return;
      }

      if (err instanceof Error) {
        const errorMessage = err.message;

        // Check if site is closed
        if (
          errorMessage.includes("maintenance") ||
          errorMessage.includes("Site is currently under maintenance")
        ) {
          setError(errorMessage);
          addToast("Site is currently under maintenance", "error");
          return;
        }

        setError(errorMessage || "Failed to create bulk order");
        addToast(
          errorMessage || "Failed to create bulk order. Please try again.",
          "error"
        );
      } else {
        setError("Failed to create bulk order");
        addToast("Failed to create bulk order. Please try again.", "error");
      }
    }
  };

  // Handle duplicate warning modal actions
  const handleDuplicateProceed = () => {
    setShowDuplicateWarning(false);
    setDuplicateCheckResult(null);
    handleConfirmOrder(true); // Force override duplicates
  };

  const handleDuplicateCancel = () => {
    setShowDuplicateWarning(false);
    setDuplicateCheckResult(null);
  };

  // Handle back to form
  const handleBack = () => {
    setShowSummary(false);
  };

  // Download CSV template
  const downloadTemplate = () => {
    const template = "0241234567 5GB\n0201234567 2GB\n0271234567 1GB";
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_order_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Helper to get currency symbol
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "GHS":
        return "GH₵";
      case "NGN":
        return "₦";
      case "USD":
        return "$";
      default:
        return currency + " ";
    }
  };

  // Aggregate total GB and currency
  const totalGB = validOrders.reduce(
    (sum, item) => sum + (item.dataVolume || 0),
    0
  );
  const totalPrice = validOrders.reduce(
    (sum, item) =>
      sum + (item.bundle ? getPriceForUserType(item.bundle, userType) : 0),
    0
  );
  const currency =
    validOrders.length > 0 && validOrders[0].bundle
      ? validOrders[0].bundle.currency
      : "GHS";

  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg" mode="bottom-sheet" closeOnOverlay={true}>
      <DialogHeader className="flex items-start justify-between border-b border-[var(--color-border)] px-4 py-3 sm:px-6 sm:py-4">
        <h2 className="text-base sm:text-lg font-semibold text-[var(--color-secondary-500)] truncate pr-4">
          {showSummary
            ? "Bulk Order Summary"
            : `Bulk Order for ${providerName}`}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-[var(--color-border)] hover:text-[var(--color-secondary-400)] flex-shrink-0"
        >
          <FaTimes size={18} className="sm:w-5 sm:h-5" />
        </Button>
      </DialogHeader>

      <DialogBody className="px-4 py-4 sm:px-6 sm:py-5">
        {!showSummary ? (
          // Order Form
          <div className="space-y-3 sm:space-y-4">
            {/* Package Info */}
            <Card variant="outlined" className="bg-[var(--color-surface)] border border-[var(--color-border)]">
              <CardBody>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-[var(--color-secondary-500)]">
                      {providerName} Package
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--color-mutedText)] mt-1">
                      Available active bundles in this package (
                      {availableBundles.length} available)
                    </p>
                  </div>
                </div>
                {/* Make available bundles scrollable */}
                <div className="space-y-1.5 sm:space-y-2 max-h-32 overflow-y-auto">
                  {Array.isArray(availableBundles) &&
                    availableBundles.length > 0 &&
                    availableBundles.map((bundle: Bundle) => (
                      <div
                        key={bundle._id}
                        className="flex items-center justify-between text-xs sm:text-sm bg-[var(--color-primaryLight)] p-2 sm:p-3 rounded"
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                          <FaWifi className="text-[var(--color-primary-500)] flex-shrink-0" />
                          <span className="truncate">
                            {bundle.dataVolume} {bundle.dataUnit}
                          </span>
                          <span className="text-[var(--color-mutedText)] hidden sm:inline">
                            •
                          </span>
                          <FaClock className="text-[var(--color-success-icon)] flex-shrink-0" />
                          <span className="truncate">
                            {bundle.validityUnit === "unlimited"
                              ? "Unlimited"
                              : `${bundle.validity} ${bundle.validityUnit}`}
                          </span>
                        </div>
                        <div
                          className="font-bold text-xs sm:text-sm flex-shrink-0 ml-2"
                          style={{ color: providerColors.primary }}
                        >
                          {formatCurrency(
                            getPriceForUserType(bundle, userType),
                            bundle.currency
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardBody>
            </Card>

            {/* Import Method Selection */}
            <Card className="bg-[var(--color-surface)] border border-[var(--color-border)]">
              <CardBody className="p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-base text-[var(--color-secondary-500)] mb-3 sm:mb-4">
                  Import Method
                </h3>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    variant={importMethod === "file" ? "primary" : "secondary"}
                    onClick={() => setImportMethod("file")}
                    className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5"
                    style={
                      importMethod === "file"
                        ? {
                          backgroundColor: providerColors.primary,
                          color: providerColors.text,
                        }
                        : {}
                    }
                  >
                    <FaFileUpload className="flex-shrink-0" />
                    <span className="truncate ml-1 sm:ml-2">Import CSV/Excel</span>
                  </Button>
                  <Button
                    variant={
                      importMethod === "manual" ? "primary" : "secondary"
                    }
                    onClick={() => setImportMethod("manual")}
                    className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5"
                    style={
                      importMethod === "manual"
                        ? {
                          backgroundColor: providerColors.primary,
                          color: providerColors.text,
                        }
                        : {}
                    }
                  >
                    <FaPlus className="flex-shrink-0" />
                    <span className="truncate ml-1 sm:ml-2">Manual Entry</span>
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* File Upload */}
            {importMethod === "file" && (
              <Card className="bg-[var(--color-surface)] border border-[var(--color-border)]">
                <CardBody>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                    <h3 className="font-semibold text-sm sm:text-base text-[var(--color-secondary-500)]">Upload File</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<FaDownload className="flex-shrink-0"/>}
                      onClick={downloadTemplate}
                      className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] text-xs sm:text-sm self-start sm:self-center"
                    >
                      <span className="truncate ml-1">Download Template</span>
                    </Button>
                  </div>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="w-full px-2 sm:px-3 py-2 border border-[var(--color-border)] rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent"
                  />
                  <p className="text-xs text-[var(--color-mutedText)] mt-2">
                    Supported formats: CSV, Excel. Format: PhoneNumber DataVolume
                  </p>
                </CardBody>
              </Card>
            )}

            {/* Manual Entry */}
            {importMethod === "manual" && (
              <Card className="bg-[var(--color-surface)] border border-[var(--color-border)]">
                <CardBody>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-semibold text-sm sm:text-base text-[var(--color-secondary-500)]">
                      Bulk Order Input
                    </h3>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[var(--color-secondary-500)] mb-2">
                      Enter orders (one per line)
                    </label>
                    <textarea
                      value={bulkText}
                      onChange={(e) => handleBulkTextChange(e.target.value)}
                      placeholder={`0241234567 5\n0201234567 2\n0271234567 1`}
                      className="w-full h-24 sm:h-32 px-2 sm:px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent resize-none text-xs sm:text-sm"
                    />
                    <p className="text-xs text-[var(--color-mutedText)] mt-2">
                      Format: PhoneNumber DataVolume (e.g., 0241234567 5). All values are in GB.
                      <br />
                      <span className="text-[var(--color-error)] font-semibold">
                        Do not type GB or MB, just the number.
                      </span>
                    </p>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Alert status="error" title="Error" className="text-xs sm:text-sm">
                {error}
              </Alert>
            )}

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={
                orderItems.length === 0 ||
                loading ||
                siteStatus?.isSiteOpen === false
              }
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base font-medium"
              style={{
                backgroundColor: providerColors.primary,
                color: providerColors.text,
              }}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-2">Processing...</span>
                </>
              ) : siteStatus?.isSiteOpen === false ? (
                "Service Unavailable"
              ) : (
                `Continue (${orderItems.length} items)`
              )}
            </Button>
          </div>
        ) : (
          // Order Summary
          <div className="space-y-3 sm:space-y-4">
            {/* Package Summary Mini Card */}
            <Card
              noPadding
              className="rounded-lg mb-4 border-2"
              style={{
                backgroundColor: providerColors.background,
                borderColor: providerColors.primary,
              }}
            >
              <CardBody>
                <div>
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0"
                        style={{ backgroundColor: providerColors.primary }}
                      >
                        <FaWifi
                          className="text-base sm:text-lg"
                          style={{ color: providerColors.text }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="text-base sm:text-lg font-bold truncate"
                          style={{ color: providerColors.primary }}
                        >
                          {providerName}
                        </h3>
                        <p className="text-xs sm:text-sm text-[var(--color-mutedText)] mt-0.5">
                          Package Summary
                        </p>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <Badge
                        colorScheme="success"
                        size="sm"
                        className="whitespace-nowrap text-xs sm:text-sm"
                      >
                        <FaCheckCircle className="flex-shrink-0" />
                        <span className="ml-1">{validOrders.length} Valid</span>
                      </Badge>
                      <Badge
                        colorScheme="error"
                        size="sm"
                        className="whitespace-nowrap text-xs sm:text-sm"
                      >
                        <FaExclamationCircle className="flex-shrink-0" />
                        <span className="ml-1">
                          {invalidOrders.length} Invalid
                        </span>
                      </Badge>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 p-2 sm:p-3 bg-white/50 dark:bg-black/20 rounded">
                      <FaDatabase className="text-[var(--color-primary-500)] flex-shrink-0 text-xs sm:text-sm" />
                      <div className="min-w-0">
                        <div className="text-xs text-[var(--color-mutedText)]">Total Data</div>
                        <div className="font-semibold text-xs sm:text-sm">
                          {totalGB} GB
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 sm:p-3 bg-white/50 dark:bg-black/20 rounded">
                      <FaBox className="text-[var(--color-warning)] flex-shrink-0 text-xs sm:text-sm" />
                      <div className="min-w-0">
                        <div className="text-xs text-[var(--color-mutedText)]">
                          Total Orders
                        </div>
                        <div className="font-semibold text-xs sm:text-sm">
                          {orderItems.length}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 sm:p-3 bg-white/50 dark:bg-black/20 rounded">
                      <FaMoneyBillWave className="text-[var(--color-success-icon)] flex-shrink-0 text-xs sm:text-sm" />
                      <div className="min-w-0">
                        <div className="text-xs text-[var(--color-mutedText)]">
                          Total Amount
                        </div>
                        <div className="font-semibold text-xs sm:text-sm">
                          {getCurrencySymbol(currency)}
                          {totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Valid Orders */}
            <div className="mb-4">
              <h3 className="font-semibold text-[var(--color-success-text)] mb-2 text-xs sm:text-base">
                Valid Orders ({validOrders.length})
              </h3>

              <Card noPadding className="border border-[var(--color-border)] overflow-hidden">
                {validOrders.length > 0 ? (
                  <>
                    <CardHeader className="bg-[var(--color-secondary-500)] text-white p-2 sm:p-3">
                      <div className="grid grid-cols-3 gap-1 sm:gap-4 text-xs sm:text-sm">
                        <div className="font-medium">Recipient</div>
                        <div className="font-medium">Data (GB)</div>
                        <div className="font-medium text-right">Price</div>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="divide-y divide-[var(--color-border)]">
                        {validOrders.map((item, index) => (
                          <div
                            key={`${item.customerPhone}-${item.dataVolume}-${index}`}
                            className="p-2 sm:p-3 hover:bg-[var(--color-primaryLight)] transition-colors"
                          >
                            <div className="grid grid-cols-3 gap-1 sm:gap-4 text-xs sm:text-sm">
                              <div className="font-medium text-[var(--color-secondary-500)] truncate">
                                {item.customerPhone}
                              </div>
                              <div className="text-[var(--color-mutedText)]">
                                {item.dataVolume}
                              </div>
                              <div className="text-right font-medium">
                                {item.bundle && (
                                  <span
                                    style={{ color: providerColors.primary }}
                                  >
                                    {formatCurrency(
                                      getPriceForUserType(
                                        item.bundle,
                                        userType
                                      ),
                                      item.bundle.currency
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </>
                ) : (
                  <CardBody className="text-center">
                    <div className="text-[var(--color-mutedText)] text-xs sm:text-sm">
                      No valid orders found
                    </div>
                  </CardBody>
                )}
              </Card>
            </div>

            {/* Invalid Orders */}
            {invalidOrders.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-[var(--color-error)] mb-2 text-xs sm:text-base">
                  Invalid Orders ({invalidOrders.length})
                </h3>

                <Card noPadding className="border border-[var(--color-border)] overflow-hidden">
                  <CardHeader className="bg-[var(--color-secondary-500)] text-white p-2 sm:p-3">
                    <div className="grid grid-cols-3 gap-1 sm:gap-4 text-xs sm:text-sm">
                      <div className="font-medium">Recipient</div>
                      <div className="font-medium">Data (GB)</div>
                      <div className="font-medium">Error</div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="divide-y divide-[var(--color-border)]">
                      {invalidOrders.map((item, index) => (
                        <div
                          key={`${item.customerPhone}-${item.dataVolume}-${index}`}
                          className="p-2 sm:p-3 hover:bg-[var(--color-primaryLight)] transition-colors"
                        >
                          <div className="grid grid-cols-3 gap-1 sm:gap-4 text-xs sm:text-sm">
                            <div className="font-medium text-[var(--color-secondary-500)] truncate">
                              {item.customerPhone}
                            </div>
                            <div className="text-[var(--color-mutedText)]">
                              {item.dataVolume}
                            </div>
                            <div className="text-[var(--color-error)]">
                              {item.phoneError && (
                                <div
                                  className="truncate text-xs"
                                  title={item.phoneError}
                                >
                                  {item.phoneError}
                                </div>
                              )}
                              {item.dataError && (
                                <div
                                  className="truncate text-xs"
                                  title={item.dataError}
                                >
                                  {item.dataError}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}

            {/* Total */}
            <div className="border-t-2 border-[var(--color-border)] pt-3 sm:pt-4 mt-4">
              <div className="flex justify-between items-center gap-2">
                <span className="text-sm sm:text-base font-semibold text-[var(--color-secondary-500)]">Total Amount:</span>
                <span className="text-base sm:text-lg font-bold" style={{ color: providerColors.primary }}>
                  GHS{" "}
                  {validOrders
                    .reduce(
                      (sum, item) =>
                        sum +
                        (item.bundle
                          ? getPriceForUserType(item.bundle, userType)
                          : 0),
                      0
                    )
                    .toFixed(2)}
                </span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert status="error" title="Error" className="text-xs sm:text-sm">
                {error}
              </Alert>
            )}
          </div>
        )}
      </DialogBody>

      {showSummary && (
        <DialogFooter className="border-t border-[var(--color-border)] px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="secondary"
            onClick={handleBack}
            className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5 order-2 sm:order-1"
          >
            Back
          </Button>
          <Button
            onClick={() => handleConfirmOrder()}
            disabled={
              loading ||
              validOrders.length === 0 ||
              siteStatus?.isSiteOpen === false
            }
            className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5 font-medium order-1 sm:order-2"
            style={{
              backgroundColor: providerColors.primary,
              color: providerColors.text,
            }}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-1" />
                <span className="hidden sm:inline">Processing...</span>
                <span className="sm:hidden">Wait...</span>
              </>
            ) : siteStatus?.isSiteOpen === false ? (
              <>
                <FaTimes className="mr-1" />
                <span className="hidden sm:inline">Site Under Maintenance</span>
                <span className="sm:hidden">Unavailable</span>
              </>
            ) : (
              <>
                <FaCheckCircle className="mr-1" />
                <span className="hidden sm:inline">Confirm Bulk Order</span>
                <span className="sm:hidden">Confirm</span>
              </>
            )}
          </Button>
        </DialogFooter>
      )}

      {/* Duplicate Order Warning Modal */}
      {duplicateCheckResult && (
        <DuplicateOrderWarningModal
          isOpen={showDuplicateWarning}
          onClose={handleDuplicateCancel}
          onProceed={handleDuplicateProceed}
          onCancel={handleDuplicateCancel}
          duplicateInfo={duplicateCheckResult}
          orderType="bulk"
        />
      )}
    </Dialog>
  );
};
