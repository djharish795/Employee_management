"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, CalendarCheck, Calendar, 
  MonitorSmartphone, ShieldCheck, History, UserPlus, 
  UserMinus, BookOpen, GitBranch, UserSearch, 
  Banknote, TrendingUp, Network, Settings, LogOut, Plus
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/executive' },
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] flex-shrink-0 bg-white flex flex-col h-screen text-slate-600 overflow-y-auto overflow-x-hidden border-r border-slate-200 scrollbar-hide">
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Naprocs CEO</h2>
        <p className="text-xs text-slate-500 font-medium tracking-wide mt-0.5">Executive Dashboard</p>
      </div>

      {/* Action Button */}
      <div className="px-4 pb-6">
        <button className="w-full bg-[#2563EB] hover:bg-blue-600 text-white flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>
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
                  ? 'bg-blue-50 text-blue-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
          Logout
        </button>
      </div>
    </aside>
  );
}
