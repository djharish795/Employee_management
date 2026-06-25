"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, CalendarCheck, Calendar, 
  MonitorSmartphone, ShieldCheck, History, UserPlus, 
  UserMinus, BookOpen, GitBranch, UserSearch, 
  Banknote, TrendingUp, Network, Settings, LogOut, Plus,
  Menu, X, ChevronLeft
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const getDashboardPath = (role: string | null) => {
  if (!role) return '/employee/dashboard';
  const r = role.toUpperCase();
  if (['SUPER_ADMIN', 'IT'].includes(r)) return '/admin/dashboard';
  if (['CEO', 'COO'].includes(r)) return '/executive/dashboard';
  if (['CTO'].includes(r)) return '/cto/dashboard';
  if (['CFO', 'FINANCE'].includes(r)) return '/finance/dashboard';
  if (['CHRO', 'HR'].includes(r)) return '/hr/dashboard';
  return '/employee/dashboard';
};

const getRoleTitle = (role: string | null) => {
  if (!role) return 'Employee';
  const r = role.toUpperCase();
  if (r === 'SUPER_ADMIN') return 'Super Admin';
  if (r === 'CEO') return 'CEO';
  if (r === 'CTO') return 'CTO';
  if (r === 'COO') return 'COO';
  if (r === 'CFO') return 'CFO';
  if (r === 'CHRO') return 'CHRO';
  if (r === 'HR') return 'HR Admin';
  if (r === 'IT') return 'IT Admin';
  if (r === 'FINANCE') return 'Finance';
  if (r === 'MANAGER') return 'Manager';
  if (r === 'TEAM_LEAD') return 'Team Lead';
  return 'Employee';
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const storeRole = useAuthStore((state) => state.role);
  const clearSession = useAuthStore((state) => state.clearSession);

  // Fallback to cookie if Zustand hasn't hydrated yet (prevents flashing 'Employee' layout for executives)
  const cookieRole = typeof document !== 'undefined' 
    ? document.cookie.match(new RegExp('(^| )role=([^;]+)'))?.[2] 
    : null;
  const role = storeRole || cookieRole;

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);
  // Desktop collapsed (icon-only) state
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };
  const dashboardPath = getDashboardPath(role);
  const roleTitle = getRoleTitle(role);

  const allNavItems = [
    { title: 'Dashboard', icon: LayoutDashboard, href: dashboardPath },
    { title: 'Employees', icon: Users, href: '/employees' },
    { title: 'Attendance', icon: CalendarCheck, href: '/attendance' },
    { title: 'Leaves', icon: Calendar, href: '/leaves' },
    { title: 'Assets', icon: MonitorSmartphone, href: '/assets' },
    { title: 'Compliance', icon: ShieldCheck, href: '/compliance' },
    { title: 'Audit Log', icon: History, href: '/audit' },
    { title: 'Onboarding', icon: UserPlus, href: '/onboarding' },
    { title: 'Offboarding', icon: UserMinus, href: '/offboarding' },
    { title: 'Knowledge Base', icon: BookOpen, href: '/knowledge' },
    { title: 'Workflows', icon: GitBranch, href: '/workflows' },
    { title: 'Recruitment', icon: UserSearch, href: '/recruitment' },
    { title: 'Payroll', icon: Banknote, href: '/payroll' },
    { title: 'Performance', icon: TrendingUp, href: '/performance' },
    { title: 'Org Chart', icon: Network, href: '/org-chart' },
    { title: 'Settings', icon: Settings, href: '/settings' },
  ];

  const employeeAllowedModules = [
    'Dashboard', 'Attendance', 'Leaves', 'Assets', 'Knowledge Base', 'Org Chart', 'Settings'
  ];

  const isEmployee = !role || role.toUpperCase() === 'EMPLOYEE';
  const navItems = isEmployee 
    ? allNavItems.filter(item => employeeAllowedModules.includes(item.title))
    : allNavItems;

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {/* Brand Header */}
      <div className={`p-5 pb-4 flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between'}`}>
        {!collapsed && (
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug">Naprocs {roleTitle}</h2>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">{roleTitle} Dashboard</p>
          </div>
        )}
        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* New Request Action */}
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
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href) || (pathname === '/' && item.href === '/executive');
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

      {/* Footer Logout */}
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

  return (
    <>
      {/* Mobile Hamburger Toggle — shown only on mobile, positioned in top-left */}
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
          <h2 className="text-base font-bold text-slate-900">Naprocs {roleTitle}</h2>
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
