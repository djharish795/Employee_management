"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, CalendarCheck, Calendar, 
  MonitorSmartphone, ShieldCheck, History, UserPlus, 
  UserMinus, BookOpen, GitBranch, UserSearch, 
  Banknote, TrendingUp, Network, Settings, LogOut, Plus, FileText, CheckSquare
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

const getWorkReportsPath = (role: string | null) => {
  if (!role) return '/employee/work-reports';
  const r = role.toUpperCase();
  if (['TEAM_LEAD', 'MANAGER'].includes(r)) return '/team-lead/work-reports';
  if (['CEO', 'COO'].includes(r)) return '/ceo/work-reports';
  if (['CTO'].includes(r)) return '/ceo/work-reports'; // fallback to ceo view or specific cto view
  if (['CFO', 'FINANCE'].includes(r)) return '/ceo/work-reports';
  if (['CHRO', 'HR'].includes(r)) return '/ceo/work-reports';
  if (['OM', 'CRM', 'CEM', 'OE'].includes(r)) return `/${r.toLowerCase()}/work-reports`;
  return '/employee/work-reports';
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
  const role = useAuthStore((state) => state.role);
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };
  const dashboardPath = getDashboardPath(role);
  const workReportsPath = getWorkReportsPath(role);
  const roleTitle = getRoleTitle(role);

  const allNavItems = [
    { title: 'Dashboard', icon: LayoutDashboard, href: dashboardPath },
    { title: 'Tasks', icon: CheckSquare, href: '/tasks' },
    { title: 'Employees', icon: Users, href: '/employees' },
    { title: 'Attendance', icon: CalendarCheck, href: '/attendance' },
    { title: 'Leaves', icon: Calendar, href: '/leaves' },
    { title: 'Assets', icon: MonitorSmartphone, href: (role === 'HR' || role === 'OM' || role === 'CHRO') ? '/assets/my' : '/assets' },
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
    { title: 'Work Reports', icon: FileText, href: workReportsPath },
    { title: 'Settings', icon: Settings, href: '/settings' },
  ];

  const employeeAllowedModules = [
    'Dashboard', 'Tasks', 'Attendance', 'Leaves', 'Work Reports', 'Assets', 'Knowledge Base', 'Org Chart', 'Settings'
  ];

  const isEmployee = !role || role.toUpperCase() === 'EMPLOYEE';
  const navItems = isEmployee 
    ? allNavItems.filter(item => employeeAllowedModules.includes(item.title))
    : allNavItems;


  return (
    <aside className="w-[260px] flex-shrink-0 bg-white flex flex-col h-screen text-slate-600 overflow-y-auto overflow-x-hidden border-r border-slate-200 scrollbar-hide">
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Naprocs {roleTitle}</h2>
        <p className="text-xs text-slate-500 font-medium tracking-wide mt-0.5">{roleTitle} Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href) || (pathname === '/' && item.href === '/executive');
          return (
            <Link 
              key={item.title} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-slate-100 text-slate-900 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
          Logout
        </button>
      </div>
    </aside>
  );
}
