import React from 'react'

interface LogoProps {
  className?: string
  variant?: 'light' | 'dark'
}

export const Logo: React.FC<LogoProps> = ({ className = '', variant = 'light' }) => (
  <span className={`font-display text-3xl font-semibold tracking-[-0.04em] ${variant === 'dark' ? 'text-obsidian' : 'text-ivory'} ${className}`} aria-label="KALAA">
    KALAA<span className="text-gold">.</span>
  </span>
)
