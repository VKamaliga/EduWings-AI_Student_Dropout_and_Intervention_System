import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  LineChart,
  ClipboardList,
  FileSpreadsheet,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Risk Analysis', path: '/risk-analysis', icon: LineChart },
    { name: 'Interventions', path: '/interventions', icon: ClipboardList },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
    ...(isAdmin ? [{ name: 'Settings', path: '/settings', icon: Settings }] : []),
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 lg:bottom-auto lg:h-screen overflow-y-auto left-0 z-50 w-64 bg-[#110A2E]/95 lg:bg-[#110A2E]/70 dark:bg-[#110A2E]/70 backdrop-blur-xl border-r border-purple-500/20 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 pb-4 flex items-center justify-between border-b border-purple-500/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-md shadow-purple-600/30 flex items-center justify-center">
                <div className="w-full h-full bg-[#150D38] rounded-[10px] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-purple-300" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  EduCare
                </div>
                <div className="text-[10px] uppercase tracking-wider text-purple-300 font-medium">
                  Predict • Support • Retain
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-purple-500/10'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout (Bottom) */}
        <div className="p-4 border-t border-purple-500/15">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-[10px]"
                />
              ) : (
                <div className="w-full h-full bg-[#1A1040] rounded-[10px] flex items-center justify-center text-xs font-bold text-purple-200">
                  {user?.name?.slice(0, 2).toUpperCase() || 'US'}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <div className="text-[11px] text-purple-300 capitalize truncate">
                {user?.role} {user?.department ? `• ${user.department}` : ''}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
