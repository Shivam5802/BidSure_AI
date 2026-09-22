import React from 'react';

interface ShieldLogoProps {
  className?: string;
  size?: number | string;
}

export function ShieldLogo({ className = 'h-10 w-10', size }: ShieldLogoProps) {
  const sizeProps = size ? { width: size, height: size } : {};

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      {...sizeProps}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>

      {/* Main Blue Shield */}
      <path
        d="M50 6 C68 6 86 12 86 12 C86 48 73 78 50 94 C27 78 14 48 14 12 C14 12 32 6 50 6 Z"
        fill="url(#shieldGrad)"
      />

      {/* Inner White Shield Line */}
      <path
        d="M50 14 C64 14 78 19 78 19 C78 46 68 70 50 84 C32 70 22 46 22 19 C22 19 36 14 50 14 Z"
        stroke="#FFFFFF"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />

      {/* Center White Checkmark */}
      <path
        d="M36 49 L46 59 L65 37"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default ShieldLogo;
