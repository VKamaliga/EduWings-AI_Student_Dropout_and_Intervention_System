import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/students/')) return 'Student File';
    if (pathname.startsWith('/students')) return 'Students Directory';
    if (pathname.startsWith('/risk-analysis')) return 'Risk Analysis & Model Insights';
    if (pathname.startsWith('/interventions')) return 'Interventions & Action Plans';
    if (pathname.startsWith('/reports')) return 'Institutional Retention Reports';
    if (pathname.startsWith('/settings')) return 'System & Threshold Settings';
    return 'Student Risk Dashboard';
  };

  return (
    <div className="min-h-screen flex bg-deep-space text-slate-900 dark:text-slate-100 font-sans">
      {/* Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar
          title={getPageTitle(location.pathname)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
