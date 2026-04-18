/**
 * AgentBottomNav
 * Mobile-first bottom tab navigation for Agent/Reseller users.
 * Renders on mobile only (md:hidden). Desktop uses the existing Sidebar.
 */

import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Home, ShoppingBag, Wallet, User, Store, ShieldCheck, FileText, Menu, X } from "lucide-react";

interface NavTab {
    label: string;
    path: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
}

const agentTabs: NavTab[] = [
    {
        label: "Home",
        path: "/agent/dashboard",
        icon: <Home className="w-5 h-5" strokeWidth={1.8} />,
        activeIcon: <Home className="w-5 h-5" strokeWidth={2.5} />,
    },
    {
        label: "Orders",
        path: "/agent/dashboard/orders",
        icon: <ShoppingBag className="w-5 h-5" strokeWidth={1.8} />,
        activeIcon: <ShoppingBag className="w-5 h-5" strokeWidth={2.5} />,
    },
    {
        label: "Wallet",
        path: "/agent/dashboard/wallet",
        icon: <Wallet className="w-5 h-5" strokeWidth={1.8} />,
        activeIcon: <Wallet className="w-5 h-5" strokeWidth={2.5} />,
    },
    {
        label: "Profile",
        path: "/agent/dashboard/profile",
        icon: <User className="w-5 h-5" strokeWidth={1.8} />,
        activeIcon: <User className="w-5 h-5" strokeWidth={2.5} />,
    },
];

interface AgentOverflowItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    description?: string;
}

const agentOverflow: AgentOverflowItem[] = [
    {
        label: "Storefront",
        path: "/agent/dashboard/storefront",
        icon: <Store className="w-5 h-5" strokeWidth={1.8} />,
        description: "Manage your public shop",
    },
    {
        label: "AFA Registration",
        path: "/agent/dashboard/afa-registration",
        icon: <ShieldCheck className="w-5 h-5" strokeWidth={1.8} />,
        description: "Customer registration flow",
    },
    {
        label: "Privacy Policy",
        path: "/agent/dashboard/privacy-policy",
        icon: <FileText className="w-5 h-5" strokeWidth={1.8} />,
        description: "View platform privacy details",
    },
];

export const AgentBottomNav = () => {
    const location = useLocation();
    const [overflowOpen, setOverflowOpen] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
                setOverflowOpen(false);
            }
        };
        if (overflowOpen) document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [overflowOpen]);

    useEffect(() => {
        setOverflowOpen(false);
    }, [location.pathname]);

    const isActive = (path: string) => {
        // Exact match for dashboard home to avoid matching all /agent/dashboard/* routes
        if (path === "/agent/dashboard") {
            return (
                location.pathname === "/agent/dashboard" ||
                location.pathname === "/agent/dashboard/"
            );
        }
        return location.pathname.startsWith(path);
    };

    const anyOverflowActive = agentOverflow.some((item) => isActive(item.path));

    return (
        <>
            {overflowOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/40 transition-opacity"
                    onClick={() => setOverflowOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div
                ref={sheetRef}
                className="md:hidden fixed left-0 right-0 z-50 flex flex-col border-t border-[var(--color-border)] bg-[var(--color-surface)] rounded-t-[20px] shadow-[0_-8px_32px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out"
                style={{
                    bottom: overflowOpen ? "72px" : "-100%",
                    maxHeight: "calc(100vh - 88px - env(safe-area-inset-top, 0px))",
                }}
            >
                <div className="flex justify-center pt-3 pb-2">
                    <div className="h-1 w-10 rounded-full bg-slate-300" />
                </div>

                <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5 pb-3">
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

                <div
                    className="overflow-y-auto overscroll-contain px-4 pt-2 pb-4"
                    style={{
                        paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))",
                    }}
                >
                    <div className="grid grid-cols-1 gap-1">
                        {agentOverflow.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 rounded-[14px] px-3 py-3 transition-colors duration-150 ${active ? "bg-primary-50" : "hover:bg-slate-50"}`}
                                >
                                    <div
                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] ${active ? "bg-primary-500 text-white" : "bg-slate-100 text-slate-600"}`}
                                    >
                                        {item.icon}
                                    </div>

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

                                    {active && (
                                        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
                                    )}
                                </NavLink>
                            );
                        })}
                    </div>
                </div>
            </div>

            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_-10px_28px_rgba(15,23,42,0.14)]"
                style={{
                    height: "72px",
                    paddingBottom: "env(safe-area-inset-bottom, 0px)",
                }}
            >
                {agentTabs.map((tab) => {
                    const active = isActive(tab.path);
                    return (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            end={tab.path === "/agent/dashboard"}
                            aria-label={tab.label}
                            className="flex flex-col items-center justify-center gap-1 flex-1 min-h-[48px] py-2 transition-all duration-150"
                        >
                            {/* Icon pill — highlighted when active */}
                            <div
                                className={`flex h-7 w-10 items-center justify-center rounded-[10px] transition-all duration-200 ${active ? "bg-primary-50 text-primary-600" : "text-slate-400"}`}
                            >
                                {active ? tab.activeIcon : tab.icon}
                            </div>

                            {/* Label */}
                            <span
                                className={`font-['DM Sans'] text-[11px] font-semibold leading-none tracking-tight transition-colors duration-150 ${active ? "text-primary-600" : "text-slate-400"}`}
                            >
                                {tab.label}
                            </span>
                        </NavLink>
                    );
                })}

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
            </nav>
        </>
    );
};