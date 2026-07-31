"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, CalendarCheck, Calendar,
  MonitorSmartphone, BookOpen, Network, Settings, LogOut, Menu, X, ChevronLeft, Plus,
  MessageSquare, CheckSquare
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useRbac } from '@/hooks/use-rbac';
import { Permission } from '@naprocs/types';
import { apiClient } from '@/lib/api/client';

const NAV_ITEMS = [
  { title: 'Dashboard',     icon: LayoutDashboard, href: '/employee/dashboard' },
  { title: 'Tasks',         icon: CheckSquare,     href: '/tasks' },
  { title: 'Connect',       icon: MessageSquare,   href: '/connect' },
  { title: 'Attendance',    icon: CalendarCheck,   href: '/attendance' },
  { title: 'Leaves',        icon: Calendar,        href: '/leaves' },
  { title: 'Assets',        icon: MonitorSmartphone,href: '/assets' },
  { title: 'Knowledge Base',icon: BookOpen,        href: '/knowledge' },
  { title: 'Org Chart',     icon: Network,         href: '/org-chart' },
  { title: 'Settings',      icon: Settings,        href: '/settings' },
];

export function EmployeeSidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const { hasPermission } = useRbac();
  const accessToken = useAuthStore((state) => state.accessToken);
  const storeRole = useAuthStore((state) => state.role) || 'Employee';
  
  let userName = "User";
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      if (payload.email) {
        userName = payload.email.split('@')[0];
        userName = userName.split('.').map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
      }
    } catch (e) {
      // ignore
    }
  }

  const initials = userName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  const displayRole = storeRole.replace('_', ' ');

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [showTasks, setShowTasks]   = useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    // Check if user has technical department or project assignments
    apiClient.get('/profile/me').then(res => {
      const deptCode = res.data?.department?.code || '';
      const isTechnical = ['DEV', 'ENG', 'TECH', 'QA'].includes(deptCode);
      const hasProjectAssignment = res.data?.user?.hasProjectAssignment;
      
      const role = useAuthStore.getState().role;
      const hasGlobalRole = ['CEO', 'CTO', 'DM', 'SPM', 'PM', 'TL', 'OM'].includes(role || '');
      
      if (isTechnical || hasProjectAssignment || hasGlobalRole) {
        setShowTasks(true);
      }
    }).catch(e => console.error(e));
  }, []);

  const handleLogout = () => {
    clearSession();
    window.location.href = '/login';
  };

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.href === '/settings') {
      return hasPermission(Permission.ACCESS_SETTINGS);
    }
    return true;
  });

  const renderSidebarContent = (onNavigate?: () => void) => (
    <>
      {/* Brand Header */}
      <div className={`p-5 pb-4 flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between'}`}>
        {!collapsed && (
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug">Naprocs EMS</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5 capitalize">{useAuthStore.getState().role?.toLowerCase() || 'employee'} Dashboard</p>
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
        {filteredNavItems.map((item) => {
          if (item.title === 'Tasks' && !showTasks) return null;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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
                  ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`} />
              {!collapsed && item.title}
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className={`p-4 mt-auto border-t border-slate-200 dark:border-slate-800 ${collapsed ? 'px-2' : ''}`}>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </>
  );

  if (!mounted) {
    return (
      <aside className="hidden lg:flex flex-col flex-shrink-0 bg-white dark:bg-slate-950 h-screen border-r border-slate-200 dark:border-slate-800 overflow-hidden w-[240px] transition-colors" />
    );
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-50 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white dark:bg-slate-950 z-50 flex flex-col border-r border-slate-200 dark:border-slate-800 shadow-xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Naprocs Employee</h2>
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
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
        className={`hidden lg:flex flex-col flex-shrink-0 bg-white dark:bg-slate-950 h-screen border-r border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[64px]' : 'w-[240px]'
        }`}
      >
        {renderSidebarContent()}
      </aside>
    </>
  );
}
