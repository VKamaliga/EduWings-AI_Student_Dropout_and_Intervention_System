import React from 'react';
import Card from './Card';

export default function KpiCard({ title, value, percentage, icon: Icon, variant = 'purple', subtitle = '' }) {
  const themes = {
    purple: {
      iconBg: 'bg-[#7C5CFA]/10 text-[#7C5CFA] border border-[#7C5CFA]/20',
    },
    mint: {
      iconBg: 'bg-[#2F9E6F]/10 text-[#2F9E6F] border border-[#2F9E6F]/20',
    },
    amber: {
      iconBg: 'bg-[#C98A1B]/10 text-[#C98A1B] border border-[#C98A1B]/20',
    },
    pink: {
      iconBg: 'bg-[#D64550]/10 text-[#D64550] border border-[#D64550]/20',
    },
    red: {
      iconBg: 'bg-[#D64550]/10 text-[#D64550] border border-[#D64550]/20',
    },
  }[variant] || themes.purple;

  return (
    <Card className="relative hover:border-[#7C5CFA]/40 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${themes.iconBg}`}>
            {Icon && <Icon className="w-4 h-4" strokeWidth={1.5} />}
          </div>
          <div>
            <div className="text-xs font-medium text-[#52525F] dark:text-[#A0A0B0]">
              {title}
            </div>
            {subtitle && <div className="text-[11px] text-[#70707E] dark:text-[#6B6B7B]">{subtitle}</div>}
          </div>
        </div>

        {percentage !== undefined && percentage !== null && (
          <div className="px-2 py-0.5 rounded-md text-xs font-medium bg-black/5 dark:bg-white/5 border border-[#E5E5EB] dark:border-[#24242E] text-[#52525F] dark:text-[#A0A0B0]">
            {percentage}%
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#14141B] dark:text-[#ECECF1]">
          {value}
        </div>
      </div>
    </Card>
  );
}
