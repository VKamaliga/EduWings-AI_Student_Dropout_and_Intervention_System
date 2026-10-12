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
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-[#0B0B10] border-b border-[#E5E5EB] dark:border-[#24242E] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-1.5 rounded-md text-[#52525F] dark:text-[#A0A0B0] hover:text-[#14141B] dark:hover:text-[#ECECF1] bg-[#F8F8FA] dark:bg-[#14141B] border border-[#E5E5EB] dark:border-[#24242E]"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-4 h-4" strokeWidth={1.5} />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-[#14141B] dark:text-[#ECECF1] tracking-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Academic Year pill, Search Bar, Notifications, ThemeToggle */}
      <div className="flex items-center gap-2.5">
        {/* Academic Year pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F8F8FA] dark:bg-[#14141B] border border-[#E5E5EB] dark:border-[#24242E] text-xs font-normal text-[#52525F] dark:text-[#A0A0B0]">
          <Calendar className="w-3.5 h-3.5 text-[#7C5CFA]" strokeWidth={1.5} />
          <span>Academic Year <strong>2026 – 2027</strong></span>
        </div>

        {/* Global Quick Search */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:block relative">
          <Search className="w-3.5 h-3.5 text-[#70707E] dark:text-[#6B6B7B] absolute left-2.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or ID..."
            className="pl-8 pr-3 py-1.5 w-44 md:w-52 rounded-md text-xs bg-white dark:bg-[#14141B] border border-[#E5E5EB] dark:border-[#24242E] text-[#14141B] dark:text-[#ECECF1] placeholder-[#70707E] dark:placeholder-[#6B6B7B] focus:outline-none focus:border-[#7C5CFA] focus:ring-1 focus:ring-[#7C5CFA] transition-colors"
          />
        </form>

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Profile Pill */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E5E5EB] dark:border-[#24242E]">
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
          <div className="hidden xl:block text-left">
            <div className="text-xs font-medium text-[#14141B] dark:text-[#ECECF1] leading-tight truncate max-w-[120px]">
              {user?.name}
            </div>
            <div className="text-[10px] text-[#70707E] dark:text-[#6B6B7B] capitalize">{user?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
