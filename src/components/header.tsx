/**
 * Header — Caskmaf Datahub
 *
 * Fixes:
 * - MobileHeader / DesktopHeader extracted OUTSIDE the parent so they
 *   are never remounted on scroll (greeting animation fires only once).
 * - Avatar dropdown is fully theme-aware via CSS custom properties.
 * - Responsive dropdown positioning on mobile.
 */

import { useState, useEffect, useCallback } from "react";
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
import { ChevronDown, Moon, Sun } from "lucide-react";
import { NotificationDropdown } from "./notifications/NotificationDropdown";
import { ImpersonationService } from "../utils/impersonation";
import { canHaveWallet, isAdminUser } from "../utils/userTypeHelpers";
import { Badge } from "../design-system/components/badge";
import { useTheme } from "../hooks/use-theme";

// ─── types ────────────────────────────────────────────────────────────────────

interface HeaderProps {
  onMenuClick: () => void;
  isScrolled?: boolean;
}

// ─── shared helpers (stable, defined at module level) ────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", emoji: "☀️" };
  if (h < 18) return { text: "Good afternoon", emoji: "🌤️" };
  return { text: "Good evening", emoji: "🌙" };
}

function formatGHS(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  }).format(amount);
}

// Scoped CSS that drives ALL theme-aware dropdown styling.
// Lives at module level — injected once, never re-runs on scroll.
const DROPDOWN_STYLES = `
  .hdr-dd {
    --dd-bg: var(--color-surface);
    --dd-border: var(--color-border);
    --dd-text: var(--color-text);
    --dd-muted: var(--color-muted-text);
    --dd-secondary: var(--color-secondary-text);
    --dd-hover: var(--color-control-bg);
    --dd-avatar-bg: var(--color-primary-100);
    --dd-danger: #e11d48;
    --dd-danger-bg: #fff1f2;
    --dd-danger-hover: #fff1f2;
    --dd-warn-bg: var(--color-pending-bg);
    --dd-warn-text: var(--color-pending-text);
    --dd-warn-icon: var(--color-pending-icon);
    --dd-wallet-bg: var(--color-surface);
    --dd-wallet-value: var(--color-text);
    --dd-shadow: 0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
    --dd-radius: 16px;
  }
  body.theme-dark .hdr-dd {
    --dd-bg: var(--color-surface);
    --dd-border: var(--color-border);
    --dd-text: var(--color-text);
    --dd-muted: var(--color-muted-text);
    --dd-secondary: var(--color-secondary-text);
    --dd-hover: rgba(255,255,255,0.05);
    --dd-avatar-bg: rgba(59,130,246,0.15);
    --dd-danger: #f87171;
    --dd-danger-bg: rgba(239,68,68,0.1);
    --dd-danger-hover: rgba(239,68,68,0.15);
    --dd-warn-bg: rgba(245,158,11,0.12);
    --dd-warn-text: #fbbf24;
    --dd-warn-icon: #f59e0b;
    --dd-wallet-bg: rgba(255,255,255,0.04);
    --dd-wallet-value: var(--color-text);
    --dd-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.25);
  }

  /* panel shell */
  .dd-panel {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    width: 272px;
    background: var(--dd-bg);
    border: 0.5px solid var(--dd-border);
    border-radius: var(--dd-radius);
    box-shadow: var(--dd-shadow);
    overflow: hidden;
    z-index: 20;
    animation: dd-in .16s cubic-bezier(.22,.68,0,1.15) both;
  }
  /* mobile: full-width anchored below header */
  @media (max-width: 639px) {
    .dd-panel {
      position: fixed;
      right: 12px;
      left: 12px;
      top: 64px;
      width: auto;
    }
  }
  @keyframes dd-in {
    from { opacity:0; transform: translateY(-6px) scale(.98); }
    to   { opacity:1; transform: none; }
  }

  .dd-section {
    padding: 14px 16px;
    border-bottom: 0.5px solid var(--dd-border);
  }
  .dd-name {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 600;
    color: var(--dd-text);
  }
  .dd-email {
    font-size: 11px; color: var(--dd-muted);
    margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* wallet mini-card inside dropdown */
  .dd-wallet {
    margin-top: 10px;
    border-radius: 12px;
    border: 0.5px solid var(--dd-border);
    background: var(--dd-wallet-bg);
    padding: 10px 12px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .dd-wallet-label {
    font-size: 10px; font-weight: 500;
    text-transform: uppercase; letter-spacing: .04em;
    color: var(--dd-muted);
  }
  .dd-wallet-value {
    font-size: 14px; font-weight: 700;
    color: var(--dd-wallet-value);
    margin-top: 2px;
  }
  .dd-wallet-right { text-align: right; }

  /* menu rows */
  .dd-link, .dd-btn {
    display: flex; align-items: center; gap: 12px;
    width: 100%;
    padding: 11px 16px;
    font-size: 13px; font-weight: 500;
    color: var(--dd-secondary);
    background: none; border: none; text-decoration: none;
    cursor: pointer;
    transition: background .12s;
    text-align: left;
  }
  .dd-link:hover, .dd-btn:hover { background: var(--dd-hover); }
  .dd-link + .dd-link, .dd-btn { border-top: 0.5px solid var(--dd-border); }

  /* icon chip */
  .dd-chip {
    width: 30px; height: 30px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    background: var(--dd-hover);
    font-size: 13px;
    color: var(--dd-muted);
  }

  /* impersonate row */
  .dd-btn--warn {
    background: var(--dd-warn-bg);
    color: var(--dd-warn-text);
    font-weight: 600;
  }
  .dd-btn--warn:hover { filter: brightness(.97); }
  .dd-btn--warn .dd-chip {
    background: var(--dd-warn-bg);
    color: var(--dd-warn-icon);
  }

  /* sign-out row */
  .dd-btn--danger { color: var(--dd-danger); }
  .dd-btn--danger:hover { background: var(--dd-danger-hover); }
  .dd-btn--danger .dd-chip {
    background: var(--dd-danger-bg);
    color: var(--dd-danger);
  }

  /* theme toggle */
  .hdr-theme-btn {
    display: flex; align-items: center; justify-content: center;
    width: 34px; height: 34px;
    border-radius: 10px;
    border: 0.5px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    transition: background .12s;
  }
  .hdr-theme-btn:hover { background: var(--color-control-bg); }

  /* avatar button */
  .hdr-avatar-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 8px 6px 6px;
    border-radius: 12px;
    border: 0.5px solid var(--color-border);
    background: var(--color-surface);
    cursor: pointer;
    transition: background .12s;
  }
  .hdr-avatar-btn:hover { background: var(--color-control-bg); }

  .hdr-avatar-circle {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700;
    background: var(--dd-avatar-bg);
    color: var(--color-text);
    flex-shrink: 0;
    position: relative;
  }
  .hdr-avatar-name {
    font-size: 13px; font-weight: 500;
    color: var(--color-text);
    max-width: 110px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* impersonation banner */
  .hdr-impersonate-bar {
    display: flex; align-items: center; justify-content: center;
    gap: 8px; padding: 6px 16px;
    font-size: 12px; font-weight: 600;
    background: var(--dd-warn-bg);
    color: var(--dd-warn-text);
  }
`;

