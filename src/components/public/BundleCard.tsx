import { memo } from "react";
import { getProviderColors } from "../../utils/provider-colors";
import type { PublicBundle } from "./types";
import { fmt, fmtValidity } from "./utils";
import { FaCircleCheck, FaIdCard, FaWifi, FaBagShopping } from "react-icons/fa6";

export const BundleCard = memo(
  ({
    bundle,
    selected,
    onBuy,
    disabled,
  }: {
    bundle: PublicBundle;
    selected: boolean;
    onBuy: (b: PublicBundle) => void;
    disabled?: boolean;
  }) => {
    const pc = getProviderColors(bundle.provider);
    const isAfa = bundle.provider?.toUpperCase() === "AFA";
    const hasData = bundle.dataVolume != null && bundle.dataVolume > 0;

    return (
      <article
        onClick={disabled ? undefined : () => onBuy(bundle)}
        className={`group relative rounded-2xl overflow-hidden transition-all duration-300 select-none ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-[1.04] hover:-translate-y-1 active:scale-[0.97]"}`}
        style={{
          background: `linear-gradient(145deg, ${pc.primary}, ${pc.secondary})`,
          boxShadow: selected
            ? `0 0 0 3px #fff, 0 0 0 5px ${pc.primary}, 0 16px 40px ${pc.primary}55`
            : `0 6px 20px ${pc.primary}40`,
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => !disabled && e.key === "Enter" && onBuy(bundle)}
        aria-label={`${disabled ? "Orders paused" : `Buy ${bundle.name} — ${fmt(bundle.price)}`}`}
        aria-disabled={disabled}
      >
        {/* Top shimmer edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
        {/* Background circle decoration */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />

        {/* Selected indicator */}
        {selected && (
          <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
            <FaCircleCheck className="w-4 h-4" style={{ color: pc.primary }} />
          </div>
        )}

        <div className="relative p-4 text-white space-y-3">
          {/* Provider + AFA badge */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-75">
              {bundle.providerName}
            </span>
            {isAfa && bundle.requiresGhanaCard && (
              <span className="text-[9px] bg-white/20 rounded-full px-1.5 py-0.5 font-semibold flex items-center gap-0.5">
                <FaIdCard className="w-2 h-2" /> ID
              </span>
            )}
          </div>

          {/* Data volume — hero */}
          <div>
            {hasData ? (
              <>
                <div className="leading-none">
                  <span className="text-4xl font-black tracking-tight">
                    {bundle.dataVolume}
                  </span>
                  <span className="text-xl font-bold ml-1 opacity-80">
                    {bundle.dataUnit}
                  </span>
                </div>
                <div className="text-xs opacity-60 mt-0.5 truncate font-medium">
                  {bundle.name}
                </div>
              </>
            ) : (
              <div className="text-base font-black leading-snug line-clamp-2">
                {bundle.name}
              </div>
            )}
          </div>

          {/* Validity pill */}
          <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1 text-[11px] font-semibold">
            <FaWifi className="w-2.5 h-2.5 opacity-75" />
            {fmtValidity(bundle.validity, bundle.validityUnit)}
          </div>

          {/* Bottom: price + buy CTA */}
          <div className="flex items-center justify-between border-t border-white/15 pt-3">
            <span className="text-xl font-extrabold">{fmt(bundle.price)}</span>
            <div
              className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5 text-xs font-black shadow transition-all group-hover:shadow-lg"
              style={{ color: pc.primary }}
            >
              <FaBagShopping className="w-3 h-3" /> Buy
            </div>
          </div>
        </div>
      </article>
    );
  },
);
