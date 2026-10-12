import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Activity,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Clock,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  FileText,
  RotateCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Card from '../components/common/Card';
import RiskBadge from '../components/common/RiskBadge';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [student, setStudent] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [showInterventionModal, setShowInterventionModal] = useState(false);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const [studentRes, interventionsRes] = await Promise.all([
        api.get(`/students/${id}`),
        api.get(`/interventions?studentId=${id}`),
      ]);
      setStudent(studentRes.student);

      // Fetch interventions by student ID
      const allStudentInterventions = await api.get(`/interventions`);
      const matched = (allStudentInterventions.interventions || []).filter(
        (i) => i.studentId === studentRes.student?.studentId
      );
      setInterventions(matched);
    } catch (err) {
      console.error('Failed to load student details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const handleRunPrediction = async () => {
    try {
      setPredicting(true);
      const res = await api.post(`/students/${id}/predict`);
      setStudent(res.student);
    } catch (err) {
      alert('Prediction failed: ' + err.message);
    } finally {
      setPredicting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 dark:text-slate-400">
        <div className="inline-block w-8 h-8 border-4 border-purple-300 dark:border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-3" />
        <div>Loading student records and ML risk history...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-4">
        <div>Student record could not be found.</div>
        <Link to="/students" className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs">
          Return to directory
        </Link>
      </div>
    );
  }

  const prob = student.currentRisk?.probability || 0.15;
  const probPercent = Math.round(prob * 100);
  const riskLevel = student.currentRisk?.riskLevel || 'Low';
  const factors = student.currentRisk?.topFactors || [];
  const suggested = student.currentRisk?.suggestedInterventions || [];

  // Gauge angle calculation (0% = 0 deg, 100% = 180 deg)
  const strokeDashoffset = 251.2 - (251.2 * probPercent) / 100;

  return (
    <div className="space-y-6">
      {/* Top Header / Profile Card */}
      <Card className="border border-purple-200 dark:border-purple-500/25">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-3.5">
            <button
              onClick={() => navigate('/students')}
              className="p-2 rounded-md border border-[#E5E5EB] dark:border-[#24242E] bg-white dark:bg-[#14141B] hover:bg-[#F8F8FA] dark:hover:bg-[#1C1C26] text-[#52525F] dark:text-[#A0A0B0] hover:text-[#14141B] dark:hover:text-[#ECECF1] transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>

            <div className="w-12 h-12 rounded-md bg-[#7C5CFA]/10 border border-[#7C5CFA]/20 flex items-center justify-center shrink-0 text-[#7C5CFA]">
              <User className="w-6 h-6" strokeWidth={1.5} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-semibold text-[#14141B] dark:text-[#ECECF1] tracking-tight">
                  {student.name}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-[#E5E5EB] dark:border-[#24242E] text-[#14141B] dark:text-[#ECECF1] font-medium">
                  {student.studentId}
                </span>
                <RiskBadge level={riskLevel} size="md" />
              </div>

              <div className="text-xs text-[#52525F] dark:text-[#A0A0B0] mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{student.department}</span>
                <span>•</span>
                <span>Year {student.year} (Semester {student.semester})</span>
                <span>•</span>
                <span>{student.email}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E5E5EB] dark:border-[#24242E]">
            <button
              onClick={handleRunPrediction}
              disabled={predicting}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-[#14141B] dark:text-[#ECECF1] bg-white dark:bg-[#14141B] hover:bg-[#F8F8FA] dark:hover:bg-[#1A1A23] border border-[#E5E5EB] dark:border-[#24242E] flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${predicting ? 'animate-spin' : ''}`} strokeWidth={1.5} />
              <span>{predicting ? 'Evaluating...' : 'Recalculate Risk'}</span>
            </button>

            <button
              onClick={() => setShowInterventionModal(true)}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-white bg-[#7C5CFA] hover:bg-[#6C4CE0] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Schedule Intervention</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Middle Row: Gauge, Risk Factor Impact Bars, Suggested Interventions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Card 1: Dropout Probability Gauge */}
        <Card className="md:col-span-4 flex flex-col justify-between items-center text-center p-6">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#52525F] dark:text-[#A0A0B0]">
              Dropout Vulnerability
            </span>
            <span className="text-[10px] text-[#70707E] dark:text-[#6B6B7B]">
              {student.currentRisk?.modelUsed || 'AI Model'}
            </span>
          </div>

          {/* Semi-circular Circular SVG Gauge */}
          <div className="relative w-40 h-40 my-2 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
                className="text-[#E5E5EB] dark:text-[#24242E]"
              />
              {/* Foreground progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={riskLevel === 'High' ? '#D64550' : riskLevel === 'Medium' ? '#C98A1B' : '#2F9E6F'}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-semibold text-[#14141B] dark:text-[#ECECF1] tracking-tight">
                {probPercent}%
              </span>
              <span className="text-[11px] font-medium text-[#52525F] dark:text-[#A0A0B0] mt-0.5">
                {riskLevel} Risk
              </span>
            </div>
          </div>

          <div className="w-full pt-3 border-t border-[#E5E5EB] dark:border-[#24242E] text-[11px] text-[#70707E] dark:text-[#6B6B7B]">
            Assessed based on 12 multidimensional engagement and academic factors.
          </div>
        </Card>

        {/* Card 2: Risk Factors with Impact Breakdown Bars */}
        <Card className="md:col-span-4 flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#52525F] dark:text-[#A0A0B0] font-medium text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-[#D64550]" strokeWidth={1.5} />
              <span>Driving Risk Factors & Weight</span>
            </div>

            <div className="space-y-3.5">
              {factors.length === 0 ? (
                <div className="text-xs text-[#70707E] dark:text-[#6B6B7B] py-6 text-center">
                  No critical risk factors currently identified. Student is maintaining steady academic progress.
                </div>
              ) : (
                factors.map((f, idx) => {
                  const impactPct = Math.round((f.impact || 0.2) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#14141B] dark:text-[#ECECF1]">{f.factor}</span>
                        <span className="font-mono text-[#7C5CFA] font-medium">{impactPct}%</span>
                      </div>

                      {/* Solid Impact Progress Bar (6px height) */}
                      <div className="w-full h-1.5 rounded-sm bg-[#E5E5EB] dark:bg-[#24242E] overflow-hidden">
                        <div
                          className="h-full rounded-sm bg-[#7C5CFA] transition-all duration-300"
                          style={{ width: `${Math.min(100, impactPct * 2.2)}%` }}
                        />
                      </div>

                      {f.description && (
                        <div className="text-[11px] text-[#70707E] dark:text-[#6B6B7B] leading-tight">
                          {f.description}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E5E5EB] dark:border-[#24242E] text-[11px] text-[#70707E] dark:text-[#6B6B7B]">
            Impact indicates feature contribution to the classification outcome.
          </div>
        </Card>

        {/* Card 3: Suggested Interventions */}
        <Card className="md:col-span-4 flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#52525F] dark:text-[#A0A0B0] font-medium text-xs">
              <Lightbulb className="w-3.5 h-3.5 text-[#C98A1B]" strokeWidth={1.5} />
              <span>Recommended Actions</span>
            </div>

            <div className="space-y-2">
              {suggested.map((action, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-md bg-[#F8F8FA] dark:bg-[#1C1C26] border border-[#E5E5EB] dark:border-[#24242E] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 text-[#14141B] dark:text-[#ECECF1]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFA]" />
                    <span>{action}</span>
                  </div>
                  <button
                    onClick={() => setShowInterventionModal(true)}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium text-[#7C5CFA] hover:bg-[#7C5CFA]/10 border border-[#7C5CFA]/20 transition-colors shrink-0 cursor-pointer"
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-[11px] text-purple-800 dark:text-purple-200">
            <strong>Support Guideline:</strong> Early outreach within 7 days of risk escalation increases student retention probability by up to 64%.
          </div>
        </Card>
      </div>

      {/* Bottom Row: Semester Progression Chart & Intervention History Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Progression Chart */}
        <Card className="lg:col-span-7 flex flex-col justify-between p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Semester Academic & Attendance Progression
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Historical Term Records</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={student.semesterProgression || []}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.15)" />
                <XAxis
                  dataKey="semester"
                  stroke="#70707E"
                  fontSize={11}
                  tickFormatter={(val) => `Sem ${val}`}
                />
                <YAxis
                  yAxisId="cgpa"
                  domain={[0, 10]}
                  stroke="#7C5CFA"
                  fontSize={11}
                  tickCount={6}
                />
                <YAxis
                  yAxisId="attendance"
                  orientation="right"
                  domain={[0, 100]}
                  stroke="#2F9E6F"
                  fontSize={11}
                  tickCount={6}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-[#14141B] p-2.5 rounded-md border border-[#E5E5EB] dark:border-[#24242E] text-xs shadow-sm dark:shadow-none space-y-1">
                          <div className="font-medium text-[#14141B] dark:text-[#ECECF1]">Semester {label}</div>
                          <div className="text-[#7C5CFA]">CGPA: {payload[0]?.value} / 10</div>
                          <div className="text-[#2F9E6F]">Attendance: {payload[1]?.value}%</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
                <Line
                  yAxisId="cgpa"
                  type="monotone"
                  dataKey="cgpa"
                  name="CGPA (0-10)"
                  stroke="#7C5CFA"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#7C5CFA' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  yAxisId="attendance"
                  type="monotone"
                  dataKey="attendance"
                  name="Attendance (%)"
                  stroke="#2F9E6F"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#2F9E6F' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Intervention History Timeline */}
        <Card className="lg:col-span-5 flex flex-col justify-between p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Support & Intervention History
            </h3>
            <button
              onClick={() => setShowInterventionModal(true)}
              className="text-xs text-purple-700 dark:text-purple-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Action</span>
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-3 pr-1 my-auto">
            {interventions.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 dark:text-slate-400">
                No interventions have been scheduled yet for this student.
              </div>
            ) : (
              interventions.map((inv) => (
                <div
                  key={inv._id}
                  className="p-3.5 rounded-xl bg-white dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{inv.type}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        inv.status === 'Completed'
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : inv.status === 'In Progress'
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          : 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  <div className="text-slate-600 dark:text-slate-300 text-[11px]">{inv.title}</div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-purple-200 dark:border-purple-500/10">
                    <span>Assigned: {inv.assignedName}</span>
                    <span>
                      {new Date(inv.scheduledDate).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {inv.notes && inv.notes.length > 0 && (
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-black/20 text-[11px] text-slate-600 dark:text-slate-300 italic">
                      "{inv.notes[inv.notes.length - 1].content}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Log Intervention Modal */}
      {showInterventionModal && (
        <CreateInterventionModal
          student={student}
          onClose={() => setShowInterventionModal(false)}
          onCreated={() => {
            setShowInterventionModal(false);
            fetchStudentDetails();
          }}
        />
      )}
    </div>
  );
}

// Sub-Modal for Creating Intervention
function CreateInterventionModal({ student, onClose, onCreated }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: `Targeted Support for ${student.name}`,
    type: student.currentRisk?.suggestedInterventions?.[0] || 'Academic Support',
    priority: student.currentRisk?.riskLevel === 'High' ? 'High' : 'Medium',
    status: 'Planned',
    initialNote: `Initiated proactive outreach based on ${student.currentRisk?.topFactors?.[0]?.factor || 'recent academic performance'}.`,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/interventions', {
        studentId: student.studentId,
        ...formData,
      });
      onCreated();
    } catch (err) {
      alert('Failed to log intervention: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white dark:bg-[#14141B] p-6 border border-[#E5E5EB] dark:border-[#24242E] shadow-sm dark:shadow-none">
        <h3 className="text-base font-semibold text-[#14141B] dark:text-[#ECECF1] mb-1">
          Initiate Support Plan
        </h3>
        <p className="text-xs text-[#70707E] dark:text-[#6B6B7B] mb-4">
          For {student.name} ({student.studentId} • {student.department})
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[#52525F] dark:text-[#A0A0B0] font-medium mb-1">Intervention Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0B0B10] border border-[#E5E5EB] dark:border-[#24242E] text-[#14141B] dark:text-[#ECECF1] focus:outline-none focus:border-[#7C5CFA]"
            >
              <option value="Counselling">Counselling</option>
              <option value="Academic Support">Academic Support</option>
              <option value="Attendance Follow-up">Attendance Follow-up</option>
              <option value="Financial Aid Referral">Financial Aid Referral</option>
              <option value="Parent Meeting">Parent Meeting</option>
              <option value="Peer Mentoring">Peer Mentoring</option>
              <option value="Career Guidance">Career Guidance</option>
            </select>
          </div>

          <div>
            <label className="block text-[#52525F] dark:text-[#A0A0B0] font-medium mb-1">Title / Objective</label>
            <input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0B0B10] border border-[#E5E5EB] dark:border-[#24242E] text-[#14141B] dark:text-[#ECECF1] focus:outline-none focus:border-[#7C5CFA]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#52525F] dark:text-[#A0A0B0] font-medium mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0B0B10] border border-[#E5E5EB] dark:border-[#24242E] text-[#14141B] dark:text-[#ECECF1] focus:outline-none focus:border-[#7C5CFA]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-[#52525F] dark:text-[#A0A0B0] font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0B0B10] border border-[#E5E5EB] dark:border-[#24242E] text-[#14141B] dark:text-[#ECECF1] focus:outline-none focus:border-[#7C5CFA]"
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#52525F] dark:text-[#A0A0B0] font-medium mb-1">Initial Case Note</label>
            <textarea
              rows="3"
              value={formData.initialNote}
              onChange={(e) => setFormData({ ...formData, initialNote: e.target.value })}
              className="w-full p-2.5 rounded-md bg-white dark:bg-[#0B0B10] border border-[#E5E5EB] dark:border-[#24242E] text-[#14141B] dark:text-[#ECECF1] focus:outline-none focus:border-[#7C5CFA]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#E5E5EB] dark:border-[#24242E]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-[#52525F] dark:text-[#A0A0B0] hover:text-[#14141B] dark:hover:text-[#ECECF1]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-md text-xs font-medium text-white bg-[#7C5CFA] hover:bg-[#6C4CE0] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Record Intervention'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
