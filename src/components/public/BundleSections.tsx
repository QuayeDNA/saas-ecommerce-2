import { memo } from "react";
import { FaStore, FaChevronDown } from "react-icons/fa6";
import { getProviderColors } from "../../utils/provider-colors";
import { getLogoUrl } from "./utils";
import { BundleCard } from "./BundleCard";
import { EmptyBundles } from "./StoreStates";
import AdBanner from "../../components/ads/ad-banner";
import type {
  PublicBundle,
  PublicStorefront,
} from "./types";

// =============================================================================
// Types
// =============================================================================

export interface BundleSectionsProps {
  storeData: PublicStorefront;
  groupedBundles: Map<string, Map<string, PublicBundle[]>>;
  searchTerm: string;
  selectedProvider: string;
  providers: Array<{ code: string; name: string; logo?: unknown }>;
  activeOrderBundleId: string | undefined;
  ordersClosed: boolean;
  collapsedPackages: Set<string>;
  onTogglePackage: (key: string) => void;
  onBuy: (bundle: PublicBundle) => void;
  onClearSearch: () => void;
}

// =============================================================================
// Package Section Header (collapsible)
// =============================================================================

const PackageHeader = memo(
  ({
    pkgName,
    count,
    collapsed,
    onToggle,
    color,
  }: {
    pkgName: string;
    count: number;
    collapsed: boolean;
    onToggle: () => void;
    color: string;
  }) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-xl shadow-sm hover:shadow-md transition-all text-left border border-[var(--color-border)]"
      aria-expanded={!collapsed}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
          style={{ backgroundColor: color }}
        >
          <FaStore className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="text-sm font-bold text-[var(--color-text)]">
            {pkgName}
          </div>
          <div className="text-xs text-[var(--color-muted-text)]">
            {count} bundle{count !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
      <div
        className="text-[var(--color-muted-text)] transition-transform duration-200"
        style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)" }}
      >
        <FaChevronDown className="w-4 h-4" />
      </div>
    </button>
  ),
);

// =============================================================================
// BundleSections
// =============================================================================

export const BundleSections = memo(({
  storeData,
  groupedBundles,
  searchTerm,
  selectedProvider,
  providers,
  activeOrderBundleId,
  ordersClosed,
  collapsedPackages,
  onTogglePackage,
  onBuy,
  onClearSearch,
}: BundleSectionsProps) => {
  if (groupedBundles.size === 0) {
    return (
      <EmptyBundles
        searchTerm={searchTerm}
        onClear={onClearSearch}
      />
    );
  }

  const AD_INTERVAL = 8;

  const renderPackageBundles = (bundles: PublicBundle[]) => {
    const items: React.ReactNode[] = [];
    bundles.forEach((b, idx) => {
      items.push(
        <BundleCard
          key={b._id}
          bundle={b}
          selected={activeOrderBundleId === b._id}
          disabled={ordersClosed}
          onBuy={onBuy}
        />
      );
      if ((idx + 1) % AD_INTERVAL === 0 && idx + 1 < bundles.length) {
        items.push(
          <div key={`ad-${idx}`} className="col-span-1 sm:col-span-3 lg:col-span-4">
            <AdBanner adSlot="YOUR_AD_SLOT_ID_C" adFormat="rectangle" />
          </div>
        );
      }
    });
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items}
      </div>
    );
  };

  // Prefer structured providers data from backend
  if (Array.isArray(storeData.providers) && storeData.providers.length > 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-5 space-y-8">
        {storeData.providers
          .filter(
            (p) => selectedProvider === "all" || p.code === selectedProvider,
          )
          .map((prov) => {
            const pc = getProviderColors(prov.code);
            const filteredPkgs = (prov.packages || [])
              .map((pkg) => ({
                ...pkg,
                bundles: (pkg.bundles || []).filter((b) => {
                  if (!searchTerm.trim()) return true;
                  const t = searchTerm.toLowerCase();
                  return (
                    b.name.toLowerCase().includes(t) ||
                    (b.description?.toLowerCase() || "").includes(t)
                  );
                }),
              }))
              .filter((p) => p.bundles.length > 0);
            if (!filteredPkgs.length) return null;
            const total = filteredPkgs.reduce(
              (s, p) => s + p.bundles.length,
              0,
            );
            return (
              <section key={prov.code}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow overflow-hidden"
                    style={{ backgroundColor: pc.primary, color: pc.text }}
                  >
                    {getLogoUrl(prov.logo) ? (
                      <img
                        src={getLogoUrl(prov.logo)}
                        alt={prov.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      prov.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[var(--color-text)]">
                      {prov.name}
                    </h2>
                    <p className="text-xs text-[var(--color-muted-text)]">
                      {total} bundle{total !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div
                  className="space-y-4 border-l-2 pl-4 ml-1"
                  style={{ borderColor: pc.primary + "25" }}
                >
                  {filteredPkgs.map((pkg) => {
                    const key = `${prov.code}-${pkg.name}`;
                    const collapsed = collapsedPackages.has(key);
                    return (
                      <div key={key} className="space-y-3">
                        <PackageHeader
                          pkgName={pkg.name}
                          count={pkg.bundles.length}
                          collapsed={collapsed}
                          onToggle={() => onTogglePackage(key)}
                          color={pc.primary}
                        />
                        {!collapsed && renderPackageBundles(pkg.bundles)}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
      </div>
    );
  }

  // Fallback: flat groupedBundles
  return (
    <div className="max-w-5xl mx-auto px-4 py-5 space-y-8">
      {Array.from(groupedBundles.entries()).map(([provCode, pkgMap]) => {
        const pc = getProviderColors(provCode);
        const provName =
          providers.find((p) => p.code === provCode)?.name || provCode;
        const total = Array.from(pkgMap.values()).reduce(
          (s, a) => s + a.length,
          0,
        );
        return (
          <section key={provCode}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow"
                style={{ backgroundColor: pc.primary, color: pc.text }}
              >
                {provName.charAt(0)}
              </div>
              <div>
                <h2 className="text-base font-black text-[var(--color-text)]">
                  {provName}
                </h2>
                <p className="text-xs text-[var(--color-muted-text)]">
                  {total} bundle{total !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div
              className="space-y-4 border-l-2 pl-4 ml-1"
              style={{ borderColor: pc.primary + "25" }}
            >
              {Array.from(pkgMap.entries()).map(([pkgName, bundles]) => {
                const key = `${provCode}-${pkgName}`;
                const collapsed = collapsedPackages.has(key);
                return (
                  <div key={key} className="space-y-3">
                    <PackageHeader
                      pkgName={pkgName}
                      count={bundles.length}
                      collapsed={collapsed}
                      onToggle={() => onTogglePackage(key)}
                      color={pc.primary}
                    />
                    {!collapsed && renderPackageBundles(bundles)}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
});
