import { memo, useState } from "react";
import { FaMagnifyingGlass, FaBoxOpen, FaXmark } from "react-icons/fa6";
import type { PublicStorefront, ThemeConfig, PublicBundle } from "./types";
import { withAlpha } from "./constants";
import { getProviderColors } from "../../utils/provider-colors";
import { getLogoUrl } from "./utils";

export interface StoreToolbarProps {
  theme: ThemeConfig;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  selectedProvider: string;
  onProviderChange: (v: string) => void;
  providers: Array<{ code: string; name: string; logo?: unknown }>;
  storeData: PublicStorefront;
  groupedBundles: Map<string, Map<string, PublicBundle[]>>;
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
  selectedProvider,
  onProviderChange,
  providers,
  storeData,
  groupedBundles,
  onOpenTrackDrawer,
  storeClosed,
  storeClosedMessage,
  storefrontsClosed,
  storefrontsClosedMessage,
  publicAnnouncements,
  dismissedAnnouncements,
  onDismissAnnouncement,
}: StoreToolbarProps) {
  const publicAnnouncement = publicAnnouncements.find(
    (a) => !dismissedAnnouncements.has(a._id),
  );

  const [announcementExpanded, setAnnouncementExpanded] = useState(false);

  return (
    <div
      className="sticky top-0 z-20 backdrop-blur-md border-b border-[var(--color-border)] shadow-sm"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-surface) 95%, transparent)",
      }}
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
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-text)] w-3.5 h-3.5 pointer-events-none" />
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

        {/* Provider carousel — only shown when multiple providers */}
        {providers.length > 1 && (
          <div className="-mx-4 px-4">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 snap-x">
              {/* All */}
              <button
                onClick={() => onProviderChange("all")}
                className="shrink-0 snap-start flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all"
                style={
                  selectedProvider === "all"
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
              {providers.map((prov) => {
                const pc = getProviderColors(prov.code);
                const isActive = selectedProvider === prov.code;
                const count = groupedBundles.get(prov.code)
                  ? Array.from(
                      groupedBundles.get(prov.code)!.values(),
                    ).reduce((s, a) => s + a.length, 0)
                  : 0;
                return (
                  <button
                    key={prov.code}
                    onClick={() => onProviderChange(prov.code)}
                    className="shrink-0 snap-start flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold border-2 transition-all"
                    style={
                      isActive
                        ? {
                            borderColor: pc.primary,
                            backgroundColor: pc.primary,
                            color: "#fff",
                          }
                        : {
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-surface)",
                            color: "var(--color-secondary-text)",
                          }
                    }
                  >
                    {getLogoUrl(prov.logo as { url?: string; alt?: string } | string | undefined) ? (
                      <img
                        src={getLogoUrl(prov.logo as { url?: string; alt?: string } | string | undefined)}
                        alt={prov.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ backgroundColor: pc.primary }}
                      >
                        {prov.name.charAt(0)}
                      </span>
                    )}
                    {prov.name} · {count}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
