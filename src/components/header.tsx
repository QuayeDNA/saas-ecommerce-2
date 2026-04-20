/**
 * Header — Caskmaf Datahub redesign
 *
 * Mobile  (<md): compact blue bar with logo wordmark, notification bell,
 *                and avatar. Wallet card is REMOVED — it lives on the
 *                Home screen hero card instead.
 *
 * Desktop (md+): full header with greeting, wallet balance strip,
 *                site-toggle, notifications, and user dropdown.
 *                Matches the existing sidebar layout paradigm.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useWallet, useDailySpending } from "../hooks";
import { useSiteStatus } from "../contexts/site-status-context";
import { settingsService } from "../services/settings.service";
import { useToast } from "../design-system/components/toast";
import {
  FaBars,
  FaUser,
  FaSignOutAlt,
  FaWallet,
  FaSync,
  FaWifi,
  FaCheck,
  FaPowerOff,
} from "react-icons/fa";
import { ChevronDown } from "lucide-react";
import { NotificationDropdown } from "./notifications/NotificationDropdown";
import { ImpersonationService } from "../utils/impersonation";
import { canHaveWallet, isAdminUser } from "../utils/userTypeHelpers";
import { Badge } from "../design-system/components/badge";

interface HeaderProps {
  onMenuClick: () => void;
  isScrolled?: boolean;
}

export const Header = ({ onMenuClick, isScrolled = false }: HeaderProps) => {
  const { authState, logout, refreshAuth } = useAuth();
  const { walletBalance, refreshWallet, isLoading, connectionStatus } = useWallet();
  const { dailySpending, isLoading: dailySpendingLoading } = useDailySpending();
  const { siteStatus, refreshSiteStatus } = useSiteStatus();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTogglingSite, setIsTogglingSite] = useState(false);

  const canShowWallet = canHaveWallet(authState.user?.userType || "");
  const isAdmin = isAdminUser(authState.user?.userType || "");
  const isImpersonating = ImpersonationService.isImpersonating();
  const surfaceColor = "var(--color-surface)";
  const borderColor = "var(--color-border)";
  const headerTextColor = isScrolled ? "#0f172a" : "#334155";
  const mutedHeaderTextColor = isScrolled ? "#475569" : "#64748b";
  const headerControlBg = isScrolled ? "var(--color-primary-50)" : "rgba(255,255,255,0.65)";
  const headerControlBorder = isScrolled ? "var(--color-primary-200)" : "rgba(255,255,255,0.5)";

  const firstName = authState.user?.fullName.split(" ")[0] ?? "";
  const initials =
    (authState.user?.fullName.charAt(0) ?? "") +
    (authState.user?.fullName.split(" ")[1]?.charAt(0) ?? "");

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return { text: "Good morning", emoji: "☀️" };
    if (h < 18) return { text: "Good afternoon", emoji: "🌤️" };
    return { text: "Good evening", emoji: "🌙" };
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount);

  const getConnectionIcon = () => {
    if (connectionStatus === "websocket") return <FaWifi className="w-3 h-3 text-emerald-400" />;
    if (connectionStatus === "polling") return <FaSync className="w-3 h-3 text-amber-400 animate-spin" />;
    return <FaWifi className="w-3 h-3 text-rose-400" />;
  };

  const getConnectionText = () => {
    if (connectionStatus === "websocket") return "Live";
    if (connectionStatus === "polling") return "Syncing";
    return "Offline";
  };

  const handleSiteToggle = async () => {
    if (authState.user?.userType !== "super_admin") return;
    setIsTogglingSite(true);
    try {
      await settingsService.toggleSiteStatus();
      await refreshSiteStatus();
    } catch {
      // handled by service
    } finally {
      setIsTogglingSite(false);
    }
  };

  const handleReturnToAdmin = async () => {
    try {
      await ImpersonationService.endImpersonation();
      setIsDropdownOpen(false);
      await refreshAuth();
      navigate("/superadmin");
    } catch {
      addToast("Failed to return to admin", "error");
    }
  };

  // Toast on site status change
  const [prevSiteStatus, setPrevSiteStatus] = useState<boolean | null>(null);
  useEffect(() => {
    if (
      siteStatus &&
      authState.user &&
      prevSiteStatus !== null &&
      prevSiteStatus !== siteStatus.isSiteOpen
    ) {
      addToast(
        siteStatus.isSiteOpen
          ? "Site is now open for business! 🎉"
          : "Site is currently under maintenance 🔧",
        siteStatus.isSiteOpen ? "success" : "warning",
        4000,
      );
    }
    setPrevSiteStatus(siteStatus?.isSiteOpen ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteStatus?.isSiteOpen]);

  // ─────────────────────────────────────────────────────────────
  // MOBILE HEADER (< md)
  // Compact: logo | title ........... bell | avatar
  // No wallet — lives on Home screen hero card
  // ─────────────────────────────────────────────────────────────
  const MobileHeader = () => (
    <header
      className="md:hidden sticky top-0 z-20 transition-all duration-300"
      style={{
        backgroundColor: isScrolled ? surfaceColor : "transparent",
        borderBottom: isScrolled ? `1px solid ${borderColor}` : "1px solid transparent",
        boxShadow: isScrolled ? "0 8px 24px rgba(15,23,42,0.08)" : "none",
        backdropFilter: isScrolled ? "blur(8px)" : "none",
      }}
    >
      <div
        className="flex items-center justify-between px-4"
        style={{ height: "56px" }}
      >
        {/* Left: hamburger */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center rounded-xl transition-colors duration-300 flex-shrink-0"
            style={{ width: "36px", height: "36px", color: mutedHeaderTextColor }}
            aria-label="Open menu"
          >
            <FaBars className="w-5 h-5" />
          </button>
        </div>

        {/* Right: notifications + avatar */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <NotificationDropdown />

          {/* Avatar */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative flex items-center justify-center rounded-full font-bold text-sm transition-all duration-300"
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: headerControlBg,
              border: `2px solid ${headerControlBorder}`,
              color: headerTextColor,
              fontFamily: "'DM Sans', sans-serif",
            }}
            aria-label="User menu"
          >
            {initials}
            {isImpersonating && (
              <span
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white animate-pulse"
                style={{ backgroundColor: "#f59e0b" }}
              />
            )}
          </button>
        </div>
      </div>

      {isImpersonating && (
        <div
          className="flex items-center justify-center gap-2 py-1.5 text-xs font-semibold"
          style={{ backgroundColor: "#f59e0b", color: "#1a1a2e" }}
        >
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Viewing as {authState.user?.fullName}
          <button
            onClick={handleReturnToAdmin}
            className="underline underline-offset-2 ml-1"
          >
            Return to Admin
          </button>
        </div>
      )}

      {/* Mobile dropdown */}
      {isDropdownOpen && (
        <>
          <button
            className="fixed inset-0 z-10 cursor-default bg-transparent border-0"
            onClick={() => setIsDropdownOpen(false)}
            aria-label="Close dropdown"
          />
          <div
            className="absolute right-4 z-20 overflow-hidden"
            style={{
              top: "64px",
              width: "260px",
              backgroundColor: surfaceColor,
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
              border: `1px solid ${borderColor}`,
            }}
          >
            {/* User info */}
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${borderColor}` }}>
              <div className="flex items-center gap-2">
                <div
                  className="min-w-0 font-semibold text-sm truncate"
                  style={{ color: "#1a1a2e", fontFamily: "'DM Sans', sans-serif" }}
                >
                  {authState.user?.fullName}
                </div>
                {authState.user?.agentCode && (
                  <Badge
                    variant="subtle"
                    size="xs"
                    colorScheme="default"
                    className="shrink-0 !rounded-full !px-1.5 !py-0.5 text-[10px] md:text-[11px]"
                    useThemeColor
                  >
                    {authState.user.agentCode}
                  </Badge>
                )}
              </div>
              <div className="text-xs truncate mt-0.5" style={{ color: "#8891a7" }}>
                {authState.user?.email}
              </div>
              {canShowWallet && (
                <div className="mt-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-light uppercase tracking-wide text-slate-500">
                        Wallet Balance
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {isLoading ? "—" : formatAmount(walletBalance)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-light uppercase tracking-wide text-slate-500">
                        Spent Today
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {dailySpendingLoading || isLoading ? "—" : formatAmount(dailySpending)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Links */}
            {canShowWallet && (
              <>
                <Link
                  to="/agent/dashboard/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-gray-50"
                  style={{ color: "#4a5270" }}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaUser className="w-4 h-4" style={{ color: "#8891a7" }} />
                  My Profile
                </Link>
                <Link
                  to="/agent/dashboard/wallet"
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-gray-50"
                  style={{ color: "#4a5270", borderBottom: `1px solid ${borderColor}` }}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaWallet className="w-4 h-4" style={{ color: "#8891a7" }} />
                  My Wallet
                </Link>
              </>
            )}

            {isImpersonating && (
              <button
                onClick={handleReturnToAdmin}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: "#fff8e6",
                  color: "#d97706",
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <FaSignOutAlt className="w-4 h-4" />
                Return to Admin
              </button>
            )}

            <button
              onClick={() => { setIsDropdownOpen(false); logout(); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors hover:bg-red-50"
              style={{ color: "#e11d48" }}
            >
              <FaSignOutAlt className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </header>
  );

  // ─────────────────────────────────────────────────────────────
  // DESKTOP HEADER (md+)
  // Greeting | site toggle | notifications | avatar
  // Wallet balance strip underneath (for agent/reseller users)
  // ─────────────────────────────────────────────────────────────
  const DesktopHeader = () => (
    <header
      className="hidden md:block sticky top-0 z-10 transition-all duration-300"
      style={{
        backgroundColor: isScrolled ? surfaceColor : "transparent",
        borderBottom: isScrolled ? `1px solid ${borderColor}` : "1px solid transparent",
        borderRadius: "0 0 16px 16px",
        boxShadow: isScrolled ? "0 10px 28px rgba(15,23,42,0.08)" : "none",
        backdropFilter: isScrolled ? "blur(8px)" : "none",
      }}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Greeting */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-xl">{getGreeting().emoji}</span>
            <div className="min-w-0">
              <div
                className="font-semibold truncate"
                style={{ fontSize: "16px", color: headerTextColor, fontFamily: "'DM Sans', sans-serif" }}
              >
                {getGreeting().text}, {firstName}
              </div>
              <div className="text-xs" style={{ color: mutedHeaderTextColor }}>
                Welcome back! 👋
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Site toggle — admins only */}
            {isAdmin && (
              <button
                onClick={handleSiteToggle}
                disabled={isTogglingSite}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                style={{
                  backgroundColor: siteStatus?.isSiteOpen
                    ? "rgba(16,185,129,0.2)"
                    : "rgba(244,63,94,0.2)",
                  color: siteStatus?.isSiteOpen ? "#6ee7b7" : "#fda4af",
                  border: `1px solid ${siteStatus?.isSiteOpen ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.3)"}`,
                }}
              >
                {isTogglingSite ? (
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : siteStatus?.isSiteOpen ? (
                  <FaCheck className="w-3 h-3" />
                ) : (
                  <FaPowerOff className="w-3 h-3" />
                )}
                {isTogglingSite ? "Updating…" : siteStatus?.isSiteOpen ? "Site Open" : "Site Closed"}
              </button>
            )}

            {/* Notifications */}
            <NotificationDropdown />

            {/* Avatar + dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-300"
                style={{
                  backgroundColor: headerControlBg,
                  border: `1px solid ${headerControlBorder}`,
                }}
                aria-label="User menu"
              >
                <div
                  className="flex items-center justify-center rounded-full font-bold text-sm relative"
                  style={{
                    width: "34px",
                    height: "34px",
                    backgroundColor: isScrolled ? "var(--color-primary-100)" : "rgba(255,255,255,0.8)",
                    color: headerTextColor,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {initials}
                  {isImpersonating && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white animate-pulse"
                      style={{ backgroundColor: "#f59e0b" }}
                    />
                  )}
                </div>
                <span
                  className="text-sm font-medium max-w-[120px] truncate"
                  style={{ color: headerTextColor, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {firstName}
                </span>
                <ChevronDown
                  className="w-4 h-4 transition-transform duration-200"
                  style={{
                    color: mutedHeaderTextColor,
                    transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0)",
                  }}
                />
              </button>

              {isDropdownOpen && (
                <>
                  <button
                    className="fixed inset-0 z-10 cursor-default bg-transparent border-0"
                    onClick={() => setIsDropdownOpen(false)}
                    aria-label="Close"
                  />
                  <div
                    className="absolute right-0 mt-2 z-20 overflow-hidden"
                    style={{
                      width: "272px",
                      backgroundColor: surfaceColor,
                      borderRadius: "16px",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <div className="px-4 py-3" style={{ borderBottom: `1px solid ${borderColor}` }}>
                      <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: "#1a1a2e" }}>
                        <span className="truncate">{authState.user?.fullName}</span>
                        {authState.user?.agentCode && (
                          <Badge
                            variant="subtle"
                            size="xs"
                            colorScheme="default"
                            className="shrink-0 !rounded-full !px-1.5 !py-0.5 text-[10px]"
                            useThemeColor
                          >
                            {authState.user.agentCode}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "#8891a7" }}>
                        {authState.user?.email}
                      </div>
                      {canShowWallet && (
                        <div
                          className="mt-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                Wallet Balance
                              </div>
                              <div className="mt-0.5 text-sm font-bold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>
                                {isLoading ? "—" : formatAmount(walletBalance)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                Spent Today
                              </div>
                              <div className="mt-0.5 text-sm font-bold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>
                                {dailySpendingLoading || isLoading ? "—" : formatAmount(dailySpending)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {canShowWallet && (
                      <>
                        <Link
                          to="/agent/dashboard/profile"
                          className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                          style={{ color: "#4a5270" }}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: "#f2f4f8" }}>
                            <FaUser className="w-3.5 h-3.5" style={{ color: "#4a5270" }} />
                          </div>
                          My Profile
                        </Link>
                        <Link
                          to="/agent/dashboard/afa-registration"
                          className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                          style={{ color: "#4a5270", borderBottom: `1px solid ${borderColor}` }}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: "#f2f4f8" }}>
                            <FaUser className="w-3.5 h-3.5" style={{ color: "#4a5270" }} />
                          </div>
                          AFA Registration
                        </Link>
                      </>
                    )}

                    {isImpersonating && (
                      <button
                        onClick={handleReturnToAdmin}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold"
                        style={{
                          color: "#d97706",
                          backgroundColor: "#fff8e6",
                          borderBottom: `1px solid ${borderColor}`,
                        }}
                      >
                        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: "#fef3c7" }}>
                          <FaSignOutAlt className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
                        </div>
                        Return to Admin
                      </button>
                    )}

                    <button
                      onClick={() => { setIsDropdownOpen(false); logout(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-red-50 transition-colors"
                      style={{ color: "#e11d48" }}
                    >
                      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: "#fff1f2" }}>
                        <FaSignOutAlt className="w-3.5 h-3.5" style={{ color: "#e11d48" }} />
                      </div>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Desktop wallet strip — agent/reseller only */}
        {canShowWallet && (
          <button
            onClick={refreshWallet}
            className="mt-3 w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 hover:brightness-95 active:scale-[0.99]"
            style={{
              backgroundColor: "var(--color-surface)",
              border: `1px solid ${borderColor}`,
              boxShadow: "0 4px 14px rgba(15,23,42,0.06)",
            }}
            aria-label="Refresh wallet"
          >
            {/* Wallet balance */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "var(--color-primary-50)",
                }}
              >
                <FaWallet className="w-4 h-4 text-primary-600" />
              </div>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">
                    Wallet Balance
                  </span>
                  <div className="flex items-center gap-1">
                    {getConnectionIcon()}
                    <span className="text-xs text-slate-500">
                      {getConnectionText()}
                    </span>
                  </div>
                </div>
                <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {isLoading ? "—" : formatAmount(walletBalance)}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-10 flex-shrink-0" style={{ backgroundColor: borderColor }} />

            {/* Today's spending */}
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs font-medium text-slate-500">
                Today's Spending
              </div>
              <div className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>
                {dailySpendingLoading || isLoading ? "—" : formatAmount(dailySpending)}
              </div>
            </div>
          </button>
        )}
      </div>
    </header>
  );

  return (
    <>
      <MobileHeader />
      <DesktopHeader />
    </>
  );
};