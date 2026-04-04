import React from 'react';
import { DirectDataLogo, DirectDataLogoCompact, DirectDataIcon, DirectDataBadge } from './DirectDataLogo';

export const DirectDataLogoShowcase: React.FC = () => {
  return (
    <div className="p-8 space-y-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">
          DirectData Logo Showcase
        </h1>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Primary Logo</h2>
            <div className="flex justify-center p-6 bg-slate-100 rounded-2xl">
              <DirectDataLogo width={160} height={140} />
            </div>
            <p className="mt-4 text-sm text-slate-600">
              A bold monogram and dynamic data bars designed for the DirectData brand.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Compact Logo</h2>
            <div className="flex justify-center items-center p-6 bg-slate-100 rounded-2xl">
              <DirectDataLogoCompact width={180} height={54} />
            </div>
            <p className="mt-4 text-sm text-slate-600">
              A horizontal variation optimized for navigation bars and headers.
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
            <DirectDataIcon width={80} height={80} />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Icon</h3>
            <p className="mt-2 text-sm text-slate-600">A small, versatile icon for avatars and app tabs.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
            <DirectDataBadge width={80} height={80} />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Badge</h3>
            <p className="mt-2 text-sm text-slate-600">A minimal badge for compact brand placement.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
