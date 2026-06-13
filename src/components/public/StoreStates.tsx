import { memo } from "react";
import { Skeleton } from "../../design-system";
import type { ThemeConfig } from "./types";
import { FaTriangleExclamation, FaWifi } from "react-icons/fa6";

/** Shimmering skeleton that exactly mirrors final card shape */
export const BundleCardSkeleton = memo(() => (
  <div className="rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)]">
    <div className="h-1 bg-[var(--color-control-bg)]" />
    <div className="p-4 space-y-3">
      <Skeleton height="1.75rem" width="60%" />
      <Skeleton height="0.9rem" width="80%" />
      <div className="flex gap-2 pt-1">
        <Skeleton height="1.3rem" width="3rem" />
        <Skeleton height="1.3rem" width="4rem" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton height="1.5rem" width="5rem" />
        <Skeleton height="2rem" width="4.5rem" />
      </div>
    </div>
  </div>
));

// =============================================================================
// Full Loading Skeleton
// =============================================================================

export const StoreSkeleton = memo(({ theme }: { theme: ThemeConfig }) => (
  <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
    {/* Hero skeleton */}
    <div
      className="h-48 sm:h-64"
      style={{ background: theme.gradient, opacity: 0.15 }}
    />
    <div className="max-w-5xl mx-auto px-4 -mt-8 space-y-6">
      {/* Popular row skeleton */}
      <div className="bg-[var(--color-surface)] rounded-2xl p-4 shadow-[var(--shadow-card)] border border-[var(--color-border)]">
        <Skeleton height="1rem" width="160px" className="mb-3" />
        <div className="flex gap-3 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-36 h-28 rounded-2xl bg-[var(--color-control-bg)] animate-pulse"
            />
          ))}
        </div>
      </div>
      {/* Bundle cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <BundleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
));

// =============================================================================
// Error / Empty States
// =============================================================================

export const StoreError = memo(
  ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-6 text-[var(--color-text)]">
      <div className="max-w-sm w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-failed-bg)] flex items-center justify-center mx-auto">
          <FaTriangleExclamation className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            Store unavailable
          </h2>
          <p className="text-sm text-[var(--color-muted-text)] mt-2">{error}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl text-[var(--color-surface)] font-semibold text-sm transition active:scale-95"
            style={{ backgroundColor: "var(--color-primary-900)" }}
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm border border-[var(--color-border)] hover:bg-[var(--color-control-bg)] transition"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  ),
);

export const EmptyBundles = memo(
  ({ searchTerm, onClear }: { searchTerm: string; onClear: () => void }) => (
    <div className="py-20 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-control-bg)] flex items-center justify-center mx-auto mb-4 border border-[var(--color-border)]">
        <FaWifi className="w-8 h-8 text-[var(--color-muted-text)]" />
      </div>
      {searchTerm ? (
        <>
          <h3 className="text-lg font-bold text-[var(--color-text)]">
            No results for "{searchTerm}"
          </h3>
          <p className="text-sm text-[var(--color-muted-text)] mt-1 mb-4">
            Try different keywords or clear the search.
          </p>
          <button
            onClick={onClear}
            className="px-4 py-2 rounded-xl text-[var(--color-surface)] text-sm font-semibold transition"
            style={{ backgroundColor: "var(--color-primary-900)" }}
          >
            Clear search
          </button>
        </>
      ) : (
        <>
          <p className="text-[var(--color-muted-text)] font-medium">
            No bundles available right now
          </p>
          <p className="text-sm text-[var(--color-secondary-text)] mt-2">
            The store owner may not have activated any bundles yet. Check back
            later or contact them for assistance.
          </p>
        </>
      )}
    </div>
  ),
);
