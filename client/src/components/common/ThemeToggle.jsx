import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label="Toggle visual theme"
      className={`p-2.5 rounded-xl transition-all duration-200 border flex items-center justify-center ${
        isDark
          ? 'bg-[#181138]/80 hover:bg-[#221750] border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 hover:text-slate-900 dark:hover:text-white shadow-sm'
          : 'bg-white hover:bg-slate-50 border-purple-200 text-purple-700 hover:text-purple-900 shadow-sm'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-700 dark:text-amber-300 animate-in spin-in-90 duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-purple-600 animate-in spin-in-90 duration-200" />
      )}
    </button>
  );
}
