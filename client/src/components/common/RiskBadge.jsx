import React from 'react';

export default function RiskBadge({ level = 'Low', probability = null, size = 'md' }) {
  const normLevel = (level || 'Low').toUpperCase();

  const styles = {
    LOW: {
      pill: 'bg-[#2F9E6F]/12 text-[#248259] dark:text-[#2F9E6F] border border-[#2F9E6F]/25',
      label: 'Low',
      dot: 'bg-[#2F9E6F]',
    },
    MEDIUM: {
      pill: 'bg-[#C98A1B]/12 text-[#A66F13] dark:text-[#C98A1B] border border-[#C98A1B]/25',
      label: 'Medium',
      dot: 'bg-[#C98A1B]',
    },
    HIGH: {
      pill: 'bg-[#D64550]/12 text-[#C23641] dark:text-[#D64550] border border-[#D64550]/25',
      label: 'High',
      dot: 'bg-[#D64550]',
    },
  }[normLevel] || {
    pill: 'bg-black/5 dark:bg-white/5 text-[#52525F] dark:text-[#A0A0B0] border border-[#E5E5EB] dark:border-[#24242E]',
    label: level,
    dot: 'bg-[#70707E]',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-xs font-semibold',
  }[size] || 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md transition-colors ${sizeClasses} ${styles.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      <span>{styles.label}</span>
      {probability !== null && (
        <span className="opacity-80 font-normal">({Math.round(probability * 100)}%)</span>
      )}
    </span>
  );
}