// ─── Avatar Dropdown (shared between mobile + desktop) ───────────────────────

interface AvatarDropdownProps {
  initials: string;
  firstName: string;
  fullName?: string;
  email?: string;
  agentCode?: string;
  isImpersonating: boolean;
  canShowWallet: boolean;
  walletBalance: number;
  dailySpending: number;
  isLoadingWallet: boolean;
  isDailyLoading: boolean;
  onReturnToAdmin: () => void;
  onLogout: () => void;
  onClose: () => void;
}

const AvatarDropdown: React.FC<AvatarDropdownProps> = ({
  fullName, email, agentCode,
  isImpersonating, canShowWallet,
  walletBalance, dailySpending, isLoadingWallet, isDailyLoading,
  onReturnToAdmin, onLogout, onClose,
}) => (
  <>
    {/* backdrop */}
    <button
      className="fixed inset-0 z-10 cursor-default bg-transparent border-0"
      onClick={onClose}
      aria-label="Close menu"
    />

    <div className="hdr-dd dd-panel" role="menu">
      {/* user info */}
      <div className="dd-section">
        <div className="dd-name">
          <span className="truncate">{fullName}</span>
          {agentCode && (
            <Badge
              variant="subtle" size="xs" colorScheme="default"
              className="shrink-0 !rounded-full !px-1.5 !py-0.5 text-[10px]"
              useThemeColor
            >
              {agentCode}
            </Badge>
          )}
        </div>
        <div className="dd-email">{email}</div>

        {canShowWallet && (
          <div className="dd-wallet">
            <div>
              <div className="dd-wallet-label">Wallet</div>
              <div className="dd-wallet-value">
                {isLoadingWallet ? "—" : formatGHS(walletBalance)}
              </div>
            </div>
            <div className="dd-wallet-right">
              <div className="dd-wallet-label">Today</div>
              <div className="dd-wallet-value">
                {isDailyLoading || isLoadingWallet ? "—" : formatGHS(dailySpending)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* nav links */}
      {canShowWallet && (
        <>
          <Link to="/agent/dashboard/profile" className="dd-link" onClick={onClose}>
            <span className="dd-chip"><FaUser style={{ width: 13, height: 13 }} /></span>
            My Profile
          </Link>
          <Link to="/agent/dashboard/wallet" className="dd-link" onClick={onClose}>
            <span className="dd-chip"><FaWallet style={{ width: 13, height: 13 }} /></span>
            My Wallet
          </Link>
        </>
      )}

      {/* impersonation */}
      {isImpersonating && (
        <button className="dd-btn dd-btn--warn" onClick={onReturnToAdmin}>
          <span className="dd-chip"><FaSignOutAlt style={{ width: 13, height: 13 }} /></span>
          Return to Admin
        </button>
      )}

      {/* sign out */}
      <button className="dd-btn dd-btn--danger" onClick={onLogout}>
        <span className="dd-chip"><FaSignOutAlt style={{ width: 13, height: 13 }} /></span>
        Sign Out
      </button>
    </div>
  </>
);

// ─── main export ──────────────────────────────────────────────────────────────

export const Header = ({ onMenuClick, isScrolled = false }: HeaderProps) => {
  const { authState, logout, refreshAuth } = useAuth();
  const { walletBalance, refreshWallet, isLoading, connectionStatus } = useWallet();
  const { dailySpending, isLoading: dailySpendingLoading } = useDailySpending();
  const { siteStatus, refreshSiteStatus } = useSiteStatus();
  const { addToast } = useToast();
  const { themeMode, toggleThemeMode } = useTheme();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTogglingSite, setIsTogglingSite] = useState(false);

  const canShowWallet = canHaveWallet(authState.user?.userType ?? "");
  const isAdmin = isAdminUser(authState.user?.userType ?? "");
  const isImpersonating = ImpersonationService.isImpersonating();

  const firstName = authState.user?.fullName.split(" ")[0] ?? "";
  const initials =
    (authState.user?.fullName.charAt(0) ?? "") +
    (authState.user?.fullName.split(" ")[1]?.charAt(0) ?? "");

  // ── derived scroll styles (only affects colours, NOT structure) ──
  const scrolledBg = isScrolled ? "var(--color-surface)" : "transparent";
  const scrolledBorder = isScrolled ? "var(--color-border)" : "transparent";
  const scrolledShadow = isScrolled ? "0 10px 28px rgba(15,23,42,0.08)" : "none";
  const scrolledBlur = isScrolled ? "blur(8px)" : "none";

  // ── connection indicator ──
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

  // ── handlers ──
  const handleSiteToggle = async () => {
    if (authState.user?.userType !== "super_admin") return;
    setIsTogglingSite(true);
    try {
      await settingsService.toggleSiteStatus();
      await refreshSiteStatus();
    } catch { /* handled by service */ }
    finally { setIsTogglingSite(false); }
  };

  const handleReturnToAdmin = useCallback(async () => {
    try {
      await ImpersonationService.endImpersonation();
      setIsDropdownOpen(false);
      await refreshAuth();
      navigate("/superadmin");
    } catch {
      addToast("Failed to return to admin", "error");
    }
  }, [refreshAuth, navigate, addToast]);

  const handleLogout = useCallback(() => {
    setIsDropdownOpen(false);
    logout();
  }, [logout]);

  // ── site-status toast ──
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

  // shared dropdown props
  const dropdownProps: AvatarDropdownProps = {
    initials, firstName,
    fullName: authState.user?.fullName,
    email: authState.user?.email,
    agentCode: authState.user?.agentCode,
    isImpersonating,
    canShowWallet,
    walletBalance,
    dailySpending,
    isLoadingWallet: isLoading,
    isDailyLoading: dailySpendingLoading,
    onReturnToAdmin: handleReturnToAdmin,
    onLogout: handleLogout,
    onClose: () => setIsDropdownOpen(false),
  };

  const greeting = getGreeting();

  return (
    <>
      {/* inject scoped styles once */}
      <style>{DROPDOWN_STYLES}</style>

      {/* ── MOBILE HEADER (<md) ──────────────────────────────────── */}
      <header
        className="md:hidden sticky top-0 z-20 transition-all duration-300"
        style={{
          backgroundColor: scrolledBg,
          borderBottom: `1px solid ${scrolledBorder}`,
          boxShadow: scrolledShadow,
          backdropFilter: scrolledBlur,
        }}
      >
        <div className="flex items-center justify-between px-4" style={{ height: "56px" }}>

          {/* left: hamburger + greeting */}
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <button
              onClick={onMenuClick}
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ width: "36px", height: "36px", color: "var(--color-muted-text)" }}
              aria-label="Open menu"
            >
              <FaBars className="w-5 h-5" />
            </button>

            {/* greeting — static, renders once, no remount */}
            <div className="min-w-0 flex-1 animate-slide-in-from-bottom">
              <div className="flex items-center gap-2">
                <span className="text-sm flex-shrink-0">{greeting.emoji}</span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[var(--color-text)] truncate">
                    {greeting.text}, {firstName}
                  </div>
                  <div className="text-[11px] text-[var(--color-muted-text)] truncate">
                    Welcome back! 👋
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* right: theme toggle, bell, avatar */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleThemeMode}
              className="hdr-theme-btn"
              aria-label="Toggle theme"
            >
              {themeMode === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <NotificationDropdown />

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen((v) => !v)}
                className="hdr-avatar-circle hdr-dd"
                style={{ width: "36px", height: "36px", border: "2px solid var(--color-border)", cursor: "pointer" }}
                aria-label="User menu"
              >
                {initials}
                {isImpersonating && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse"
                    style={{ backgroundColor: "var(--color-pending-icon)" }}
                  />
                )}
              </button>
              {isDropdownOpen && <AvatarDropdown {...dropdownProps} />}
            </div>
          </div>
        </div>

        {/* impersonation banner */}
        {isImpersonating && (
          <div className="hdr-dd hdr-impersonate-bar">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--dd-warn-icon)" }}
            />
            Viewing as {authState.user?.fullName}
            <button
              onClick={handleReturnToAdmin}
              className="underline underline-offset-2 ml-1"
            >
              Return to Admin
            </button>
          </div>
        )}
      </header>

      {/* ── DESKTOP HEADER (md+) ─────────────────────────────────── */}
      <header
        className="hidden md:block sticky top-0 z-10 transition-all duration-300"
        style={{
          backgroundColor: scrolledBg,
          borderBottom: `1px solid ${scrolledBorder}`,
          borderRadius: "0 0 16px 16px",
          boxShadow: scrolledShadow,
          backdropFilter: scrolledBlur,
        }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">

            {/* greeting — static, no remount */}
            <div className="flex items-center gap-3 min-w-0 flex-1 animate-slide-in-from-bottom">
              <span className="text-xl flex-shrink-0">{greeting.emoji}</span>
              <div className="min-w-0">
                <div
                  className="font-semibold truncate"
                  style={{ fontSize: "16px", color: "var(--color-text)" }}
                >
                  {greeting.text}, {firstName}
                </div>
                <div className="text-xs" style={{ color: "var(--color-muted-text)" }}>
                  Welcome back! 👋
                </div>
              </div>
            </div>

            {/* right actions */}
            <div className="flex items-center gap-3 flex-shrink-0">

              {/* theme toggle */}
              <button
                onClick={toggleThemeMode}
                className="hdr-theme-btn"
                aria-label="Toggle theme"
                title={`Switch to ${themeMode === "light" ? "dark" : "light"} mode`}
              >
                {themeMode === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              {/* site toggle — admins only */}
              {isAdmin && (
                <button
                  onClick={handleSiteToggle}
                  disabled={isTogglingSite}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: siteStatus?.isSiteOpen
                      ? "rgba(16,185,129,0.15)"
                      : "rgba(244,63,94,0.15)",
                    color: siteStatus?.isSiteOpen ? "#6ee7b7" : "#fda4af",
                    border: `1px solid ${siteStatus?.isSiteOpen ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.25)"}`,
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

              {/* notifications */}
              <NotificationDropdown />

              {/* avatar + dropdown */}
              <div className="relative hdr-dd">
                <button
                  onClick={() => setIsDropdownOpen((v) => !v)}
                  className="hdr-avatar-btn"
                  aria-label="User menu"
                  aria-expanded={isDropdownOpen}
                >
                  <div className="hdr-avatar-circle">
                    {initials}
                    {isImpersonating && (
                      <span
                        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse"
                        style={{ backgroundColor: "#f59e0b" }}
                      />
                    )}
                  </div>
                  <span className="hdr-avatar-name">{firstName}</span>
                  <ChevronDown
                    className="w-4 h-4 transition-transform duration-200"
                    style={{
                      color: "var(--color-muted-text)",
                      transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>

                {isDropdownOpen && <AvatarDropdown {...dropdownProps} />}
              </div>
            </div>
          </div>

          {/* wallet strip — agent/reseller only */}
          {canShowWallet && (
            <button
              onClick={refreshWallet}
              className="mt-3 w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 hover:brightness-95 active:scale-[0.99]"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "0.5px solid var(--color-border)",
                boxShadow: "0 4px 14px rgba(15,23,42,0.06)",
              }}
              aria-label="Refresh wallet"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ width: "36px", height: "36px", backgroundColor: "var(--color-primary-50)" }}
                >
                  <FaWallet className="w-4 h-4" style={{ color: "var(--color-primary-600)" }} />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: "var(--color-muted-text)" }}>
                      Wallet Balance
                    </span>
                    <div className="flex items-center gap-1">
                      {getConnectionIcon()}
                      <span className="text-xs" style={{ color: "var(--color-muted-text)" }}>
                        {getConnectionText()}
                      </span>
                    </div>
                  </div>
                  <div
                    className="text-lg font-bold"
                    style={{ color: "var(--color-text)", fontFamily: "'Syne', sans-serif" }}
                  >
                    {isLoading ? "—" : formatGHS(walletBalance)}
                  </div>
                </div>
              </div>

              <div className="w-px h-10 flex-shrink-0" style={{ backgroundColor: "var(--color-border)" }} />

              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-medium" style={{ color: "var(--color-muted-text)" }}>
                  Today's Spending
                </div>
                <div
                  className="text-lg font-bold"
                  style={{ color: "var(--color-text)", fontFamily: "'Syne', sans-serif" }}
                >
                  {dailySpendingLoading || isLoading ? "—" : formatGHS(dailySpending)}
                </div>
              </div>
            </button>
          )}
        </div>
      </header>
    </>
  );
};