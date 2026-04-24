/**
 * DashboardLayout — Caskmaf Datahub
 *
 * Mobile  (<md): Header (56px) → scrollable Outlet → BottomNav (64px)
 * Desktop (md+): Sidebar + Header + scrollable Outlet (no bottom nav)
 *
 * Changes from previous version:
 * - AgentBottomNav + AdminBottomNav replaced with single <BottomNav>
 * - Scroll detection moved to the <main> element via onScroll
 * - paddingBottom driven by a CSS var so BottomNav height is one source of truth
 * - Sidebar overlay uses a proper <div> (not <button>) to avoid a11y issues
 * - isMobile state removed — CSS/Tailwind handles responsive visibility;
 *   only sidebar open/close state is tracked in JS
 */

import { useState, useEffect, useCallback, type UIEvent } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { BottomNav } from "../components/BottomNav";           // ← new consolidated nav
import { NavigationLoader } from "../components/navigation-loader";
import { TutorialProvider } from "../contexts/TutorialContext";
import { TutorialPlayer } from "../components/tutorials/tutorial-player";
import { TutorialLauncher } from "../components/tutorials/tutorial-launcher";
import { TutorialAutoTrigger } from "../components/tutorials/tutorial-auto-trigger";
import { AnnouncementPopupHandler } from "../components/announcements/announcement-popup-handler";
import { useAuth } from "../hooks";

// User types that get a bottom nav (everything except roles that are desktop-only)
const BOTTOM_NAV_TYPES = new Set([
  "agent", "super_agent", "dealer", "super_dealer",
  "admin", "super_admin",
]);

// Height of the fixed bottom nav bar in px — must match BottomNav CSS var
const BOTTOM_NAV_HEIGHT = 64;
// Scroll threshold before the header gains a background
const SCROLL_THRESHOLD = 24;

export const DashboardLayout = () => {
  const { authState, updateFirstTimeFlag } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const location = useLocation();

  const userType = (authState.user?.userType ?? "agent") as
    | "agent" | "super_agent" | "dealer" | "super_dealer"
    | "admin" | "super_admin";

  const showBottomNav = BOTTOM_NAV_TYPES.has(userType);

  // ── close sidebar on route change (mobile) ──────────────────────────────────
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // ── first-time onboarding flag ───────────────────────────────────────────────
  useEffect(() => {
    if (
      authState.isAuthenticated &&
      authState.user?.isFirstTime &&
      location.pathname.includes("/dashboard")
    ) {
      if (localStorage.getItem("tourCompleted") !== "true") {
        localStorage.setItem("tourCompleted", "true");
        updateFirstTimeFlag();
      }
    }
  }, [authState.isAuthenticated, authState.user, location.pathname, updateFirstTimeFlag]);

  // ── scroll handler ───────────────────────────────────────────────────────────
  const handleMainScroll = useCallback((e: UIEvent<HTMLElement>) => {
    setIsHeaderScrolled(e.currentTarget.scrollTop > SCROLL_THRESHOLD);
  }, []);

  // ── sidebar keyboard trap (Escape closes) ────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sidebarOpen) setSidebarOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [sidebarOpen]);

  return (
    <TutorialProvider userRole={userType}>
      <div
        className="flex h-[100dvh] overflow-hidden"
        style={{ background: "var(--color-background)" }}
      >

        {/* ── Mobile sidebar scrim ──────────────────────────────────────────── */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* ── Main column ───────────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Header — renders compact (mobile) or full (desktop) internally */}
          <Header
            onMenuClick={() => setSidebarOpen((v) => !v)}
            isScrolled={isHeaderScrolled}
          />

          {/* Scrollable content area */}
          <main
            className="flex-1 overflow-y-auto overscroll-contain"
            onScroll={handleMainScroll}
            style={{
              // On mobile, pad the bottom so content isn't hidden behind the nav bar.
              // On md+ the bottom nav is hidden so no padding needed.
              paddingBottom: `var(--main-pb, 0px)`,
            }}
          >
            {/*
              We set the CSS variable on the element itself so we can use a
              Tailwind responsive override without needing JS to track viewport.
            */}
            <style>{`
              @media (max-width: 767px) {
                main { --main-pb: ${BOTTOM_NAV_HEIGHT + 16}px; }
              }
            `}</style>

            <div className="p-3 sm:p-4 md:p-6">
              <NavigationLoader delay={150}>
                <Outlet />
              </NavigationLoader>
            </div>
          </main>
        </div>

        {/* ── Bottom nav (mobile only, hidden on md+ via CSS inside BottomNav) ── */}
        {showBottomNav && <BottomNav userType={userType} />}

        {/* ── Tutorial system ───────────────────────────────────────────────── */}
        <TutorialPlayer />
        <TutorialAutoTrigger />
        <TutorialLauncher />

        {/* ── Announcements ─────────────────────────────────────────────────── */}
        <AnnouncementPopupHandler />
      </div>
    </TutorialProvider>
  );
};