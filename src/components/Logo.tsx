import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 48, showText = true, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e87c8a" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        {/* K stylized with heart */}
        <path
          d="M25 15 L25 85 M25 50 L55 15 M25 50 L60 85"
          stroke="url(#logoGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Heart shape integrated */}
        <path
          d="M55 55 C55 50 60 45 67 45 C75 45 80 52 80 60 C80 72 67 82 67 82 C67 82 55 72 55 60 C55 58 55 56 55 55 Z"
          stroke="url(#logoGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showText && (
        <span className="text-2xl font-bold gradient-text" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Kupido
        </span>
      )}
    </div>
  );
};

export default Logo;
