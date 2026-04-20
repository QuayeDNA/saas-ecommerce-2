import React from 'react';

interface CaskmafDatahubLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export const CaskmafDatahubLogo: React.FC<CaskmafDatahubLogoProps> = ({
  width = 80,
  height = 80,
  className = '',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main vertical pillar (The spine of the 'D') */}
      <rect
        x="18"
        y="16"
        width="16"
        height="68"
        rx="8"
        fill="currentColor"
        className="text-slate-900 dark:text-white"
      />

      {/* Inner data signal wave */}
      <path
        d="M 42 32 A 18 18 0 0 1 42 68"
        stroke="#0057FF"
        strokeWidth="12"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Outer data signal wave */}
      <path
        d="M 42 16 A 34 34 0 0 1 42 84"
        stroke="#0057FF"
        strokeWidth="12"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const CaskmafDatahubLogoCompact: React.FC<CaskmafDatahubLogoProps> = ({
  width = 160,
  height = 40,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`} style={{ width }}>
      <CaskmafDatahubLogo width={height} height={height} />
      <div
        className="flex items-center tracking-tight leading-none"
        style={{ fontSize: height * 0.45 }}
      >
        <span className="text-slate-900 dark:text-white font-extrabold">Caskmaf</span>
        <span className="text-[#0057FF] font-semibold">Datahub</span>
      </div>
    </div>
  );
};

export const CaskmafDatahubIcon = CaskmafDatahubLogo;
export const CaskmafDatahubBadge = CaskmafDatahubLogo;
