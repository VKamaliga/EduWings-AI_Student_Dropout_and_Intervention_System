import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ShieldCheck, HeartHandshake, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@eduwings.edu');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    {
      role: 'Admin',
      name: 'Dr. Warren',
      email: 'admin@eduwings.edu',
      pass: 'Admin@123',
      color: 'border-purple-500/40 hover:border-purple-500 text-purple-400 bg-purple-500/10',
      badge: 'All Access',
    },
    {
      role: 'Faculty',
      name: 'Prof. Kulkarni',
      email: 'faculty@eduwings.edu',
      pass: 'Faculty@123',
      color: 'border-blue-500/40 hover:border-blue-500 text-blue-400 bg-blue-500/10',
      badge: 'CS Dept',
    },
    {
      role: 'Counsellor',
      name: 'Dr. Jenkins',
      email: 'counsellor@eduwings.edu',
      pass: 'Counsellor@123',
      color: 'border-pink-500/40 hover:border-pink-500 text-pink-400 bg-pink-500/10',
      badge: 'At-Risk Support',
    },
  ];

  const handleQuickFill = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0D0822] text-slate-100 dark:bg-[#0D0822] dark:text-slate-100 font-sans relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating Theme Toggle (Top Right) */}
      <div className="absolute top-6 right-6 z-30">
        <ThemeToggle />
      </div>

      {/* LEFT PANEL: Brand & Value Proposition */}
      <div className="lg:w-1/2 flex flex-col justify-between p-8 lg:p-16 relative z-10 border-b lg:border-b-0 lg:border-r border-purple-500/20 bg-gradient-to-br from-[#120B30]/80 via-[#0E0826]/90 to-[#0A061C]/95">
        <div>
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3.5 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-purple-600/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#140D36] rounded-[14px] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-300" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-purple-100 to-pink-200">
                EduWings
              </div>
              <div className="text-xs uppercase tracking-widest text-purple-300/80 font-medium">
                Predict • Support • Retain
              </div>
            </div>
          </div>

          {/* Headline & Subline */}
          <div className="max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-6">
              Support every student <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300">
                before they slip away.
              </span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
              EduWings transforms academic records, attendance trends, and behavioral signals into actionable, explainable insights — empowering faculty and counsellors to intervene early and retain learners.
            </p>

            {/* Three Feature Chips */}
            <div className="flex flex-wrap gap-3 mb-10">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-200 text-xs sm:text-sm font-medium">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Early detection</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-500/10 border border-pink-500/25 text-pink-200 text-xs sm:text-sm font-medium">
                <ShieldCheck className="w-4 h-4 text-pink-400" />
                <span>Explainable risk</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-200 text-xs sm:text-sm font-medium">
                <HeartHandshake className="w-4 h-4 text-indigo-400" />
                <span>Timely intervention</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supportive Institutional Trust Badge */}
        <div className="mt-8 pt-6 border-t border-purple-500/15 flex items-center gap-4 text-xs text-slate-400">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border border-purple-400/30 bg-purple-900/60 flex items-center justify-center font-bold text-purple-200">
              CS
            </div>
            <div className="w-8 h-8 rounded-full border border-pink-400/30 bg-pink-900/60 flex items-center justify-center font-bold text-pink-200">
              EC
            </div>
            <div className="w-8 h-8 rounded-full border border-emerald-400/30 bg-emerald-900/60 flex items-center justify-center font-bold text-emerald-200">
              ME
            </div>
          </div>
          <div>
            <span className="text-white font-semibold">200+ Students</span> actively monitored across 5 departments.
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Sign-In Card & Quick Demo Access */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative z-10">
        <div className="w-full max-w-md">
          {/* Glass Card Container */}
          <div className="glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl relative border border-purple-500/30">
            <div className="mb-6 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white tracking-tight mb-1.5">
                Sign in securely
              </h2>
              <p className="text-sm text-slate-400">
                Access your institutional dashboard and student risk roster
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start gap-2.5">
                <span className="font-bold">•</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300/90 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@eduwings.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#110A2E]/80 border border-purple-500/25 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-white placeholder-slate-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300/90 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#110A2E]/80 border border-purple-500/25 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-white placeholder-slate-500 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:to-pink-600 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign in securely</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Section */}
            <div className="mt-8 pt-6 border-t border-purple-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-wider uppercase text-purple-300">
                  Quick demo access
                </span>
                <span className="text-[11px] text-slate-400">Click to autofill</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickFill(acc)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${acc.color} ${
                      email === acc.email ? 'ring-2 ring-purple-400' : ''
                    }`}
                  >
                    <div className="text-xs font-bold">{acc.role}</div>
                    <div className="text-[10px] text-slate-300 truncate">{acc.badge}</div>
                  </button>
                ))}
              </div>

              <div className="mt-4 p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/10 text-[11px] text-slate-400 text-center">
                Pre-configured with 200 real students, ML risk scoring, and mock cohorts.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
