import React from 'react';

interface DirectDataLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export const DirectDataLogo: React.FC<DirectDataLogoProps> = ({
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
      {/* Rounded square background */}
      <rect width="100" height="100" rx="28" fill="#0057FF" />

      {/* Wifi arc — top */}
      <path
        d="M 26 52 Q 50 26 74 52"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />

      {/* Wifi arc — middle */}
      <path
        d="M 34 60 Q 50 42 66 60"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        opacity="0.72"
      />

      {/* Wifi dot — bottom */}
      <circle cx="50" cy="70" r="5.5" fill="white" />
    </svg>
  );
};

export const DirectDataLogoCompact: React.FC<DirectDataLogoProps> = ({
  width = 160,
  height = 40,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`} style={{ width }}>
      <DirectDataLogo width={height} height={height} />
      <span
        style={{
          fontSize: height * 0.5,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'white',
          lineHeight: 1,
        }}
      >
        DirectData
      </span>
    </div>
  );
};

export const DirectDataIcon = DirectDataLogo;
export const DirectDataBadge = DirectDataLogo;