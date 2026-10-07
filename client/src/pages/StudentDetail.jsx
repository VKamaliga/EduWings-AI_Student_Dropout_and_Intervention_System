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
          <div className="flex items-start sm:items-center gap-4">
            <button
              onClick={() => navigate('/students')}
              className="p-2.5 rounded-xl border border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:text-slate-900 dark:hover:text-white transition-all shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-lg shadow-purple-600/30 shrink-0">
              <div className="w-full h-full bg-white dark:bg-[#180E3E] rounded-[14px] flex items-center justify-center">
                <User className="w-8 h-8 text-purple-800 dark:text-purple-200" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {student.name}
                </h2>
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-500/30 text-purple-800 dark:text-purple-200 font-bold">
                  {student.studentId}
                </span>
                <RiskBadge level={riskLevel} size="md" />
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>{student.department}</span>
                <span>•</span>
                <span>Year {student.year} (Semester {student.semester})</span>
                <span>•</span>
                <span>{student.email}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-purple-200 dark:border-purple-500/15">
            <button
              onClick={handleRunPrediction}
              disabled={predicting}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-800 dark:text-purple-200 bg-purple-50 dark:bg-purple-500/15 hover:bg-purple-500/25 border border-purple-300 dark:border-purple-500/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${predicting ? 'animate-spin' : ''}`} />
              <span>{predicting ? 'Evaluating...' : 'Recalculate Risk'}</span>
            </button>

            <button
              onClick={() => setShowInterventionModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
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
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              Dropout Vulnerability
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {student.currentRisk?.modelUsed || 'AI Model'}
            </span>
          </div>

          {/* Semi-circular Circular SVG Gauge */}
          <div className="relative w-44 h-44 my-2 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="rgba(168, 85, 247, 0.15)"
                strokeWidth="10"
              />
              {/* Foreground progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={riskLevel === 'High' ? '#EC4899' : riskLevel === 'Medium' ? '#FBBF24' : '#34D399'}
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {probPercent}%
              </span>
              <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider mt-0.5">
                {riskLevel} Risk
              </span>
            </div>
          </div>

          <div className="w-full pt-3 border-t border-purple-200 dark:border-purple-500/15 text-[11px] text-slate-500 dark:text-slate-400">
            Assessed based on 12 multidimensional engagement and academic factors.
          </div>
        </Card>

        {/* Card 2: Risk Factors with Impact Breakdown Bars */}
        <Card className="md:col-span-4 flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center gap-2 mb-4 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              <span>Driving Risk Factors & Weight</span>
            </div>

            <div className="space-y-4">
              {factors.length === 0 ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
                  No critical risk factors currently identified. Student is maintaining steady academic progress.
                </div>
              ) : (
                factors.map((f, idx) => {
                  const impactPct = Math.round((f.impact || 0.2) * 100);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900 dark:text-white">{f.factor}</span>
                        <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">{impactPct}% impact</span>
                      </div>

                      {/* Impact Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-purple-950/60 overflow-hidden border border-purple-200 dark:border-purple-500/20">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, impactPct * 2.2)}%` }}
                        />
                      </div>

                      {f.description && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                          {f.description}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-200 dark:border-purple-500/15 text-[11px] text-slate-500 dark:text-slate-400">
            Impact indicates feature contribution to the classification outcome.
          </div>
        </Card>

        {/* Card 3: Suggested Interventions */}
        <Card className="md:col-span-4 flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center gap-2 mb-4 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-amber-700 dark:text-amber-300" />
              <span>Recommended Actions</span>
            </div>

            <div className="space-y-2.5">
              {suggested.map((action, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                    <span>{action}</span>
                  </div>
                  <button
                    onClick={() => setShowInterventionModal(true)}
                    className="px-2 py-1 rounded-lg text-[10px] font-semibold text-purple-700 dark:text-purple-300 hover:text-slate-900 dark:hover:text-white bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-500/40 transition-colors shrink-0"
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(168, 85, 247, 0.15)" />
                <XAxis
                  dataKey="semester"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickFormatter={(val) => `Sem ${val}`}
                />
                <YAxis
                  yAxisId="cgpa"
                  domain={[0, 10]}
                  stroke="#A855F7"
                  fontSize={11}
                  tickCount={6}
                />
                <YAxis
                  yAxisId="attendance"
                  orientation="right"
                  domain={[0, 100]}
                  stroke="#34D399"
                  fontSize={11}
                  tickCount={6}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-panel p-3 rounded-xl border border-purple-300 dark:border-purple-500/30 text-xs shadow-xl space-y-1">
                          <div className="font-bold text-slate-900 dark:text-white">Semester {label}</div>
                          <div className="text-purple-700 dark:text-purple-300">CGPA: {payload[0]?.value} / 10</div>
                          <div className="text-emerald-700 dark:text-emerald-300">Attendance: {payload[1]?.value}%</div>
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
                  stroke="#C084FC"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#C084FC' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="attendance"
                  type="monotone"
                  dataKey="attendance"
                  name="Attendance (%)"
                  stroke="#34D399"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#34D399' }}
                  activeDot={{ r: 6 }}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl glass-panel p-6 border border-purple-300 dark:border-purple-500/30 shadow-2xl animate-in zoom-in-95">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Initiate Support Plan
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          For {student.name} ({student.studentId} • {student.department})
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Intervention Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#110A2E] border border-purple-200 dark:border-purple-500/25 text-white"
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
            <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Title / Objective</label>
            <input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#110A2E] border border-purple-200 dark:border-purple-500/25 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#110A2E] border border-purple-200 dark:border-purple-500/25 text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#110A2E] border border-purple-200 dark:border-purple-500/25 text-white"
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Initial Case Note</label>
            <textarea
              rows="3"
              value={formData.initialNote}
              onChange={(e) => setFormData({ ...formData, initialNote: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#110A2E] border border-purple-200 dark:border-purple-500/25 text-white"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-purple-200 dark:border-purple-500/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-md shadow-purple-600/30 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Record Intervention'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
