/**
 * Sidebar — Caskmaf Datahub redesign
 *
 * Visible only on md+ screens (desktop). Mobile uses BottomNav instead.
 * Retains all existing navigation logic but overhauls visual design to match
 * the Caskmaf Datahub blue (#0057FF) brand and DM Sans / Syne type system.
 */

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import type { ReactNode } from "react";
import {
  FaBox, FaMobile, FaUsers, FaUsersCog, FaWallet, FaUser,
  FaCog, FaTachometerAlt, FaBuilding, FaClipboardList, FaChartLine,
  FaMoneyBillWave, FaCreditCard, FaHistory, FaBullhorn, FaStore,
} from "react-icons/fa";
import { useOrderNotificationBubble } from "../hooks/use-order-notification-bubble";
import { Home, Plus, LogOut, ChevronRight, Check, X } from "lucide-react";
import { Button, Badge } from "../design-system";
import { useState } from "react";
import { CaskmafDatahubLogo } from "./common/CaskmafDatahubLogo";

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  children?: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Nav configs (unchanged from original) ───────────────────────────────────

const getAgentNavItems = (): NavItem[] => [
  { label: "Dashboard", path: "/agent/dashboard", icon: <Home className="w-4 h-4" /> },
  {
    label: "Packages", path: "/agent/dashboard/packages", icon: <FaBox />,
    children: [
      { label: "MTN Packages", path: "/agent/dashboard/packages/mtn", icon: <FaBox /> },
      { label: "Telecel Packages", path: "/agent/dashboard/packages/telecel", icon: <FaBox /> },
      { label: "AT BIG TIME", path: "/agent/dashboard/packages/at-big-time", icon: <FaBox /> },
      { label: "AT iShare Premium", path: "/agent/dashboard/packages/at-ishare-premium", icon: <FaBox /> },
    ],
  },
  { label: "Orders", path: "/agent/dashboard/orders", icon: <FaMobile /> },
  { label: "Wallet", path: "/agent/dashboard/wallet", icon: <FaWallet /> },
  { label: "My Storefront", path: "/agent/dashboard/storefront", icon: <FaStore /> },
  { label: "AFA Registration", path: "/agent/dashboard/afa-registration", icon: <Plus className="w-4 h-4" /> },
  { label: "Profile", path: "/agent/dashboard/profile", icon: <FaUser /> },
];

const getAdminNavItems = (): NavItem[] => [
  { label: "Dashboard", path: "/admin/dashboard", icon: <Home className="w-4 h-4" /> },
  { label: "User Management", path: "/admin/dashboard/users", icon: <FaUsersCog /> },
  { label: "Packages", path: "/admin/dashboard/packages", icon: <FaBox /> },
  { label: "Wallet", path: "/admin/dashboard/wallet", icon: <FaWallet /> },
  { label: "Profile", path: "/admin/dashboard/profile", icon: <FaUser /> },
];

const getSuperAdminNavItems = (): NavItem[] => [
  { label: "Dashboard", path: "/superadmin", icon: <FaTachometerAlt /> },
  { label: "Analytics", path: "/superadmin/analytics", icon: <FaChartLine /> },
  { label: "Users", path: "/superadmin/users", icon: <FaUsers /> },
  { label: "Providers", path: "/superadmin/providers", icon: <FaBuilding /> },
  { label: "Packages", path: "/superadmin/packages", icon: <FaBox /> },
  { label: "Orders", path: "/superadmin/orders", icon: <FaClipboardList /> },
  { label: "Commissions", path: "/superadmin/commissions", icon: <FaMoneyBillWave /> },
  { label: "Announcements", path: "/superadmin/announcements", icon: <FaBullhorn /> },
  { label: "Stores", path: "/superadmin/stores", icon: <FaStore /> },
  {
    label: "Wallet", path: "/superadmin/wallet", icon: <FaWallet />,
    children: [
      { label: "Top-ups", path: "/superadmin/wallet/top-ups", icon: <FaCreditCard /> },
      { label: "Payouts", path: "/superadmin/wallet/payouts", icon: <FaMoneyBillWave /> },
      { label: "History", path: "/superadmin/wallet/history", icon: <FaHistory /> },
    ],
  },
  { label: "Settings", path: "/superadmin/settings", icon: <FaCog /> },
];

