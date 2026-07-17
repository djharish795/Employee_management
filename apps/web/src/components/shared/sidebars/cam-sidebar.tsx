"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Calendar, ShieldCheck, History,
  Network, BarChart3, Settings, LogOut, Menu, X, ChevronLeft, Plus,
  MessageSquare, CalendarCheck, UserPlus, UserMinus, BookOpen, Monitor, Lock, Bell, CheckSquare, Target, Briefcase, AlignLeft
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useNotifications } from '@/hooks/use-notifications';
import { useRbac } from '@/hooks/use-rbac';
import { Permission } from '@naprocs/types';

export function CamSidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const { unreadCount } = useNotifications();
  const { hasPermission } = useRbac();
  const storeRole = useAuthStore((state) => state.role) || 'CEM';
  const accessToken = useAuthStore((state) => state.accessToken);
  const photoUrl = useAuthStore((state) => state.photoUrl);

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

  let displayRole = storeRole.replace('_', ' ');
  if (storeRole === 'OM') displayRole = 'Operations Manager';
  else if (storeRole === 'OE') displayRole = 'Operations Executive';
  else if (storeRole === 'CRM') displayRole = 'CRM Executive';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [mounted, setMounted]       = useState(false);
  
  React.useEffect(() => { setMounted(true); }, []);

  const handleLogout = () => {
    clearSession();
    window.location.href = '/login';
  };

  const otherItems: any[] = [
    { title: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined, href: '/notifications' },
  ];
  if (hasPermission(Permission.ACCESS_SETTINGS)) {
    otherItems.push({ title: 'Settings', icon: Settings, href: '/settings' });
  }

  const navGroups = [
    {
      label: 'CAM PORTAL',
      items: [
        { title: 'Dashboard', icon: LayoutDashboard, href: '/cam/dashboard' },
        { title: 'Lead Workspace', icon: Briefcase, href: '/cam/workspace' },
        { title: 'Follow-up Hub', icon: History, href: '/cam/follow-ups' },
        { title: 'Meetings', icon: Calendar, href: '/cam/meetings' },
        { title: 'Qualification', icon: ShieldCheck, href: '/cam/qualification' },
      ]
    },
    {
      label: 'MY WORKPLACE',
      items: [
        { title: 'Tasks', icon: CheckSquare, href: '/tasks' },
        { title: 'Connect', icon: MessageSquare, href: '/connect' },
        { title: 'Attendance', icon: CalendarCheck, href: '/attendance' },
        { title: 'Leaves', icon: Calendar, href: '/leaves' },
        { title: 'Assets', icon: Monitor, href: '/assets' },
        { title: 'Knowledge Base', icon: BookOpen, href: '/knowledge' },
        { title: 'Org Chart', icon: Network, href: '/org-chart' },
      ]
    },
    {
      label: 'OTHER',
      items: otherItems
    }
  ];

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {/* Brand Header */}
      <div className={`p-5 pb-4 flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between'}`}>
        {!collapsed && (
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug">Naprocs EMS</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5 uppercase">{displayRole} Portal</p>
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

      {/* Quick Action */}
      {!collapsed && (
        <div className="px-4 pb-5">
          <button className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </button>
        </div>
      )}
      {collapsed && (
        <div className="px-3 pb-5">
          <button className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white flex items-center justify-center py-2.5 rounded-lg transition-colors shadow-sm" title="New Lead">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={`flex-1 space-y-6 overflow-y-auto ${collapsed ? 'px-2 py-4' : 'px-3 py-2'}`}>
        {navGroups.map((group, gIndex) => (
          <div key={group.label || gIndex} className="space-y-1.5">
            {!collapsed && group.label && (
              <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 mt-2">
                {group.label}
              </div>
            )}
            {group.items.map((item: any) => {
              if (item.locked && !item.href) {
                return (
                  <div key={item.title} className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed ${collapsed ? 'justify-center' : ''}`}>
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && item.title}
                    </div>
                    {!collapsed && <Lock className="w-3.5 h-3.5" />}
                  </div>
                );
              }
              const isActive = item.href ? (pathname === item.href || pathname.startsWith(item.href + '/')) : false;
              
              if (item.locked && item.href) {
                  return (
                    <div key={item.title} className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed ${collapsed ? 'justify-center' : ''}`}>
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && item.title}
                    </div>
                    {!collapsed && <Lock className="w-3.5 h-3.5" />}
                  </div>
                  );
              }
              
              return (
                <div key={item.title} className="space-y-1">
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.title : undefined}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-slate-900 dark:bg-slate-800 text-white font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                      {!collapsed && item.title}
                    </div>
                    {!collapsed && item.badge && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className={`p-4 border-t border-slate-200 dark:border-slate-800 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-blue-200 dark:border-blue-800">
                {initials}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{userName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate uppercase">{displayRole}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </>
  );

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-40 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-sm"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out relative z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
