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
        return <AlertTriangle className="w-3.5 h-3.5 text-[#D64550]" strokeWidth={1.5} />;
      case 'intervention_due':
        return <Calendar className="w-3.5 h-3.5 text-[#C98A1B]" strokeWidth={1.5} />;
      default:
        return <Info className="w-3.5 h-3.5 text-[#7C5CFA]" strokeWidth={1.5} />;
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
        className="relative p-1.5 rounded-md border border-[#E5E5EB] dark:border-[#24242E] bg-white dark:bg-[#14141B] hover:bg-[#F8F8FA] dark:hover:bg-[#1A1A23] text-[#52525F] dark:text-[#A0A0B0] transition-colors flex items-center justify-center"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D64550] text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-white dark:bg-[#14141B] border border-[#E5E5EB] dark:border-[#24242E] p-3.5 shadow-sm dark:shadow-none z-50">
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#E5E5EB] dark:border-[#24242E]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#14141B] dark:text-[#ECECF1]">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[#D64550]/10 text-[#D64550]">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-[#7C5CFA] hover:underline flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3 h-3" strokeWidth={1.5} />
                <span>Mark read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto space-y-1.5 pr-0.5">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#70707E] dark:text-[#6B6B7B]">
                No new notifications.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-2.5 rounded-md border text-left cursor-pointer transition-colors ${
                    item.read
                      ? 'bg-transparent border-[#E5E5EB]/60 dark:border-[#24242E]/60 opacity-60 hover:opacity-100'
                      : 'bg-[#F8F8FA] dark:bg-[#1A1A23] border-[#E5E5EB] dark:border-[#24242E] hover:border-[#7C5CFA]/40'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="p-1 rounded bg-black/5 dark:bg-white/5 shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-[#14141B] dark:text-[#ECECF1] truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#52525F] dark:text-[#A0A0B0] line-clamp-2 mt-0.5">
                        {item.message}
                      </div>
                      <div className="text-[10px] text-[#70707E] dark:text-[#6B6B7B] mt-1">
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
