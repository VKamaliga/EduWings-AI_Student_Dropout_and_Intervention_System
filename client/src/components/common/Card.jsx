import React from 'react';

export default function Card({ children, className = '', glow = false, noPadding = false, ...props }) {
  return (
    <div
      className={`rounded-2xl transition-all duration-200 glass-panel relative ${
        glow ? 'shadow-glass-glow' : ''
      } ${noPadding ? '' : 'p-5 sm:p-6'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
