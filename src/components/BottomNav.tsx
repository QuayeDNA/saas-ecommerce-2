/**
 * BottomNav — Consolidated mobile tab navigation
 *
 * Single component handles both Agent and Admin/SuperAdmin nav.
 * - Fully theme-aware via CSS custom properties (light + dark mode)
 * - Viewport-safe: no overflow, no bleeding, safe-area inset aware
 * - Smooth drop-up sheet with spring animation
 * - Active pill indicator with animated highlight
 * - DRY: shared primitives, config-driven tabs
 */

import { useState, useEffect, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home, ShoppingBag, Wallet, User, Store, ShieldCheck, FileText,
  LayoutDashboard, Users, Package, ClipboardList, Settings,
  Menu, X, Megaphone, CreditCard, Banknote, History,
  Building2, BadgeDollarSign, BarChart3, ChevronRight,
} from "lucide-react";
import { useOrderNotificationBubble } from "../hooks/use-order-notification-bubble";

// ─── types ────────────────────────────────────────────────────────────────────

interface PrimaryTab {
  label: string;
  path: string;
  icon: React.ReactNode;
  exact?: boolean;
  badge?: number;
}

interface OverflowItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  description?: string;
}

// ─── navigation config ────────────────────────────────────────────────────────

const AGENT_PRIMARY: PrimaryTab[] = [
  { label: "Home",    path: "/agent/dashboard",        icon: <Home        className="w-[18px] h-[18px]" strokeWidth={1.8} />, exact: true },
  { label: "Orders",  path: "/agent/dashboard/orders", icon: <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.8} /> },
  { label: "Wallet",  path: "/agent/dashboard/wallet", icon: <Wallet      className="w-[18px] h-[18px]" strokeWidth={1.8} /> },
  { label: "Profile", path: "/agent/dashboard/profile",icon: <User        className="w-[18px] h-[18px]" strokeWidth={1.8} /> },
];

const AGENT_OVERFLOW: OverflowItem[] = [
  { label: "Storefront",      path: "/agent/dashboard/storefront",      icon: <Store       className="w-5 h-5" />, description: "Manage your public shop" },
  { label: "AFA Registration",path: "/agent/dashboard/afa-registration",icon: <ShieldCheck className="w-5 h-5" />, description: "Customer registration flow" },
  { label: "Privacy Policy",  path: "/agent/dashboard/privacy-policy",  icon: <FileText    className="w-5 h-5" />, description: "View platform privacy details" },
];

const SUPER_ADMIN_PRIMARY: PrimaryTab[] = [
  { label: "Dashboard", path: "/superadmin",          icon: <LayoutDashboard className="w-[18px] h-[18px]" strokeWidth={1.8} />, exact: true },
  { label: "Users",     path: "/superadmin/users",    icon: <Users           className="w-[18px] h-[18px]" strokeWidth={1.8} /> },
  { label: "Packages",  path: "/superadmin/packages", icon: <Package         className="w-[18px] h-[18px]" strokeWidth={1.8} /> },
  { label: "Orders",    path: "/superadmin/orders",   icon: <ClipboardList   className="w-[18px] h-[18px]" strokeWidth={1.8} /> },
];

const SUPER_ADMIN_OVERFLOW: OverflowItem[] = [
  { label: "Analytics",     path: "/superadmin/analytics",       icon: <BarChart3        className="w-5 h-5" />, description: "Performance dashboards" },
  { label: "Settings",      path: "/superadmin/settings",        icon: <Settings         className="w-5 h-5" />, description: "Platform configuration" },
  { label: "Providers",     path: "/superadmin/providers",       icon: <Building2        className="w-5 h-5" />, description: "Manage telecom providers" },
  { label: "Commissions",   path: "/superadmin/commissions",     icon: <BadgeDollarSign  className="w-5 h-5" />, description: "Reseller commission rates" },
  { label: "Announcements", path: "/superadmin/announcements",   icon: <Megaphone        className="w-5 h-5" />, description: "Platform-wide notices" },
  { label: "Stores",        path: "/superadmin/stores",          icon: <Store            className="w-5 h-5" />, description: "Agent storefronts" },
  { label: "Top-ups",       path: "/superadmin/wallet/top-ups",  icon: <CreditCard       className="w-5 h-5" />, description: "Wallet funding requests" },
  { label: "Payouts",       path: "/superadmin/wallet/payouts",  icon: <Banknote         className="w-5 h-5" />, description: "Withdrawal processing" },
  { label: "Tx History",    path: "/superadmin/wallet/history",  icon: <History          className="w-5 h-5" />, description: "All wallet transactions" },
];

