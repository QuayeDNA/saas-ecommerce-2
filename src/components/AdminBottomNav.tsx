/**
 * AdminBottomNav
 * Mobile bottom tab navigation for Admin and Super Admin users.
 *
 * - Super admin primary tabs: Dashboard | Users | Packages | Orders (+ More)
 * - Settings is available in the More drop-up menu
 * - A "More" hamburger button opens a drop-up sheet for secondary routes
 *   (Commissions, Announcements, Stores, Wallet sub-routes, etc.)
 * - On md+ screens this component is hidden; the existing Sidebar takes over.
 */

import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Package,
    ClipboardList,
    Settings,
    Menu,
    X,
    Wallet,
    Megaphone,
    Store,
    CreditCard,
    Banknote,
    History,
    Building2,
    BadgeDollarSign,
} from "lucide-react";

// ─── Primary tabs (always visible) ──────────────────────────────────────────

interface PrimaryTab {
    label: string;
    path: string;
    icon: React.ReactNode;
}

// Super-admin primaries
const superAdminPrimary: PrimaryTab[] = [
    { label: "Dashboard", path: "/superadmin", icon: <LayoutDashboard className="w-5 h-5" strokeWidth={1.8} /> },
    { label: "Users", path: "/superadmin/users", icon: <Users className="w-5 h-5" strokeWidth={1.8} /> },
    { label: "Packages", path: "/superadmin/packages", icon: <Package className="w-5 h-5" strokeWidth={1.8} /> },
    { label: "Orders", path: "/superadmin/orders", icon: <ClipboardList className="w-5 h-5" strokeWidth={1.8} /> },
];

// Regular admin primaries
const adminPrimary: PrimaryTab[] = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" strokeWidth={1.8} /> },
    { label: "Users", path: "/admin/dashboard/users", icon: <Users className="w-5 h-5" strokeWidth={1.8} /> },
    { label: "Packages", path: "/admin/dashboard/packages", icon: <Package className="w-5 h-5" strokeWidth={1.8} /> },
    { label: "Wallet", path: "/admin/dashboard/wallet", icon: <Wallet className="w-5 h-5" strokeWidth={1.8} /> },
    { label: "Profile", path: "/admin/dashboard/profile", icon: <Users className="w-5 h-5" strokeWidth={1.8} /> },
];

// ─── Secondary (overflow) items for super admin ──────────────────────────────

interface OverflowItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    description?: string;
}

