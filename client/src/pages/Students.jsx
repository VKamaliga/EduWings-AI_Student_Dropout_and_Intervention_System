import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  UserPlus,
  Upload,
  Play,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import Card from '../components/common/Card';
import RiskBadge from '../components/common/RiskBadge';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Students() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isFaculty, user } = useAuth();

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [batchPredicting, setBatchPredicting] = useState(false);
  const [predictingId, setPredictingId] = useState(null);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [department, setDepartment] = useState('All');
  const [year, setYear] = useState('All');
  const [riskLevel, setRiskLevel] = useState('All');
  const [sortBy, setSortBy] = useState('risk');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  const fetchStudents = async (page = 1) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page,
        limit: 12,
        search,
        department,
        year,
        riskLevel,
        sortBy,
        sortOrder,
      });

      const res = await api.get(`/students?${query.toString()}`);
      setStudents(res.students || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(1);
  }, [department, year, riskLevel, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents(1);
  };

  const handlePredictSingle = async (e, studentId) => {
    e.stopPropagation();
    try {
      setPredictingId(studentId);
      const res = await api.post(`/students/${studentId}/predict`);
      setStudents((prev) =>
        prev.map((s) => (s._id === studentId ? res.student : s))
      );
      setNotificationMsg(`Prediction updated for student ${res.student.studentId}`);
      setTimeout(() => setNotificationMsg(''), 4000);
    } catch (err) {
      alert('Prediction failed: ' + err.message);
    } finally {
      setPredictingId(null);
    }
  };

  const handlePredictAll = async () => {
    if (!window.confirm('Run AI Dropout Risk Prediction on all student records?')) return;
    try {
      setBatchPredicting(true);
      const res = await api.post('/students/predict-all');
      setNotificationMsg(res.message);
      setTimeout(() => setNotificationMsg(''), 5000);
      fetchStudents(pagination.page);
    } catch (err) {
      alert('Batch prediction failed: ' + err.message);
    } finally {
      setBatchPredicting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="p-4 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-sm flex items-center justify-between shadow-lg">
          <span>{notificationMsg}</span>
          <button onClick={() => setNotificationMsg('')} className="text-purple-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Students Cohort Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {pagination.total} registered students • Monitor attendance, academic signals, and dropout probabilities
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePredictAll}
            disabled={batchPredicting}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${batchPredicting ? 'animate-spin' : ''}`} />
            <span>{batchPredicting ? 'Analyzing Cohort...' : 'Predict All'}</span>
          </button>

          <button
            onClick={() => setShowBulkModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-[#1A1040]/70 hover:bg-[#251758] border border-purple-500/25 flex items-center gap-2 transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-purple-300" />
            <span>Bulk CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 border border-purple-400/30 flex items-center gap-2 transition-all shadow-md shadow-purple-600/20"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card noPadding className="p-4">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, student name, or email..."
              className="w-full pl-10 pr-20 py-2 rounded-xl text-xs bg-[#120B30]/80 border border-purple-500/25 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-semibold text-purple-200 hover:text-white bg-purple-600/40 hover:bg-purple-600/70 rounded-lg transition-colors"
            >
              Search
            </button>
          </form>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Department (unless faculty restricted) */}
            {!isFaculty && (
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-[#120B30]/80 border border-purple-500/25 text-slate-200 focus:outline-none focus:border-purple-400"
              >
                <option value="All">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics & Comm.">Electronics & Comm.</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Data Science & AI">Data Science & AI</option>
              </select>
            )}

            {/* Year */}
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-[#120B30]/80 border border-purple-500/25 text-slate-200 focus:outline-none focus:border-purple-400"
            >
              <option value="All">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>

            {/* Risk Level */}
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-[#120B30]/80 border border-purple-500/25 text-slate-200 focus:outline-none focus:border-purple-400"
            >
              <option value="All">All Risk Levels</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>

            {/* Sort Field */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-[#120B30]/80 border border-purple-500/25 text-slate-200 focus:outline-none focus:border-purple-400"
            >
              <option value="risk">Sort: Risk Probability</option>
              <option value="attendance">Sort: Attendance</option>
              <option value="cgpa">Sort: CGPA</option>
              <option value="studentId">Sort: Student ID</option>
              <option value="name">Sort: Name</option>
            </select>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-xl bg-[#120B30]/80 border border-purple-500/25 text-slate-300 hover:text-white text-xs font-semibold"
              title="Toggle Sort Order"
            >
              {sortOrder === 'asc' ? '▲ ASC' : '▼ DESC'}
            </button>
          </div>
        </div>
      </Card>

      {/* Students Data Table */}
      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-purple-500/20 bg-purple-950/20 text-purple-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Dept & Year</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Backlogs</th>
                <th className="py-3 px-4">Fee Status</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Probability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Loading student cohort records...</div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    No students match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const prob = s.currentRisk?.probability || 0;
                  const probPct = Math.round(prob * 100);
                  const isCurrentPredicting = predictingId === s._id;

                  return (
                    <tr
                      key={s._id}
                      className="hover:bg-purple-500/10 transition-colors group cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-200">
                        <Link to={`/students/${s._id}`} className="hover:underline">
                          {s.studentId}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link to={`/students/${s._id}`} className="font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                          {s.name}
                        </Link>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">{s.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200">{s.department}</div>
                        <div className="text-[10px] text-slate-400">Year {s.year} • Sem {s.semester}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-semibold ${s.attendance < 65 ? 'text-pink-400' : s.attendance < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {s.attendance}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-semibold ${s.cgpa < 5.5 ? 'text-pink-600 dark:text-pink-400' : s.cgpa < 6.5 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                          {s.cgpa.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={s.backlogCount > 0 ? 'text-pink-300 font-bold' : 'text-slate-400'}>
                          {s.backlogCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          s.feePaymentStatus === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-300'
                            : s.feePaymentStatus === 'Pending'
                            ? 'bg-amber-500/10 text-amber-300'
                            : 'bg-pink-500/10 text-pink-300'
                        }`}>
                          {s.feePaymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={s.currentRisk?.riskLevel || 'Low'} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {probPct}%
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => handlePredictSingle(e, s._id)}
                            disabled={isCurrentPredicting}
                            title="Run single prediction"
                            className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-600/30 transition-all"
                          >
                            <RotateCw className={`w-3.5 h-3.5 ${isCurrentPredicting ? 'animate-spin' : ''}`} />
                          </button>
                          <Link
                            to={`/students/${s._id}`}
                            title="View student file"
                            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-purple-600/30 transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-purple-500/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total students)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchStudents(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded-xl border border-purple-500/25 bg-[#120B30] text-slate-200 hover:text-white disabled:opacity-40 flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => fetchStudents(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-xl border border-purple-500/25 bg-[#120B30] text-slate-200 hover:text-white disabled:opacity-40 flex items-center gap-1 transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Add Student Modal */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false);
            fetchStudents(1);
            setNotificationMsg('New student registered and AI risk assessment calculated.');
          }}
        />
      )}

      {/* Bulk CSV Modal */}
      {showBulkModal && (
        <BulkUploadModal
          onClose={() => setShowBulkModal(false)}
          onUploaded={(count) => {
            setShowBulkModal(false);
            fetchStudents(1);
            setNotificationMsg(`Successfully imported and scored ${count} students from CSV.`);
          }}
        />
      )}
    </div>
  );
}

