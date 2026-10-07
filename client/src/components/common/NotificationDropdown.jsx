import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, AlertTriangle, Calendar, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'high_risk_alert':
        return <AlertTriangle className="w-4 h-4 text-pink-600 dark:text-pink-400" />;
      case 'intervention_due':
        return <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-purple-400" />;
    }
  };

  const handleNotificationClick = (item) => {
    markAsRead(item._id);
    setOpen(false);
    if (item.studentId) {
      navigate(`/students?search=${encodeURIComponent(item.studentId)}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-xl border border-purple-200 dark:border-purple-500/25 bg-[#160E3A]/60 hover:bg-[#1E144D] text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-md shadow-pink-500/50">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel border border-purple-300 dark:border-purple-500/30 p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-purple-200 dark:border-purple-500/15">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-purple-700 dark:text-purple-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                No new notifications at this time.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    item.read
                      ? 'bg-purple-900/10 border-purple-200 dark:border-purple-500/10 opacity-70 hover:opacity-100'
                      : 'bg-purple-50 dark:bg-purple-500/15 border-purple-300 dark:border-purple-500/30 hover:bg-purple-500/25'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-black/20 shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                        {item.message}
                      </div>
                      <div className="text-[9px] text-purple-700 dark:text-purple-300/70 mt-1">
                        {new Date(item.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
