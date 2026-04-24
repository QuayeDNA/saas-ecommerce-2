import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Spinner,
} from "../../design-system";
import { useToast } from "../../design-system/components/toast";
import { bundleService } from "../../services/bundle.service";
import { FaDollarSign, FaUsers, FaSave, FaTimes } from "react-icons/fa";

interface PricingManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundleId: string;
  bundleName: string;
  onPricingUpdated?: () => void;
}

type PricingTiers = Record<string, number | string> & {
  agent: number | string;
  super_agent: number | string;
  dealer: number | string;
  super_dealer: number | string;
  default: number | string;
};

const userTypeLabels: Record<string, string> = {
  agent: "Agent",
  super_agent: "Super Agent",
  dealer: "Dealer",
  super_dealer: "Super Dealer",
  default: "Default Price",
};

const userTypeDescriptions: Record<string, string> = {
  agent: "Regular agents — standard pricing",
  super_agent: "Senior agents with special pricing",
  dealer: "Dealers with volume discounts",
  super_dealer: "High-volume dealers with maximum discounts",
  default: "Fallback price when no specific pricing is set",
};

// Mapped to semantic theme color variables instead of hardcoded Tailwind colours
const userTypeBadgeStyle: Record<string, React.CSSProperties> = {
  agent: { background: "var(--color-primary-100)", color: "var(--color-primary-700)" },
  super_agent: { background: "var(--color-primary-50)", color: "var(--color-primary-600)" },
  dealer: { background: "var(--color-success-bg)", color: "var(--color-success-text)" },
  super_dealer: { background: "var(--color-pending-bg)", color: "var(--color-pending-text)" },
  default: { background: "var(--color-control-bg)", color: "var(--color-secondary-text)" },
};

const editableUserTypes: Array<keyof PricingTiers> = [
  "agent",
  "super_agent",
  "dealer",
  "super_dealer",
];

