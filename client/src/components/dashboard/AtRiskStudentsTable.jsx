import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import RiskBadge from '../common/RiskBadge';

export default function AtRiskStudentsTable({ students = [], selectedStudentId, onSelectStudent }) {
  return (
    <Card className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#14141B] dark:text-[#ECECF1] tracking-tight">
          At-Risk Students
        </h3>
        <Link
          to="/students"
          className="text-xs text-[#7C5CFA] hover:underline flex items-center gap-1 transition-colors font-medium"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </Link>
      </div>

      <div className="overflow-x-auto my-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#E5E5EB] dark:border-[#24242E] text-[#70707E] dark:text-[#6B6B7B] font-medium text-[11px]">
              <th className="py-2 px-3">ID</th>
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3 text-right">Risk Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5EB] dark:divide-[#24242E]">
            {students.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-8 text-center text-[#70707E] dark:text-[#6B6B7B]">
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
                        ? 'bg-[#7C5CFA]/10 text-[#14141B] dark:text-[#ECECF1]'
                        : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.03] text-[#14141B] dark:text-[#ECECF1]'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-[#7C5CFA]">
                      {s.studentId}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="truncate max-w-[150px] font-medium">{s.name}</div>
                      <div className="text-[10px] text-[#70707E] dark:text-[#6B6B7B]">{s.department}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
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
