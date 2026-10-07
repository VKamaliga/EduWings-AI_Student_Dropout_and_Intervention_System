import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import RiskBadge from '../common/RiskBadge';

export default function AtRiskStudentsTable({ students = [], selectedStudentId, onSelectStudent }) {
  return (
    <Card className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          At-Risk Students
        </h3>
        <Link
          to="/students"
          className="text-xs text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-white flex items-center gap-1 transition-colors font-medium"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto my-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-purple-500/15 text-purple-700/80 dark:text-purple-300/80 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3">ID</th>
              <th className="py-2.5 px-3">Name</th>
              <th className="py-2.5 px-3 text-right">Risk Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/10">
            {students.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-8 text-center text-slate-400">
                  No students currently flagged in this cohort.
                </td>
              </tr>
            ) : (
              students.slice(0, 5).map((s) => {
                const isSelected = selectedStudentId === s.studentId;
                return (
                  <tr
                    key={s.studentId}
                    onClick={() => onSelectStudent && onSelectStudent(s)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-purple-600/25 text-slate-900 dark:text-white'
                        : 'hover:bg-purple-500/10 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-purple-800 dark:text-purple-200">
                      {s.studentId}
                    </td>
                    <td className="py-3 px-3 font-medium">
                      <div className="truncate max-w-[150px]">{s.name}</div>
                      <div className="text-[10px] text-slate-400">{s.department}</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <RiskBadge level={s.currentRisk?.riskLevel || 'Low'} size="sm" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
