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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 lg:bottom-auto lg:h-screen overflow-y-auto left-0 z-50 w-60 bg-white dark:bg-[#0B0B10] border-r border-[#E5E5EB] dark:border-[#24242E] flex flex-col justify-between transition-transform duration-150 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-4 flex items-center justify-between border-b border-[#E5E5EB] dark:border-[#24242E]">
            <div className="flex items-center gap-2.5">
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

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-[#70707E] hover:text-[#14141B] dark:hover:text-[#ECECF1] hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#7C5CFA]/10 text-[#7C5CFA] dark:text-[#ECECF1] border-l-2 border-[#7C5CFA]'
                        : 'text-[#52525F] dark:text-[#A0A0B0] hover:text-[#14141B] dark:hover:text-[#ECECF1] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#7C5CFA]' : 'text-[#70707E] dark:text-[#6B6B7B]'
                        }`}
                        strokeWidth={1.5}
                      />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout (Bottom) */}
        <div className="p-3 border-t border-[#E5E5EB] dark:border-[#24242E]">
          <div className="p-2.5 rounded-lg bg-[#F8F8FA] dark:bg-[#14141B] border border-[#E5E5EB] dark:border-[#24242E] mb-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#7C5CFA]/10 border border-[#7C5CFA]/20 flex items-center justify-center shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <span className="text-[10px] font-semibold text-[#7C5CFA]">
                  {user?.name?.slice(0, 2).toUpperCase() || 'US'}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-[#14141B] dark:text-[#ECECF1] truncate">
                {user?.name}
              </div>
              <div className="text-[10px] text-[#70707E] dark:text-[#6B6B7B] capitalize truncate">
                {user?.role} {user?.department ? `• ${user.department}` : ''}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-[#52525F] dark:text-[#A0A0B0] hover:text-[#D64550] hover:bg-[#D64550]/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
