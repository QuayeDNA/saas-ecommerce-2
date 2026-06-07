/**
 * Sidebar — Caskmaf Datahub redesign
 *
 * Mobile-first slide-out drawer, static on md+.
 * Nav items are rendered by NavItem component.
 * CSS tokens (--sb-*) are defined once here.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { LogOut, X, Loader2 } from "lucide-react";
import { FaBox } from "react-icons/fa";
import { useAuth } from "../hooks/use-auth";
import { useOrderNotificationBubble } from "../hooks/use-order-notification-bubble";
import { packageService } from "../services/package.service";
import { CaskmafDatahubLogo } from "./common/CaskmafDatahubLogo";
import { NavItem } from "./sidebar/nav-item";
import { getNavSections, isAgent } from "./sidebar/nav-config";
import type { NavItem as NavItemConfig } from "./sidebar/nav-config";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ─── Path matching ──────────────────────────────────────────────────────── */

const prefixMatchPaths = new Set(["/superadmin/wallet"]);

const isExactMatch = (a: string, b: string) =>
  a.replace(/\/$/, "") === b.replace(/\/$/, "");

const useActivePath = (pathname: string) =>
  useCallback(
    (path: string) => {
      if (prefixMatchPaths.has(path)) {
        return isExactMatch(path, pathname) || pathname.startsWith(path + "/");
      }
      return isExactMatch(path, pathname);
    },
    [pathname],
  );

/* ─── Avatar initials ────────────────────────────────────────────────────── */

const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

const NavSkeleton = () => (
  <div className="space-y-2 px-2" aria-hidden="true" aria-label="Loading navigation">
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-12 rounded-2xl sb-shimmer"
        style={{ animationDelay: `${i * 90}ms` }}
      />
    ))}
  </div>
);

/* ─── Loading nav item (shown inside Packages dropdown) ──────────────────── */

const loadingItem: NavItemConfig = {
  label: "Loading...",
  path: "",
  icon: <Loader2 className="w-4 h-4 animate-spin" />,
};

/* ─── Section header ─────────────────────────────────────────────────────── */

const SectionHeader = ({ label }: { label: string }) => (
  <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-[0.26em] text-[var(--sb-text-muted)]">
    {label}
  </p>
);

