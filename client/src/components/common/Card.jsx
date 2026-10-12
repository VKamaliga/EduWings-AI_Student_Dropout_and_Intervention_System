import React from 'react';

export default function Card({ children, className = '', glow = false, noPadding = false, ...props }) {
  return (
    <div
      className={`rounded-lg transition-colors bg-white dark:bg-[#14141B] border border-[#E5E5EB] dark:border-[#24242E] shadow-sm dark:shadow-none relative ${
        noPadding ? '' : 'p-5 sm:p-6'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
