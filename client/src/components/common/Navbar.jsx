import React, { useState } from 'react';
import { Menu, Search, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ title = 'Student Risk Dashboard', onOpenSidebar }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/students?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#0D0822]/80 dark:bg-[#0D0822]/80 border-b border-purple-500/15 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-purple-500/10 border border-purple-500/20"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Academic Year pill, Search Bar, Notifications, ThemeToggle */}
      <div className="flex items-center gap-3">
        {/* Academic Year pill from the screenshot */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-200">
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
          <span>ACADEMIC YEAR <strong>2026 – 2027</strong></span>
        </div>

        {/* Global Quick Search */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:block relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or ID..."
            className="pl-9 pr-3.5 py-1.5 w-44 md:w-56 rounded-xl text-xs bg-[#170E3B]/70 border border-purple-500/25 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
          />
        </form>

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Profile Pill */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-purple-500/20">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover rounded-[10px]"
              />
            ) : (
              <div className="w-full h-full bg-[#180E3E] rounded-[10px] flex items-center justify-center text-[10px] font-bold text-white">
                {user?.name?.slice(0, 2).toUpperCase() || 'US'}
              </div>
            )}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
              {user?.name}
            </div>
            <div className="text-[10px] text-purple-300 capitalize">{user?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
