"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, CalendarCheck, Calendar,
  MonitorSmartphone, ShieldCheck, History, UserPlus,
  UserMinus, BookOpen, GitBranch, UserSearch,
  Banknote, TrendingUp, Network, Settings, LogOut,
  Menu, X, ChevronLeft, BarChart3, Plus
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

// ─── Role → home dashboard ────────────────────────────────────────────────
const getDashboardPath = (role: string | null): string => {
  if (!role) return '/employee/dashboard';
  const r = role.toUpperCase();
  if (['SUPER_ADMIN', 'IT'].includes(r)) return '/admin/dashboard';
  if (['CEO', 'COO'].includes(r)) return '/executive/dashboard';
  if (['CTO'].includes(r)) return '/cto/dashboard';
  if (['CFO', 'FINANCE'].includes(r)) return '/finance/dashboard';
  if (['CHRO', 'HR'].includes(r)) return '/hr/dashboard';
  return '/employee/dashboard';
};

const getRoleTitle = (role: string | null): string => {
  if (!role) return 'Employee';
  const r = role.toUpperCase();
  const map: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    CEO: 'CEO', COO: 'COO', CTO: 'CTO',
    CFO: 'CFO', CHRO: 'CHRO', HR: 'HR Admin',
    IT: 'IT Admin', FINANCE: 'Finance',
    MANAGER: 'Manager', TEAM_LEAD: 'Team Lead',
  };
  return map[r] ?? 'Employee';
};

// ─── All possible nav items ───────────────────────────────────────────────
const ALL_NAV = [
  { title: 'Dashboard',     icon: LayoutDashboard, href: null },          // href injected dynamically
  { title: 'Employees',     icon: Users,            href: '/employees' },
  { title: 'Attendance',    icon: CalendarCheck,    href: '/attendance' },
  { title: 'Leaves',        icon: Calendar,         href: '/leaves' },
  { title: 'Assets',        icon: MonitorSmartphone,href: '/assets' },
  { title: 'Compliance',    icon: ShieldCheck,      href: '/compliance' },
  { title: 'Audit Log',     icon: History,          href: '/audit' },
  { title: 'Onboarding',    icon: UserPlus,         href: '/onboarding' },
  { title: 'Offboarding',   icon: UserMinus,        href: '/offboarding' },
  { title: 'Knowledge Base',icon: BookOpen,         href: '/knowledge' },
  { title: 'Workflows',     icon: GitBranch,        href: '/workflows' },
  { title: 'Recruitment',   icon: UserSearch,       href: '/recruitment' },
  { title: 'Payroll',       icon: Banknote,         href: '/payroll' },
  { title: 'Performance',   icon: TrendingUp,       href: '/performance' },
  { title: 'Org Chart',     icon: Network,          href: '/org-chart' },
  { title: 'Analytics',     icon: BarChart3,        href: '/analytics' },
  { title: 'Settings',      icon: Settings,         href: '/settings' },
];

// ─── Role → allowed modules list ─────────────────────────────────────────
const NAV_BY_ROLE: Record<string, string[]> = {
  EMPLOYEE: [
    'Dashboard', 'Attendance', 'Leaves', 'Assets',
    'Knowledge Base', 'Org Chart', 'Settings',
  ],
  MANAGER: [
    'Dashboard', 'Employees', 'Attendance', 'Leaves',
    'Performance', 'Workflows', 'Org Chart', 'Settings',
  ],
  TEAM_LEAD: [
    'Dashboard', 'Employees', 'Attendance', 'Leaves',
    'Performance', 'Org Chart', 'Settings',
  ],
  CTO: [
    'Dashboard', 'Employees', 'Attendance', 'Leaves',
    'Performance', 'Org Chart', 'Settings',
  ],
  HR: [
    'Dashboard', 'Employees', 'Attendance', 'Leaves',
    'Compliance', 'Onboarding', 'Offboarding',
    'Recruitment', 'Knowledge Base', 'Workflows', 'Settings',
  ],
  CHRO: [
    'Dashboard', 'Employees', 'Attendance', 'Leaves',
    'Compliance', 'Onboarding', 'Offboarding',
    'Recruitment', 'Payroll', 'Knowledge Base', 'Workflows', 'Settings',
  ],
  CFO: [
    'Dashboard', 'Employees', 'Payroll', 'Compliance', 'Settings',
  ],
  FINANCE: [
    'Dashboard', 'Employees', 'Payroll', 'Compliance', 'Settings',
  ],
  CEO: [
    'Dashboard', 'Employees', 'Org Chart', 'Analytics',
    'Compliance', 'Leaves', 'Audit Log',
  ],
  COO: [
    'Dashboard', 'Employees', 'Org Chart', 'Analytics',
    'Compliance', 'Leaves', 'Workflows',
  ],
  SUPER_ADMIN: [
    'Dashboard', 'Employees', 'Attendance', 'Leaves', 'Assets',
    'Compliance', 'Audit Log', 'Onboarding', 'Offboarding',
    'Knowledge Base', 'Workflows', 'Recruitment', 'Payroll',
    'Performance', 'Org Chart', 'Analytics', 'Settings',
  ],
  IT: [
    'Dashboard', 'Employees', 'Assets', 'Audit Log',
    'Compliance', 'Settings',
  ],
};

export function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const storeRole = useAuthStore((state) => state.role);
  const clearSession = useAuthStore((state) => state.clearSession);

  // Cookie fallback for SSR hydration race
  const cookieRole = typeof document !== 'undefined'
    ? (document.cookie.match(new RegExp('(^| )role=([^;]+)'))?.[2] ?? null)
    : null;
  const role = (storeRole || cookieRole)?.toUpperCase() ?? 'EMPLOYEE';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [mounted, setMounted]       = useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  const dashboardPath = getDashboardPath(role);
  const roleTitle     = getRoleTitle(role);

  // Build filtered nav list for the current role
  const allowedTitles = NAV_BY_ROLE[role] ?? NAV_BY_ROLE['EMPLOYEE'];
  const navItems = ALL_NAV
    .filter(item => allowedTitles.includes(item.title))
    .map(item => ({
      ...item,
      href: item.title === 'Dashboard' ? dashboardPath : (item.href ?? '#'),
    }));

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {/* Brand Header */}
      <div className={`p-5 pb-4 flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between'}`}>
        {!collapsed && (
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug">Naprocs EMS</h2>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">{roleTitle} Dashboard</p>
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
        {navItems.map((item) => {
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
