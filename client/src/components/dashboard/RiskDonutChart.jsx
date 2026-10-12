import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../common/Card';

export default function RiskDonutChart({ data = [] }) {
  const chartData = data && data.length > 0 ? data.map(d => ({
    ...d,
    color: d.name.toLowerCase().includes('high')
      ? '#D64550'
      : d.name.toLowerCase().includes('medium')
      ? '#C98A1B'
      : '#2F9E6F'
  })) : [
    { name: 'Low Risk', value: 65, percentage: 65, color: '#2F9E6F' },
    { name: 'Medium Risk', value: 22, percentage: 22, color: '#C98A1B' },
    { name: 'High Risk', value: 13, percentage: 13, color: '#D64550' },
  ];

  return (
    <Card className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-[#14141B] dark:text-[#ECECF1] tracking-tight">
          Risk Distribution
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
                      <div className="bg-white dark:bg-[#14141B] px-3 py-2 rounded-md border border-[#E5E5EB] dark:border-[#24242E] text-xs shadow-sm dark:shadow-none">
                        <div className="font-medium text-[#14141B] dark:text-[#ECECF1]">{item.name}</div>
                        <div className="text-[#52525F] dark:text-[#A0A0B0]">
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
                paddingAngle={2}
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
        <div className="sm:col-span-6 space-y-3 pr-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#52525F] dark:text-[#A0A0B0] font-normal">
                  {item.name}
                </span>
              </div>
              <span className="font-semibold text-[#14141B] dark:text-[#ECECF1]">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
