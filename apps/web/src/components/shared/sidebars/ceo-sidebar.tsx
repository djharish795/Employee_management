"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Calendar, ShieldCheck, History,
  Network, BarChart3, Settings, LogOut, Menu, X, ChevronLeft, Plus,
  MessageSquare, CalendarCheck, UserPlus, UserMinus, BookOpen, CheckSquare
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const getDashboardPath = (role: string) => {
  if (['SUPER_ADMIN', 'IT'].includes(role)) return '/admin/dashboard';
  if (['CEO', 'COO'].includes(role)) return '/executive/dashboard';
  if (role === 'CTO') return '/cto/dashboard';
  if (['CFO', 'FINANCE'].includes(role)) return '/finance/dashboard';
  if (['CHRO', 'HR'].includes(role)) return '/hr/dashboard';
  return '/employee/dashboard';
};

const getNavItems = (role: string) => {
  const items = [
    { title: 'Dashboard', icon: LayoutDashboard, href: getDashboardPath(role) },
    { title: 'Tasks', icon: CheckSquare, href: '/tasks' },
    { title: 'Connect', icon: MessageSquare, href: '/connect' },
    { title: 'Attendance', icon: CalendarCheck, href: '/attendance' },
    { title: 'Employees', icon: Users, href: '/employees' },
    { title: 'Org Chart', icon: Network, href: '/org-chart' },
    { title: 'Analytics', icon: BarChart3, href: '/analytics' },
    { title: 'Knowledge Base', icon: BookOpen, href: '/knowledge' },
  ];

  if (['SUPER_ADMIN', 'CEO', 'COO', 'HR', 'CHRO', 'COMPLIANCE_OFFICER', 'LEGAL'].includes(role)) {
    items.push({ title: 'Compliance', icon: ShieldCheck, href: '/compliance' });
  }

  items.push({ title: 'Leaves', icon: Calendar, href: '/leaves' });

  if (role === 'HR') {
    items.push({ title: 'Onboarding', icon: UserPlus, href: '/onboarding' });
    items.push({ title: 'Offboarding', icon: UserMinus, href: '/offboarding' });
    items.push({ title: 'Workflows', icon: BookOpen, href: '/hr/workflows' });
  }

  if (role === 'SUPER_ADMIN') {
    items.push({ title: 'Audit Log', icon: History, href: '/audit' });
  }

  return items;
};

export function CeoSidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const role = useAuthStore((state) => state.role) || 'EMPLOYEE';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [mounted, setMounted]       = useState(false);
  
  const displayRole = role.replace('_', ' ');

  React.useEffect(() => { setMounted(true); }, []);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {/* Brand Header */}
      <div className={`p-5 pb-4 flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between'}`}>
        {!collapsed && (
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug">Naprocs EMS</h2>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5 capitalize">{displayRole} Dashboard</p>
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

      {/* Quick Action */}
      {!collapsed && (
        <div className="px-4 pb-5">
          <button className="w-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </button>
        </div>
      )}
      {collapsed && (
        <div className="px-3 pb-5">
          <button className="w-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center py-2.5 rounded-lg transition-colors shadow-sm" title="New Request">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={`flex-1 space-y-0.5 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
        {getNavItems(role).map((item) => {
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

      {/* Logout Footer */}
      <div className={`p-4 mt-auto border-t border-slate-100 ${collapsed ? 'px-2' : ''}`}>
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
      <aside className="hidden lg:flex flex-col flex-shrink-0 bg-white h-screen border-r border-slate-200 overflow-hidden w-[240px]" />
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
          <h2 className="text-base font-bold text-slate-900 capitalize">Naprocs {displayRole}</h2>
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-white h-screen border-r border-slate-200 overflow-hidden transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[64px]' : 'w-[240px]'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
