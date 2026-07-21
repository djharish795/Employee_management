"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Calendar, ShieldCheck, History,
  Network, BarChart3, Settings, LogOut, Menu, X, ChevronLeft, Plus,
  MessageSquare, CalendarCheck, UserPlus, UserMinus, BookOpen, Monitor,
  Lock, Bell, CheckSquare, Target, Briefcase, AlignLeft, ClipboardList,
  FileBarChart, Clock, Wrench, Building2
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useNotifications } from '@/hooks/use-notifications';
import { useRbac } from '@/hooks/use-rbac';
import { Permission } from '@naprocs/types';

export function CemSidebar() {
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
  else if (storeRole === 'CEM') displayRole = 'CEM Executive';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => ({ ...prev, [title]: !prev[title] }));
  };
  
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

  // ─── Shared Operations items (Reports + Scheduler) for CRM, CEM, OM ───
  const opsPrefix = storeRole === 'CRM' ? '/crm' : (storeRole === 'OM' ? '/om' : '/cem');
  const sharedOpsItems = [
    { title: 'Reports', icon: FileBarChart, href: `${opsPrefix}/reports` },
    { title: 'Scheduler', icon: Clock, href: `${opsPrefix}/scheduler` },
  ];

  // ─── Build nav groups based on role ───────────────────────────────────
  const buildNavGroups = () => {
    if (storeRole === 'CRM') {
      return [
        {
          label: 'CRM PORTAL',
          items: [
            { title: 'Dashboard', icon: LayoutDashboard, href: '/crm/dashboard' },
            { title: 'Client Workspace', icon: Briefcase, href: '/crm/workspace' },
            { title: 'Meetings', icon: Calendar, href: '/crm/meetings' },
            { title: 'Requirements', icon: ShieldCheck, href: '/crm/requirements' },
          ]
        },
        {
          label: 'OPERATIONS',
          items: sharedOpsItems,
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
        { label: 'OTHER', items: otherItems }
      ];
    }

    if (storeRole === 'OM') {
      return [
        {
          label: 'OPERATIONS HUB',
          items: [
            { title: 'Dashboard', icon: LayoutDashboard, href: '/om/dashboard' },
            { title: 'Work Reports', icon: ClipboardList, href: '/om/work-reports' },
            { title: 'Field Reports', icon: Target, href: '/om/field-reports' },
            { title: 'Team Overview', icon: Users, href: '/org-chart' },
          ]
        },
        {
          label: 'MY WORKPLACE',
          items: [
            { title: 'My Submissions', icon: FileBarChart, href: '/om/reports' },
            { title: 'Tasks', icon: CheckSquare, href: '/tasks' },
            { title: 'Connect', icon: MessageSquare, href: '/connect' },
            { title: 'Attendance', icon: CalendarCheck, href: '/attendance' },
            { title: 'Leaves', icon: Calendar, href: '/leaves' },
            { title: 'Assets', icon: Monitor, href: '/assets/my' },
            { title: 'Knowledge Base', icon: BookOpen, href: '/knowledge' },
          ]
        },
        { label: 'OTHER', items: otherItems }
      ];
    }

    // Default: CEM (and OE)
    return [
      {
        label: 'CEM PORTAL',
        items: [
          { title: 'Dashboard', icon: LayoutDashboard, href: '/cem/dashboard' },
          { title: 'Lead Workspace', icon: Briefcase, href: '/cem/workspace' },
          { title: 'Follow-up Hub', icon: History, href: '/cem/follow-ups' },
          { title: 'Meetings', icon: Calendar, href: '/cem/meetings' },
          { title: 'Qualification', icon: ShieldCheck, href: '/cem/qualification' },
        ]
      },
      {
        label: 'OPERATIONS',
        items: sharedOpsItems,
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
      { label: 'OTHER', items: otherItems }
    ];
  };

  const navGroups = buildNavGroups();

  // Portal label for brand header
  const portalLabel = storeRole === 'CRM' ? 'CRM Portal'
    : storeRole === 'OM' ? 'OM Portal'
    : 'Naprocs EMS';

  const portalSub = storeRole === 'CRM' ? 'Operational Execution'
    : storeRole === 'OM' ? 'Operations Management'
    : `${displayRole} Portal`;

  const quickActionLabel = storeRole === 'CRM' ? 'New Client'
    : storeRole === 'OM' ? 'New Report'
    : 'New Lead';

  const renderSidebarContent = (onNavigate?: () => void) => (
    <>
      {/* Brand Header */}
      <div className={`p-5 pb-4 flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between'}`}>
        {!collapsed && (
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
              {portalLabel}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5 capitalize">
              {portalSub}
            </p>
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
      <nav className={`flex-1 space-y-6 overflow-y-auto ${collapsed ? 'px-2 py-4' : 'px-3 py-2'}`}>
        {navGroups.map((group, gIndex) => (
          <div key={group.label || gIndex} className="space-y-1.5">
            {!collapsed && group.label && (
              <div className="px-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-2">
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
              const isActive = item.href ? (pathname === item.href || pathname.startsWith(item.href + '/')) : (item.subItems?.some((s: any) => pathname === s.href) || false);
              
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
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={collapsed ? item.title : undefined}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        collapsed ? 'justify-center' : ''
                      } ${
                        isActive
                          ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                        {!collapsed && item.title}
                      </div>
                      {!collapsed && item.badge && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <button 
                      onClick={() => item.subItems ? toggleExpand(item.title) : undefined}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${collapsed ? 'justify-center' : ''} ${isActive ? 'text-slate-900 dark:text-white font-semibold bg-slate-100 dark:bg-slate-800/50' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white transition-colors'}`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                        {!collapsed && item.title}
                      </div>
                      {!collapsed && item.subItems && (
                        <span className="text-slate-400">
                          {expandedItems[item.title] ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  )}

                  {!collapsed && item.subItems && expandedItems[item.title] && (
                    <div className="flex flex-col gap-1 pl-10 mt-1">
                      {item.subItems.map((sub: any) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link 
                            key={sub.title} 
                            href={sub.href} 
                            onClick={onNavigate}
                            className={`block px-3 py-2 text-[13px] rounded-lg transition-colors ${
                              isSubActive 
                              ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-white font-semibold' 
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/50'
                            }`}
                          >
                            {sub.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
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
            {renderSidebarContent(() => setMobileOpen(false))}
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out relative z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderSidebarContent()}
      </aside>
    </>
  );
}
