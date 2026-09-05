import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  // Unique ID for filters to avoid conflicts
  const id = React.useId();

  return (
    <div className={`relative inline-block ${className}`}>
      <svg
        viewBox="0 0 400 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
        aria-label="Kअlla Logo"
        style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.15))' }}
      >
        <defs>
          {/* 1. Heavy Canvas Texture (Sponge Effect) */}
          <filter id={filterTexture} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="4" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0" in="noise" result="coloredNoise" />
            <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
            <feBlend mode="multiply" in="composite" in2="SourceGraphic" />
          </filter>
          
          {/* 2. Rough Edge/Brush Filter for Text */}
          <filter id={filterRough} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" result="distorted" />
            <feGaussianBlur in="distorted" stdDeviation="0.5" result="blurred" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" in="blurred" result="goo" />
            <feComposite operator="atop" in="SourceGraphic" in2="goo" />
          </filter>

          {/* 3. Background Paint Blobs Pattern */}
          <radialGradient id={`grad-center-${id}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#FFD54F" /> {/* Yellow center */}
            <stop offset="100%" stopColor="#FF9800" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`grad-corner-${id}`} cx="0" cy="0" r="0.8">
            <stop offset="0%" stopColor="#FF5722" /> {/* Orange/Red corner */}
            <stop offset="100%" stopColor="#FF5722" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`grad-blue-${id}`} cx="1" cy="1" r="0.8">
            <stop offset="0%" stopColor="#0288D1" /> {/* Blue corner */}
            <stop offset="100%" stopColor="#0288D1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* --- Background Canvas --- */}
        {/* We create a bounding box with the colorful texture */}
        <g clipPath={`url(#clip-${id})`}>
            {/* Base Color */}
            <rect x="0" y="0" width="400" height="180" fill="#F57F17" />
            
            {/* Colorful Splashes simulating the reference background */}
            <rect x="0" y="0" width="400" height="180" fill={`url(#grad-center-${id})`} opacity="0.8" />
            <circle cx="0" cy="0" r="250" fill={`url(#grad-corner-${id})`} opacity="0.9" />
            <circle cx="400" cy="180" r="200" fill="#0277BD" opacity="0.6" filter="blur(40px)" />
            <circle cx="400" cy="0" r="150" fill="#D84315" opacity="0.7" filter="blur(30px)" />
            <circle cx="0" cy="180" r="180" fill="#0097A7" opacity="0.6" filter="blur(30px)" />
            
            {/* Noise Texture Overlay */}
            <rect x="0" y="0" width="400" height="180" fill="transparent" filter={`url(#filterTexture)`} opacity="0.5" />
            
            {/* Extra speckles */}
            <filter id={`speckles-${id}`}>
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" />
                <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 50 -40" />
            </filter>
            <rect x="0" y="0" width="400" height="180" filter={`url(#speckles-${id})`} opacity="0.1" />
        </g>

        {/* --- Main Text Group --- */}
        <g 
          fontFamily="'Montserrat', sans-serif" 
          fontWeight="900" 
          fontSize="130" 
          filter={`url(#${filterRough})`}
          style={{ mixBlendMode: 'normal' }} // Changed to normal to pop against the busy background
        >
            {/* K - Deep Blue */}
            <text x="30" y="135" fill="#01579B" stroke="#01579B" strokeWidth="2">K</text>
            
            {/* अ - Vibrant Orange - Centered */}
            <text x="120" y="135" fill="#E65100" stroke="#E65100" strokeWidth="2" fontFamily="'Noto Sans Devanagari', 'Arial', sans-serif">अ</text>
            
            {/* L - Green */}
            <text x="215" y="135" fill="#1B5E20" stroke="#1B5E20" strokeWidth="2">L</text>
            
            {/* L - Blue */}
            <text x="285" y="135" fill="#01579B" stroke="#01579B" strokeWidth="2">L</text>
            
            {/* a - Orange */}
            <text x="350" y="135" fill="#E65100" stroke="#E65100" strokeWidth="2" textAnchor="middle">a</text>
        </g>
        
        {/* --- Top Texture Overlay (to make text look painted ON the canvas) --- */}
        <rect x="0" y="0" width="400" height="180" fill="transparent" filter={`url(#${filterTexture})`} opacity="0.3" pointerEvents="none" style={{ mixBlendMode: 'multiply' }}/>

      </svg>
    </div>
  );
};
