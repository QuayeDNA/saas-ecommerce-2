import { memo, useEffect, useRef, useState } from "react";
import { FaMagnifyingGlass, FaBoxOpen, FaXmark } from "react-icons/fa6";
import type { PublicStorefront, ThemeConfig } from "./types";
import { withAlpha } from "./constants";

export interface StoreToolbarProps {
  theme: ThemeConfig;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  selectedPackage: string;
  onSelectPackage: (v: string) => void;
  packages: Array<{ name: string; count: number }>;
  storeData: PublicStorefront;
  onOpenTrackDrawer: () => void;
  storeClosed: boolean;
  storeClosedMessage: string;
  storefrontsClosed: boolean;
  storefrontsClosedMessage: string;
  publicAnnouncements: any[];
  dismissedAnnouncements: Set<string>;
  onDismissAnnouncement: (id: string) => void;
}

export const StoreToolbar = memo(function StoreToolbar({
  theme,
  searchTerm,
  onSearchChange,
  selectedPackage,
  onSelectPackage,
  packages,
  storeData,
  onOpenTrackDrawer,
  storeClosed,
  storeClosedMessage,
  storefrontsClosed,
  storefrontsClosedMessage,
  publicAnnouncements,
  dismissedAnnouncements,
  onDismissAnnouncement,
}: StoreToolbarProps) {
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: [0] },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const publicAnnouncement = publicAnnouncements.find(
    (a) => !dismissedAnnouncements.has(a._id),
  );

  const [announcementExpanded, setAnnouncementExpanded] = useState(false);

  return (
    <>
      <div ref={sentinelRef} className="h-px pointer-events-none" />
      <div
        className={`sticky top-0 z-20 store-toolbar${isStuck ? " store-toolbar--stuck" : ""}`}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">
          {publicAnnouncement && (
            <div
              className="rounded-xl bg-[var(--color-primary-50)] border border-[var(--color-border)] p-3 text-sm text-[var(--color-text)] cursor-pointer select-none"
              onClick={() => setAnnouncementExpanded((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setAnnouncementExpanded((prev) => !prev);
                }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={announcementExpanded}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold text-xs uppercase tracking-wider text-[var(--color-primary-700)]">
                  {publicAnnouncement.title}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismissAnnouncement(publicAnnouncement._id);
                  }}
                  className="shrink-0 transition-opacity hover:opacity-70 p-0.5 text-[var(--color-primary-700)]"
                  aria-label="Dismiss announcement"
                >
                  <FaXmark className="w-4 h-4" />
                </button>
              </div>
              <div
                className="mt-1.5 text-xs transition-all overflow-hidden text-[var(--color-muted-text)]"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: announcementExpanded ? "unset" : 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {publicAnnouncement.message}
              </div>
            </div>
          )}
          {storeClosed && (
            <div className="rounded-xl bg-[var(--color-pending-bg)] border border-[var(--color-border)] p-3 text-sm text-[var(--color-pending-text)]">
              <strong className="font-semibold">
                Store temporarily closed:
              </strong>{" "}
              {storeClosedMessage}
            </div>
          )}
          {storefrontsClosed && (
            <div className="rounded-xl bg-[var(--color-pending-bg)] border border-[var(--color-border)] p-3 text-sm text-[var(--color-pending-text)]">
              <strong className="font-semibold">
                Storefronts closed by admin:
              </strong>{" "}
              {storefrontsClosedMessage}
            </div>
          )}
          {/* Search + view toggle row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: isStuck ? "var(--color-muted-text)" : "rgba(255,255,255,0.55)" }} />
              <input
                type="search"
                placeholder="Search bundles…"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition placeholder:text-[var(--color-muted-text)]"
                style={
                  {
                    "--tw-ring-color": withAlpha(theme.primary, 25),
                  } as React.CSSProperties
                }
              />
            </div>
            <button
              onClick={onOpenTrackDrawer}
              title="Track my orders"
              className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-secondary-text)] hover:bg-[var(--color-control-bg)] transition whitespace-nowrap"
            >
              <FaBoxOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">My Orders</span>
            </button>
          </div>

          {/* Package carousel — only shown when multiple packages */}
          {packages.length > 1 && (
            <div className="-mx-4 px-4">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 snap-x">
                {/* All */}
                <button
                  onClick={() => onSelectPackage("all")}
                  className="shrink-0 snap-start flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all"
                  style={
                    selectedPackage === "all"
                      ? {
                          borderColor: theme.primary,
                          backgroundColor: theme.primary,
                          color: "#fff",
                        }
                      : {
                          borderColor: "var(--color-border)",
                          backgroundColor: "var(--color-surface)",
                          color: "var(--color-secondary-text)",
                        }
                  }
                >
                  All · {storeData?.bundles.length ?? 0}
                </button>
                {packages.map((pkg) => {
                  const isActive = selectedPackage === pkg.name;
                  return (
                    <button
                      key={pkg.name}
                      onClick={() => onSelectPackage(pkg.name)}
                      className="shrink-0 snap-start flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold border-2 transition-all"
                      style={
                        isActive
                          ? {
                              borderColor: theme.primary,
                              backgroundColor: theme.primary,
                              color: "#fff",
                            }
                          : {
                              borderColor: "var(--color-border)",
                              backgroundColor: "var(--color-surface)",
                              color: "var(--color-secondary-text)",
                            }
                      }
                    >
                      {pkg.name} · {pkg.count}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .store-toolbar {
          background: rgba(0, 0, 0, 0.25);
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
          transition: background 350ms ease,
                      border-color 350ms ease,
                      box-shadow 350ms ease;
        }

        .store-toolbar input::placeholder {
          color: rgba(255, 255, 255, 0.45);
        }

        .store-toolbar--stuck input::placeholder {
          color: var(--color-muted-text);
        }

        .store-toolbar--stuck {
          background: var(--color-surface, #FFFFFF);
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          border-bottom: 1px solid var(--color-border, #D4D8DC);
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }

        @media (prefers-reduced-motion: reduce) {
          .store-toolbar { transition: none !important; }
        }
      `}</style>
    </>
  );
});
