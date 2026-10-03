import React from 'react';

interface ShieldLogoProps {
  className?: string;
  size?: number | string;
}

export function ShieldLogo({ className = 'h-10 w-10', size }: ShieldLogoProps) {
  const pixelSize = typeof size === 'number' ? size : 48;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <img
        src="/images/bidsure_icon.png"
        alt="BidSure Official Logo"
        width={pixelSize}
        height={pixelSize}
        className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(26,106,239,0.25)] select-none pointer-events-none"
      />
    </div>
  );
}

export default ShieldLogo;