// ─── Component ───────────────────────────────────────────────────────────────

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { authState, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["packages", "wallet"]),
  );

  const toggleExpanded = (path: string) => {
    const next = new Set(expandedItems);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    setExpandedItems(next);
  };

  const getNavItems = (): NavItem[] => {
    switch (authState.user?.userType) {
      case "agent": case "super_agent": case "dealer": case "super_dealer":
        return getAgentNavItems();
      case "super_admin":
        return getSuperAdminNavItems();
      default:
        return getAdminNavItems();
    }
  };

  const navItems = getNavItems();
  const initials =
    (authState.user?.fullName.charAt(0) ?? "") +
    (authState.user?.fullName.split(" ")[1]?.charAt(0) ?? "");
  const isOrdersPage =
    location.pathname.startsWith("/superadmin/orders") ||
    location.pathname.startsWith("/admin/dashboard/orders") ||
    location.pathname.startsWith("/agent/dashboard/orders");
  const newOrderCount = useOrderNotificationBubble(isOrdersPage);

  const isActivePath = (path: string) => {
    if (path === "/superadmin") return location.pathname === "/superadmin" || location.pathname === "/superadmin/";
    if (path === "/agent/dashboard") return location.pathname === "/agent/dashboard" || location.pathname === "/agent/dashboard/";
    if (path === "/admin/dashboard") return location.pathname === "/admin/dashboard" || location.pathname === "/admin/dashboard/";
    if (path === "/superadmin/wallet") return location.pathname.startsWith("/superadmin/wallet");
    return location.pathname === path;
  };

  const hasActiveChild = (item: NavItem) =>
    !!item.children?.some((c) => isActivePath(c.path));

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = !!item.children?.length;
    const isExpanded = expandedItems.has(item.path);
    const isActive = isActivePath(item.path);
    const hasActiveChildItem = hasActiveChild(item);

    const baseClasses =
      "group flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors duration-150";
    const activeClasses =
      "bg-slate-800 text-white shadow-sm shadow-slate-950/20";
    const inactiveClasses =
      "text-slate-300 hover:bg-slate-800/80 hover:text-white";
    const iconClasses =
      "flex h-10 w-10 items-center justify-center rounded-2xl text-lg transition-colors duration-150";
    const iconActive = "bg-primary-600 text-white";
    const iconInactive =
      "bg-slate-800/80 text-slate-400 group-hover:bg-primary-600 group-hover:text-white";

    return (
      <li key={item.path} className="list-none">
        {hasChildren ? (
          <>
            <button
              type="button"
              onClick={() => toggleExpanded(item.path)}
              className={`${baseClasses} ${isActive || hasActiveChildItem ? activeClasses : inactiveClasses}`}
            >
              <span className={`${iconClasses} ${isActive || hasActiveChildItem ? iconActive : iconInactive}`}>
                {item.icon}
              </span>
              <div className="min-w-0 flex-1 text-left">
                <p className={`text-sm font-semibold ${isActive || hasActiveChildItem ? "text-white" : "text-slate-200"}`}>
                  {item.label}
                </p>
              </div>
              <ChevronRight
                size={16}
                className={`text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-90 text-white" : ""}`}
              />
            </button>
            {isExpanded && (
              <ul className="mt-2 space-y-2 pl-8">
                {item.children?.map((child) => renderNavItem(child, level + 1))}
              </ul>
            )}
          </>
        ) : (
          <Link
            to={item.path}
            onClick={onClose}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
          >
            <span className={`${iconClasses} ${isActive ? iconActive : iconInactive}`}>
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-slate-200"}`}>
                {item.label}
              </p>
            </div>
            {item.path.includes("/orders") && newOrderCount > 0 && !isActive && (
              <Badge variant="solid" colorScheme="error" className="ml-auto text-[10px] font-semibold">
                {newOrderCount}
              </Badge>
            )}
            {isActive && <Check size={16} className="text-primary-400" />}
          </Link>
        )}
      </li>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-[70] w-72 transform transition-transform duration-300 ease-in-out bg-slate-950 text-slate-100 shadow-xl border-r border-slate-800 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:h-screen flex flex-col min-h-0 overflow-hidden`}
    >
      <div className="flex items-center justify-between gap-4 p-2 bg-slate-900/95 border-b border-slate-700">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-950 shadow-sm shadow-slate-950/20">
            <CaskmafDatahubLogo width={26} height={26} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-white">Caskmaf Datahub</p>
            <p className="truncate text-xs uppercase tracking-[0.24em] text-slate-500">User Portal</p>
          </div>
        </div>

        <Button
          variant="ghost"
          iconOnly
          aria-label="Close sidebar"
          onClick={onClose}
          className="text-slate-300 hover:text-white"
        >
          <X size={18} />
        </Button>
      </div>

      <div className="px-5 pt-5 pb-3">
        <span className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
          Navigation
        </span>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-2 pb-3">
        <ul className="space-y-2">{navItems.map((item) => renderNavItem(item))}</ul>
      </nav>

      {/* ── User profile + logout ── */}
      <div className="flex-shrink-0 border-t border-slate-800 bg-slate-950/95 p-2 gap-2 flex flex-col">
        <div className="flex items-center gap-3 rounded-3xl bg-slate-900/95 p-2 shadow-inner shadow-slate-950/10">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {authState.user?.fullName ?? "Admin user"}
            </p>
            <p className="inline-flex items-center truncate rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[8px] font-light uppercase tracking-[0.18em] text-white shadow-sm shadow-black/10">
              {authState.user?.userType?.replace("_", " ") ?? "User"}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          colorScheme="error"
          leftIcon={<LogOut className="h-4 w-4" />}
          onClick={() => {
            logout();
            onClose();
          }}
          className="w-full"
        >
          Sign Out
        </Button>

        <div className="text-center text-[11px] text-slate-500">
          {authState.user?.businessName ?? "Caskmaf Datahub"} · v1.0.0
        </div>
      </div>
    </aside>
  );
};