// Add Student Sub-Modal
function AddStudentModal({ onClose, onAdded }) {
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    department: 'Computer Science',
    semester: 1,
    year: 1,
    gender: 'Female',
    attendance: 85,
    cgpa: 7.5,
    internalMarks: 72,
    backlogCount: 0,
    assignmentSubmissionRate: 85,
    lmsEngagementScore: 80,
    feePaymentStatus: 'Paid',
    familyIncomeBracket: '2-5L',
    firstGenerationLearner: false,
    commuteDistanceKm: 6,
    pastCounsellingVisits: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/students', formData);
      onAdded();
    } catch (err) {
      setError(err.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl glass-panel p-6 sm:p-8 border border-purple-500/30 my-8 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-purple-500/20">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Enroll New Student</h3>
            <p className="text-xs text-slate-400">Real-time ML feature extraction and risk assessment will run automatically</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-purple-300 font-semibold mb-1">Student ID *</label>
              <input
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="e.g. S1250"
                className="w-full px-3 py-2 rounded-xl bg-[#110A2E] border border-purple-500/25 text-white"
              />
            </div>
            <div>
              <label className="block text-purple-300 font-semibold mb-1">Full Name *</label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Maya Patel"
                className="w-full px-3 py-2 rounded-xl bg-[#110A2E] border border-purple-500/25 text-white"
              />
            </div>
            <div>
              <label className="block text-purple-300 font-semibold mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="maya.s1250@eduwings.edu"
                className="w-full px-3 py-2 rounded-xl bg-[#110A2E] border border-purple-500/25 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-purple-300 font-semibold mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#110A2E] border border-purple-500/25 text-white"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics & Comm.">Electronics & Comm.</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>
            <div>
              <label className="block text-purple-300 font-semibold mb-1">Semester & Year</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value), year: Math.ceil(e.target.value / 2) })}
                  className="w-1/2 px-3 py-2 rounded-xl bg-[#110A2E] border border-purple-500/25 text-white"
                  title="Semester"
                />
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-1/2 px-3 py-2 rounded-xl bg-[#110A2E] border border-purple-500/25 text-white"
                  title="Year"
                />
              </div>
            </div>
            <div>
              <label className="block text-purple-300 font-semibold mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#110A2E] border border-purple-500/25 text-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-purple-500/15">
            <div>
              <label className="block text-slate-300 mb-1">Attendance (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.attendance}
                onChange={(e) => setFormData({ ...formData, attendance: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#110A2E] border border-purple-500/25 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">CGPA (0 - 10)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#110A2E] border border-purple-500/25 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Active Backlogs</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.backlogCount}
                onChange={(e) => setFormData({ ...formData, backlogCount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#110A2E] border border-purple-500/25 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Assignment Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.assignmentSubmissionRate}
                onChange={(e) => setFormData({ ...formData, assignmentSubmissionRate: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#110A2E] border border-purple-500/25 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Fee Payment Status</label>
              <select
                value={formData.feePaymentStatus}
                onChange={(e) => setFormData({ ...formData, feePaymentStatus: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#110A2E] border border-purple-500/25 text-white"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1">LMS Engagement (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.lmsEngagementScore}
                onChange={(e) => setFormData({ ...formData, lmsEngagementScore: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#110A2E] border border-purple-500/25 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Commute (Km)</label>
              <input
                type="number"
                min="0"
                value={formData.commuteDistanceKm}
                onChange={(e) => setFormData({ ...formData, commuteDistanceKm: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#110A2E] border border-purple-500/25 text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="fgLearner"
              checked={formData.firstGenerationLearner}
              onChange={(e) => setFormData({ ...formData, firstGenerationLearner: e.target.checked })}
              className="rounded bg-[#110A2E] border-purple-500/30 text-purple-500"
            />
            <label htmlFor="fgLearner" className="text-slate-300 text-xs">
              First-generation college learner
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-purple-500/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-md shadow-purple-600/30 disabled:opacity-50"
            >
              {loading ? 'Evaluating Model...' : 'Enroll & Predict'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Bulk CSV Import Modal
function BulkUploadModal({ onClose, onUploaded }) {
  const [csvText, setCsvText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const sampleCSV = `studentId,name,email,department,year,semester,attendance,cgpa,backlogCount,assignmentSubmissionRate,lmsEngagementScore,feePaymentStatus
S2001,Aakash Varma,aakash.s2001@eduwings.edu,Computer Science,2,3,68,6.1,1,65,55,Paid
S2002,Divya Rao,divya.s2002@eduwings.edu,Mechanical Engineering,1,2,54,4.9,3,50,42,Pending
S2003,Tanvi Joshi,tanvi.s2003@eduwings.edu,Electronics & Comm.,3,5,91,8.4,0,94,88,Paid`;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvText(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleProcessImport = async () => {
    if (!csvText.trim()) {
      setError('Please select a CSV file or paste CSV text.');
      return;
    }
    setUploading(true);
    setError('');

    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) throw new Error('CSV must contain a header and at least one student row.');

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
      const parsedStudents = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const vals = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = vals[idx];
        });
        parsedStudents.push(obj);
      }

      const res = await api.post('/students/bulk', { students: parsedStudents });
      onUploaded(res.importedCount || parsedStudents.length);
    } catch (err) {
      setError(err.message || 'CSV Parsing or upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl glass-panel p-6 sm:p-8 border border-purple-500/30 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Bulk CSV Import</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Select CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold">Or Paste CSV Data Below</label>
              <button
                type="button"
                onClick={() => setCsvText(sampleCSV)}
                className="text-[11px] text-purple-300 hover:text-white underline"
              >
                Insert sample demo CSV
              </button>
            </div>
            <textarea
              rows="6"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="studentId,name,email,department,year,attendance,cgpa..."
              className="w-full p-3 font-mono text-[11px] rounded-xl bg-[#110A2E] border border-purple-500/25 text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/15 text-[11px] text-slate-300">
            Each imported record is automatically parsed through the machine learning pipeline and assigned an initial dropout probability.
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-purple-500/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleProcessImport}
              disabled={uploading}
              className="px-5 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-md shadow-purple-600/30 disabled:opacity-50"
            >
              {uploading ? 'Processing & Scoring...' : 'Import Cohort'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
