import React from 'react';

export default function RiskBadge({ level = 'Low', probability = null, size = 'md' }) {
  const normLevel = (level || 'Low').toUpperCase();

  const styles = {
    LOW: {
      pill: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/35',
      label: 'Low',
      dot: 'bg-emerald-400',
    },
    MEDIUM: {
      pill: 'bg-amber-500/15 text-amber-300 border border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/35',
      label: 'Medium',
      dot: 'bg-amber-400',
    },
    HIGH: {
      pill: 'bg-pink-500/20 text-pink-300 border border-pink-500/40 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/40',
      label: 'High',
      dot: 'bg-pink-400',
    },
  }[normLevel] || {
    pill: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
    label: level,
    dot: 'bg-slate-400',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs font-semibold',
    lg: 'px-4 py-1.5 text-sm font-bold tracking-wide uppercase',
  }[size] || 'px-3 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full backdrop-blur-sm transition-all ${sizeClasses} ${styles.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      <span>{styles.label}</span>
      {probability !== null && (
        <span className="opacity-80 font-normal">({Math.round(probability * 100)}%)</span>
      )}
    </span>
  );
}
