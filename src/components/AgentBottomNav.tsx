/**
 * AgentBottomNav
 * Mobile-first bottom tab navigation for Agent/Reseller users.
 * Renders on mobile only (md:hidden). Desktop uses the existing Sidebar.
 */

import { NavLink, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Wallet, User } from "lucide-react";

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

export const AgentBottomNav = () => {
    const location = useLocation();

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

    return (
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
        </nav>
    );
};