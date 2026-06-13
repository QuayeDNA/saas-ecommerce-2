import React from "react";
import {
  Button,
  Alert,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
} from "../../design-system";
import { getProviderColors } from "../../utils/provider-colors";
import type {
  PublicBundle,
  PublicStorefront,
  ThemeConfig,
  OrderStep,
  PaymentAccount,
  PublicOrderResult,
} from "./types";
import { fmt, normalizePhone, fmtValidity, normalizeWhatsappNumber } from "./utils";
import { withAlpha } from "./constants";
import {
  FaCircleCheck,
  FaTriangleExclamation,
  FaIdCard,
  FaArrowRight,
  FaArrowLeft,
  FaPhone,
  FaBolt,
  FaWhatsapp,
} from "react-icons/fa6";

export interface OrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrder: {
    bundle: PublicBundle;
    customerPhone: string;
    customerName?: string;
    ghanaCardNumber?: string;
  } | null;
  orderStep: OrderStep;
  onOrderStepChange: (step: OrderStep) => void;
  storefront: PublicStorefront["storefront"];
  theme: ThemeConfig;
  ordersClosed: boolean;
  storeClosed: boolean;
  storeClosedMessage: string;
  storefrontsClosed: boolean;
  storefrontsClosedMessage: string;
  orderPhone: string;
  setOrderPhone: (v: string) => void;
  orderCustomerName: string;
  setOrderCustomerName: (v: string) => void;
  orderGhanaCard: string;
  setOrderGhanaCard: (v: string) => void;
  customerName: string;
  setCustomerName: (v: string) => void;
  paymentType: string;
  setPaymentType: (v: string) => void;
  transactionRef: string;
  setTransactionRef: (v: string) => void;
  feeEstimate: { charge: number; fee: number } | null;
  onConfirmDetails: () => void;
  onSubmitOrder: () => void;
  submitting: boolean;
  orderError: string | null;
  orderResult: PublicOrderResult | null;
  paystackStatus: "idle" | "success" | "failed";
  onOpenPaystack: (ref: string, amount: number, accessCode: string) => void;
  onShowTrackDrawer: () => void;
}

const isValidPhone = (p: string) => /^0\d{9}$/.test(normalizePhone(p));

