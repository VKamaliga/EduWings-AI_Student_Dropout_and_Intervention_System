import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Users,
  Sliders,
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
      <div className="py-24 text-center text-[#70707E] dark:text-[#6B6B7B]">
        <div className="inline-block w-6 h-6 border-2 border-[#7C5CFA] border-t-transparent rounded-full animate-spin mb-2" />
        <div>Loading configuration & administrative controls...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {message && (
        <div className="p-3.5 rounded-md bg-[#2F9E6F]/10 border border-[#2F9E6F]/20 text-[#2F9E6F] text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2F9E6F]" strokeWidth={1.5} />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="text-[#2F9E6F] hover:opacity-80">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-[#14141B] dark:text-[#ECECF1] tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-[#7C5CFA]" strokeWidth={1.5} />
          <span>System & Risk Threshold Configuration</span>
        </h2>
        <p className="text-xs text-[#70707E] dark:text-[#6B6B7B]">
          Calibrate classification cutoffs, update institutional profile, and manage authorized faculty and counsellor credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Risk Thresholds & Institutional Settings */}
        <Card className="lg:col-span-5 p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E5E5EB] dark:border-[#24242E]">
            <Sliders className="w-4 h-4 text-[#7C5CFA]" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-[#14141B] dark:text-[#ECECF1]">Risk Threshold Calibration</h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#52525F] dark:text-[#A0A0B0] font-medium mb-1">
                Institution Name
              </label>
              <input
                type="text"
                required
                value={settings.institutionName}
                onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0B0B10] border border-[#E5E5EB] dark:border-[#24242E] text-[#14141B] dark:text-[#ECECF1] focus:outline-none focus:border-[#7C5CFA]"
              />
            </div>

            <div>
              <label className="block text-[#52525F] dark:text-[#A0A0B0] font-medium mb-1">
                Active Academic Year
              </label>
              <input
                type="text"
                required
                value={settings.academicYear}
                onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0B0B10] border border-[#E5E5EB] dark:border-[#24242E] text-[#14141B] dark:text-[#ECECF1] focus:outline-none focus:border-[#7C5CFA]"
              />
            </div>

            {/* Threshold Sliders */}
            <div className="p-3.5 rounded-md bg-[#F8F8FA] dark:bg-[#1C1C26] border border-[#E5E5EB] dark:border-[#24242E] space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#2F9E6F] font-medium">Low Risk Ceiling</span>
                  <span className="font-mono text-[#14141B] dark:text-[#ECECF1] font-medium">&lt; {settings.riskThresholdLow}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="45"
                  value={settings.riskThresholdLow}
                  onChange={(e) => setSettings({ ...settings, riskThresholdLow: Number(e.target.value) })}
                  className="w-full accent-[#2F9E6F] cursor-pointer"
                />
                <span className="text-[10px] text-[#70707E] dark:text-[#6B6B7B]">Students below this threshold are categorized as Low Risk.</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#D64550] font-medium">High Risk Floor</span>
                  <span className="font-mono text-[#14141B] dark:text-[#ECECF1] font-medium">&gt; {settings.riskThresholdHigh}%</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="85"
                  value={settings.riskThresholdHigh}
                  onChange={(e) => setSettings({ ...settings, riskThresholdHigh: Number(e.target.value) })}
                  className="w-full accent-[#D64550] cursor-pointer"
                />
                <span className="text-[10px] text-[#70707E] dark:text-[#6B6B7B]">Students exceeding this threshold trigger immediate high-priority alerts.</span>
              </div>

              <div className="p-2 rounded-md bg-black/5 dark:bg-white/5 border border-[#E5E5EB] dark:border-[#24242E] text-[11px] text-[#52525F] dark:text-[#A0A0B0]">
                <strong>Medium Risk Window:</strong> Evaluated between {settings.riskThresholdLow}% and {settings.riskThresholdHigh}%.
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="autoNotify"
                checked={settings.autoNotifyHighRisk}
                onChange={(e) => setSettings({ ...settings, autoNotifyHighRisk: e.target.checked })}
                className="rounded bg-white dark:bg-[#0B0B10] border-[#E5E5EB] dark:border-[#24242E] text-[#7C5CFA]"
              />
              <label htmlFor="autoNotify" className="text-[#52525F] dark:text-[#A0A0B0]">
                Automatically push alert notifications upon high-risk flag
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="w-full py-2 px-4 rounded-md font-medium text-white bg-[#7C5CFA] hover:bg-[#6C4CE0] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" strokeWidth={1.5} />
                <span>{savingSettings ? 'Saving Settings...' : 'Apply System Parameters'}</span>
              </button>
            </div>
          </form>
        </Card>

        {/* Right Column: User & Staff Role Management */}
        <Card className="lg:col-span-7 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E5EB] dark:border-[#24242E]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#7C5CFA]" strokeWidth={1.5} />
              <div>
                <h3 className="text-sm font-semibold text-[#14141B] dark:text-[#ECECF1]">Authorized Institutional Staff</h3>
                <p className="text-xs text-[#70707E] dark:text-[#6B6B7B]">Admin, Faculty mentors, and Student Counsellors</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium text-white bg-[#7C5CFA] hover:bg-[#6C4CE0] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Add Staff</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {users.map((u) => (
              <div
                key={u._id}
                className="p-3 rounded-md bg-[#F8F8FA] dark:bg-[#1C1C26] border border-[#E5E5EB] dark:border-[#24242E] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-[#7C5CFA]/10 border border-[#7C5CFA]/20 text-[#7C5CFA] flex items-center justify-center shrink-0 font-medium text-[11px]">
                    {u.name?.slice(0, 2).toUpperCase() || 'ST'}
                  </div>

                  <div className="min-w-0">
                    <div className="font-medium text-[#14141B] dark:text-[#ECECF1] truncate">{u.name}</div>
                    <div className="text-[11px] text-[#70707E] dark:text-[#6B6B7B] truncate">{u.email}</div>
                    <div className="text-[10px] text-[#52525F] dark:text-[#A0A0B0]">
                      {u.title || u.role} • {u.department}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium capitalize ${
                      u.role === 'admin'
                        ? 'bg-[#7C5CFA]/10 text-[#7C5CFA]'
                        : u.role === 'counsellor'
                        ? 'bg-[#C98A1B]/10 text-[#C98A1B]'
                        : 'bg-black/5 dark:bg-white/5 text-[#52525F] dark:text-[#A0A0B0]'
                    }`}
                  >
                    {u.role}
                  </span>

                  <button
                    onClick={() => handleToggleUserActive(u._id, u.active)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                      u.active
                        ? 'bg-[#2F9E6F]/10 text-[#2F9E6F] hover:bg-[#D64550]/10 hover:text-[#D64550]'
                        : 'bg-black/5 dark:bg-white/5 text-[#70707E] dark:text-[#6B6B7B] hover:bg-[#2F9E6F]/10 hover:text-[#2F9E6F]'
                    }`}
                  >
                    {u.active ? 'Active' : 'Deactivated'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Add Staff Account Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onAdded={(newUser) => {
            setUsers((prev) => [...prev, newUser]);
            setShowAddUserModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddUserModal({ onClose, onAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'faculty',
    department: 'Computer Science',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/register', formData);
      onAdded(res.user);
    } catch (err) {
      setError(err.message || 'Failed to create user account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-[#14141B] p-6 border border-[#E5E5EB] dark:border-[#24242E] shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E5EB] dark:border-[#24242E]">
          <h3 className="text-base font-semibold text-[#14141B] dark:text-[#ECECF1]">Create Staff Account</h3>
          <button onClick={onClose} className="text-[#70707E] dark:text-[#6B6B7B] hover:text-[#14141B] dark:hover:text-[#ECECF1]">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-md bg-[#D64550]/10 border border-[#D64550]/20 text-[#D64550] text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[#52525F] dark:text-[#A0A0B0] font-medium mb-1">Full Name *</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Anand Verma"
              className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0B0B10] border border-[#E5E5EB] dark:border-[#24242E] text-[#14141B] dark:text-[#ECECF1] focus:outline-none focus:border-[#7C5CFA]"
            />
          </div>

          <div>
            <label className="block text-[#52525F] dark:text-[#A0A0B0] font-medium mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="anand@eduwings.edu"
              className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0B0B10] border border-[#E5E5EB] dark:border-[#24242E] text-[#14141B] dark:text-[#ECECF1] focus:outline-none focus:border-[#7C5CFA]"
            />
          </div>

          <div>
            <label className="block text-[#52525F] dark:text-[#A0A0B0] font-medium mb-1">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0B0B10] border border-[#E5E5EB] dark:border-[#24242E] text-[#14141B] dark:text-[#ECECF1] focus:outline-none focus:border-[#7C5CFA]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#52525F] dark:text-[#A0A0B0] font-medium mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0B0B10] border border-[#E5E5EB] dark:border-[#24242E] text-[#14141B] dark:text-[#ECECF1] focus:outline-none focus:border-[#7C5CFA]"
              >
                <option value="faculty">Faculty</option>
                <option value="counsellor">Counsellor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-[#52525F] dark:text-[#A0A0B0] font-medium mb-1">Department</label>
              <input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Computer Science"
                className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#0B0B10] border border-[#E5E5EB] dark:border-[#24242E] text-[#14141B] dark:text-[#ECECF1] focus:outline-none focus:border-[#7C5CFA]"
              />
            </div>
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
              className="px-4 py-1.5 rounded-md font-medium text-xs text-white bg-[#7C5CFA] hover:bg-[#6C4CE0] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
