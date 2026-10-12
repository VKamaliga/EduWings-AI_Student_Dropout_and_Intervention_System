import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Plus,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
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
          <h2 className="text-lg sm:text-xl font-semibold text-[#14141B] dark:text-[#ECECF1] tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#7C5CFA]" strokeWidth={1.5} />
            <span>Intervention Tracking & Action Plans</span>
          </h2>
          <p className="text-xs text-[#70707E] dark:text-[#6B6B7B]">
            Coordinate student advising, remedial tutoring, wellness counselling, and track risk reduction deltas
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-l-2 border-l-[#7C5CFA]">
          <div className="text-xs text-[#70707E] dark:text-[#6B6B7B]">Total Action Plans</div>
          <div className="text-xl font-semibold text-[#14141B] dark:text-[#ECECF1] mt-1">{interventions.length}</div>
        </Card>
        <Card className="p-4 border-l-2 border-l-[#C98A1B]">
          <div className="text-xs text-[#70707E] dark:text-[#6B6B7B]">In Active Progress</div>
          <div className="text-xl font-semibold text-[#14141B] dark:text-[#ECECF1] mt-1">{inProgressCount}</div>
        </Card>
        <Card className="p-4 border-l-2 border-l-[#2F9E6F]">
          <div className="text-xs text-[#70707E] dark:text-[#6B6B7B]">Completed Plans</div>
          <div className="text-xl font-semibold text-[#14141B] dark:text-[#ECECF1] mt-1">{completedCount}</div>
        </Card>
        <Card className="p-4 border-l-2 border-l-[#7C5CFA]">
          <div className="text-xs text-[#70707E] dark:text-[#6B6B7B]">Retention Success Rate</div>
          <div className="text-xl font-semibold text-[#14141B] dark:text-[#ECECF1] mt-1">{successRate}%</div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card noPadding className="p-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          {['All', 'Planned', 'In Progress', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#7C5CFA] text-white'
                  : 'text-[#52525F] dark:text-[#A0A0B0] hover:text-[#14141B] dark:hover:text-[#ECECF1] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#70707E] dark:text-[#6B6B7B]">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-[#14141B] border border-[#E5E5EB] dark:border-[#24242E] text-[#14141B] dark:text-[#ECECF1] focus:outline-none focus:border-[#7C5CFA]"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-[#70707E] dark:text-[#6B6B7B]">
            <div className="inline-block w-6 h-6 border-2 border-[#7C5CFA] border-t-transparent rounded-full animate-spin mb-2" />
            <div>Loading active case interventions...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#70707E] dark:text-[#6B6B7B] text-xs">
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
                className="flex flex-col justify-between hover:border-[#7C5CFA]/40 transition-colors p-5"
              >
                <div>
                  {/* Card Header: Type, Priority, Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[#7C5CFA]/10 text-[#7C5CFA] border border-[#7C5CFA]/20">
                      {inv.type}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                          inv.priority === 'Urgent' || inv.priority === 'High'
                            ? 'bg-[#D64550]/10 text-[#D64550]'
                            : inv.priority === 'Medium'
                            ? 'bg-[#C98A1B]/10 text-[#C98A1B]'
                            : 'bg-[#2F9E6F]/10 text-[#2F9E6F]'
                        }`}
                      >
                        {inv.priority}
                      </span>

                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                          inv.status === 'Completed'
                            ? 'bg-[#2F9E6F]/10 text-[#2F9E6F]'
                            : inv.status === 'In Progress'
                            ? 'bg-[#C98A1B]/10 text-[#C98A1B]'
                            : 'bg-black/5 dark:bg-white/5 text-[#52525F] dark:text-[#A0A0B0]'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Student Meta */}
                  <h4 className="text-sm font-medium text-[#14141B] dark:text-[#ECECF1] line-clamp-1 mb-1">
                    {inv.title}
                  </h4>
                  <div className="text-xs text-[#52525F] dark:text-[#A0A0B0] flex items-center justify-between mb-3">
                    <span className="font-medium text-[#14141B] dark:text-[#ECECF1]">
                      {inv.studentName} ({inv.studentId})
                    </span>
                    <span className="text-[11px] text-[#70707E] dark:text-[#6B6B7B]">{inv.department}</span>
                  </div>

                  {/* Before / After Risk Delta Comparison */}
                  <div className="p-2.5 rounded-md bg-[#F8F8FA] dark:bg-[#1C1C26] border border-[#E5E5EB] dark:border-[#24242E] mb-3 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[#70707E] dark:text-[#6B6B7B] text-[11px]">
                      <span>Before / After Risk Comparison:</span>
                      {deltaPct > 0 ? (
                        <span className="text-[#2F9E6F] font-medium flex items-center gap-0.5">
                          <TrendingDown className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span>-{deltaPct}% Risk</span>
                        </span>
                      ) : (
                        <span className="text-[#70707E] dark:text-[#6B6B7B]">Active monitoring</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#70707E] dark:text-[#6B6B7B] text-[10px]">Initial:</span>
                        <RiskBadge level={inv.initialRiskLevel} probability={inv.initialProbability} size="sm" />
                      </div>
                      <ArrowRight className="w-3 h-3 text-[#70707E] dark:text-[#6B6B7B]" strokeWidth={1.5} />
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#70707E] dark:text-[#6B6B7B] text-[10px]">Current:</span>
                        <RiskBadge level={inv.currentRiskLevel} probability={inv.currentProbability} size="sm" />
                      </div>
                    </div>
                  </div>

                  {/* Case Notes snippet */}
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#70707E] dark:text-[#6B6B7B]">
                      <span>Follow-up Case Notes ({inv.notes?.length || 0})</span>
                      <button
                        onClick={() => setActiveNoteModal(inv)}
                        className="text-[#7C5CFA] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" strokeWidth={1.5} />
                        <span>Add Note</span>
                      </button>
                    </div>

                    {inv.notes && inv.notes.length > 0 ? (
                      <div className="p-2 rounded-md bg-white dark:bg-[#14141B] text-[11px] text-[#52525F] dark:text-[#A0A0B0] italic border border-[#E5E5EB] dark:border-[#24242E] line-clamp-2">
                        "{inv.notes[inv.notes.length - 1].content}"
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#70707E] dark:text-[#6B6B7B] italic">No notes logged yet.</div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-2.5 border-t border-[#E5E5EB] dark:border-[#24242E] flex items-center justify-between text-[11px]">
                  <span className="text-[#70707E] dark:text-[#6B6B7B]">Assigned: {inv.assignedName}</span>

                  {/* Quick Status Advancement */}
                  <div className="flex items-center gap-1.5">
                    {inv.status === 'Planned' && (
                      <button
                        onClick={() => handleStatusChange(inv._id, 'In Progress')}
                        className="px-2 py-0.5 rounded-md bg-[#7C5CFA]/10 hover:bg-[#7C5CFA]/20 text-[#7C5CFA] font-medium transition-colors cursor-pointer"
                      >
                        Start
                      </button>
                    )}
                    {inv.status === 'In Progress' && (
                      <button
                        onClick={() => handleStatusChange(inv._id, 'Completed')}
                        className="px-2 py-0.5 rounded-md bg-[#2F9E6F]/10 hover:bg-[#2F9E6F]/20 text-[#2F9E6F] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-[#14141B] p-5 border border-[#E5E5EB] dark:border-[#24242E] shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#E5E5EB] dark:border-[#24242E]">
              <h3 className="text-sm font-semibold text-[#14141B] dark:text-[#ECECF1]">
                Append Case Note • {activeNoteModal.studentName}
              </h3>
              <button
                onClick={() => setActiveNoteModal(null)}
                className="text-[#70707E] dark:text-[#6B6B7B] hover:text-[#14141B] dark:hover:text-[#ECECF1]"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#52525F] dark:text-[#A0A0B0] font-medium mb-1">Observation / Progress Log</label>
                <textarea
                  rows="4"
                  required
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Record advising outcomes, student feedback, or remedial goals..."
                  className="w-full p-2.5 rounded-md bg-white dark:bg-[#0B0B10] border border-[#E5E5EB] dark:border-[#24242E] text-[#14141B] dark:text-[#ECECF1] focus:outline-none focus:border-[#7C5CFA]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5E5EB] dark:border-[#24242E]">
                <button
                  type="button"
                  onClick={() => setActiveNoteModal(null)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-[#52525F] dark:text-[#A0A0B0] hover:text-[#14141B] dark:hover:text-[#ECECF1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNote}
                  className="px-4 py-1.5 rounded-md text-xs font-medium text-white bg-[#7C5CFA] hover:bg-[#6C4CE0] transition-colors disabled:opacity-50 cursor-pointer"
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