export function OrderDialog({
  isOpen,
  onClose,
  activeOrder,
  orderStep,
  onOrderStepChange,
  storefront,
  theme,
  ordersClosed,
  storeClosed,
  storeClosedMessage,
  storefrontsClosed,
  storefrontsClosedMessage,
  orderPhone,
  setOrderPhone,
  orderCustomerName,
  setOrderCustomerName,
  orderGhanaCard,
  setOrderGhanaCard,
  customerName,
  setCustomerName,
  paymentType,
  setPaymentType,
  transactionRef,
  setTransactionRef,
  feeEstimate,
  onConfirmDetails,
  onSubmitOrder,
  submitting,
  orderError,
  orderResult,
  paystackStatus,
  onOpenPaystack,
  onShowTrackDrawer,
}: OrderDialogProps) {
  if (!activeOrder) return null;
  const bundle = activeOrder.bundle;
  const pc = getProviderColors(bundle.provider);
  const isAfa = bundle.provider?.toUpperCase() === "AFA";
  const hasData = bundle.dataVolume != null && bundle.dataVolume > 0;

  const rawMethods = storefront.paymentMethods || [];
  const paystackStorefrontEnabled =
    storefront.paystackStorefrontEnabled ?? false;
  const paymentMethods = rawMethods.some((m) => m.type === "paystack")
    ? rawMethods.filter(
        (m) => m.type !== "paystack" || paystackStorefrontEnabled,
      )
    : paystackStorefrontEnabled
      ? [
          { type: "paystack" as const, details: {}, isActive: true },
          ...rawMethods,
        ]
      : rawMethods;
  const selectedPayment =
    paymentMethods.find((m) => m.type === paymentType) || paymentMethods[0];

  const displayTotal =
    orderStep === "confirmation" && orderResult
      ? (orderResult.total ?? bundle.price)
      : (feeEstimate?.charge ?? bundle.price);

  const stepNum =
    orderStep === "details" ? 1 : orderStep === "payment" ? 2 : 3;

  const phoneOk = isValidPhone(orderPhone);
  const afaOk =
    !isAfa ||
    (orderCustomerName.trim() &&
      (!bundle.requiresGhanaCard ||
        (orderGhanaCard.trim() &&
          /^[A-Z]{3}-?\d{9}-?\d$/i.test(orderGhanaCard))));
  const step1Valid = phoneOk && Boolean(afaOk);
  const canSubmitOrder = Boolean(
    customerName.trim() &&
      (paymentType !== "mobile_money" || transactionRef.trim()),
  );

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="md">
      {/* Step progress bar */}
      <div className="px-5 pt-4 pb-0">
        <div className="flex items-center gap-1.5 mb-4">
          {[1, 2, 3].map((n) => (
            <React.Fragment key={n}>
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-all duration-300 ${
                  n <= stepNum
                    ? "text-[var(--color-surface)]"
                    : "bg-[var(--color-control-bg)] text-[var(--color-muted-text)]"
                }`}
                style={
                  n <= stepNum
                    ? { backgroundColor: theme.primary }
                    : undefined
                }
              >
                {n < stepNum ? <FaCircleCheck className="w-3.5 h-3.5" /> : n}
              </div>
              {n < 3 && (
                <div
                  className="flex-1 h-1 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor:
                      n < stepNum ? theme.primary : "var(--color-border)",
                  }}
                />
              )}
            </React.Fragment>
          ))}
          <span className="ml-2 text-xs text-[var(--color-muted-text)] font-semibold whitespace-nowrap">
            {orderStep === "details"
              ? "Bundle & Number"
              : orderStep === "payment"
                ? "Your Details"
                : "Order Placed"}
          </span>
        </div>
      </div>

      {storeClosed && (
        <div className="px-5 pb-4">
          <Alert status="warning">{storeClosedMessage}</Alert>
        </div>
      )}
      {storefrontsClosed && (
        <div className="px-5 pb-4">
          <Alert status="warning">{storefrontsClosedMessage}</Alert>
        </div>
      )}

      {/* STEP 1: Details */}
      {orderStep === "details" && (
        <>
          <DialogHeader>
            <div
              className="rounded-2xl p-4"
              style={{
                background: `linear-gradient(135deg, ${withAlpha(pc.primary, 12)}, ${withAlpha(pc.primary, 4)})`,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  {hasData && (
                    <div
                      className="text-4xl font-black leading-none"
                      style={{ color: pc.primary }}
                    >
                      {bundle.dataVolume}
                      <span className="text-2xl font-bold ml-1 opacity-80">
                        {bundle.dataUnit}
                      </span>
                    </div>
                  )}
                  <h3 className="font-bold text-[var(--color-text)] mt-1">
                    {bundle.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface)] text-[var(--color-secondary-text)] border font-medium shadow-sm border-[var(--color-border)]">
                      {fmtValidity(bundle.validity, bundle.validityUnit)}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{
                        backgroundColor: withAlpha(pc.primary, 12),
                        color: pc.primary,
                      }}
                    >
                      {bundle.providerName}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className="text-2xl font-extrabold"
                    style={{ color: pc.primary }}
                  >
                    {fmt(bundle.price)}
                  </div>
                  {paymentType === "paystack" && feeEstimate && (
                    <div className="text-[10px] text-[var(--color-muted-text)] mt-0.5">
                      ~{fmt(feeEstimate.charge)} w/ fees
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          <DialogBody>
            <div className="space-y-4">
              {isAfa && bundle.requiresGhanaCard && (
                <Alert status="warning">
                  <strong>Ghana Card required</strong> — This bundle needs ID
                  verification.
                </Alert>
              )}

              {/* Phone number */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-secondary-text)] mb-2">
                  <FaPhone className="w-3 h-3 opacity-60" />
                  Recipient Number *
                </label>
                <Input
                  type="tel"
                  placeholder="e.g. 0244 123 456"
                  value={orderPhone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setOrderPhone(e.target.value)
                  }
                  autoComplete="tel"
                />
                {orderPhone && !phoneOk && (
                  <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                    <FaTriangleExclamation className="w-3 h-3" />
                    Enter a valid 10-digit Ghana number (e.g. 0244123456)
                  </p>
                )}
                {phoneOk && (
                  <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                    <FaCircleCheck className="w-3 h-3" /> Looks good!
                  </p>
                )}
              </div>

              {/* AFA-specific fields */}
              {isAfa && (
                <>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-secondary-text)] mb-2">
                      <FaIdCard className="w-3 h-3 opacity-60" /> Recipient
                      Full Name *
                    </label>
                    <Input
                      placeholder="Full name as on Ghana Card"
                      value={orderCustomerName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setOrderCustomerName(e.target.value)
                      }
                    />
                  </div>
                  {bundle.requiresGhanaCard && (
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-secondary-text)] mb-2">
                        <FaIdCard className="w-3 h-3 opacity-60" /> Ghana Card
                        Number *
                      </label>
                      <Input
                        placeholder="GHA-XXXXXXXXX-X"
                        value={orderGhanaCard}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setOrderGhanaCard(e.target.value)
                        }
                      />
                      {orderGhanaCard &&
                        !/^[A-Z]{3}-?\d{9}-?\d$/i.test(orderGhanaCard) && (
                          <p className="text-xs text-rose-500 mt-1">
                            Format: GHA-000000000-0
                          </p>
                        )}
                    </div>
                  )}
                </>
              )}

              {/* Fee estimate note for Paystack */}
              {feeEstimate && (
                <div
                  className="rounded-sm p-3 text-xs space-y-1 bg-[var(--color-surface)] border-l-4"
                  style={{ borderLeftColor: theme.primary }}
                >
                  <p className="font-bold text-[var(--color-secondary-text)]">
                    Price Breakdown (Paystack)
                  </p>
                  <div className="flex justify-between text-[var(--color-secondary-text)]">
                    <span>Bundle price</span>
                    <span>{fmt(bundle.price)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-secondary-text)]">
                    <span>Processing fee (~1.95%)</span>
                    <span>+{fmt(feeEstimate.fee)}</span>
                  </div>
                  <div
                    className="flex justify-between font-black pt-1 border-t border-[var(--color-border)]"
                    style={{ color: theme.primary }}
                  >
                    <span>You pay</span>
                    <span>{fmt(feeEstimate.charge)}</span>
                  </div>
                  <p className="text-[var(--color-muted-text)] text-[10px] pt-0.5">
                    Exact amount confirmed at payment. Fee covers Paystack
                    processing.
                  </p>
                </div>
              )}
            </div>
          </DialogBody>

          <DialogFooter>
            <div className="flex gap-2 w-full">
              <Button
                variant="secondary"
                onClick={onClose}
                className="shrink-0"
              >
                Cancel
              </Button>
              <button
                disabled={!step1Valid || ordersClosed}
                onClick={onConfirmDetails}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-[var(--color-surface)] transition-all active:scale-95 disabled:opacity-40"
                style={{ backgroundColor: theme.primary }}
              >
                Continue to Payment <FaArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </DialogFooter>
        </>
      )}

      {/* STEP 2: Payment */}
      {orderStep === "payment" && (
        <>
          <DialogHeader>
            <div className="space-y-1">
              <h3 className="font-black text-[var(--color-text)] text-lg">
                Complete your details
              </h3>
              <p className="text-sm text-[var(--color-muted-text)]">
                Ordering <strong>{bundle.name}</strong> →{" "}
                <span className="font-mono">
                  {normalizePhone(orderPhone)}
                </span>
              </p>
            </div>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-5">
              {/* Customer info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-secondary-text)] mb-1.5 uppercase tracking-wide">
                    Your Full Name *
                  </label>
                  <Input
                    placeholder="e.g. Kwame Asante"
                    value={customerName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCustomerName(e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Payment method */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-secondary-text)] mb-2 uppercase tracking-wide">
                  How would you like to pay?
                </label>
                <div className="space-y-2">
                  {paymentMethods.map((pm) => {
                    const icons: Record<string, string> = {
                      paystack: "⚡",
                      mobile_money: "📱",
                      bank_transfer: "🏦",
                    };
                    const labels: Record<string, string> = {
                      paystack: "Paystack (Card, MoMo & more)",
                      mobile_money: "Mobile Money",
                      bank_transfer: "Bank Transfer",
                    };
                    const descs: Record<string, string> = {
                      paystack:
                        "Instant, secure online checkout — powered by Paystack Ghana",
                      mobile_money:
                        "Send via MoMo first, then enter the reference number below",
                      bank_transfer:
                        "Transfer to our bank account, then notify the store owner",
                    };
                    const active = paymentType === pm.type;
                    return (
                      <button
                        key={pm.type}
                        onClick={() => setPaymentType(pm.type)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
                        style={
                          active
                            ? {
                                borderColor: theme.primary,
                                backgroundColor: "var(--color-surface)",
                              }
                            : {
                                borderColor: "var(--color-border)",
                                backgroundColor: "var(--color-surface)",
                              }
                        }
                      >
                        <span className="text-2xl shrink-0">
                          {icons[pm.type] || "💳"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[var(--color-text)]">
                            {labels[pm.type] || pm.type}
                          </p>
                          <p className="text-xs text-[var(--color-muted-text)] leading-snug">
                            {descs[pm.type] || ""}
                          </p>
                        </div>
                        <div
                          className="w-4 h-4 rounded-full border-2 shrink-0 transition-all"
                          style={
                            active
                              ? {
                                  borderColor: theme.primary,
                                  backgroundColor: theme.primary,
                                }
                              : { borderColor: "var(--color-border)" }
                          }
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Manual payment account details */}
              {selectedPayment && selectedPayment.type !== "paystack" && (
                <div
                  className="p-4 rounded-xl border-2 border-dashed space-y-2 bg-[var(--color-surface)]"
                  style={{ borderColor: withAlpha(theme.primary, 25) }}
                >
                  <h4
                    className="text-xs font-black uppercase tracking-wide flex items-center gap-1.5"
                    style={{ color: theme.secondary }}
                  >
                    📋 Payment Instructions
                  </h4>
                  {Array.isArray(selectedPayment.details?.accounts)
                    ? (
                        selectedPayment.details.accounts as PaymentAccount[]
                      ).map((acc, i) => (
                        <div key={i} className="text-sm space-y-1">
                          {acc.provider && (
                            <div className="flex justify-between">
                              <span className="text-[var(--color-muted-text)]">
                                Provider
                              </span>
                              <span className="font-semibold">
                                {acc.provider}
                              </span>
                            </div>
                          )}
                          {acc.number && (
                            <div className="flex justify-between">
                              <span className="text-[var(--color-muted-text)]">
                                Number
                              </span>
                              <span className="font-bold text-lg tracking-wider">
                                {acc.number}
                              </span>
                            </div>
                          )}
                          {acc.accountName && (
                            <div className="flex justify-between">
                              <span className="text-[var(--color-muted-text)]">
                                Account Name
                              </span>
                              <span className="font-semibold">
                                {acc.accountName}
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    : Object.entries(selectedPayment.details || {}).map(
                        ([k, v]) => {
                          if (v == null || typeof v === "object") return null;
                          return (
                            <div
                              key={k}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-[var(--color-muted-text)] capitalize">
                                {k.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span className="font-semibold">
                                {String(v)}
                              </span>
                            </div>
                          );
                        },
                      )}
                  <div
                    className="pt-2 border-t border-dashed"
                    style={{ borderColor: withAlpha(theme.primary, 19) }}
                  >
                    <p
                      className="font-black text-base"
                      style={{ color: theme.secondary }}
                    >
                      Send exactly: {fmt(bundle.price)}
                    </p>
                    <p className="text-xs text-[var(--color-muted-text)] mt-0.5">
                      ✅ Send the exact amount — do not round up or down
                    </p>
                  </div>
                </div>
              )}

              {/* MoMo transaction ref input */}
              {paymentType === "mobile_money" && (
                <div>
                  <label className="block text-xs font-bold text-[var(--color-secondary-text)] mb-1.5 uppercase tracking-wide">
                    MoMo Transaction Reference *
                  </label>
                  <Input
                    placeholder="e.g. S2304..."
                    value={transactionRef}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTransactionRef(e.target.value)
                    }
                  />
                  <p className="text-xs text-[var(--color-muted-text)] mt-1">
                    💡 Make the payment first, then paste your reference ID
                    here. You&apos;ll get it in your MoMo SMS.
                  </p>
                </div>
              )}

              {/* Order summary */}
              <div className="rounded-xl p-3 space-y-1.5 bg-[var(--color-surface)] border border-[var(--color-border)]">
                <p className="text-xs font-bold text-[var(--color-secondary-text)] uppercase tracking-wide mb-2">
                  Order Summary
                </p>
                <div className="flex justify-between text-sm text-[var(--color-secondary-text)]">
                  <span>{bundle.name}</span>
                  <span>{fmt(bundle.price)}</span>
                </div>
                {feeEstimate && paymentType === "paystack" && (
                  <div className="flex justify-between text-xs text-[var(--color-muted-text)]">
                    <span>Paystack processing fee (~1.95%)</span>
                    <span>+{fmt(feeEstimate.fee)}</span>
                  </div>
                )}
                <div
                  className="flex justify-between font-black pt-2 border-t border-[var(--color-border)] text-base"
                  style={{ color: theme.primary }}
                >
                  <span>Total to Pay</span>
                  <span>
                    {fmt(
                      feeEstimate && paymentType === "paystack"
                        ? feeEstimate.charge
                        : bundle.price,
                    )}
                  </span>
                </div>
              </div>

              {orderError && (
                <Alert status="error">
                  <strong>Order failed:</strong> {orderError}
                </Alert>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <div className="flex gap-2 w-full">
              <Button
                variant="secondary"
                onClick={() => onOrderStepChange("details")}
              >
                <FaArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
              </Button>
              <button
                disabled={!canSubmitOrder || submitting || ordersClosed}
                onClick={onSubmitOrder}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-[var(--color-surface)] transition-all active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: theme.primary }}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Placing Order…
                  </>
                ) : (
                  <>
                    Place Order · {fmt(displayTotal)}
                    <FaBolt className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </DialogFooter>
        </>
      )}

      {/* STEP 3: Confirmation */}
      {orderStep === "confirmation" && orderResult && (
        <>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <FaCircleCheck className="w-6 h-6 text-emerald-500" />
              <h3 className="font-black text-[var(--color-text)] text-lg">
                Order Placed! 🎉
              </h3>
            </div>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-5 py-1">
              {/* Success icon */}
              <div className="flex flex-col items-center text-center pb-2">
                <div className="w-20 h-20 rounded-2xl bg-[var(--color-success-bg)] border-2 border-[var(--color-border)] flex items-center justify-center mb-3">
                  <FaCircleCheck className="w-10 h-10 text-emerald-500" />
                </div>
                <p className="text-xl font-black text-[var(--color-text)]">
                  Thank you!
                </p>
                <p className="text-sm text-[var(--color-muted-text)] mt-0.5">
                  Order #{orderResult.orderNumber}
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onShowTrackDrawer();
                  }}
                  className="text-xs font-bold mt-1.5 underline underline-offset-2 text-[var(--color-primary-700)]"
                >
                  Track this order →
                </button>
              </div>

              {/* Order breakdown */}
              <div className="bg-[var(--color-control-bg)] rounded-2xl p-4 space-y-2 text-sm border border-[var(--color-border)]">
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted-text)]">
                    Bundle
                  </span>
                  <span className="font-semibold">{bundle.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted-text)]">
                    For number
                  </span>
                  <span className="font-mono font-semibold">
                    {normalizePhone(orderPhone)}
                  </span>
                </div>
                {(orderResult as any).subtotal &&
                  (orderResult as any).subtotal !== orderResult.total && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-muted-text)]">
                          Bundle price
                        </span>
                        <span>{fmt((orderResult as any).subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-muted-text)]">
                          Processing fee
                        </span>
                        <span>
                          +
                          {fmt(
                            orderResult.total - (orderResult as any).subtotal,
                          )}
                        </span>
                      </div>
                    </>
                  )}
                <div className="flex justify-between font-black text-lg pt-2 border-t border-[var(--color-border)]">
                  <span>Total Charged</span>
                  <span style={{ color: theme.primary }}>
                    {fmt(orderResult.total)}
                  </span>
                </div>
              </div>

              {/* Paystack payment status */}
              {orderResult.paystack?.authorizationUrl ? (
                <div className="space-y-3">
                  {(() => {
                    const paystackReference = orderResult.paystack?.reference;
                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--color-secondary-text)] font-semibold">
                            Payment Status
                          </span>
                          {paystackStatus === "success" ? (
                            <span className="text-xs bg-[var(--color-success-bg)] text-[var(--color-success-text)] border border-[var(--color-border)] px-2.5 py-1 rounded-full font-bold">
                              ✓ Payment Confirmed
                            </span>
                          ) : paystackStatus === "failed" ? (
                            <span className="text-xs bg-[var(--color-failed-bg)] text-[var(--color-failed-text)] border border-[var(--color-border)] px-2.5 py-1 rounded-full font-bold">
                              ✕ Failed
                            </span>
                          ) : (
                            <span className="text-xs bg-[var(--color-pending-bg)] text-[var(--color-pending-text)] border border-[var(--color-border)] px-2.5 py-1 rounded-full font-bold animate-pulse">
                              ⏳ Awaiting Payment
                            </span>
                          )}
                        </div>
                        {paystackStatus !== "success" &&
                          paystackReference && (
                            <button
                              onClick={() =>
                                onOpenPaystack(
                                  paystackReference,
                                  orderResult.total,
                                  orderResult.paystack?.accessCode || "",
                                )
                              }
                              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-[var(--color-surface)]"
                              style={{ backgroundColor: theme.primary }}
                            >
                              <FaBolt className="w-4 h-4" /> Continue to
                              Paystack Payment
                            </button>
                          )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-pending-bg)] border border-[var(--color-border)]">
                  <span className="text-sm text-[var(--color-pending-text)] font-semibold">
                    Awaiting manual verification
                  </span>
                  <span className="text-xs bg-[var(--color-control-bg)] text-[var(--color-pending-text)] px-2 py-0.5 rounded-full font-bold">
                    Pending
                  </span>
                </div>
              )}

              {/* What's next */}
              <div className="bg-[var(--color-primary-50)] rounded-2xl p-4 border border-[var(--color-border)]">
                <h4 className="text-xs font-black text-[var(--color-primary-900)] uppercase tracking-wide mb-2.5">
                  What Happens Next
                </h4>
                <ol className="text-xs text-[var(--color-secondary-text)] space-y-2">
                  {orderResult.paystack?.authorizationUrl ? (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[var(--color-control-bg)] flex items-center justify-center text-[var(--color-primary-900)] font-bold shrink-0 mt-0.5">
                          1
                        </span>
                        Complete payment in the Paystack window that opened.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[var(--color-control-bg)] flex items-center justify-center text-[var(--color-primary-900)] font-bold shrink-0 mt-0.5">
                          2
                        </span>
                        Your order is automatically processed upon
                        confirmation.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[var(--color-control-bg)] flex items-center justify-center text-[var(--color-primary-900)] font-bold shrink-0 mt-0.5">
                          3
                        </span>
                        Bundle is sent to{" "}
                        <strong>{normalizePhone(orderPhone)}</strong> within
                        minutes.
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[var(--color-control-bg)] flex items-center justify-center text-[var(--color-primary-900)] font-bold shrink-0 mt-0.5">
                          1
                        </span>
                        The store owner reviews your payment reference.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[var(--color-control-bg)] flex items-center justify-center text-[var(--color-primary-900)] font-bold shrink-0 mt-0.5">
                          2
                        </span>
                        They approve and process the bundle order.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[var(--color-control-bg)] flex items-center justify-center text-[var(--color-primary-900)] font-bold shrink-0 mt-0.5">
                          3
                        </span>
                        Bundle is delivered to{" "}
                        <strong>{normalizePhone(orderPhone)}</strong>.
                      </li>
                    </>
                  )}
                </ol>
              </div>

              {/* WhatsApp contact */}
              {storefront.contactInfo?.whatsapp && (
                <a
                  href={`https://wa.me/${normalizeWhatsappNumber(storefront.contactInfo.whatsapp)}?text=${encodeURIComponent(`Hi, I just placed order #${orderResult.orderNumber} for ${bundle.name} on ${normalizePhone(orderPhone)}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--color-whatsapp)] text-[var(--color-surface)] rounded-xl font-bold text-sm hover:bg-[var(--color-whatsapp-dark)] transition active:scale-95"
                >
                  <FaWhatsapp className="w-4 h-4" /> Message store on WhatsApp
                </a>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-bold text-[var(--color-surface)] active:scale-95 transition"
              style={{ backgroundColor: theme.primary }}
            >
              Done — Browse More Bundles
            </button>
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
}
