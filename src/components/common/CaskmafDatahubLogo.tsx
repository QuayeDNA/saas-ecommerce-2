import React from 'react';

interface CaskmafDatahubLogoProps {
  width?: number;
  height?: number;
  className?: string;
  /** Optional src to override the default generated logo */
  src?: string;
  /** Optional alt text for accessibility */
  alt?: string;
  /** When true, render an <img> using `src` instead of the inline SVG */
  useImage?: boolean;
}

const DEFAULT_LOGO_SRC = '/logo.png';

export const CaskmafDatahubLogo: React.FC<CaskmafDatahubLogoProps> = ({
  width = 80,
  height = 80,
  className = '',
  src = DEFAULT_LOGO_SRC,
  alt = 'Caskmaf Datahub',
}) => {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{ display: 'inline-block', objectFit: 'contain' }}
    />
  );
};

export const CaskmafDatahubLogoCompact: React.FC<CaskmafDatahubLogoProps> = ({
  width = 160,
  height = 40,
  className = '',
  src = DEFAULT_LOGO_SRC,
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`} style={{ width }}>
      <CaskmafDatahubLogo width={height} height={height} src={src} />
      <div
        className="flex items-center tracking-tight leading-none"
        style={{ fontSize: height * 0.45 }}
      >
        <span className="text-slate-900 dark:text-white font-extrabold">Caskmaf</span>
        <span className="text-[var(--caskmaf-gold)] font-semibold ml-1">Datahub</span>
      </div>
    </div>
  );
};

export const CaskmafDatahubIcon = CaskmafDatahubLogo;
export const CaskmafDatahubBadge = CaskmafDatahubLogo;
