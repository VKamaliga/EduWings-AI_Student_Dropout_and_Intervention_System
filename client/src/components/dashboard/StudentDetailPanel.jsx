import React from 'react';
import { User, FileText, Lightbulb, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import RiskBadge from '../common/RiskBadge';

export default function StudentDetailPanel({ student }) {
  if (!student) {
    return (
      <Card className="p-8 text-center text-slate-400">
        Select a student from the table above to review their explainable risk breakdown.
      </Card>
    );
  }

  const { studentId, name, department, currentRisk, _id } = student;
  const prob = currentRisk?.probability || 0.15;
  const probPercent = Math.round(prob * 100);
  const riskLevel = currentRisk?.riskLevel || 'Low';
  const factors = currentRisk?.topFactors || [];
  const interventions = currentRisk?.suggestedInterventions || [];

  return (
    <Card className="overflow-hidden border border-purple-500/30">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-500/15">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Active Student Risk Profile
          </h3>
          <span className="text-xs text-purple-700/80 dark:text-purple-300/80 hidden sm:inline">
            ({name} • {department})
          </span>
        </div>

        {_id && (
          <Link
            to={`/students/${_id}`}
            className="text-xs text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white flex items-center gap-1.5 font-semibold transition-colors bg-purple-500/10 px-3 py-1 rounded-xl border border-purple-500/20"
          >
            <span>Open Student Record</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Column 1: ID, Probability, Risk Badge */}
        <div className="md:col-span-4 flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-500/20">
          {/* Avatar Icon */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-lg shadow-purple-600/30 shrink-0">
            <div className="w-full h-full bg-[#180E3E] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-purple-300" />
            </div>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-purple-700 dark:text-purple-300 font-semibold">
              Student ID
            </div>
            <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white">
              {studentId}
            </div>

            <div className="pt-1 flex items-baseline gap-3">
              <div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">Dropout Probability</div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {probPercent}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">Risk Level</div>
                <div className="mt-0.5">
                  <RiskBadge level={riskLevel} size="md" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Risk Factors */}
        <div className="md:col-span-4 p-4 rounded-2xl bg-purple-900/10 border border-purple-500/15 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase tracking-wider">
              <div className="p-1.5 rounded-lg bg-purple-500/20">
                <FileText className="w-4 h-4 text-purple-300" />
              </div>
              <span>Risk Factors</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-800 dark:text-slate-200">
              {factors.length === 0 ? (
                <li className="text-slate-400 italic">No elevated risk flags detected.</li>
              ) : (
                factors.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-pink-400 font-bold leading-tight">•</span>
                    <span>{f.factor}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Column 3: Suggested Interventions */}
        <div className="md:col-span-4 p-4 rounded-2xl bg-purple-900/10 border border-purple-500/15 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase tracking-wider">
              <div className="p-1.5 rounded-lg bg-purple-500/20">
                <Lightbulb className="w-4 h-4 text-amber-300" />
              </div>
              <span>Suggested Intervention</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-800 dark:text-slate-200">
              {interventions.length === 0 ? (
                <li className="text-slate-400 italic">Continue standard semester monitoring.</li>
              ) : (
                interventions.map((inv, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold leading-tight">•</span>
                    <span>{inv}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
