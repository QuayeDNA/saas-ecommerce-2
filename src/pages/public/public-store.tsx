/* eslint-disable @typescript-eslint/no-explicit-any */
// =============================================================================
// PublicStore — Thin orchestrator
// State, data fetching, derived state, handlers live here.
// All UI is delegated to sub-components in src/components/public/
// =============================================================================

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "../../design-system";
import storefrontService from "../../services/storefront.service";
import announcementService from "../../services/announcement.service";
import { websocketService } from "../../services/websocket.service";
import { useToast } from "../../design-system/components/toast";
import { useSiteStatus } from "../../contexts/site-status-context";
import AnnouncementPopupHandler from "../../components/announcements/announcement-popup-handler";
import { StorefrontEntryMarker } from "../../contexts/storefront-session-context";
import AdBanner from "../../components/ads/ad-banner";

// ─── Sub-components ──────────────────────────────────────────────────────────
import {
  StoreSkeleton,
  StoreError,
  StoreHeader,
  StoreToolbar,
  FeaturedSection,
  BundleSections,
  OrderDialog,
  StoreFooter,
  TrackOrderDrawer,
} from "../../components/public";
import type {
  ThemeConfig,
  PublicBundle,
  PublicStorefront,
  PublicOrderData,
  PublicOrderResult,
  StorefrontBranding,
} from "../../components/public/types";
import { THEMES, DEFAULT_THEME } from "../../components/public/constants";
import { getPaystackEmail } from "../../utils/paystack-email";
import {
  normalizePhone,
  isValidPhone,
  loadPaystackScript,
  updateStorefrontOGTags,
} from "../../components/public/utils";
import { estimateFee } from "../../components/public/types";
import { saveOrderEntry } from "../../components/public/order-tracking";

import type { Announcement } from "../../types/announcement";
import { FaStore } from "react-icons/fa6";

// ─── Order types ─────────────────────────────────────────────────────────────

interface OrderItem {
  bundle: PublicBundle;
  customerPhone: string;
  customerName?: string;
  ghanaCardNumber?: string;
}

type OrderStep = "details" | "payment" | "confirmation";

// =============================================================================
// Main Component
// =============================================================================