const ADMIN_PRIMARY: PrimaryTab[] = [
  { label: "Dashboard", path: "/admin/dashboard",          icon: <LayoutDashboard className="w-[18px] h-[18px]" strokeWidth={1.8} />, exact: true },
  { label: "Users",     path: "/admin/dashboard/users",    icon: <Users           className="w-[18px] h-[18px]" strokeWidth={1.8} /> },
  { label: "Packages",  path: "/admin/dashboard/packages", icon: <Package         className="w-[18px] h-[18px]" strokeWidth={1.8} /> },
  { label: "Wallet",    path: "/admin/dashboard/wallet",   icon: <Wallet          className="w-[18px] h-[18px]" strokeWidth={1.8} /> },
  { label: "Profile",   path: "/admin/dashboard/profile",  icon: <User            className="w-[18px] h-[18px]" strokeWidth={1.8} /> },
];

// ─── scoped styles (module-level, injected once) ──────────────────────────────

const NAV_STYLES = `
  /* ── palette ── */
  .bn-root {
    --bn-bg: var(--color-surface);
    --bn-border: var(--color-border);
    --bn-text: var(--color-muted-text);
    --bn-active: var(--color-primary-600);
    --bn-active-pill: var(--color-primary-50);
    --bn-active-dot: var(--color-primary-500);
    --bn-sheet-bg: var(--color-surface);
    --bn-sheet-handle: var(--color-gray-300);
    --bn-item-hover: var(--color-control-bg);
    --bn-item-active-bg: var(--color-primary-50);
    --bn-item-active-icon-bg: var(--color-primary-500);
    --bn-item-active-text: var(--color-primary-600);
    --bn-item-text: var(--color-text);
    --bn-item-sub: var(--color-muted-text);
    --bn-close-bg: var(--color-control-bg);
    --bn-close-text: var(--color-secondary-text);
    --bn-shadow-bar: 0 -8px 24px rgba(15,23,42,0.10);
    --bn-shadow-sheet: 0 -12px 40px rgba(15,23,42,0.14);
    --bn-badge-bg: #ef4444;
    --bn-badge-text: #ffffff;
  }

  body.theme-dark .bn-root {
    --bn-bg: var(--color-surface);
    --bn-border: var(--color-border);
    --bn-text: var(--color-muted-text);
    --bn-active: var(--color-primary-400);
    --bn-active-pill: rgba(59,130,246,0.12);
    --bn-active-dot: var(--color-primary-400);
    --bn-sheet-bg: var(--color-surface);
    --bn-sheet-handle: rgba(255,255,255,0.15);
    --bn-item-hover: rgba(255,255,255,0.05);
    --bn-item-active-bg: rgba(59,130,246,0.12);
    --bn-item-active-icon-bg: var(--color-primary-500);
    --bn-item-active-text: var(--color-primary-400);
    --bn-item-text: var(--color-text);
    --bn-item-sub: var(--color-muted-text);
    --bn-close-bg: rgba(255,255,255,0.08);
    --bn-close-text: var(--color-secondary-text);
    --bn-shadow-bar: 0 -8px 32px rgba(0,0,0,0.35);
    --bn-shadow-sheet: 0 -12px 40px rgba(0,0,0,0.45);
    --bn-badge-bg: #ef4444;
    --bn-badge-text: #ffffff;
  }

  /* ── tab bar ── */
  .bn-bar {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 30;
    display: flex;
    align-items: stretch;
    background: var(--bn-bg);
    border-top: 0.5px solid var(--bn-border);
    box-shadow: var(--bn-shadow-bar);
    height: 64px;
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  /* ── tab item ── */
  .bn-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    min-width: 0;
    padding: 6px 2px 4px;
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
    transition: opacity .15s;
    position: relative;
  }
  .bn-tab:active { opacity: .7; }

  .bn-pill {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 26px;
    border-radius: 8px;
    transition: background .2s, color .2s;
    color: var(--bn-text);
    position: relative;
  }
  .bn-pill--active {
    background: var(--bn-active-pill);
    color: var(--bn-active);
  }

  .bn-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .01em;
    line-height: 1;
    color: var(--bn-text);
    transition: color .2s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 52px;
  }
  .bn-label--active { color: var(--bn-active); }

  /* active indicator dot at top of bar */
  .bn-dot {
    position: absolute;
    top: -1px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px; height: 2.5px;
    border-radius: 0 0 3px 3px;
    background: var(--bn-active-dot);
    opacity: 0;
    transition: opacity .2s;
  }
  .bn-dot--visible { opacity: 1; }

  /* badge */
  .bn-badge {
    position: absolute;
    top: -4px; right: -4px;
    min-width: 16px; height: 16px;
    padding: 0 4px;
    border-radius: 99px;
    background: var(--bn-badge-bg);
    color: var(--bn-badge-text);
    font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 1.5px solid var(--bn-bg);
    line-height: 1;
  }

  /* ── overflow sheet ── */
  .bn-sheet {
    position: fixed;
    left: 0; right: 0;
    z-index: 50;
    background: var(--bn-sheet-bg);
    border-top: 0.5px solid var(--bn-border);
    border-radius: 20px 20px 0 0;
    box-shadow: var(--bn-shadow-sheet);
    display: flex;
    flex-direction: column;
    max-height: calc(100svh - 120px);
    transition: transform .3s cubic-bezier(.32,.72,0,1), opacity .25s ease;
    /* bottom is set inline to sit above the bar */
  }
  .bn-sheet--open  { transform: translateY(0);    opacity: 1; }
  .bn-sheet--closed{ transform: translateY(100%); opacity: 0; pointer-events: none; }

  /* drag handle */
  .bn-handle {
    display: flex; justify-content: center;
    padding: 10px 0 6px;
    flex-shrink: 0;
  }
  .bn-handle-bar {
    width: 36px; height: 4px;
    border-radius: 99px;
    background: var(--bn-sheet-handle);
  }

  /* sheet header */
  .bn-sheet-hdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px 12px;
    border-bottom: 0.5px solid var(--bn-border);
    flex-shrink: 0;
  }
  .bn-sheet-title {
    font-size: 15px; font-weight: 700;
    color: var(--bn-item-text);
  }
  .bn-close-btn {
    width: 30px; height: 30px;
    border-radius: 50%;
    border: none;
    background: var(--bn-close-bg);
    color: var(--bn-close-text);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background .15s;
  }
  .bn-close-btn:hover { filter: brightness(.95); }

  /* sheet list */
  .bn-sheet-list {
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 8px 12px;
    padding-bottom: max(16px, env(safe-area-inset-bottom, 0px));
    display: flex; flex-direction: column; gap: 2px;
  }
  .bn-sheet-list::-webkit-scrollbar { display: none; }

  /* sheet item */
  .bn-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 14px;
    text-decoration: none;
    transition: background .15s;
    -webkit-tap-highlight-color: transparent;
  }
  .bn-item:hover, .bn-item:focus-visible { background: var(--bn-item-hover); outline: none; }
  .bn-item--active { background: var(--bn-item-active-bg); }
  .bn-item--active:hover { filter: brightness(.97); }

  .bn-item-icon {
    width: 40px; height: 40px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    background: var(--bn-item-hover);
    color: var(--bn-item-sub);
    transition: background .15s, color .15s;
  }
  .bn-item--active .bn-item-icon {
    background: var(--bn-item-active-icon-bg);
    color: #fff;
  }

  .bn-item-text { flex: 1; min-width: 0; }
  .bn-item-name {
    font-size: 13px; font-weight: 600;
    color: var(--bn-item-text);
    line-height: 1.2;
  }
  .bn-item--active .bn-item-name { color: var(--bn-item-active-text); }
  .bn-item-desc {
    font-size: 11px;
    color: var(--bn-item-sub);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bn-item-arrow {
    color: var(--bn-item-sub);
    flex-shrink: 0;
    opacity: 0;
    transition: opacity .15s, transform .15s;
  }
  .bn-item:hover .bn-item-arrow { opacity: 1; transform: translateX(2px); }
  .bn-item--active .bn-item-arrow { opacity: 1; color: var(--bn-item-active-text); }

  /* backdrop */
  .bn-backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(2px);
    animation: bn-fade-in .2s ease;
  }
  @keyframes bn-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* item entry stagger */
  @keyframes bn-item-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: none; }
  }
  .bn-item { animation: bn-item-in .22s ease both; }
`;