/* ─── Sidebar ────────────────────────────────────────────────────────────── */

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { authState, logout } = useAuth();
  const isActivePath = useActivePath(location.pathname);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    () => new Set(["packages", "wallet"]),
  );
  const [packageNavItems, setPackageNavItems] = useState<NavItemConfig[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  /* Fetch packages (agents only) */
  useEffect(() => {
    if (!isAgent(authState.user?.userType)) {
      setPackagesLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setPackagesLoading(true);
        const response = await packageService.getPackages({ isActive: true });
        if (cancelled) return;
        setPackageNavItems(
          (response.packages ?? [])
            .filter((pkg) => !!pkg._id && pkg.provider !== "AFA")
            .map((pkg) => ({
              label: pkg.name,
              path: `/agent/dashboard/packages/${pkg._id}`,
              icon: <FaBox />,
            })),
        );
      } catch {
        if (!cancelled) setPackageNavItems([]);
      } finally {
        if (!cancelled) setPackagesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authState.user?.userType]);

  const resolvedPackageItems = useMemo(
    () => (packagesLoading && packageNavItems.length === 0 ? [loadingItem] : packageNavItems),
    [packagesLoading, packageNavItems],
  );

  const navSections = useMemo(
    () => getNavSections(authState.user?.userType, resolvedPackageItems),
    [authState.user?.userType, resolvedPackageItems],
  );

  const toggleExpanded = useCallback((path: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const hasActiveChild = useCallback(
    (item: NavItemConfig) =>
      item.children?.some((c) => isActivePath(c.path)) ?? false,
    [isActivePath],
  );

  const handleLogout = useCallback(() => {
    logout();
    onClose();
  }, [logout, onClose]);

  /* Derived values */
  const appName  = authState.user?.businessName || "Caskmaf Datahub";
  const initials = getInitials(authState.user?.fullName ?? "");
  const userRole = authState.user?.userType ?? "User";
  const agentCode = isAgent(authState.user?.userType) ? (authState.user?.agentCode ?? null) : null;
  const isOnline = authState.isAuthenticated;

  const isOrdersPage =
    location.pathname.startsWith("/superadmin/orders") ||
    location.pathname.startsWith("/admin/dashboard/orders") ||
    location.pathname.startsWith("/agent/dashboard/orders");
  const newOrderCount = useOrderNotificationBubble(isOrdersPage);

  return (
    <>
      {/* ── CSS design tokens + minimal keyframes ─────────────────────────── */}
      <style>{`
        aside[data-sidebar] {
          --sb-text-primary:   var(--color-gray-100);
          --sb-text-secondary: var(--color-gray-300);
          --sb-text-muted:     var(--color-gray-500);

          --sb-hover-bg:       rgba(55, 55, 65, 0.8);
          --sb-active-bg:      var(--color-gray-700);
          --sb-active-shadow:  var(--color-gray-900);

          --sb-accent:         var(--color-primary-600, #0057FF);
          --sb-icon-bg:        rgba(55, 55, 65, 0.8);

          --sb-divider:        var(--color-gray-700);

          --sb-shimmer-a:      rgba(55, 55, 65, 0.4);
          --sb-shimmer-b:      rgba(55, 55, 65, 0.8);
        }

        @keyframes sb-shimmer {
          0%, 100% { background-color: var(--sb-shimmer-a); }
          50%       { background-color: var(--sb-shimmer-b); }
        }
        .sb-shimmer {
          animation: sb-shimmer 1.5s ease-in-out infinite;
        }

        .sb-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: var(--sb-divider) transparent;
        }
        .sb-scrollbar::-webkit-scrollbar       { width: 3px; }
        .sb-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .sb-scrollbar::-webkit-scrollbar-thumb {
          background: var(--sb-divider);
          border-radius: 9999px;
        }

        @media (prefers-reduced-motion: reduce) {
          .sb-shimmer { animation: none; }
        }
      `}</style>

      {/* ── Mobile backdrop ───────────────────────────────────────────────── */}
      {isOpen && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ── Sidebar shell ─────────────────────────────────────────────────── */}
      <aside
        data-sidebar
        aria-label="Main navigation"
        className={[
          "fixed inset-y-0 left-0 z-30 flex w-72 flex-col bg-[var(--color-gray-900)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] will-change-transform",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:static md:h-screen md:translate-x-0 md:flex-shrink-0",
        ].join(" ")}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-[var(--sb-divider)] bg-[var(--color-gray-800)] p-2">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-gray-900)] shadow-sm">
              <CaskmafDatahubLogo width={26} height={26} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-[var(--sb-text-primary)]">
                Caskmaf Datahub
              </p>
              <p className="truncate text-xs uppercase tracking-[0.24em] text-[var(--sb-text-muted)]">
                User Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className={[
              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl md:hidden",
              "text-[var(--sb-text-secondary)] transition-colors duration-150",
              "hover:bg-[var(--sb-hover-bg)] hover:text-[var(--sb-text-primary)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sb-accent)]",
            ].join(" ")}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* ── Navigation ──────────────────────────────────────────────────── */}
        <nav
          aria-label="Navigation menu"
          className="sb-scrollbar flex flex-1 flex-col overflow-y-auto px-2 py-3"
        >
          {packagesLoading && packageNavItems.length === 0 ? (
            <NavSkeleton />
          ) : (
            <div className="flex flex-col gap-4">
              {navSections.map((section) => (
                <div key={section.label}>
                  <SectionHeader label={section.label} />
                  <ul role="list" className="mt-2 space-y-2">
                    {section.items.map((item) => (
                      <NavItem
                        key={item.path}
                        item={item}
                        level={0}
                        isActive={isActivePath(item.path)}
                        isExpanded={expandedItems.has(item.path)}
                        hasActiveChild={hasActiveChild(item)}
                        checkActive={isActivePath}
                        onToggle={toggleExpanded}
                        onClose={onClose}
                        newOrderCount={newOrderCount}
                        isOrdersPage={isOrdersPage}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="flex flex-shrink-0 flex-col gap-2.5 border-t border-[var(--sb-divider)] bg-[var(--color-gray-900)] p-2">
          {/* User card */}
          <div className="flex items-center gap-3 rounded-3xl bg-[var(--color-gray-800)] p-2 shadow-inner">
            <div className="relative flex-shrink-0" aria-hidden="true">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-gray-700)] text-sm font-bold text-[var(--sb-text-primary)]">
                {initials}
              </div>
              <span
                className={[
                  "absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 transition-colors duration-300",
                  isOnline ? "bg-emerald-500" : "bg-[var(--sb-text-muted)]",
                ].join(" ")}
                style={{ borderColor: "var(--color-gray-800)" }}
                title={isOnline ? "Online" : "Offline"}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--sb-text-primary)]">
                {authState.user?.fullName ?? "Admin user"}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="inline-flex items-center truncate rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[8px] font-light uppercase tracking-[0.18em] text-[var(--sb-text-secondary)]">
                  {userRole.replace("_", " ")}
                </span>
                {agentCode && (
                  <span
                    className="flex-shrink-0 rounded px-1 py-px text-[10px] font-bold tracking-wider font-mono"
                    style={{
                      color: "var(--sb-accent)",
                      background: "rgba(0, 87, 255, 0.12)",
                    }}
                  >
                    {agentCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className={[
              "flex min-h-[42px] w-full items-center justify-center gap-2 rounded-2xl px-4 py-2",
              "text-sm font-semibold transition-colors duration-150",
              "text-red-300 border border-red-500/20 bg-red-500/10",
              "hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70",
            ].join(" ")}
          >
            <LogOut size={15} aria-hidden="true" />
            <span>Sign Out</span>
          </button>

          {/* App meta */}
          <div className="flex items-center justify-between px-1">
            <span className="max-w-[70%] truncate text-[11px] text-[var(--sb-text-muted)]">
              {appName}
            </span>
            <span
              className="flex-shrink-0 rounded-full border px-1.5 py-px text-[10px] font-mono font-semibold tracking-wide text-[var(--sb-text-muted)]"
              style={{ borderColor: "var(--sb-divider)", background: "var(--sb-hover-bg)" }}
            >
              v1.0.0
            </span>
          </div>
        </footer>
      </aside>
    </>
  );
};
