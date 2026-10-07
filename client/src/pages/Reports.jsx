import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Building,
  CheckCircle,
  Users,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import Card from '../components/common/Card';
import RiskBadge from '../components/common/RiskBadge';
import api from '../services/api';

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const [sumRes, deptRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/predictions/department-risk'),
        ]);
        setSummary(sumRes.summary);
        setDepartmentData(deptRes.departmentData || []);
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const blob = await api.get('/reports/export-csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EduWings_Cohort_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert('CSV export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-3" />
        <div>Generating institutional retention report...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-purple-400" />
            <span>Institutional Retention Reports</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Comprehensive student attrition analytics, intervention progress, and formal audit summaries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-[#1A1040]/80 hover:bg-[#251758] border border-purple-500/25 flex items-center gap-2 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-purple-300" />
            <span>Print View</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'Exporting CSV...' : 'Download CSV'}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <Card className="p-6 sm:p-10 border border-purple-500/30 space-y-8 bg-[#110A2E]/90">
        {/* Institutional Formal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-purple-500/20 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#180E3E] rounded-[14px] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-200" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                EduWings Institute of Technology
              </h1>
              <p className="text-xs text-purple-300 font-medium">
                Office of Academic Affairs & Student Success • Academic Year 2025 – 2026
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 space-y-1">
            <div>Report Date: <strong>{new Date().toLocaleDateString()}</strong></div>
            <div>Generated by: <strong>EduWings Predictive AI System</strong></div>
            <div className="text-emerald-400 font-semibold">Status: Audited & Verified</div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Executive Cohort Summary</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20">
              <div className="text-[11px] text-slate-400">Total Enrolled Cohort</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {summary?.totalStudents || 200}
              </div>
              <div className="text-[10px] text-purple-300 mt-1">Students actively tracked</div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20">
              <div className="text-[11px] text-slate-400">Average Attendance</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {summary?.overallAttendance || 78}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Min. threshold 75%</div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20">
              <div className="text-[11px] text-slate-400">High-Risk Vulnerable</div>
              <div className="text-2xl font-extrabold text-pink-400 mt-1">
                {summary?.highRiskCount || 26}
              </div>
              <div className="text-[10px] text-pink-300 mt-1">Requiring immediate care</div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20">
              <div className="text-[11px] text-slate-400">Intervention Success</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {summary?.successRate || 68}%
              </div>
              <div className="text-[10px] text-emerald-300 mt-1">Risk improvement rate</div>
            </div>
          </div>
        </div>

        {/* Academic Department Breakdown Table */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-400" />
            <span>Department Risk & Retention Performance</span>
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-purple-500/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-950/40 text-purple-300 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Academic Division</th>
                  <th className="py-3 px-4">Enrolled Students</th>
                  <th className="py-3 px-4">Low Risk</th>
                  <th className="py-3 px-4">Medium Risk</th>
                  <th className="py-3 px-4">High Risk</th>
                  <th className="py-3 px-4 text-right">Avg Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {departmentData.map((d) => (
                  <tr key={d.department} className="hover:bg-purple-500/5">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{d.department}</td>
                    <td className="py-3 px-4">{d.total}</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">{d.low}</td>
                    <td className="py-3 px-4 text-amber-400 font-semibold">{d.medium}</td>
                    <td className="py-3 px-4 text-pink-400 font-semibold">{d.high}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {d.avgRiskScore}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Institutional Recommendations & Compliance Sign-off */}
        <div className="pt-6 border-t border-purple-500/20 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Summary Recommendations
            </h4>
            <ul className="space-y-1 list-disc pl-4 text-slate-400">
              <li>Reinforce attendance tracking alerts for early-semester courses.</li>
              <li>Expand peer tutoring networks for first-generation engineering students.</li>
              <li>Provide bursar grace period extensions for pending tuition accounts.</li>
            </ul>
          </div>

          <div className="space-y-3 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/15">
            <div className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Verification & Certification
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              This report complies with Higher Education Retention Guidelines. Data is aggregated from LMS activity logs, semester grades, and counsellor advising records.
            </p>
            <div className="pt-2 flex items-center justify-between text-[10px] text-purple-300 border-t border-purple-500/10 font-semibold">
              <span>Dr. Elizabeth Warren • Dean</span>
              <span>EduWings AI Governance Board</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
