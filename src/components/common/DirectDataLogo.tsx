import React from 'react';

interface DirectDataLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export const DirectDataLogo: React.FC<DirectDataLogoProps> = ({
  width = 200,
  height = 180,
  className = '',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.25" />
        </filter>
      </defs>

      <rect x="18" y="20" width="184" height="124" rx="32" fill="url(#backgroundGradient)" filter="url(#shadow)" />
      <path d="M64 42 H102 C128 42 142 66 142 90 S128 138 102 138 H64 V42 Z" fill="#ffffff" opacity="0.9" />
      <path d="M64 42 H102 C120 42 132 60 132 90 C132 120 120 138 102 138 H64 V42 Z" stroke="url(#strokeGradient)" strokeWidth="10" fill="none" strokeLinejoin="round" />

      <rect x="148" y="54" width="14" height="48" rx="7" fill="#38bdf8" opacity="0.95" />
      <rect x="148" y="106" width="14" height="24" rx="7" fill="#38bdf8" opacity="0.75" />
      <rect x="164" y="70" width="8" height="38" rx="4" fill="#7dd3fc" opacity="0.85" />
      <rect x="176" y="84" width="6" height="22" rx="3" fill="#bae6fd" opacity="0.8" />

      <circle cx="172" cy="36" r="8" fill="#38bdf8" />
      <circle cx="172" cy="36" r="4" fill="#ffffff" />

      <path d="M58 62 C69 52 84 52 95 62" stroke="#ffffff" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M58 82 C75 72 94 72 110 82" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.35" />

      <text x="110" y="158" textAnchor="middle" fill="url(#textGradient)" fontSize="26" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontWeight="700" letterSpacing="-0.04em">
        DirectData
      </text>
    </svg>
  );
};

export const DirectDataLogoCompact: React.FC<DirectDataLogoProps> = ({
  width = 220,
  height = 60,
  className = '',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="compactGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="compactText" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>

      <rect x="6" y="10" width="44" height="40" rx="14" fill="url(#compactGradient)" />
      <path d="M18 25 H30 C38 25 44 31 44 39 C44 47 38 53 30 53 H18 V25 Z" fill="#ffffff" opacity="0.9" />
      <path d="M18 25 H30 C36 25 42 31 42 39 C42 47 36 53 30 53 H18 V25 Z" stroke="#38bdf8" strokeWidth="6" fill="none" strokeLinejoin="round" />
      <rect x="46" y="34" width="9" height="14" rx="4" fill="#38bdf8" opacity="0.9" />
      <rect x="58" y="38" width="6" height="10" rx="3" fill="#7dd3fc" opacity="0.85" />

      <text x="116" y="38" fill="url(#compactText)" fontSize="28" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontWeight="700" letterSpacing="-0.02em">
        DirectData
      </text>
    </svg>
  );
};

export const DirectDataIcon: React.FC<DirectDataLogoProps> = ({
  width = 48,
  height = 48,
  className = '',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#iconGradient)" />
      <path d="M16 18 H26 C31 18 34 22 34 26 C34 30 31 34 26 34 H16 V18 Z" fill="#ffffff" opacity="0.92" />
      <path d="M16 18 H26 C30 18 33 21 33 26 C33 31 30 34 26 34 H16 V18 Z" stroke="#38bdf8" strokeWidth="4" fill="none" strokeLinejoin="round" />
      <rect x="29" y="22" width="4" height="10" rx="2" fill="#7dd3fc" />
      <circle cx="34" cy="16" r="2" fill="#ffffff" opacity="0.9" />
    </svg>
  );
};

export const DirectDataBadge: React.FC<DirectDataLogoProps> = ({
  width = 32,
  height = 32,
  className = '',
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>

      <rect width="32" height="32" rx="10" fill="url(#badgeGradient)" />
      <text x="16" y="21" textAnchor="middle" fill="#ffffff" fontSize="14" fontFamily="system-ui, sans-serif" fontWeight="700">
        DD
      </text>
    </svg>
  );
};
