import { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Spinner,
} from "../../design-system";
import { bundleService } from "../../services/bundle.service";
import { useToast } from "../../design-system/components/toast";
import {
  FaDollarSign,
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSync,
  FaEdit,
  FaCube,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import type { Bundle } from "../../types/package";

interface BulkPricingManagementModalProps {
  packageId: string;
  packageName: string;
  bundles: Bundle[];
  isOpen: boolean;
  onClose: () => void;
  onPricingUpdated: () => void;
}

interface BundlePricing {
  basePrice: number | string;
  pricingTiers: Record<string, number | string>;
  hasChanges: boolean;
}

type PricingData = Record<string, BundlePricing>;

// ─── config ───────────────────────────────────────────────────────────────────

const USER_TYPES = [
  { key: "customer", label: "Customer", badgeStyle: { background: "var(--color-primary-100)", color: "var(--color-primary-700)" } },
  { key: "agent", label: "Agent", badgeStyle: { background: "var(--color-success-bg)", color: "var(--color-success-text)" } },
  { key: "super_agent", label: "Super Agent", badgeStyle: { background: "var(--color-primary-50)", color: "var(--color-primary-600)" } },
  { key: "dealer", label: "Dealer", badgeStyle: { background: "var(--color-pending-bg)", color: "var(--color-pending-text)" } },
  { key: "super_dealer", label: "Super Dealer", badgeStyle: { background: "var(--color-failed-bg)", color: "var(--color-failed-text)" } },
] as const;

const DECIMAL_INPUT_PATTERN = /^[0-9]*\.?[0-9]*$/;

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

// ─── shared price input ───────────────────────────────────────────────────────

interface PriceInputProps {
  value: number | string;
  onChange: (val: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isEditing?: boolean;
  hasChanges?: boolean;
}

const PriceInput = ({ value, onChange, onFocus, onBlur, isEditing, hasChanges }: PriceInputProps) => (
  <input
    type="text"
    inputMode="decimal"
    pattern="^\d*\.?\d*$"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onFocus={onFocus}
    onBlur={onBlur}
    style={{
      width: "100%",
      padding: "5px 8px",
      fontSize: "12px",
      textAlign: "center",
      borderRadius: "8px",
      border: `1px solid ${isEditing
          ? "var(--color-primary-400)"
          : hasChanges
            ? "var(--color-warning)"
            : "var(--color-border)"
        }`,
      background: isEditing
        ? "var(--color-primary-50)"
        : hasChanges
          ? "var(--color-input-bg)"
          : "var(--color-input-bg)",
      color: "var(--color-gray-900)",
      outline: "none",
      transition: "border-color 0.15s, background 0.15s",
      boxShadow: isEditing ? "0 0 0 2px var(--color-primary-200)" : "none",
    }}
  />
);

// ─── main component ───────────────────────────────────────────────────────────

export const BulkPricingManagementModal: React.FC<BulkPricingManagementModalProps> = ({
  packageName,
  bundles,
  isOpen,
  onClose,
  onPricingUpdated,
}) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pricingData, setPricingData] = useState<PricingData>({});
  const [editingCell, setEditingCell] = useState<{ bundleId: string; userType: string } | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [expandedBundles, setExpandedBundles] = useState<Record<string, boolean>>({});

  // ── data loading ────────────────────────────────────────────────────────────

  const loadAllPricing = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        bundles.map((b) => bundleService.getBundlePricing(b._id!))
      );
      const newData: PricingData = {};
      const initialExpansion: Record<string, boolean> = {};

      results.forEach((result, i) => {
        const id = bundles[i]._id!;
        newData[id] = {
          basePrice: result.basePrice?.toString() ?? "",
          pricingTiers: Object.fromEntries(
            Object.entries(result.pricingTiers || {}).map(([key, value]) => [
              key,
              value?.toString() ?? "",
            ])
          ),
          hasChanges: false,
        };
        initialExpansion[id] = i < 2; // first two open by default
      });

      setPricingData(newData);
      setExpandedBundles(initialExpansion);
    } catch {
      addToast("Failed to load pricing data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && bundles.length > 0) loadAllPricing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, bundles]);

  // ── mutations ───────────────────────────────────────────────────────────────

  const updateTier = (bundleId: string, userType: string, value: string) => {
    if (value === "" || DECIMAL_INPUT_PATTERN.test(value)) {
      setPricingData((prev) => ({
        ...prev,
        [bundleId]: {
          ...prev[bundleId],
          pricingTiers: { ...prev[bundleId].pricingTiers, [userType]: value },
          hasChanges: true,
        },
      }));
    }
  };

  const updateBasePrice = (bundleId: string, value: string) => {
    if (value === "" || DECIMAL_INPUT_PATTERN.test(value)) {
      setPricingData((prev) => ({
        ...prev,
        [bundleId]: { ...prev[bundleId], basePrice: value, hasChanges: true },
      }));
    }
  };

  const handleSaveAll = async () => {
    const changed = Object.entries(pricingData).filter(([, d]) => d.hasChanges);
    if (!changed.length) {
      addToast("No changes to save", "info");
      return;
    }

    const updates = [] as Array<{
      bundleId: string;
      basePrice: number;
      pricingTiers: Record<string, number>;
    }>;

    for (const [bundleId, data] of changed) {
      const basePriceValue =
        typeof data.basePrice === "number"
          ? data.basePrice
          : data.basePrice.trim() === ""
            ? NaN
            : parseFloat(data.basePrice);

      if (Number.isNaN(basePriceValue) || basePriceValue < 0) {
        addToast(`Base price for bundle ${bundleId} must be a valid positive number`, "error");
        return;
      }

      const pricingTiers: Record<string, number> = {};
      for (const [userType, value] of Object.entries(data.pricingTiers)) {
        const tierValue =
          typeof value === "number"
            ? value
            : value.trim() === ""
              ? NaN
              : parseFloat(value);

        if (Number.isNaN(tierValue) || tierValue < 0) {
          addToast(`Price for ${userType} on bundle ${bundleId} must be a valid positive number`, "error");
          return;
        }

        pricingTiers[userType] = tierValue;
      }

      updates.push({
        bundleId,
        basePrice: basePriceValue,
        pricingTiers: { ...pricingTiers, default: basePriceValue },
      });
    }

    setSaving(true);
    try {
      const result = await bundleService.bulkUpdatePricing(updates);

      if (result.failed.length > 0) {
        addToast(`Updated ${result.successful.length}, ${result.failed.length} failed`, "warning");
      } else {
        addToast(`Pricing updated for ${result.successful.length} bundle${result.successful.length !== 1 ? "s" : ""}`, "success");
      }

      setPricingData((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          next[k] = { ...next[k], hasChanges: false };
        });
        return next;
      });
      onPricingUpdated();
    } catch {
      addToast("Failed to save pricing changes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetAll = () => {
    loadAllPricing();
    addToast("All changes have been reset", "info");
  };

  // ── derived ─────────────────────────────────────────────────────────────────

  const changedCount = Object.values(pricingData).filter((d) => d.hasChanges).length;
  const toggleBundle = (id: string) =>
    setExpandedBundles((prev) => ({ ...prev, [id]: !prev[id] }));

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="full" mode="bottom-sheet">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <DialogHeader
        className="border-b"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
          <div className="flex-1 min-w-0">
            <h2
              className="text-base sm:text-lg font-bold flex items-center gap-2"
              style={{ color: "var(--color-text)" }}
            >
              <FaDollarSign style={{ color: "var(--color-success-icon)" }} />
              <span className="truncate">Bulk Pricing Management</span>
            </h2>
            <p className="text-xs sm:text-sm mt-0.5 line-clamp-1" style={{ color: "var(--color-muted-text)" }}>
              {packageName} — {bundles.length} bundle{bundles.length !== 1 ? "s" : ""}
            </p>
          </div>

          {changedCount > 0 && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
              style={{ background: "var(--color-pending-bg)", color: "var(--color-pending-text)" }}
            >
              <FaEdit className="w-3 h-3" />
              {changedCount} bundle{changedCount !== 1 ? "s" : ""} modified
            </span>
          )}
        </div>
      </DialogHeader>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <DialogBody style={{ background: "var(--color-background)" }}>
        {loading ? (
          <div
            className="flex flex-col items-center justify-center gap-3 py-16"
            style={{ color: "var(--color-muted-text)" }}
          >
            <Spinner size="lg" />
            <span className="text-sm">Loading pricing data…</span>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Instructions accordion */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "var(--color-primary-200)", background: "var(--color-primary-50)" }}
            >
              <button
                onClick={() => setInstructionsOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
                style={{ color: "var(--color-primary-700)" }}
              >
                <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                  <FaExclamationTriangle className="w-3.5 h-3.5 shrink-0" />
                  How to use
                </span>
                {instructionsOpen
                  ? <FaChevronUp className="w-3 h-3 shrink-0" />
                  : <FaChevronDown className="w-3 h-3 shrink-0" />}
              </button>

              {instructionsOpen && (
                <div
                  className="px-4 pb-4 pt-2 border-t text-xs sm:text-sm space-y-1"
                  style={{
                    borderColor: "var(--color-primary-200)",
                    color: "var(--color-primary-700)",
                  }}
                >
                  {[
                    "Click any price cell to edit it directly",
                    "Edited rows are highlighted with an amber border",
                    "Press Save All Changes to apply every modification at once",
                    "Press Reset All to discard unsaved changes",
                  ].map((tip) => (
                    <div key={tip} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">•</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Mobile cards (< lg) ─────────────────────────────────────── */}
            <div className="space-y-3 lg:hidden">
              {bundles.map((bundle) => {
                const bp = pricingData[bundle._id!];
                if (!bp) return null;
                const open = expandedBundles[bundle._id!] ?? false;

                return (
                  <div
                    key={bundle._id}
                    className="rounded-xl border overflow-hidden transition-colors"
                    style={{
                      background: "var(--color-surface)",
                      borderColor: bp.hasChanges ? "var(--color-warning)" : "var(--color-border)",
                      borderLeft: bp.hasChanges ? "3px solid var(--color-warning)" : undefined,
                    }}
                  >
                    {/* accordion header */}
                    <button
                      type="button"
                      onClick={() => toggleBundle(bundle._id!)}
                      className="w-full flex items-start justify-between gap-3 p-4 text-left"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <FaCube
                          className="w-4 h-4 mt-0.5 shrink-0"
                          style={{ color: "var(--color-primary-500)" }}
                        />
                        <div className="min-w-0">
                          <p
                            className="text-sm font-semibold truncate"
                            style={{ color: "var(--color-text)" }}
                          >
                            {bundle.name}
                          </p>
                          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-muted-text)" }}>
                            {bundle.dataVolume} {bundle.dataUnit} · {bundle.validity} {bundle.validityUnit}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {bp.hasChanges ? (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: "var(--color-pending-bg)", color: "var(--color-pending-text)" }}
                          >
                            Modified
                          </span>
                        ) : (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: "var(--color-success-bg)", color: "var(--color-success-text)" }}
                          >
                            Saved
                          </span>
                        )}
                        {open
                          ? <FaChevronUp className="w-3 h-3" style={{ color: "var(--color-muted-text)" }} />
                          : <FaChevronDown className="w-3 h-3" style={{ color: "var(--color-muted-text)" }} />}
                      </div>
                    </button>

                    {/* expanded content */}
                    {open && (
                      <div
                        className="px-4 pb-4 pt-3 border-t space-y-3"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        {/* base price */}
                        <div>
                          <label
                            className="text-xs font-medium mb-1.5 block"
                            style={{ color: "var(--color-secondary-text)" }}
                          >
                            Base Price
                          </label>
                          <PriceInput
                            value={bp.basePrice}
                            onChange={(v) => updateBasePrice(bundle._id!, v)}
                            hasChanges={bp.hasChanges}
                          />
                        </div>

                        {/* user type inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {USER_TYPES.map((ut) => {
                            const price = bp.pricingTiers[ut.key] ?? bp.basePrice;
                            return (
                              <div
                                key={ut.key}
                                className="rounded-xl border p-3"
                                style={{
                                  background: "var(--color-control-bg)",
                                  borderColor: "var(--color-border)",
                                }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span
                                    className="text-xs font-semibold"
                                    style={{ color: "var(--color-text)" }}
                                  >
                                    {ut.label}
                                  </span>
                                  <span
                                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                    style={ut.badgeStyle}
                                  >
                                    {ut.key}
                                  </span>
                                </div>
                                <PriceInput
                                  value={price}
                                  onChange={(v) => updateTier(bundle._id!, ut.key, v)}
                                  hasChanges={bp.hasChanges}
                                />
                              </div>
                            );
                          })}
                        </div>

                        <p
                          className="text-xs rounded-lg px-3 py-2"
                          style={{ background: "var(--color-control-bg)", color: "var(--color-muted-text)" }}
                        >
                          Base: <strong style={{ color: "var(--color-text)" }}>{formatCurrency(bp.basePrice)}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table (lg+) ─────────────────────────────────────── */}
            <div
              className="hidden lg:block rounded-xl border overflow-hidden"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr style={{ background: "var(--color-control-bg)", borderBottom: `1px solid var(--color-border)` }}>
                      {/* bundle col */}
                      <th
                        className="sticky left-0 z-20 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{
                          background: "var(--color-control-bg)",
                          color: "var(--color-muted-text)",
                          minWidth: 240,
                        }}
                      >
                        Bundle
                      </th>

                      {/* base price col */}
                      <th
                        className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--color-muted-text)", minWidth: 120 }}
                      >
                        Base Price
                      </th>

                      {/* user type cols */}
                      {USER_TYPES.map((ut) => (
                        <th
                          key={ut.key}
                          className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide"
                          style={{ color: "var(--color-muted-text)", minWidth: 130 }}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span>{ut.label}</span>
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                              style={ut.badgeStyle}
                            >
                              {ut.key}
                            </span>
                          </div>
                        </th>
                      ))}

                      <th
                        className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--color-muted-text)", minWidth: 90 }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {bundles.map((bundle, idx) => {
                      const bp = pricingData[bundle._id!];
                      if (!bp) return null;

                      return (
                        <tr
                          key={bundle._id}
                          style={{
                            background: bp.hasChanges
                              ? "var(--color-pending-bg)"
                              : idx % 2 === 0
                                ? "var(--color-surface)"
                                : "var(--color-control-bg)",
                            borderBottom: `1px solid var(--color-border)`,
                            transition: "background 0.15s",
                          }}
                        >
                          {/* bundle name — sticky */}
                          <td
                            className="sticky left-0 z-10 px-4 py-3"
                            style={{
                              background: bp.hasChanges ? "var(--color-pending-bg)" : "inherit",
                              borderRight: `1px solid var(--color-border)`,
                            }}
                          >
                            <div className="flex items-center gap-2.5">
                              <FaCube
                                className="w-4 h-4 shrink-0"
                                style={{ color: "var(--color-primary-500)" }}
                              />
                              <div className="min-w-0">
                                <p
                                  className="text-sm font-semibold truncate"
                                  style={{ color: "var(--color-text)" }}
                                >
                                  {bundle.name}
                                </p>
                                <p className="text-xs truncate" style={{ color: "var(--color-muted-text)" }}>
                                  {bundle.dataVolume} {bundle.dataUnit} · {bundle.validity} {bundle.validityUnit}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* base price */}
                          <td className="px-3 py-2.5">
                            <PriceInput
                              value={bp.basePrice}
                              onChange={(v) => updateBasePrice(bundle._id!, v)}
                              hasChanges={bp.hasChanges}
                            />
                          </td>

                          {/* user type prices */}
                          {USER_TYPES.map((ut) => {
                            const price = bp.pricingTiers[ut.key] ?? bp.basePrice;
                            const isEditing =
                              editingCell?.bundleId === bundle._id &&
                              editingCell?.userType === ut.key;
                            return (
                              <td key={ut.key} className="px-3 py-2.5">
                                <PriceInput
                                  value={price}
                                  onChange={(v) => updateTier(bundle._id!, ut.key, v)}
                                  onFocus={() => setEditingCell({ bundleId: bundle._id!, userType: ut.key })}
                                  onBlur={() => setEditingCell(null)}
                                  isEditing={isEditing}
                                  hasChanges={bp.hasChanges}
                                />
                              </td>
                            );
                          })}

                          {/* status */}
                          <td className="px-3 py-2.5">
                            <div className="flex justify-center">
                              {bp.hasChanges ? (
                                <span
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                  style={{ background: "var(--color-pending-bg)", color: "var(--color-pending-text)" }}
                                >
                                  <FaEdit className="w-2.5 h-2.5" />
                                  Modified
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                  style={{ background: "var(--color-success-bg)", color: "var(--color-success-text)" }}
                                >
                                  <FaCheckCircle className="w-2.5 h-2.5" />
                                  Saved
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Summary strip ───────────────────────────────────────────── */}
            <div
              className="rounded-xl border p-4"
              style={{ background: "var(--color-control-bg)", borderColor: "var(--color-border)" }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Bundles", value: bundles.length, color: "var(--color-text)" },
                  { label: "Modified", value: changedCount, color: "var(--color-pending-icon)" },
                  { label: "User Types", value: USER_TYPES.length, color: "var(--color-primary-500)" },
                  { label: "Total Prices", value: bundles.length * (USER_TYPES.length + 1), color: "var(--color-info)" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <p className="text-xs mb-1" style={{ color: "var(--color-muted-text)" }}>{label}</p>
                    <p className="text-lg font-bold" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogBody>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <DialogFooter
        className="border-t"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between w-full gap-2 sm:gap-3">

          {/* reset */}
          <Button
            variant="outline"
            onClick={handleResetAll}
            disabled={saving || loading || changedCount === 0}
            size="sm"
            className="sm:w-auto"
          >
            <FaSync className="mr-2 w-3 h-3" />
            Reset All
          </Button>

          {/* cancel + save */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={saving}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <FaTimes className="mr-2 w-3 h-3" />
              Cancel
            </Button>

            <Button
              onClick={handleSaveAll}
              disabled={saving || loading || changedCount === 0}
              size="sm"
              className="flex-1 sm:flex-none"
              style={{
                background: saving || changedCount === 0
                  ? "var(--color-control-bg)"
                  : "var(--color-success-icon)",
                color: saving || changedCount === 0
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
                  <FaSave className="mr-2 w-3 h-3" />
                  Save All {changedCount > 0 && `(${changedCount})`}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </Dialog>
  );
};