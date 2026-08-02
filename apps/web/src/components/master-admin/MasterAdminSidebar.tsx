"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity, ShieldAlert, Users, LayoutDashboard, LogOut, ChevronLeft, Menu, X, Database, MonitorPlay, AlertTriangle
} from 'lucide-react';
import { clearMasterAdminToken } from './MasterAdminEntryPoint';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { title: 'System Health Radar', icon: Activity, href: '/observatory?tab=health' },
  { title: 'Global Network Tracer', icon: Activity, href: '/observatory?tab=tracer' },
  { title: 'Live Now', icon: Activity, href: '/observatory?tab=live' },
  { title: 'Analytics & Traffic', icon: MonitorPlay, href: '/observatory?tab=analytics' },
  { title: 'Anomaly Radar', icon: AlertTriangle, href: '/observatory?tab=anomalies' },
  { title: 'Deep Audit', icon: Database, href: '/observatory?tab=audit' },
  { title: 'Crewbase Control', icon: Users, href: '/observatory?tab=crewbase' },
  { title: 'Security Alerts', icon: ShieldAlert, href: '/observatory?tab=security' },
];

export function MasterAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => setMounted(true), []);

  const handleLogout = () => {
    clearMasterAdminToken();
    router.push('/login');
  };

  const renderSidebarContent = (onNavigate?: () => void) => (
    <>
      {/* Brand Header */}
      <div className={`p-5 pb-4 flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between'}`}>
        {!collapsed && (
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug">Crewbase Observatory</h2>
            <p className="text-[11px] text-red-500 font-bold tracking-wide mt-0.5 uppercase">Master Admin</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex-shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          return (
            <Link
              key={item.title}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.title : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                collapsed ? 'justify-center' : ''
              } text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 text-slate-400 dark:text-slate-500`} />
              {!collapsed && item.title}
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className={`p-4 mt-auto border-t border-slate-200 dark:border-slate-800 ${collapsed ? 'px-2' : ''}`}>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Exit Observatory' : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          {!collapsed && <span>Exit Observatory</span>}
        </button>
      </div>
    </>
  );

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-white">Observatory</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-950 flex flex-col border-r border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-end p-4">
              <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarContent(() => setMobileOpen(false))}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
        {renderSidebarContent()}
      </aside>
    </>
  );
}
