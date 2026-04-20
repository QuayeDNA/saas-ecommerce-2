/**
 * DashboardLayout — Caskmaf Datahub mobile-first redesign
 *
 * Mobile (<md):
 *   ┌──────────────────────────┐
 *   │  CompactHeader (56px)    │  ← logo + bell + avatar only, no wallet
 *   ├──────────────────────────┤
 *   │                          │
 *   │   <Outlet />             │  ← scrollable content, pb-20 to clear nav
 *   │                          │
 *   ├──────────────────────────┤
 *   │  BottomNav (72px)        │  ← AgentBottomNav or AdminBottomNav
 *   └──────────────────────────┘
 *
 * Desktop (md+):
 *   ┌──────────┬───────────────────────────┐
 *   │          │  DesktopHeader (full)     │
 *   │ Sidebar  ├───────────────────────────┤
 *   │  (64px)  │                           │
 *   │          │   <Outlet />              │
 *   │          │                           │
 *   └──────────┴───────────────────────────┘
 */

import { useState, useEffect, type UIEvent } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { AgentBottomNav } from "../components/AgentBottomNav";
import { AdminBottomNav } from "../components/AdminBottomNav";
import { NavigationLoader } from "../components/navigation-loader";
import { TutorialProvider } from "../contexts/TutorialContext";
import { TutorialPlayer } from "../components/tutorials/tutorial-player";
import { TutorialLauncher } from "../components/tutorials/tutorial-launcher";
import { TutorialAutoTrigger } from "../components/tutorials/tutorial-auto-trigger";
import { AnnouncementPopupHandler } from "../components/announcements/announcement-popup-handler";
import { useAuth } from "../hooks";

// User types that get the Agent bottom nav
const AGENT_USER_TYPES = ["agent", "super_agent", "dealer", "super_dealer"];
// User types that get the Admin bottom nav
const ADMIN_USER_TYPES = ["admin", "super_admin"];

export const DashboardLayout = () => {
  const { authState, updateFirstTimeFlag } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const location = useLocation();

  const userType = authState.user?.userType ?? "agent";
  const userRole = userType as string;

  const isAgentUser = AGENT_USER_TYPES.includes(userType);
  const isAdminUser = ADMIN_USER_TYPES.includes(userType);

  // Responsive breakpoint detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  // First-time onboarding flag
  useEffect(() => {
    if (
      authState.isAuthenticated &&
      authState.user?.isFirstTime &&
      location.pathname.includes("/dashboard")
    ) {
      const handled = localStorage.getItem("tourCompleted") === "true";
      if (!handled) {
        localStorage.setItem("tourCompleted", "true");
        updateFirstTimeFlag();
      }
    }
  }, [authState.isAuthenticated, authState.user, location.pathname, updateFirstTimeFlag]);

  const handleMainScroll = (e: UIEvent<HTMLElement>) => {
    const threshold = 24;
    setIsHeaderScrolled(e.currentTarget.scrollTop > threshold);
  };

  return (
    <TutorialProvider userRole={userRole}>
      <div className="flex h-screen overflow-hidden bg-[var(--color-primary-50)]">

        {/* ── Mobile sidebar overlay (dark scrim) ── */}
        {sidebarOpen && isMobile && (
          <button
            className="fixed inset-0 z-50 bg-black/50 border-0 cursor-default md:hidden"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        {/* ── Sidebar (desktop always visible, mobile slide-in) ── */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* ── Main column ── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Header (renders two variants internally — mobile compact / desktop full) */}
          <Header
            onMenuClick={() => setSidebarOpen((v) => !v)}
            isScrolled={isHeaderScrolled}
          />

          {/* Scrollable content */}
          <main
            className="flex-1 overflow-y-auto"
            onScroll={handleMainScroll}
            style={{
              // Extra bottom padding on mobile so content clears the bottom nav
              paddingBottom: isMobile ? "88px" : "0px",
            }}
          >
            <div className="p-3 sm:p-4 md:p-6">
              <NavigationLoader delay={150}>
                <Outlet />
              </NavigationLoader>
            </div>
          </main>
        </div>

        {/* ── Mobile bottom nav — mutually exclusive by user type ── */}
        {isAgentUser && <AgentBottomNav />}
        {isAdminUser && (
          <AdminBottomNav userType={userType} />
        )}

        {/* ── Tutorial system ── */}
        <TutorialPlayer />
        <TutorialAutoTrigger />
        <TutorialLauncher />

        {/* ── Announcements ── */}
        <AnnouncementPopupHandler />
      </div>
    </TutorialProvider>
  );
};