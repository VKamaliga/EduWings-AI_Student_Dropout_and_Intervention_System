import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../common/Card';

export default function RiskDonutChart({ data = [] }) {
  const chartData = data && data.length > 0 ? data : [
    { name: 'Low Risk', value: 65, percentage: 65, color: '#34D399' },
    { name: 'Medium Risk', value: 22, percentage: 22, color: '#FBBF24' },
    { name: 'High Risk', value: 13, percentage: 13, color: '#EC4899' },
  ];

  return (
    <Card className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          Risk Distribution <span className="text-xs font-normal text-slate-400"></span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-2 my-auto">
        {/* Donut Chart */}
        <div className="sm:col-span-6 h-52 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="glass-panel px-3 py-2 rounded-xl border border-purple-500/30 text-xs shadow-xl">
                        <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-slate-600 dark:text-slate-300">
                          {item.value} students ({item.percentage}%)
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="sm:col-span-6 space-y-3.5 pr-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm">
                  {item.name}
                </span>
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
