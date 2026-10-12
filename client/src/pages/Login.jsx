import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ShieldCheck, HeartHandshake, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@eduwings.edu');
  const [password, setPassword] = useState('EduWingsAdmin@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    {
      role: 'Admin',
      name: 'Kamaliga Varatharaj',
      email: 'admin@eduwings.edu',
      pass: 'EduWingsAdmin@2026!',
      badge: 'All Access',
    },
    {
      role: 'Faculty',
      name: 'Lavanya Muthukumar',
      email: 'faculty@eduwings.edu',
      pass: 'EduWingsFaculty@2026!',
      badge: 'CS Dept',
    },
    {
      role: 'Counsellor',
      name: 'Varsha S Rao',
      email: 'counsellor@eduwings.edu',
      pass: 'EduWingsCounsellor@2026!',
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8F8FA] dark:bg-[#0B0B10] text-[#14141B] dark:text-[#ECECF1] font-sans antialiased relative">
      {/* Floating Theme Toggle (Top Right) */}
      <div className="absolute top-5 right-5 z-30">
        <ThemeToggle />
      </div>

      {/* LEFT PANEL: Brand & Value Proposition */}
      <div className="lg:w-1/2 flex flex-col justify-between p-8 lg:p-14 relative z-10 border-b lg:border-b-0 lg:border-r border-[#E5E5EB] dark:border-[#24242E] bg-white dark:bg-[#0B0B10]">
        <div>
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-md bg-[#7C5CFA] flex items-center justify-center shrink-0 text-white">
              <GraduationCap className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-[#14141B] dark:text-[#ECECF1]">
                EduWings
              </div>
              <div className="text-[10px] text-[#70707E] dark:text-[#6B6B7B]">
                Predict • Support • Retain
              </div>
            </div>
          </div>

          {/* Headline & Subline */}
          <div className="max-w-lg">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#14141B] dark:text-[#ECECF1] leading-tight mb-4">
              Support every student <br />
              <span className="text-[#7C5CFA]">before they slip away.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#52525F] dark:text-[#A0A0B0] leading-relaxed mb-6">
              EduWings transforms academic records, attendance trends, and behavioral signals into actionable, explainable insights — empowering faculty and counsellors to intervene early and retain learners.
            </p>

            {/* Three Feature Chips */}
            <div className="flex flex-wrap gap-2 mb-8">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F8F8FA] dark:bg-[#14141B] border border-[#E5E5EB] dark:border-[#24242E] text-[#52525F] dark:text-[#A0A0B0] text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#7C5CFA]" strokeWidth={1.5} />
                <span>Early detection</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F8F8FA] dark:bg-[#14141B] border border-[#E5E5EB] dark:border-[#24242E] text-[#52525F] dark:text-[#A0A0B0] text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2F9E6F]" strokeWidth={1.5} />
                <span>Explainable risk</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F8F8FA] dark:bg-[#14141B] border border-[#E5E5EB] dark:border-[#24242E] text-[#52525F] dark:text-[#A0A0B0] text-xs font-medium">
                <HeartHandshake className="w-3.5 h-3.5 text-[#7C5CFA]" strokeWidth={1.5} />
                <span>Timely intervention</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supportive Institutional Trust Badge */}
        <div className="pt-5 border-t border-[#E5E5EB] dark:border-[#24242E] flex items-center gap-3 text-xs text-[#70707E] dark:text-[#6B6B7B]">
          <div className="flex -space-x-1.5">
            <div className="w-6 h-6 rounded-md border border-[#E5E5EB] dark:border-[#24242E] bg-black/5 dark:bg-white/5 flex items-center justify-center font-mono text-[10px] text-[#52525F] dark:text-[#A0A0B0]">
              CS
            </div>
            <div className="w-6 h-6 rounded-md border border-[#E5E5EB] dark:border-[#24242E] bg-black/5 dark:bg-white/5 flex items-center justify-center font-mono text-[10px] text-[#52525F] dark:text-[#A0A0B0]">
              EC
            </div>
            <div className="w-6 h-6 rounded-md border border-[#E5E5EB] dark:border-[#24242E] bg-black/5 dark:bg-white/5 flex items-center justify-center font-mono text-[10px] text-[#52525F] dark:text-[#A0A0B0]">
              ME
            </div>
          </div>
          <div>
            <strong className="text-[#14141B] dark:text-[#ECECF1] font-medium">200+ Students</strong> actively monitored across 5 departments.
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Sign-In Card & Quick Demo Access */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-[#F8F8FA] dark:bg-[#0B0B10]">
        <div className="w-full max-w-sm">
          {/* Solid Card Container */}
          <div className="bg-white dark:bg-[#14141B] rounded-lg p-6 sm:p-8 border border-[#E5E5EB] dark:border-[#24242E] shadow-sm dark:shadow-none">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-[#14141B] dark:text-[#ECECF1] tracking-tight mb-1">
                Sign in securely
              </h2>
              <p className="text-xs text-[#70707E] dark:text-[#6B6B7B]">
                Access your institutional dashboard and student risk roster
              </p>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-md bg-[#D64550]/10 border border-[#D64550]/20 text-[#D64550] text-xs flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#52525F] dark:text-[#A0A0B0] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#70707E] dark:text-[#6B6B7B] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@eduwings.edu"
                    className="w-full pl-9 pr-3 py-2 rounded-md bg-white dark:bg-[#0B0B10] border border-[#E5E5EB] dark:border-[#24242E] focus:border-[#7C5CFA] focus:outline-none focus:ring-1 focus:ring-[#7C5CFA] text-[#14141B] dark:text-[#ECECF1] placeholder-[#70707E] dark:placeholder-[#6B6B7B] text-xs transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#52525F] dark:text-[#A0A0B0] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#70707E] dark:text-[#6B6B7B] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 rounded-md bg-white dark:bg-[#0B0B10] border border-[#E5E5EB] dark:border-[#24242E] focus:border-[#7C5CFA] focus:outline-none focus:ring-1 focus:ring-[#7C5CFA] text-[#14141B] dark:text-[#ECECF1] placeholder-[#70707E] dark:placeholder-[#6B6B7B] text-xs transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#70707E] dark:text-[#6B6B7B] hover:text-[#14141B] dark:hover:text-[#ECECF1]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-md font-medium text-xs text-white bg-[#7C5CFA] hover:bg-[#6C4CE0] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-1 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign in securely</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Section */}
            <div className="mt-6 pt-5 border-t border-[#E5E5EB] dark:border-[#24242E]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-medium text-[#52525F] dark:text-[#A0A0B0]">
                  Quick demo access
                </span>
                <span className="text-[11px] text-[#70707E] dark:text-[#6B6B7B]">Click to autofill</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickFill(acc)}
                    className={`p-2 rounded-md border text-left transition-colors cursor-pointer ${
                      email === acc.email
                        ? 'border-[#7C5CFA] bg-[#7C5CFA]/10 text-[#7C5CFA]'
                        : 'border-[#E5E5EB] dark:border-[#24242E] bg-[#F8F8FA] dark:bg-[#1C1C26] text-[#14141B] dark:text-[#ECECF1] hover:border-[#7C5CFA]/40'
                    }`}
                  >
                    <div className="text-xs font-medium">{acc.role}</div>
                    <div className="text-[10px] text-[#70707E] dark:text-[#6B6B7B] truncate">{acc.badge}</div>
                  </button>
                ))}
              </div>

              <div className="mt-3.5 p-2 rounded-md bg-[#F8F8FA] dark:bg-[#1C1C26] border border-[#E5E5EB] dark:border-[#24242E] text-[11px] text-[#70707E] dark:text-[#6B6B7B] text-center">
                Pre-configured with 200 real students, ML risk scoring, and mock cohorts.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
