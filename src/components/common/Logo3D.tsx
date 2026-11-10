import React from 'react';

interface Logo3DProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const Logo3D: React.FC<Logo3DProps> = ({ size = 'md', className = '', onClick }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-24 h-24 sm:w-28 sm:h-28'
  }[size];

  return (
    <div
      onClick={onClick}
      className={`logo-3d-wrap logo-3d-float relative flex items-center justify-center cursor-pointer group select-none shrink-0 ${sizeClasses} ${className}`}
      title="SUKA SRI ORIGINALS — Official Brand Emblem"
    >
      {/* 1. Golden Glowing Light Halo around the Logo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-gold-500/35 via-amber-400/50 to-gold-400/30 blur-md gold-halo-pulse pointer-events-none group-hover:scale-125 group-hover:opacity-100 transition-all duration-500" />
      <div className="absolute -inset-1.5 rounded-full bg-gold-400/20 blur-xl pointer-events-none" />

      {/* 2. 3D Rotating Emblem Container */}
      <div className="logo-3d-inner relative w-full h-full flex items-center justify-center">
        {/* Front Face of Emblem */}
        <div
          className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden] [transform:translateZ(3px)] drop-shadow-[0_0_12px_rgba(255,215,0,0.65)]"
        >
          <img
            src="/images/suka-sri-logo.png"
            alt="SUKA SRI ORIGINALS"
            className="w-full h-full object-contain filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
          />
        </div>

        {/* Back Face of Emblem (Rotated 180deg with text reading correctly from behind!) */}
        <div
          className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(3px)] drop-shadow-[0_0_12px_rgba(255,215,0,0.65)]"
        >
          <img
            src="/images/suka-sri-logo.png"
            alt="SUKA SRI ORIGINALS"
            className="w-full h-full object-contain filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
          />
        </div>

        {/* 3D Metallic Edge Rings to simulate physical coin depth */}
        <div className="absolute inset-1 rounded-full border border-gold-500/50 [transform:translateZ(1.5px)] pointer-events-none opacity-80" />
        <div className="absolute inset-1 rounded-full border border-amber-600/40 [transform:translateZ(0px)] pointer-events-none opacity-70" />
        <div className="absolute inset-1 rounded-full border border-gold-400/40 [transform:translateZ(-1.5px)] pointer-events-none opacity-80" />
      </div>
    </div>
  );
};