const superAdminOverflow: OverflowItem[] = [
    { label: "Settings", path: "/superadmin/settings", icon: <Settings className="w-5 h-5" />, description: "Platform configuration" },
    { label: "Providers", path: "/superadmin/providers", icon: <Building2 className="w-5 h-5" />, description: "Manage telecom providers" },
    { label: "Commissions", path: "/superadmin/commissions", icon: <BadgeDollarSign className="w-5 h-5" />, description: "Reseller commission rates" },
    { label: "Announcements", path: "/superadmin/announcements", icon: <Megaphone className="w-5 h-5" />, description: "Platform-wide notices" },
    { label: "Stores", path: "/superadmin/stores", icon: <Store className="w-5 h-5" />, description: "Agent storefronts" },
    { label: "Top-ups", path: "/superadmin/wallet/top-ups", icon: <CreditCard className="w-5 h-5" />, description: "Wallet funding requests" },
    { label: "Payouts", path: "/superadmin/wallet/payouts", icon: <Banknote className="w-5 h-5" />, description: "Withdrawal processing" },
    { label: "Tx History", path: "/superadmin/wallet/history", icon: <History className="w-5 h-5" />, description: "All wallet transactions" },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface AdminBottomNavProps {
    userType?: string;
}

export const AdminBottomNav = ({ userType = "admin" }: AdminBottomNavProps) => {
    const location = useLocation();
    const [overflowOpen, setOverflowOpen] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);

    const isSuperAdmin = userType === "super_admin";
    const primaryTabs = isSuperAdmin ? superAdminPrimary : adminPrimary;
    const overflowItems = isSuperAdmin ? superAdminOverflow : [];

    // Close sheet on outside tap
    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
                setOverflowOpen(false);
            }
        };
        if (overflowOpen) document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [overflowOpen]);

    // Close sheet on route change
    useEffect(() => {
        setOverflowOpen(false);
    }, [location.pathname]);

    const isActive = (path: string) => {
        if (path === "/superadmin" || path === "/admin/dashboard") {
            return location.pathname === path || location.pathname === path + "/";
        }
        return location.pathname.startsWith(path);
    };

    const anyOverflowActive = overflowItems.some((item) => isActive(item.path));

    return (
        <>
            {/* ── Drop-up overlay ── */}
            {overflowOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/40 transition-opacity"
                    onClick={() => setOverflowOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ── Drop-up sheet ── */}
            {isSuperAdmin && (
                <div
                    ref={sheetRef}
                    className="md:hidden fixed left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-surface)] rounded-t-[20px] shadow-[0_-8px_32px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out"
                    style={{
                        bottom: overflowOpen ? "72px" : "-100%",
                        padding: "0 0 16px 0",
                    }}
                >
                    {/* Sheet handle */}
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="h-1 w-10 rounded-full bg-slate-300" />
                    </div>

                    {/* Sheet title */}
                    <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 pb-3">
                        <span className="font-['Syne'] text-base font-bold text-slate-900">
                            More
                        </span>
                        <button
                            onClick={() => setOverflowOpen(false)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                            aria-label="Close menu"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Overflow items */}
                    <div className="px-4 pt-2 grid grid-cols-1 gap-1">
                        {overflowItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 rounded-[14px] px-3 py-3 transition-colors duration-150 ${active ? "bg-primary-50" : "hover:bg-slate-50"}`}
                                    onMouseEnter={(e) => {
                                        if (!active) e.currentTarget.style.backgroundColor = "";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!active) e.currentTarget.style.backgroundColor = "";
                                    }}
                                >
                                    {/* Icon */}
                                    <div
                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] ${active ? "bg-primary-500 text-white" : "bg-slate-100 text-slate-600"}`}
                                    >
                                        {item.icon}
                                    </div>

                                    {/* Text */}
                                    <div className="min-w-0 flex-1">
                                        <div className={`font-['DM Sans'] text-sm font-semibold ${active ? "text-primary-600" : "text-slate-900"}`}>
                                            {item.label}
                                        </div>
                                        {item.description && (
                                            <div className="mt-0.5 truncate text-xs text-slate-500">
                                                {item.description}
                                            </div>
                                        )}
                                    </div>

                                    {/* Active indicator */}
                                    {active && (
                                        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
                                    )}
                                </NavLink>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Bottom tab bar ── */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_-10px_28px_rgba(15,23,42,0.14)]"
                style={{
                    height: "72px",
                    paddingBottom: "env(safe-area-inset-bottom, 0px)",
                }}
            >
                {primaryTabs.map((tab) => {
                    const active = isActive(tab.path);
                    return (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            end={tab.path === "/superadmin" || tab.path === "/admin/dashboard"}
                            aria-label={tab.label}
                            className="flex flex-col items-center justify-center gap-1 flex-1 min-h-[48px] py-2 transition-all duration-150"
                        >
                            <div
                                className={`flex h-7 w-10 items-center justify-center rounded-[10px] transition-all duration-200 ${active ? "bg-primary-50 text-primary-600" : "text-slate-400"}`}
                            >
                                {tab.icon}
                            </div>
                            <span
                                className={`font-['DM Sans'] text-[11px] font-semibold leading-none ${active ? "text-primary-600" : "text-slate-400"}`}
                            >
                                {tab.label}
                            </span>
                        </NavLink>
                    );
                })}

                {/* More button — super admin only */}
                {isSuperAdmin && (
                    <button
                        onClick={() => setOverflowOpen((v) => !v)}
                        className="flex flex-col items-center justify-center gap-1 flex-1 min-h-[48px] py-2 transition-all duration-150"
                        aria-label="More navigation options"
                        aria-expanded={overflowOpen}
                    >
                        <div
                            className={`flex h-7 w-10 items-center justify-center rounded-[10px] transition-all duration-200 ${(overflowOpen || anyOverflowActive) ? "bg-primary-50 text-primary-600" : "text-slate-400"}`}
                        >
                            {overflowOpen
                                ? <X className="w-5 h-5" strokeWidth={2} />
                                : <Menu className="w-5 h-5" strokeWidth={1.8} />}
                        </div>
                        <span
                            className={`font-['DM Sans'] text-[11px] font-semibold leading-none ${(overflowOpen || anyOverflowActive) ? "text-primary-600" : "text-slate-400"}`}
                        >
                            More
                        </span>
                    </button>
                )}
            </nav>
        </>
    );
};