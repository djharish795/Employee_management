"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Calendar, 
  CheckSquare, 
  Star, 
  Settings, 
  LogOut,
  Lock,
  LifeBuoy
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';

export function TeamLeadSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  const navItems = [
    { title: 'Dashboard', icon: LayoutDashboard, href: '/team-lead/dashboard' },
    { title: 'My Team', icon: Users, href: '/team-lead/team' },
    { title: 'Attendance', icon: CalendarCheck, href: '/attendance' },
    { title: 'Leave', icon: Calendar, href: '/leaves' },
    { title: 'Task Board', icon: CheckSquare, href: '/team-lead/task-board' },
    { title: 'Performance Input', icon: Star, href: '/team-lead/performance' },
  ];

  const bottomItems = [
    { title: 'Settings', icon: Settings, href: '/settings' },
    { title: 'Lock Screen', icon: Lock, href: '/lock' },
    { title: 'Support', icon: LifeBuoy, href: '/support' },
  ];

  const handleLogout = () => {
    clearSession();
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  return (
    <div className="w-64 bg-slate-900 text-slate-300 h-full flex flex-col font-sans relative border-r border-slate-800">
      
      {/* Brand Header */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Naprocs EMS</h2>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Team Lead Portal</p>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href || '#');
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-600/10 text-blue-400' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <item.icon className="w-4 h-4 text-slate-500" />
            {item.title}
          </Link>
        ))}
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors mt-2"
        >
          <LogOut className="w-4 h-4 text-slate-500" />
          Log Out
        </button>
      </div>
    </div>
  );
}
