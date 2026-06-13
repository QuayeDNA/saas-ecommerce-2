import type {
  PublicBundle as _PublicBundle,
  PublicStorefront as _PublicStorefront,
  PublicOrderData as _PublicOrderData,
  PublicOrderResult as _PublicOrderResult,
  StorefrontBranding as _StorefrontBranding,
  TrackedOrder as _TrackedOrder,
} from "../../services/storefront.service";

export type PublicBundle = _PublicBundle;
export type PublicStorefront = _PublicStorefront;
export type PublicOrderData = _PublicOrderData;
export type PublicOrderResult = _PublicOrderResult;
export type StorefrontBranding = _StorefrontBranding;
export type TrackedOrder = _TrackedOrder;

/** Single-item order (replaces multi-item cart) */
export interface OrderItem {
  bundle: _PublicBundle;
  customerPhone: string;
  customerName?: string; // AFA only
  ghanaCardNumber?: string; // AFA only
}

export type OrderStep = "details" | "payment" | "confirmation";

/** Client-side Paystack fee estimate (1.95% inverse formula — same as backend) */
export const estimateFee = (base: number, pct = 1.95) => {
  const charge = Math.round((base / (1 - pct / 100)) * 100) / 100;
  const fee = Math.round((charge - base) * 100) / 100;
  return { charge, fee };
};

// minimal shape of a generic payment account description returned by the API
// we can't predict all fields so allow optional ones used in the UI
export interface PaymentAccount {
  provider?: string;
  number?: string;
  accountName?: string;
  account_number?: string;
  bank_name?: string;
  [key: string]: unknown;
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
  gradient: string;
  cardBorder: string;
  heroBg: string;
}

export interface SavedOrderEntry {
  orderId: string;
  orderNumber: string;
  reference: string;
  bundleName: string;
  provider: string;
  total: number;
  paymentType: string;
  savedAt: number;
  lastStatus: string;
}
