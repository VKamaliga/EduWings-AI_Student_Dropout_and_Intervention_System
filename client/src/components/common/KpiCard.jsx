import React from 'react';
import Card from './Card';

export default function KpiCard({ title, value, percentage, icon: Icon, variant = 'purple', subtitle = '' }) {
  const themes = {
    purple: {
      iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30',
      titleColor: 'text-purple-900 dark:text-purple-200',
      valueColor: 'text-slate-900 dark:text-white',
      accentGlow: 'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-purple-500/10 before:to-transparent before:pointer-events-none',
    },
    mint: {
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
      titleColor: 'text-emerald-800 dark:text-emerald-300',
      valueColor: 'text-slate-900 dark:text-white',
      accentGlow: 'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-emerald-500/10 before:to-transparent before:pointer-events-none',
    },
    amber: {
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30',
      titleColor: 'text-amber-800 dark:text-amber-200',
      valueColor: 'text-slate-900 dark:text-white',
      accentGlow: 'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-amber-500/10 before:to-transparent before:pointer-events-none',
    },
    pink: {
      iconBg: 'bg-pink-500/20 text-pink-600 dark:text-pink-300 border border-pink-500/35',
      titleColor: 'text-pink-800 dark:text-pink-300',
      valueColor: 'text-slate-900 dark:text-white',
      accentGlow: 'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-pink-500/15 before:to-transparent before:pointer-events-none',
    },
  }[variant] || themes.purple;

  return (
    <Card className={`relative overflow-hidden group hover:border-purple-400/40 transition-all ${themes.accentGlow}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${themes.iconBg}`}>
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${themes.titleColor}`}>
              {title}
            </div>
            {subtitle && <div className="text-[11px] text-slate-400">{subtitle}</div>}
          </div>
        </div>

        {percentage !== undefined && percentage !== null && (
          <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300">
            {percentage}%
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${themes.valueColor}`}>
          {value}
        </div>
      </div>
    </Card>
  );
}
