import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label="Toggle visual theme"
      className={`p-1.5 rounded-md transition-colors border flex items-center justify-center ${
        isDark
          ? 'bg-[#14141B] hover:bg-[#1A1A23] border-[#24242E] text-[#A0A0B0] hover:text-[#ECECF1]'
          : 'bg-white hover:bg-[#F8F8FA] border-[#E5E5EB] text-[#52525F] hover:text-[#14141B]'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#C98A1B]" strokeWidth={1.5} />
      ) : (
        <Moon className="w-4 h-4 text-[#7C5CFA]" strokeWidth={1.5} />
      )}
    </button>
  );
}
