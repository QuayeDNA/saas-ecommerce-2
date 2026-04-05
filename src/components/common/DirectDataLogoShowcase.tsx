import React from 'react';
import { DirectDataLogo, DirectDataLogoCompact, DirectDataIcon, DirectDataBadge } from './DirectDataLogo';

export const DirectDataLogoShowcase: React.FC = () => {
  return (
    <div className="p-8 space-y-12 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
          DirectData Logo Showcase
        </h1>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Primary Light Mode */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Primary Logo</h2>
            <div className="flex justify-center p-6 bg-slate-100 dark:bg-slate-900 rounded-2xl">
              <DirectDataLogo width={120} height={120} />
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Minimalist 'D' monogram crossed with data network waves.
            </p>
          </div>

          {/* Compact Light Mode */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Compact Logo</h2>
            <div className="flex justify-center items-center p-6 bg-slate-100 dark:bg-slate-900 rounded-2xl">
              <DirectDataLogoCompact width={220} height={54} />
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              A horizontal typography variation optimized for navigation bars and headers.
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mt-8">
          {/* Dark Mode Showcase */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-white mb-4">Dark Mode Adaptability</h2>
            <div className="flex flex-col gap-6 justify-center items-center p-6 bg-slate-900 rounded-2xl dark">
              <DirectDataLogoCompact width={220} height={54} className="text-white" />
              <DirectDataLogo width={80} height={80} className="text-white" />
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Demonstrates automatic text and icon fill adaptation using Tailwind's <code>dark:text-white</code> and <code>currentColor</code> base.
            </p>
          </div>

          {/* Icon & Badge Forms */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm text-center flex flex-col items-center justify-center">
            <div className="flex gap-12">
              <div>
                <DirectDataIcon width={64} height={64} />
                <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">App Icon</h3>
              </div>
              <div>
                <DirectDataBadge width={48} height={48} />
                <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">Favicon/Badge</h3>
              </div>
            </div>
            <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
              Scales down cleanly while preserving the brand's core data-wave identity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
