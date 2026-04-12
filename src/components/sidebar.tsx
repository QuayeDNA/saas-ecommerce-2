/**
 * Sidebar — DirectData redesign
 *
 * Visible only on md+ screens (desktop). Mobile uses BottomNav instead.
 * Retains all existing navigation logic but overhauls visual design to match
 * the DirectData blue (#0057FF) brand and DM Sans / Syne type system.
 */

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import type { ReactNode } from "react";
import {
  FaBox, FaMobile, FaUsers, FaUsersCog, FaWallet, FaUser,
  FaCog, FaTachometerAlt, FaBuilding, FaClipboardList, FaChartLine,
  FaMoneyBillWave, FaCreditCard, FaHistory, FaBullhorn, FaStore,
} from "react-icons/fa";
import { Home, Plus, LogOut, ChevronRight, Check, X } from "lucide-react";
import { useState } from "react";
import { DirectDataLogo } from "./common/DirectDataLogo";

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

  const isActivePath = (path: string) => {
    if (path === "/superadmin") return location.pathname === "/superadmin" || location.pathname === "/superadmin/";
    if (path === "/agent/dashboard") return location.pathname === "/agent/dashboard" || location.pathname === "/agent/dashboard/";
    if (path === "/admin/dashboard") return location.pathname === "/admin/dashboard" || location.pathname === "/admin/dashboard/";
    if (path === "/superadmin/wallet") return location.pathname.startsWith("/superadmin/wallet");
    return location.pathname === path;
  };

  const hasActiveChild = (item: NavItem) =>
    !!item.children?.some((c) => isActivePath(c.path));

  // ── Style helpers ─────────────────────────────────────────────
  const itemBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    fontSize: "14px",
    width: "100%",
    border: "none",
    textAlign: "left",
  };

  const activeStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.18)",
    color: "#ffffff",
  };

  const inactiveStyle: React.CSSProperties = {
    backgroundColor: "transparent",
    color: "rgba(255,255,255,0.65)",
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = !!item.children?.length;
    const isExpanded = expandedItems.has(item.path);
    const isActive = isActivePath(item.path);
    const hasActiveChildItem = hasActiveChild(item);

    const computedStyle = {
      ...itemBase,
      ...(isActive || hasActiveChildItem ? activeStyle : inactiveStyle),
      paddingLeft: level > 0 ? "36px" : "12px",
    };

    return (
      <li key={item.path} className="list-none">
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleExpanded(item.path)}
              style={computedStyle}
              onMouseEnter={(e) => {
                if (!isActive && !hasActiveChildItem) {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "#ffffff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && !hasActiveChildItem) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                }
              }}
            >
              {/* Icon */}
              <span style={{ fontSize: "14px", flexShrink: 0, opacity: isActive || hasActiveChildItem ? 1 : 0.7 }}>
                {item.icon}
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              <ChevronRight
                size={14}
                style={{
                  flexShrink: 0,
                  opacity: 0.6,
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            </button>
            {isExpanded && (
              <ul className="mt-0.5 space-y-0.5">
                {item.children?.map((child) => renderNavItem(child, level + 1))}
              </ul>
            )}
          </>
        ) : (
          <Link
            to={item.path}
            style={computedStyle}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#ffffff";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.65)";
              }
            }}
            onClick={onClose}
          >
            <span style={{ fontSize: "14px", flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>
              {item.icon}
            </span>
            <span className="flex-1 truncate">{item.label}</span>
            {isActive && (
              <Check size={14} style={{ flexShrink: 0, opacity: 0.9 }} />
            )}
          </Link>
        )}
      </li>
    );
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 bottom-[72px] z-30 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:inset-y-0 md:translate-x-0 md:static md:h-screen md:flex-shrink-0
      `}
      style={{
        width: "240px",
        backgroundColor: "var(--color-primary-500)",
      }}
    >
      {/* ── Logo header ── */}
      <div
        className="flex items-center justify-between px-4 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <DirectDataLogo width={32} height={32} className="flex-shrink-0" />
          <span
            className="truncate"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "18px",
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            DirectData
          </span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden flex items-center justify-center rounded-xl ml-2 flex-shrink-0"
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: "rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.8)",
            border: "none",
          }}
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Nav section label ── */}
      <div className="px-4 pt-5 pb-2">
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Navigation
        </span>
      </div>

      {/* ── Nav items ── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        {navItems.map((item) => renderNavItem(item))}
      </nav>

      {/* ── User profile + logout ── */}
      <div
        className="flex-shrink-0 p-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
      >
        {/* User row */}
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0 font-bold text-sm"
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "#ffffff",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-sm font-semibold truncate"
              style={{ color: "#ffffff", fontFamily: "'DM Sans', sans-serif" }}
            >
              {authState.user?.fullName}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: authState.isAuthenticated ? "#34d399" : "#9ca3af" }}
              />
              <span
                className="text-xs truncate capitalize"
                style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'DM Sans', sans-serif" }}
              >
                {authState.user?.userType?.replace("_", " ") ?? "User"}
              </span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => { logout(); onClose(); }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-sm font-semibold transition-all duration-150"
          style={{
            backgroundColor: "rgba(244,63,94,0.18)",
            color: "#fda4af",
            border: "1px solid rgba(244,63,94,0.25)",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(244,63,94,0.28)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(244,63,94,0.18)";
          }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        {/* Version */}
        <div
          className="text-center mt-2"
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}
        >
          {authState.user?.businessName ?? "DirectData"} · v1.0.0
        </div>
      </div>
    </aside>
  );
};