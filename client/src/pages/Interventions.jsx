import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  MessageSquare,
  User,
  ArrowRight,
  Filter,
  X,
} from 'lucide-react';
import Card from '../components/common/Card';
import RiskBadge from '../components/common/RiskBadge';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Interventions() {
  const { user } = useAuth();
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [activeNoteModal, setActiveNoteModal] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchInterventions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/interventions');
      setInterventions(res.interventions || []);
    } catch (err) {
      console.error('Failed to load interventions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const payload = { status: newStatus };
      if (newStatus === 'Completed') {
        payload.outcome = 'Improved';
        // Simulating risk improvement upon intervention completion
        const target = interventions.find((i) => i._id === id);
        if (target) {
          payload.currentProbability = Math.max(0.15, target.initialProbability - 0.22);
        }
      }
      const res = await api.put(`/interventions/${id}`, payload);
      setInterventions((prev) =>
        prev.map((i) => (i._id === id ? res.intervention : i))
      );
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeNoteModal) return;
    setSavingNote(true);
    try {
      const res = await api.post(`/interventions/${activeNoteModal._id}/notes`, {
        content: newNoteText.trim(),
      });
      setInterventions((prev) =>
        prev.map((i) => (i._id === activeNoteModal._id ? res.intervention : i))
      );
      setNewNoteText('');
      setActiveNoteModal(null);
    } catch (err) {
      alert('Failed to add note: ' + err.message);
    } finally {
      setSavingNote(false);
    }
  };

  // Filtered interventions
  const filtered = interventions.filter((item) => {
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && item.priority !== priorityFilter) return false;
    return true;
  });

  const completedCount = interventions.filter((i) => i.status === 'Completed').length;
  const inProgressCount = interventions.filter((i) => i.status === 'In Progress').length;
  const plannedCount = interventions.filter((i) => i.status === 'Planned').length;
  const improvedCount = interventions.filter((i) => i.outcome === 'Improved').length;
  const successRate = completedCount ? Math.round((improvedCount / completedCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ClipboardCheck className="w-6 h-6 text-purple-400" />
            <span>Intervention Tracking & Action Plans</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Coordinate student advising, remedial tutoring, wellness counselling, and track risk reduction deltas
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Action Plans</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{interventions.length}</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="text-xs text-slate-500 dark:text-slate-400">In Active Progress</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{inProgressCount}</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="text-xs text-slate-500 dark:text-slate-400">Completed Plans</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{completedCount}</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-pink-500">
          <div className="text-xs text-slate-500 dark:text-slate-400">Retention Success Rate</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{successRate}%</div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card noPadding className="p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {['All', 'Planned', 'In Progress', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === tab
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-purple-500/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#120B30] border border-purple-200 dark:border-purple-500/25 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </Card>

      {/* Interventions List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400">
            <div className="inline-block w-8 h-8 border-4 border-purple-300 dark:border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-3" />
            <div>Loading active case interventions...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400">
            No interventions match the selected filter criteria.
          </div>
        ) : (
          filtered.map((inv) => {
            const initialProbPct = Math.round((inv.initialProbability || 0) * 100);
            const currentProbPct = Math.round((inv.currentProbability || inv.initialProbability || 0) * 100);
            const deltaPct = initialProbPct - currentProbPct;

            return (
              <Card
                key={inv._id}
                className="flex flex-col justify-between border border-purple-200 dark:border-purple-500/25 hover:border-purple-500/45 transition-all p-5"
              >
                <div>
                  {/* Card Header: Type, Priority, Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-500/30">
                      {inv.type}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          inv.priority === 'Urgent' || inv.priority === 'High'
                            ? 'bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300'
                            : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {inv.priority}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          inv.status === 'Completed'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : inv.status === 'In Progress'
                            ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                            : 'bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Student Meta */}
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                    {inv.title}
                  </h4>
                  <div className="text-xs text-purple-800 dark:text-purple-200 font-medium flex items-center justify-between mb-3">
                    <span>
                      {inv.studentName} ({inv.studentId})
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{inv.department}</span>
                  </div>

                  {/* Before / After Risk Delta Comparison */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/20 mb-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                      <span>Before / After Risk Comparison:</span>
                      {deltaPct > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>-{deltaPct}% Risk</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400">Active monitoring</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 dark:text-slate-400 text-[10px]">Initial:</span>
                        <RiskBadge level={inv.initialRiskLevel} probability={inv.initialProbability} size="sm" />
                      </div>
                      <ArrowRight className="w-3 h-3 text-purple-400" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 dark:text-slate-400 text-[10px]">Current:</span>
                        <RiskBadge level={inv.currentRiskLevel} probability={inv.currentProbability} size="sm" />
                      </div>
                    </div>
                  </div>

                  {/* Case Notes snippet */}
                  <div className="mb-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      <span>Follow-up Case Notes ({inv.notes?.length || 0})</span>
                      <button
                        onClick={() => setActiveNoteModal(inv)}
                        className="text-purple-700 dark:text-purple-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Note</span>
                      </button>
                    </div>

                    {inv.notes && inv.notes.length > 0 ? (
                      <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-black/25 text-[11px] text-slate-600 dark:text-slate-300 italic border border-purple-200 dark:border-purple-500/10 line-clamp-2">
                        "{inv.notes[inv.notes.length - 1].content}"
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">No notes logged yet.</div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-purple-200 dark:border-purple-500/15 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Assigned: {inv.assignedName}</span>

                  {/* Quick Status Advancement */}
                  <div className="flex items-center gap-1.5">
                    {inv.status === 'Planned' && (
                      <button
                        onClick={() => handleStatusChange(inv._id, 'In Progress')}
                        className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-500/40 text-blue-700 dark:text-blue-300 font-semibold transition-colors"
                      >
                        Start
                      </button>
                    )}
                    {inv.status === 'In Progress' && (
                      <button
                        onClick={() => handleStatusChange(inv._id, 'Completed')}
                        className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Resolve</span>
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Note Sub-Modal */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-purple-300 dark:border-purple-500/30 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-200 dark:border-purple-500/20">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Append Case Note • {activeNoteModal.studentName}
              </h3>
              <button
                onClick={() => setActiveNoteModal(null)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Observation / Progress Log</label>
                <textarea
                  rows="4"
                  required
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Record advising outcomes, student feedback, or remedial goals..."
                  className="w-full p-3 rounded-xl bg-white dark:bg-[#110A2E] border border-purple-200 dark:border-purple-500/25 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveNoteModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNote}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/30 disabled:opacity-50"
                >
                  {savingNote ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
