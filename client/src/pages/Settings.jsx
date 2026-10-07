import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Users,
  Sliders,
  Shield,
  Save,
  UserPlus,
  CheckCircle2,
  X,
} from 'lucide-react';
import Card from '../components/common/Card';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    institutionName: 'EduWings Institute of Technology',
    academicYear: '2025 – 2026',
    riskThresholdLow: 35,
    riskThresholdHigh: 65,
    autoNotifyHighRisk: true,
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [settRes, usersRes] = await Promise.all([
          api.get('/settings'),
          api.get('/auth/users'),
        ]);
        if (settRes.setting) setSettings(settRes.setting);
        setUsers(usersRes.users || []);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setMessage('');
    try {
      const res = await api.put('/settings', settings);
      setMessage('Institutional parameters and risk thresholds updated successfully.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleUserActive = async (userId, currentActive) => {
    try {
      const res = await api.put(`/auth/users/${userId}`, { active: !currentActive });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? res.user : u))
      );
    } catch (err) {
      alert('Failed to update user status: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 dark:text-slate-400">
        <div className="inline-block w-8 h-8 border-4 border-purple-300 dark:border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-3" />
        <div>Loading configuration & administrative controls...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/35 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="text-emerald-700 dark:text-emerald-300 hover:text-slate-900 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-purple-400" />
          <span>System & Risk Threshold Configuration</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Calibrate classification cutoffs, update institutional profile, and manage authorized faculty and counsellor credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Risk Thresholds & Institutional Settings */}
        <Card className="lg:col-span-5 p-6 border border-purple-200 dark:border-purple-500/25">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-purple-200 dark:border-purple-500/15">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Risk Threshold Calibration</h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                Institution Name
              </label>
              <input
                type="text"
                required
                value={settings.institutionName}
                onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#110A2E] border border-purple-200 dark:border-purple-500/25 text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                Active Academic Year
              </label>
              <input
                type="text"
                required
                value={settings.academicYear}
                onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#110A2E] border border-purple-200 dark:border-purple-500/25 text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Threshold Sliders */}
            <div className="p-4 rounded-2xl bg-white dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Low Risk Ceiling</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">&lt; {settings.riskThresholdLow}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="45"
                  value={settings.riskThresholdLow}
                  onChange={(e) => setSettings({ ...settings, riskThresholdLow: Number(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Students with dropout probability below this threshold are categorized as Low Risk.</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-pink-600 dark:text-pink-400 font-bold">High Risk Floor</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">&gt; {settings.riskThresholdHigh}%</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="85"
                  value={settings.riskThresholdHigh}
                  onChange={(e) => setSettings({ ...settings, riskThresholdHigh: Number(e.target.value) })}
                  className="w-full accent-pink-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Students exceeding this threshold trigger immediate high-priority intervention alerts.</span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 text-[11px] text-amber-200">
                <strong>Medium Risk Window:</strong> Automatically evaluated between {settings.riskThresholdLow}% and {settings.riskThresholdHigh}%.
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="autoNotify"
                checked={settings.autoNotifyHighRisk}
                onChange={(e) => setSettings({ ...settings, autoNotifyHighRisk: e.target.checked })}
                className="rounded bg-white dark:bg-[#110A2E] border-purple-300 dark:border-purple-500/30 text-purple-600"
              />
              <label htmlFor="autoNotify" className="text-slate-600 dark:text-slate-300">
                Automatically push alert notifications to counsellors upon high-risk flag
              </label>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Saving Settings...' : 'Apply System Parameters'}</span>
              </button>
            </div>
          </form>
        </Card>

        {/* Right Column: User & Staff Role Management */}
        <Card className="lg:col-span-7 p-6 border border-purple-200 dark:border-purple-500/25">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-purple-200 dark:border-purple-500/15">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Authorized Institutional Staff</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Admin, Faculty mentors, and Student Counsellors</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Staff</span>
            </button>
          </div>

          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u._id}
                className="p-3.5 rounded-2xl bg-white dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shrink-0">
                    <div className="w-full h-full bg-white dark:bg-[#180E3E] rounded-[10px] flex items-center justify-center font-bold text-white text-[11px]">
                      {u.name?.slice(0, 2).toUpperCase() || 'ST'}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white truncate">{u.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{u.email}</div>
                    <div className="text-[10px] text-purple-700 dark:text-purple-300 font-medium">
                      {u.title || u.role} • {u.department}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin'
                        ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30'
                        : u.role === 'counsellor'
                        ? 'bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-500/30'
                        : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30'
                    }`}
                  >
                    {u.role}
                  </span>

                  <button
                    onClick={() => handleToggleUserActive(u._id, u.active)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                      u.active
                        ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-red-500/15 hover:text-red-300'
                        : 'bg-slate-100 dark:bg-slate-500/15 text-slate-500 dark:text-slate-400 hover:bg-emerald-500/15 hover:text-emerald-300'
                    }`}
                  >
                    {u.active ? 'Active' : 'Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onAdded={(newUser) => {
            setShowAddUserModal(false);
            setUsers((prev) => [newUser, ...prev]);
            setMessage(`Staff account created for ${newUser.name}.`);
          }}
        />
      )}
    </div>
  );
}

// Add User Sub-Modal
function AddUserModal({ onClose, onAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'faculty',
    department: 'Computer Science',
    title: 'Assistant Professor',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/auth/users', formData);
      onAdded(res.user);
    } catch (err) {
      setError(err.message || 'Failed to create user account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-purple-300 dark:border-purple-500/30 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-200 dark:border-purple-500/20">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Staff Account</h3>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-xl bg-pink-50 dark:bg-pink-500/15 border border-pink-300 dark:border-pink-500/30 text-pink-700 dark:text-pink-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Full Name *</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Anand Verma"
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#110A2E] border border-purple-200 dark:border-purple-500/25 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="anand@eduwings.edu"
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#110A2E] border border-purple-200 dark:border-purple-500/25 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#110A2E] border border-purple-200 dark:border-purple-500/25 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#110A2E] border border-purple-200 dark:border-purple-500/25 text-white"
              >
                <option value="faculty">Faculty</option>
                <option value="counsellor">Counsellor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Department</label>
              <input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Computer Science"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#110A2E] border border-purple-200 dark:border-purple-500/25 text-white"
              />
            </div>
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
              className="px-5 py-2 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/30 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