const PublicStore: React.FC = () => {
  const { businessName } = useParams<{ businessName: string }>();
  const { addToast } = useToast();
  const { siteStatus } = useSiteStatus();

  const storeClosed = siteStatus?.isSiteOpen === false;
  const storeClosedMessage =
    siteStatus?.customMessage ||
    "The site is currently closed for maintenance. Orders are temporarily disabled.";
  const storefrontsOpen = siteStatus?.storefrontsOpen ?? true;
  const storefrontsClosedMessage =
    siteStatus?.storefrontsClosedMessage ||
    "Storefronts are temporarily closed by the admin. Please check back later.";
  const storefrontsClosed = !storefrontsOpen;
  const ordersClosed = storeClosed || storefrontsClosed;

  // ── Data ─────────────────────────────────────────────────────────────────────
  const [storeData, setStoreData] = useState<PublicStorefront | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── UI ───────────────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [collapsedPackages, setCollapsedPackages] = useState<Set<string>>(new Set());

  // ── Single-item order ─────────────────────────────────────────────────────────
  const [activeOrder, setActiveOrder] = useState<OrderItem | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderStep, setOrderStep] = useState<OrderStep>("details");
  const [orderPhone, setOrderPhone] = useState("");
  const [orderCustomerName, setOrderCustomerName] = useState("");
  const [orderGhanaCard, setOrderGhanaCard] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentType, setPaymentType] = useState<"paystack" | "mobile_money" | "bank_transfer">("paystack");
  const [transactionRef, setTransactionRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<PublicOrderResult | null>(null);
  const [paystackStatus, setPaystackStatus] = useState<"idle" | "success" | "failed">("idle");

  // ── Track order drawer ────────────────────────────────────────────────────
  const [showTrackDrawer, setShowTrackDrawer] = useState(false);

  // ── Public announcements ──────────────────────────────────────────────────
  const [publicAnnouncements, setPublicAnnouncements] = useState<Announcement[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<Set<string>>(new Set());
  const [viewedPublicAnnouncements, setViewedPublicAnnouncements] = useState<Set<string>>(new Set());

  const storeViewedKey = businessName ? `public_announcements_viewed_${businessName}` : null;
  const storeDismissedKey = businessName ? `public_announcements_dismissed_${businessName}` : null;

  // ==========================================================================
  // Data fetching
  // ==========================================================================

  const fetchStore = useCallback(async () => {
    if (!businessName) return;
    setLoading(true);
    setError(null);
    try {
      const data = await storefrontService.getPublicStorefront(businessName);
      setStoreData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Store not found");
    } finally {
      setLoading(false);
    }
  }, [businessName]);

  useEffect(() => { fetchStore(); }, [fetchStore]);

  useEffect(() => {
    if (storeData) updateStorefrontOGTags(storeData.storefront, storeData.bundles);
    return () => { document.title = "Caskmaf Datahub"; };
  }, [storeData]);

  // Public announcement persistence
  const viewedKey = businessName ? `public_announcements_viewed_${businessName}` : null;
  const dismissedKey = businessName ? `public_announcements_dismissed_${businessName}` : null;

  const markPublicAnnouncementViewed = useCallback(
    (id: string) => {
      if (!viewedKey) return;
      setViewedPublicAnnouncements((prev) => {
        const next = new Set(prev);
        next.add(id);
        try { localStorage.setItem(viewedKey, JSON.stringify(Array.from(next))); } catch { /* empty */ }
        return next;
      });
    },
    [viewedKey],
  );

  const dismissPublicAnnouncement = useCallback(
    (id: string) => {
      if (!dismissedKey) return;
      setDismissedAnnouncements((prev) => {
        const next = new Set(prev);
        next.add(id);
        try { localStorage.setItem(dismissedKey, JSON.stringify(Array.from(next))); } catch { /* empty */ }
        return next;
      });
    },
    [dismissedKey],
  );

  useEffect(() => {
    if (!businessName) return;
    if (viewedKey) {
      const stored = localStorage.getItem(viewedKey);
      if (stored) { try { setViewedPublicAnnouncements(new Set(JSON.parse(stored))); } catch { /* empty */ } }
    }
    if (dismissedKey) {
      const stored = localStorage.getItem(dismissedKey);
      if (stored) { try { setDismissedAnnouncements(new Set(JSON.parse(stored))); } catch { /* empty */ } }
    }
    const fetchAnnouncements = async () => {
      try {
        const announcements = await announcementService.getPublicActiveAnnouncements(businessName);
        setPublicAnnouncements(announcements);
      } catch (err) {
        console.warn("Failed to load public announcements", err);
      }
    };
    fetchAnnouncements();
    websocketService.connect(`public:${businessName}`);
    const handleAnnouncement = (data: unknown) => {
      const announcement = data as Announcement;
      if (!announcement || !announcement._id) return;
      setPublicAnnouncements((prev) => {
        const exists = prev.some((a) => a._id === announcement._id);
        if (exists) return prev.map((a) => (a._id === announcement._id ? announcement : a));
        return [announcement, ...prev];
      });
    };
    websocketService.on("announcement", handleAnnouncement);
    return () => { websocketService.off("announcement", handleAnnouncement); };
  }, [businessName, viewedKey, dismissedKey, storeViewedKey, storeDismissedKey]);

  // Paystack popup message listener
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data || {};
      if (d.type !== "PAYSTACK_STOREFRONT") return;
      if (orderResult?.paystack?.reference && d.reference && d.reference !== orderResult.paystack.reference) return;
      setPaystackStatus(d.status === "success" ? "success" : "failed");
      if (d.status === "success") setOrderStep("confirmation");
      else setOrderError(d.message || "Payment verification failed");
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [orderResult]);

  // ==========================================================================
  // Derived state
  // ==========================================================================

  const theme = useMemo<ThemeConfig>(() => {
    if (!storeData) return DEFAULT_THEME;
    const b = storeData.storefront.branding;
    if (b?.customColors?.primary) {
      return {
        primary: b.customColors.primary,
        secondary: b.customColors.secondary || b.customColors.primary,
        accent: b.customColors.accent || b.customColors.primary + "40",
        bg: b.customColors.primary + "12",
        text: "#FFFFFF",
        gradient: `linear-gradient(135deg, ${b.customColors.primary}, ${b.customColors.secondary || b.customColors.primary})`,
        cardBorder: b.customColors.primary + "30",
        heroBg: b.customColors.primary + "10",
      };
    }
    const key = storeData.storefront.settings?.theme || "blue";
    return THEMES[key] || DEFAULT_THEME;
  }, [storeData]);

  const branding: StorefrontBranding = storeData?.storefront.branding || {};
  const storeLayout = branding.layout || "modern";

  const providers = useMemo(() => {
    if (!storeData) return [];
    if (Array.isArray(storeData.providers) && storeData.providers.length > 0) {
      return storeData.providers.map((p) => ({ code: p.code, name: p.name, logo: p.logo }));
    }
    const map = new Map<string, string>();
    for (const b of storeData.bundles) {
      const code = b.provider || "Unknown";
      if (!map.has(code)) map.set(code, b.providerName || code);
    }
    return Array.from(map.entries()).map(([code, name]) => ({ code, name, logo: undefined }));
  }, [storeData]);

  const groupedBundles = useMemo(() => {
    if (!storeData) return new Map<string, Map<string, PublicBundle[]>>();
    let filtered = storeData.bundles;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(term) ||
          (b.description?.toLowerCase() || "").includes(term) ||
          (b.providerName?.toLowerCase() || "").includes(term) ||
          (b.packageName?.toLowerCase() || "").includes(term),
      );
    }
    if (selectedProvider !== "all") filtered = filtered.filter((b) => b.provider === selectedProvider);
    const result = new Map<string, Map<string, PublicBundle[]>>();
    for (const bundle of filtered) {
      const provCode = bundle.provider || "Unknown";
      if (!result.has(provCode)) result.set(provCode, new Map());
      const pkgName = bundle.packageName || "General";
      const pkgMap = result.get(provCode)!;
      if (!pkgMap.has(pkgName)) pkgMap.set(pkgName, []);
      pkgMap.get(pkgName)!.push(bundle);
    }
    return result;
  }, [storeData, searchTerm, selectedProvider]);

  const popularBundles = useMemo(() => {
    if (storeData?.popularBundles && storeData.popularBundles.length) return storeData.popularBundles.slice(0, 8);
    if (!storeData?.bundles.length) return [];
    return [...storeData.bundles].sort((a, b) => a.price - b.price).slice(0, 8);
  }, [storeData]);

  const feeEstimate = useMemo(() => {
    if (!activeOrder) return null;
    if (paymentType !== "paystack") return null;
    return estimateFee(activeOrder.bundle.price);
  }, [activeOrder, paymentType]);

  const phoneOk = isValidPhone(orderPhone);
  const isAfaBundle = activeOrder?.bundle.provider?.toUpperCase() === "AFA";
  const afaOk =
    !isAfaBundle ||
    (orderCustomerName.trim() &&
      (!activeOrder?.bundle.requiresGhanaCard ||
        (orderGhanaCard.trim() && /^[A-Z]{3}-?\d{9}-?\d$/i.test(orderGhanaCard))));
  const step1Valid = phoneOk && Boolean(afaOk);
  const canSubmitOrder = Boolean(
    customerName.trim() &&
    (paymentType !== "mobile_money" || transactionRef.trim()),
  );

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const openOrderDialog = useCallback(
    (bundle: PublicBundle) => {
      if (storeClosed) { addToast(storeClosedMessage, "warning", 5000); return; }
      if (storefrontsClosed) { addToast(storefrontsClosedMessage, "warning", 5000); return; }
      setActiveOrder({ bundle, customerPhone: "" });
      setOrderPhone(""); setOrderCustomerName(""); setOrderGhanaCard("");
      setCustomerName(""); setTransactionRef("");
      setOrderError(null); setOrderResult(null); setPaystackStatus("idle"); setOrderStep("details");
      const methods = storeData?.storefront.paymentMethods || [];
      const paystackOk = storeData?.storefront.paystackStorefrontEnabled ?? false;
      const hasMomo = methods.some((m) => m.type === "mobile_money");
      const hasPaystack = methods.some((m) => m.type === "paystack");
      if (hasMomo) setPaymentType("mobile_money");
      else if (hasPaystack && paystackOk) setPaymentType("paystack");
      else setPaymentType(methods[0]?.type ?? "mobile_money");
      setShowOrderDialog(true);
    },
    [storeClosed, storeClosedMessage, storefrontsClosed, storefrontsClosedMessage, storeData, addToast],
  );

  const closeOrderDialog = useCallback(() => {
    setShowOrderDialog(false);
    setActiveOrder(null);
  }, []);

  const confirmDetails = useCallback(() => {
    if (!step1Valid || !activeOrder) return;
    const isAfa = activeOrder.bundle.provider?.toUpperCase() === "AFA";
    setActiveOrder((prev) =>
      prev ? {
        ...prev,
        customerPhone: normalizePhone(orderPhone),
        customerName: isAfa ? orderCustomerName : undefined,
        ghanaCardNumber: isAfa ? orderGhanaCard : undefined,
      } : null,
    );
    setOrderStep("payment");
  }, [step1Valid, activeOrder, orderPhone, orderCustomerName, orderGhanaCard]);

  const togglePackage = useCallback((key: string) => {
    setCollapsedPackages((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const openPaystackInline = useCallback(
    async (_reference: string, _amountGhs: number, accessCode: string) => {
      try {
        setPaystackStatus("idle");
        await loadPaystackScript();
        const PaystackPopCtor = (window as any).PaystackPop;
        if (!PaystackPopCtor) throw new Error("Paystack script failed to load");
        if (!accessCode) throw new Error("Missing Paystack access code");
        const onSuccess = (response: { reference: string }) => {
          storefrontService
            .verifyPaystackReference(response.reference)
            .then(() => {
              setPaystackStatus("success"); setOrderStep("confirmation");
              addToast("Payment confirmed! Your order is processing.", "success", 5000);
            })
            .catch(() => {
              setPaystackStatus("failed");
              addToast("Payment received but verification is pending.", "warning", 8000);
            });
        };
        const onClose = () => {
          addToast("Payment window closed — no charge was made.", "info", 4000);
        };
        const popup = new PaystackPopCtor();
        popup.resumeTransaction(accessCode, { onSuccess, onCancel: onClose });
      } catch (err) {
        console.error("[PublicStore] Paystack inline checkout failed", err);
        addToast("Unable to open Paystack checkout. Please try again or use a different browser.", "error", 8000);
      }
    },
    [addToast],
  );

  const submitOrder = useCallback(async () => {
    if (!businessName || !storeData || !canSubmitOrder || !activeOrder) return;
    setSubmitting(true); setOrderError(null);
    try {
      const phone = normalizePhone(orderPhone);
      const isAfa = activeOrder.bundle.provider?.toUpperCase() === "AFA";
      const orderData: PublicOrderData = {
        items: [{ bundleId: activeOrder.bundle._id, quantity: 1, customerPhone: phone }],
        customerInfo: {
          name: isAfa && activeOrder.customerName ? activeOrder.customerName.trim() : customerName.trim(),
          phone,
          email: getPaystackEmail(phone),
          ...(activeOrder.ghanaCardNumber && { ghanaCardNumber: activeOrder.ghanaCardNumber }),
        },
        paymentMethod: {
          type: paymentType,
          reference: transactionRef.trim().replace(/[^a-zA-Z0-9\-_]/g, "") || undefined,
        },
      };
      const result = await storefrontService.createPublicOrder(businessName, orderData);
      const paystackData = result?.paystack as { authorizationUrl?: string; authorization_url?: string; reference?: string } | undefined;
      const paystackUrl = paystackData?.authorizationUrl || paystackData?.authorization_url;
      const reference = paystackData?.reference;
      const accessCode = (result?.paystack as any)?.accessCode || "";
      setOrderResult(result);
      if (businessName) {
        saveOrderEntry(businessName, {
          orderId: result.orderId, orderNumber: result.orderNumber,
          reference: result.orderNumber || reference || result.orderId,
          bundleName: activeOrder.bundle.name, provider: activeOrder.bundle.provider || "",
          total: result.total, paymentType, savedAt: Date.now(), lastStatus: result.status,
        });
      }
      setOrderStep("confirmation");
      if (paystackUrl && reference) {
        await openPaystackInline(reference, result.total ?? activeOrder.bundle.price, accessCode);
      }
    } catch (err) {
      const errorData = (err as any)?.response?.data;
      const axiosMsg = errorData?.message;
      const firstFieldError = Array.isArray(errorData?.errors) && errorData.errors.length > 0
        ? errorData.errors[0]?.msg || errorData.errors[0]?.message : null;
      setOrderError(firstFieldError || axiosMsg || (err instanceof Error ? err.message : "Failed to place order. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }, [businessName, storeData, canSubmitOrder, activeOrder, orderPhone, customerName, paymentType, transactionRef, openPaystackInline]);

  const onClearSearch = useCallback(() => { setSearchTerm(""); setSelectedProvider("all"); }, []);

  // ==========================================================================
  // Conditional renders
  // ==========================================================================

  if (loading) return <StoreSkeleton theme={DEFAULT_THEME} />;
  if (error || !storeData) return <StoreError error={error ?? "Store not available"} onRetry={fetchStore} />;

  const { storefront } = storeData;

  // ==========================================================================
  // Root render
  // ==========================================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      {businessName && <StorefrontEntryMarker businessName={businessName} />}
      <AnnouncementPopupHandler
        announcements={publicAnnouncements.filter(
          (a) => !dismissedAnnouncements.has(a._id) && !viewedPublicAnnouncements.has(a._id),
        )}
        onMarkAsViewed={markPublicAnnouncementViewed}
        onMarkAsAcknowledged={markPublicAnnouncementViewed}
      />
      {storefrontsClosed && (
        <Dialog isOpen={true} onClose={() => {}} size="sm" closeOnOverlay={false} overlayClassName="bg-black/60 backdrop-blur-sm">
          <DialogHeader className="border-b-0 pb-0">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <FaStore className="w-7 h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-text)]">Storefronts Are Closed</h3>
            </div>
          </DialogHeader>
          <DialogBody className="space-y-3 text-center text-sm sm:text-base text-[var(--color-secondary-text)]">
            <p>{storefrontsClosedMessage}</p>
            <p className="text-xs sm:text-sm text-[var(--color-muted-text)]">Orders are paused for all storefronts until the admin reopens them.</p>
          </DialogBody>
          <DialogFooter justify="center" className="pt-0">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Check Again</Button>
          </DialogFooter>
        </Dialog>
      )}
      <StoreHeader storefront={storefront} branding={branding} theme={theme} storeLayout={storeLayout} />
      <StoreToolbar
        theme={theme} searchTerm={searchTerm} onSearchChange={setSearchTerm}
        selectedProvider={selectedProvider} onProviderChange={setSelectedProvider}
        providers={providers} storeData={storeData} groupedBundles={groupedBundles}
        onOpenTrackDrawer={() => setShowTrackDrawer(true)}
        storeClosed={storeClosed} storeClosedMessage={storeClosedMessage}
        storefrontsClosed={storefrontsClosed} storefrontsClosedMessage={storefrontsClosedMessage}
        publicAnnouncements={publicAnnouncements} dismissedAnnouncements={dismissedAnnouncements}
        onDismissAnnouncement={dismissPublicAnnouncement}
      />
      <main>
        {(popularBundles.length > 0 || storeData.bundles.length > 0) && (
          <div className="max-w-5xl mx-auto">
            <FeaturedSection theme={theme} trendingBundles={popularBundles} allBundles={storeData.bundles} onSelect={openOrderDialog} />
          </div>
        )}
        <div className="max-w-5xl mx-auto px-4 py-3">
          <AdBanner adSlot="YOUR_AD_SLOT_ID_B" adFormat="horizontal" />
        </div>
        <BundleSections
          storeData={storeData} groupedBundles={groupedBundles} searchTerm={searchTerm}
          selectedProvider={selectedProvider} providers={providers}
          activeOrderBundleId={activeOrder?.bundle._id} ordersClosed={ordersClosed}
          collapsedPackages={collapsedPackages} onTogglePackage={togglePackage}
          onBuy={openOrderDialog} onClearSearch={onClearSearch}
        />
      </main>
      <div className="max-w-5xl mx-auto px-4 pb-2 pt-2">
        <AdBanner adSlot="YOUR_AD_SLOT_ID_D" adFormat="horizontal" />
      </div>
      <StoreFooter storefront={storefront} branding={branding} />
      <OrderDialog
        isOpen={showOrderDialog} onClose={closeOrderDialog} activeOrder={activeOrder}
        orderStep={orderStep} onOrderStepChange={setOrderStep} storefront={storefront}
        theme={theme} ordersClosed={ordersClosed} storeClosed={storeClosed} storeClosedMessage={storeClosedMessage}
        storefrontsClosed={storefrontsClosed} storefrontsClosedMessage={storefrontsClosedMessage}
        orderPhone={orderPhone} setOrderPhone={setOrderPhone}
        orderCustomerName={orderCustomerName} setOrderCustomerName={setOrderCustomerName}
        orderGhanaCard={orderGhanaCard} setOrderGhanaCard={setOrderGhanaCard}
        customerName={customerName} setCustomerName={setCustomerName}
        paymentType={paymentType} setPaymentType={setPaymentType as (v: string) => void}
        transactionRef={transactionRef} setTransactionRef={setTransactionRef}
        feeEstimate={feeEstimate} onConfirmDetails={confirmDetails} onSubmitOrder={submitOrder}
        submitting={submitting} orderError={orderError} orderResult={orderResult}
        paystackStatus={paystackStatus} onOpenPaystack={openPaystackInline}
        onShowTrackDrawer={() => { setShowOrderDialog(false); setShowTrackDrawer(true); }}
      />
      {businessName && (
        <TrackOrderDrawer businessName={businessName} theme={theme} isOpen={showTrackDrawer} onClose={() => setShowTrackDrawer(false)} />
      )}
    </div>
  );
};

export { PublicStore as PublicStorePage };
export default PublicStore;
