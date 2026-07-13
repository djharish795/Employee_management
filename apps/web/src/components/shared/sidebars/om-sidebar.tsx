"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CheckSquare, Briefcase, Users, CalendarCheck, FileText, AlertTriangle, HelpCircle, LogOut, FileBadge, ArrowUpRight
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export function OmSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navGroups = [
    {
      label: 'Operations Portal',
      subtitle: 'Enterprise EMS',
      items: [
        { title: 'Dashboard', icon: LayoutDashboard, href: '/om/dashboard' },
        { title: 'Tasks', icon: CheckSquare, href: '/tasks' },
        { title: 'Projects', icon: Briefcase, href: '/projects' },
        { title: 'Teams', icon: Users, href: '/teams' },
        { title: 'Approvals', icon: CalendarCheck, href: '/om/approvals' },
        { title: 'Escalations', icon: AlertTriangle, href: '/om/escalations' },
        { title: 'Work Reports', icon: FileText, href: '/om/work-reports' },
      ]
    },
    {
      label: 'Client Operations',
      items: [
        { title: 'Scheduler', icon: CalendarCheck, href: '/om/scheduler' },
        { title: 'Client Reports', icon: FileText, href: '/om/reports' },
      ]
    },
    {
      label: 'Other',
      items: [
        { title: 'Help Center', icon: HelpCircle, href: '/help' },
        { title: 'Log Out', icon: LogOut, action: logout },
      ]
    }
  ];

  return (
    <div className="w-[280px] h-full bg-[#1e2330] text-slate-300 flex flex-col border-r border-[#2a3040]">
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 text-white mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <FileBadge className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide">Operations Portal</h2>
            <p className="text-[10px] text-slate-400 font-medium">Enterprise EMS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide px-4">
        <div className="space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <div className="space-y-1">
                {group.items.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                  
                  if (item.action) {
                    return (
                      <button
                        key={i}
                        onClick={item.action}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:text-white hover:bg-[#2a3040]"
                      >
                        <Icon className="w-4 h-4" />
                        {item.title}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={i}
                      href={item.href || '#'}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                          : 'text-slate-400 hover:text-white hover:bg-[#2a3040]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-4 border-t border-[#2a3040]">
        <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2">
          Quick Action
        </button>
      </div>
    </div>
  );
}