// ─── shared sub-components ────────────────────────────────────────────────────

interface TabProps {
  tab: PrimaryTab;
  isActive: boolean;
  badge?: number;
}

const Tab: React.FC<TabProps> = ({ tab, isActive, badge }) => (
  <NavLink
    to={tab.path}
    end={tab.exact}
    aria-label={tab.label}
    className="bn-tab"
  >
    <span className={`bn-dot ${isActive ? "bn-dot--visible" : ""}`} />
    <span className={`bn-pill ${isActive ? "bn-pill--active" : ""}`}>
      {tab.icon}
      {badge && badge > 0 ? (
        <span className="bn-badge">{badge > 99 ? "99+" : badge}</span>
      ) : null}
    </span>
    <span className={`bn-label ${isActive ? "bn-label--active" : ""}`}>
      {tab.label}
    </span>
  </NavLink>
);

interface MoreButtonProps {
  isOpen: boolean;
  isActive: boolean;
  onClick: () => void;
}

const MoreButton: React.FC<MoreButtonProps> = ({ isOpen, isActive, onClick }) => (
  <button
    onClick={onClick}
    className="bn-tab"
    aria-label="More navigation options"
    aria-expanded={isOpen}
  >
    <span className={`bn-dot ${isActive ? "bn-dot--visible" : ""}`} />
    <span className={`bn-pill ${(isOpen || isActive) ? "bn-pill--active" : ""}`}>
      {isOpen
        ? <X className="w-[18px] h-[18px]" strokeWidth={2} />
        : <Menu className="w-[18px] h-[18px]" strokeWidth={1.8} />}
    </span>
    <span className={`bn-label ${(isOpen || isActive) ? "bn-label--active" : ""}`}>
      More
    </span>
  </button>
);

