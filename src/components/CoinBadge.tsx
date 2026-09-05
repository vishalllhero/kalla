import React from 'react';

export const CoinBadge = ({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const dims = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-12 h-12';
  const fontSize = size === 'sm' ? 'text-[8px]' : size === 'md' ? 'text-[10px]' : 'text-sm';

  return (
    <div className={`relative ${dims} rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 shadow-lg flex items-center justify-center border border-yellow-200`}>
      <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
      <span className={`font-bold text-white ${fontSize} relative z-10`}>K</span>
    </div>
  );
};
