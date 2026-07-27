"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, CalendarCheck, Calendar,
  MonitorSmartphone, BookOpen, Network, Settings, LogOut, Menu, X, ChevronLeft,
  MessageSquare, CheckSquare, Users, Star, Lock
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useRbac } from '@/hooks/use-rbac';
import { Permission } from '@naprocs/types';
import { apiClient } from '@/lib/api/client';

const INDIVIDUAL_NAV_ITEMS = [
  { title: 'Dashboard',     icon: LayoutDashboard, href: '/employee/dashboard' },
  { title: 'Tasks',         icon: CheckSquare,     href: '/tasks' },
  { title: 'Connect',       icon: MessageSquare,   href: '/connect' },
  { title: 'Attendance',    icon: CalendarCheck,   href: '/attendance' },
  { title: 'Leaves',        icon: Calendar,        href: '/leaves' },
  { title: 'Assets',        icon: MonitorSmartphone,href: '/assets' },
  { title: 'Knowledge Base',icon: BookOpen,        href: '/knowledge' },
  { title: 'Org Chart',     icon: Network,         href: '/org-chart' },
];

const TEAM_NAV_ITEMS = [
  { title: 'Dashboard',         icon: LayoutDashboard, href: '/team-lead/dashboard' },
  { title: 'My Team',           icon: Users,           href: '/team-lead/team' },
  { title: 'Team Attendance',   icon: CalendarCheck,   href: '/team-lead/attendance' },
  { title: 'Team Leave',        icon: Calendar,        href: '/team-lead/leaves' },
  { title: 'Task Board',        icon: CheckSquare,     href: '/team-lead/task-board' },
  { title: 'Performance Input', icon: Star,            locked: true },
];

export function TeamLeadSidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const { hasPermission } = useRbac();

  const [workspace, setWorkspace] = useState<'individual' | 'team'>(
    pathname.startsWith('/team-lead') ? 'team' : 'individual'
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [showTasks, setShowTasks]   = useState(false);

  useEffect(() => {
    setMounted(true);
    
    apiClient.get('/profile/me').then(res => {
      const deptCode = res.data?.department?.code || '';
      const isTechnical = ['ENG', 'TECH', 'QA'].includes(deptCode);
      const hasProjectAssignment = res.data?.user?.hasProjectAssignment;
      
      const role = useAuthStore.getState().role;
      const hasGlobalRole = ['CEO', 'CTO', 'DM', 'SPM', 'PM', 'TL', 'OM'].includes(role || '');
      
      if (isTechnical || hasProjectAssignment || hasGlobalRole) {
        setShowTasks(true);
      }
    }).catch(e => console.error(e));
  }, []);

  useEffect(() => {
    setWorkspace(pathname.startsWith('/team-lead') ? 'team' : 'individual');
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    window.location.href = '/login';
  };

  const navItems = workspace === 'individual' ? INDIVIDUAL_NAV_ITEMS : TEAM_NAV_ITEMS;

  const renderSidebarContent = (onNavigate?: () => void) => (
    <>
      {/* Brand Header */}
      <div className={`p-5 pb-4 flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between'}`}>
        {!collapsed && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">Naprocs EMS</h2>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">My Workspace</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Workspace Toggle */}
      {!collapsed && (
        <div className="px-4 pb-5">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setWorkspace('individual');
                router.push('/employee/dashboard');
              }}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all ${
                workspace === 'individual'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => {
                setWorkspace('team');
                router.push('/team-lead/dashboard');
              }}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all ${
                workspace === 'team'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Team Workspace
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item: any) => {
          if (item.title === 'Tasks' && !showTasks) return null;
          if (item.locked) {
            return (
              <div key={item.title} title={collapsed ? item.title : undefined} className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed ${collapsed ? 'justify-center' : ''}`}>
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 flex-shrink-0 text-slate-300" />
                  {!collapsed && item.title}
                </div>
                {!collapsed && <Lock className="w-3.5 h-3.5 text-slate-300" />}
              </div>
            );
          }
          const isActive = item.href && (pathname === item.href || pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.title}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.title : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
              {!collapsed && item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer Settings & Logout */}
      <div className={`p-4 mt-auto border-t border-slate-100 ${collapsed ? 'px-2 space-y-1' : 'space-y-1'}`}>
        {hasPermission(Permission.ACCESS_SETTINGS) && (
          <Link
            href="/settings"
            title={collapsed ? 'Settings' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <Settings className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {!collapsed && 'Settings'}
          </Link>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </>
  );

  if (!mounted) {
    return (
      <aside id="tour-sidebar" className="hidden lg:flex flex-col flex-shrink-0 bg-white h-screen border-r border-slate-200 overflow-hidden w-[240px] transition-colors" />
    );
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-50 p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-700 hover:bg-slate-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col border-r border-slate-200 shadow-xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Naprocs Portal</h2>
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col">
          {renderSidebarContent(() => setMobileOpen(false))}
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        id="tour-sidebar"
        className={`hidden lg:flex flex-col flex-shrink-0 bg-white h-screen border-r border-slate-200 overflow-hidden transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[64px]' : 'w-[240px]'
        }`}
      >
        {renderSidebarContent()}
      </aside>
    </>
  );
}