interface OverflowSheetProps {
  items: OverflowItem[];
  isOpen: boolean;
  barHeight: number;
  isItemActive: (path: string) => boolean;
  onClose: () => void;
}

const OverflowSheet: React.FC<OverflowSheetProps> = ({
  items, isOpen, barHeight, isItemActive, onClose,
}) => (
  <>
    {isOpen && (
      <div className="bn-backdrop md:hidden" onClick={onClose} aria-hidden="true" />
    )}

    <div
      className={`bn-root bn-sheet md:hidden ${isOpen ? "bn-sheet--open" : "bn-sheet--closed"}`}
      style={{ bottom: barHeight }}
      aria-hidden={!isOpen}
    >
      <div className="bn-handle">
        <div className="bn-handle-bar" />
      </div>

      <div className="bn-sheet-hdr">
        <span className="bn-sheet-title">More</span>
        <button className="bn-close-btn" onClick={onClose} aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="bn-sheet-list">
        {items.map((item, i) => {
          const active = isItemActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`bn-item ${active ? "bn-item--active" : ""}`}
              style={{ animationDelay: `${i * 30}ms` }}
              onClick={onClose}
            >
              <span className="bn-item-icon">{item.icon}</span>
              <span className="bn-item-text flex flex-col items-start gap-1">
                <span className="bn-item-name">{item.label}</span>
                {item.description && (
                  <span className="bn-item-desc">{item.description}</span>
                )}
              </span>
              <ChevronRight className="bn-item-arrow w-4 h-4" />
            </NavLink>
          );
        })}
      </div>
    </div>
  </>
);

// ─── main BottomNav component ─────────────────────────────────────────────────

type UserType = "agent" | "super_agent" | "dealer" | "super_dealer" | "admin" | "super_admin";

interface BottomNavProps {
  userType: UserType;
}

const AGENT_TYPES = new Set(["agent", "super_agent", "dealer", "super_dealer"]);

export const BottomNav: React.FC<BottomNavProps> = ({ userType }) => {
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const BAR_HEIGHT = 64; // px — matches CSS

  const isAgent     = AGENT_TYPES.has(userType);
  const isSuperAdmin = userType === "super_admin";

  const primaryTabs  = isAgent ? AGENT_PRIMARY : isSuperAdmin ? SUPER_ADMIN_PRIMARY : ADMIN_PRIMARY;
  const overflowItems = isAgent ? AGENT_OVERFLOW : isSuperAdmin ? SUPER_ADMIN_OVERFLOW : [];
  const hasOverflow  = overflowItems.length > 0;

  // order badge (only relevant when on an orders tab)
  const isOrdersPage = location.pathname.includes("/orders");
  const newOrderCount = useOrderNotificationBubble(isOrdersPage);

  const isActive = useCallback((path: string, exact = false) => {
    if (exact) return location.pathname === path || location.pathname === path + "/";
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  // close sheet on route change
  useEffect(() => { setSheetOpen(false); }, [location.pathname]);

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const anyOverflowActive = overflowItems.some((item) => isActive(item.path));

  return (
    <>
      <style>{NAV_STYLES}</style>

      {/* overflow sheet */}
      {hasOverflow && (
        <OverflowSheet
          items={overflowItems}
          isOpen={sheetOpen}
          barHeight={BAR_HEIGHT}
          isItemActive={(path) => isActive(path)}
          onClose={() => setSheetOpen(false)}
        />
      )}

      {/* tab bar */}
      <nav className="bn-root bn-bar md:hidden" aria-label="Main navigation">
        {primaryTabs.map((tab) => {
          const active = isActive(tab.path, tab.exact);
          const badge = tab.path.includes("/orders") ? newOrderCount : 0;
          return (
            <Tab key={tab.path} tab={tab} isActive={active} badge={badge} />
          );
        })}

        {hasOverflow && (
          <MoreButton
            isOpen={sheetOpen}
            isActive={anyOverflowActive}
            onClick={() => setSheetOpen((v) => !v)}
          />
        )}
      </nav>
    </>
  );
};

// ─── convenience re-exports (drop-in for old AgentBottomNav / AdminBottomNav) ─

export const AgentBottomNav: React.FC = () => <BottomNav userType="agent" />;

interface AdminBottomNavProps { userType?: string; }
export const AdminBottomNav: React.FC<AdminBottomNavProps> = ({ userType = "admin" }) => (
  <BottomNav userType={userType as UserType} />
);