export const PricingManagementModal: React.FC<PricingManagementModalProps> = ({
  isOpen,
  onClose,
  bundleId,
  bundleName,
  onPricingUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [basePrice, setBasePrice] = useState(0);
  const [pricingTiers, setPricingTiers] = useState<PricingTiers>({
    agent: 0, super_agent: 0, dealer: 0, super_dealer: 0, default: 0,
  });
  const [originalPricing, setOriginalPricing] = useState<PricingTiers>({
    agent: 0, super_agent: 0, dealer: 0, super_dealer: 0, default: 0,
  });
  const { addToast } = useToast();

  const fetchPricingData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bundleService.getBundlePricing(bundleId);
      setBasePrice(data.basePrice);
      const pricing: PricingTiers = {
        agent: data.pricingTiers.agent ?? data.basePrice,
        super_agent: data.pricingTiers.super_agent ?? data.basePrice,
        dealer: data.pricingTiers.dealer ?? data.basePrice,
        super_dealer: data.pricingTiers.super_dealer ?? data.basePrice,
        default: data.basePrice,
      };
      setPricingTiers(pricing);
      setOriginalPricing(pricing);
    } catch (error) {
      console.error("Failed to fetch pricing data:", error);
      addToast("Failed to load pricing data", "error");
    } finally {
      setLoading(false);
    }
  }, [bundleId, addToast]);

  useEffect(() => {
    if (isOpen && bundleId) fetchPricingData();
  }, [isOpen, bundleId, fetchPricingData]);

  const handlePriceChange = (userType: keyof PricingTiers, value: string) => {
    if (userType === "default") return;
    setPricingTiers((prev) => ({ ...prev, [userType]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const validatedTiers: Record<string, number> = {};
      for (const [tier, value] of Object.entries(pricingTiers)) {
        if (tier === "default") continue;

        const numericValue =
          typeof value === "number"
            ? value
            : value.trim() === ""
              ? NaN
              : parseFloat(value);

        if (Number.isNaN(numericValue) || numericValue < 0) {
          addToast("All prices must be positive numbers", "error");
          return;
        }

        validatedTiers[tier] = numericValue;
      }

      await bundleService.updateBundlePricing(bundleId, {
        ...validatedTiers,
        default: basePrice,
      });
      addToast("Pricing updated successfully", "success");
      onPricingUpdated?.();
      onClose();
    } catch (error) {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      addToast(msg || "Failed to update pricing", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => setPricingTiers(originalPricing);

  const hasChanges = () =>
    Object.keys(pricingTiers).some((k) => pricingTiers[k] !== originalPricing[k]);

  const calculateDiscount = (userPrice: number | string) => {
    const numericPrice =
      typeof userPrice === "number"
        ? userPrice
        : userPrice.trim() === ""
          ? 0
          : parseFloat(userPrice);

    if (basePrice === 0 || numericPrice >= basePrice) return 0;
    return Math.round(((basePrice - numericPrice) / basePrice) * 100);
  };

  const formatCurrency = (amount: number | string) => {
    const numericAmount =
      typeof amount === "number"
        ? amount
        : amount.trim() === ""
          ? 0
          : parseFloat(amount);

    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(numericAmount);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      mode="bottom-sheet"
      size="xl"
      className="sm:max-w-5xl"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <DialogHeader className="px-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div
            className="p-2 rounded-xl shrink-0"
            style={{ background: "var(--color-primary-100)" }}
          >
            <FaDollarSign
              className="w-4 h-4 sm:w-5 sm:h-5"
              style={{ color: "var(--color-primary-600)" }}
            />
          </div>
          <div>
            <h3
              className="text-base sm:text-lg font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              Pricing Management
            </h3>
            <p className="text-xs sm:text-sm" style={{ color: "var(--color-muted-text)" }}>
              Set user type-specific pricing for &ldquo;{bundleName}&rdquo;
            </p>
          </div>
        </div>
      </DialogHeader>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <DialogBody className="px-4 sm:px-6 py-4 max-h-[70vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-16">
            <Spinner size="lg" />
            <span
              className="ml-3 text-sm sm:text-base"
              style={{ color: "var(--color-muted-text)" }}
            >
              Loading pricing data…
            </span>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">

            {/* Base price card */}
            <div
              className="p-4 rounded-xl border"
              style={{
                background: "var(--color-control-bg)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4
                    className="text-sm sm:text-base font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    Base Price
                  </h4>
                  <p
                    className="text-xs sm:text-sm mt-0.5"
                    style={{ color: "var(--color-muted-text)" }}
                  >
                    The original bundle price. The default tier always reflects this value.
                  </p>
                </div>
                <div
                  className="text-base sm:text-lg font-bold shrink-0"
                  style={{ color: "var(--color-text)" }}
                >
                  {formatCurrency(basePrice)}
                </div>
              </div>
            </div>

            {/* User-type pricing rows */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FaUsers className="w-4 h-4" style={{ color: "var(--color-muted-text)" }} />
                <h4
                  className="text-sm sm:text-base font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  User Type Pricing
                </h4>
              </div>

              <div className="grid gap-3">
                {editableUserTypes.map((userType) => {
                  const label = userTypeLabels[userType as string];
                  const desc = userTypeDescriptions[userType as string];
                  const price = pricingTiers[userType];
                  const discount = calculateDiscount(price);
                  const badgeStyle = userTypeBadgeStyle[userType as string];
                  const isChanged = price !== originalPricing[userType];

                  return (
                    <div
                      key={userType}
                      className="p-4 rounded-xl border transition-colors duration-150"
                      style={{
                        background: "var(--color-surface)",
                        borderColor: isChanged
                          ? "var(--color-primary-300)"
                          : "var(--color-border)",
                        // subtle left accent when value has been edited
                        borderLeft: isChanged
                          ? "3px solid var(--color-primary-500)"
                          : undefined,
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                        {/* info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {/* user type pill */}
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                              style={badgeStyle}
                            >
                              {label}
                            </span>

                            {/* discount badge — only shown when there's a saving */}
                            {discount > 0 && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={{
                                  background: "var(--color-success-bg)",
                                  color: "var(--color-success-text)",
                                }}
                              >
                                −{discount}% off
                              </span>
                            )}

                            {/* changed indicator */}
                            {isChanged && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{
                                  background: "var(--color-primary-50)",
                                  color: "var(--color-primary-600)",
                                }}
                              >
                                edited
                              </span>
                            )}
                          </div>
                          <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>
                            {desc}
                          </p>
                        </div>

                        {/* price input */}
                        <div className="w-full sm:w-36 shrink-0">
                          <label htmlFor={`price-${userType}`} className="sr-only">
                            Price for {label}
                          </label>
                          <div className="relative">
                            <span
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium select-none"
                              style={{ color: "var(--color-muted-text)" }}
                            >
                              ₵
                            </span>
                            <Input
                              id={`price-${userType}`}
                              type="text"
                              inputMode="decimal"
                              pattern="^\d*\.?\d*$"
                              value={price}
                              onChange={(e) =>
                                handlePriceChange(userType as keyof PricingTiers, e.target.value)
                              }
                              className="pl-7 w-full"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing summary */}
            <div
              className="p-4 rounded-xl border"
              style={{
                background: "var(--color-primary-50)",
                borderColor: "var(--color-primary-100)",
              }}
            >
              <h4
                className="text-sm sm:text-base font-semibold mb-3"
                style={{ color: "var(--color-primary-700)" }}
              >
                Pricing Summary
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(pricingTiers).map(([userType, price]) => (
                  <div
                    key={userType}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
                    style={{ background: "var(--color-surface)" }}
                  >
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-secondary-text)" }}
                    >
                      {userTypeLabels[userType]}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {formatCurrency(price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogBody>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <DialogFooter className="px-4 sm:px-6 flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* reset — only shown when there are unsaved changes */}
        <div className="w-full sm:w-auto flex gap-2 order-2 sm:order-1">
          {hasChanges() && (
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              <FaTimes className="w-3.5 h-3.5 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {/* cancel + save */}
        <div className="w-full sm:w-auto flex flex-col-reverse sm:flex-row gap-2 order-1 sm:order-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges()}
            className="w-full sm:w-auto"
            style={{
              background: saving || !hasChanges()
                ? "var(--color-control-bg)"
                : "var(--color-primary-600)",
              color: saving || !hasChanges()
                ? "var(--color-muted-text)"
                : "#ffffff",
            }}
          >
            {saving ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Saving…
              </>
            ) : (
              <>
                <FaSave className="w-3.5 h-3.5 mr-2" />
                Save Pricing
              </>
            )}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
};