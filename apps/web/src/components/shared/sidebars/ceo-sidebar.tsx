"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Calendar, ShieldCheck, History,
  Network, BarChart3, Settings, LogOut, Menu, X, ChevronLeft, ChevronDown, ChevronUp, Plus, FolderPlus,
  MessageSquare, CalendarCheck, UserPlus, UserMinus, BookOpen, Monitor, Lock, Bell, CheckSquare
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useNotifications } from '@/hooks/use-notifications';
import { getDashboardPathForRole, Permission } from '@naprocs/types';
import { useRbac } from '@/hooks/use-rbac';

interface SidebarProps {
  activeModule?: string;
}



const getNavGroups = (role: string, unreadCount: number, hasSettingsAccess: boolean) => {
  if (role === 'CEO') {
    return [
      {
        label: 'MAIN',
        items: [
          { title: 'Dashboard', icon: LayoutDashboard, href: '/executive/dashboard' },
          { title: 'Tasks', icon: CheckSquare, href: '/tasks' },
          { title: 'Connect', icon: MessageSquare, href: '/connect' },
          { title: 'Org Chart', icon: Network, href: '/org-chart' },
        ]
      },
      {
        label: 'OPERATIONS',
        items: [
          { 
            title: 'Attendance', 
            icon: CalendarCheck, 
            subItems: [
              { title: 'Attendance Summary', href: '/attendance/summary' },
              { title: 'My Attendance', href: '/attendance' }
            ]
          },
          { title: 'Employees', icon: Users, href: '/employees' },
          { title: 'Compliance', icon: ShieldCheck, href: '/compliance' },
          { title: 'Leaves', icon: Calendar, href: '/leaves' },
          { title: 'Assets', icon: Monitor, href: '/assets' },
        ]
      },
      {
        label: 'OTHER',
        items: [
          { title: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined, href: '/notifications' },
          ...(hasSettingsAccess ? [{ title: 'Settings', icon: Settings, href: '/settings' }] : []),
        ]
      },
      {
        label: 'PHASE 2',
        items: [
          { title: 'Payroll', icon: Calendar, locked: true },
          { title: 'Recruitment', icon: UserPlus, locked: true },
          { title: 'Performance', icon: BarChart3, locked: true },
          { title: 'Succession Planning', icon: Users, locked: true },
          { title: 'Reports / Analytics', icon: BarChart3, locked: true },
          { title: 'Workforce Analytics', icon: BarChart3, locked: true },
          { title: 'Analytics', icon: BarChart3, locked: true },
        ]
      }
    ];
  }

  if (role === 'CTO') {
    return [
      {
        label: 'MAIN',
        items: [
          { title: 'Dashboard', icon: LayoutDashboard, href: '/cto/dashboard' },
          { title: 'Tasks', icon: CheckSquare, href: '/tasks' },
          { title: 'Connect', icon: MessageSquare, href: '/connect' },
          { title: 'Engineering Team', icon: Users, href: '/cto/team' },
          { title: 'Assets', icon: Monitor, href: '/cto/assets' },
          { title: 'Team Leave', icon: Calendar, href: '/cto/leaves' },
          { title: 'Org Chart', icon: Network, href: '/org-chart' },
          { 
            title: 'Attendance', 
            icon: CalendarCheck, 
            subItems: [
              { title: 'Attendance Summary', href: '/attendance/summary' },
              { title: 'My Attendance', href: '/attendance' }
            ]
          },
          { title: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined, href: '/notifications' },
        ]
      },
      {
        label: 'PHASE 2 (LOCKED)',
        items: [
          { title: 'Skill Matrix', icon: Network, locked: true },
          { title: 'Recruitment', icon: UserPlus, href: '/cto/recruitment', locked: true },
          { title: 'Performance', icon: BarChart3, locked: true },
          { title: 'Analytics', icon: BarChart3, locked: true },
        ]
      }
    ];
  }

  if (role === 'MANAGER' || role === 'OPERATIONS_HEAD') {
    return [
      {
        label: 'OPERATIONS PORTAL',
        items: [
          { title: 'Dashboard', icon: LayoutDashboard, href: '/employee/dashboard' },
          { title: 'Work Reports', icon: BarChart3, href: '/om/work-reports' },
          { title: 'Approvals', icon: CheckSquare, href: '/om/approvals' },
          { title: 'Scheduler', icon: Calendar, href: '/cem/scheduler' },
          { title: 'Reports', icon: BarChart3, href: '/cem/reports' },
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
        items: [
          { title: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined, href: '/notifications' },
          ...(hasSettingsAccess ? [{ title: 'Settings', icon: Settings, href: '/settings' }] : []),
        ]
      }
    ];
  }

  const mainItems: any[] = [
    { title: 'Dashboard', icon: LayoutDashboard, href: getDashboardPathForRole(role) },
    { title: 'Connect', icon: MessageSquare, href: '/connect' },
  ];

  const ALLOWED_TASK_ROLES = ['CTO', 'CEO', 'DM', 'SPM', 'PM', 'TL', 'TR', 'TS', 'QM', 'QA', 'QE', 'OM'];
  if (ALLOWED_TASK_ROLES.includes(role)) {
    mainItems.splice(1, 0, { title: 'Tasks', icon: CheckSquare, href: '/tasks' });
  }

  if (['HR', 'CEO'].includes(role)) {
    mainItems.push({ 
      title: 'Attendance', 
      icon: CalendarCheck, 
      subItems: [
        { title: 'Attendance Summary', href: '/attendance/summary' },
        { title: 'My Attendance', href: '/attendance' }
      ]
    });
  } else {
    mainItems.push({ title: 'Attendance', icon: CalendarCheck, href: '/attendance' });
  }

  mainItems.push(
    { title: 'Employees', icon: Users, href: '/employees' },
    { title: 'Org Chart', icon: Network, href: '/org-chart' }
  );

  if (['SUPER_ADMIN', 'CEO', 'COO', 'HR', 'CHRO', 'COMPLIANCE_OFFICER', 'LEGAL'].includes(role)) {
    mainItems.push({ title: 'Compliance', icon: ShieldCheck, href: '/compliance' });
  }

  mainItems.push({ title: 'Leaves', icon: Calendar, href: '/leaves' });

  if (role === 'HR') {
    mainItems.push({ title: 'Onboarding', icon: UserPlus, href: '/onboarding' });
    mainItems.push({ title: 'Offboarding', icon: UserMinus, href: '/offboarding' });
    mainItems.push({ title: 'Workflows', icon: BookOpen, href: '/hr/workflows' });
    mainItems.push({ title: 'Knowledge Base', icon: BookOpen, href: '/knowledge-base' });
    mainItems.push({ title: 'Asset Management', icon: Monitor, href: '/assets' });
  }

  if (role === 'SUPER_ADMIN') {
    mainItems.push({ title: 'Audit Log', icon: History, href: '/audit' });
  }

  const groups: any[] = [
    {
      label: 'MAIN',
      items: mainItems
    },
    {
      label: 'OTHER',
      items: [
        { title: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined, href: '/notifications' },
        ...(hasSettingsAccess ? [{ title: 'Settings', icon: Settings, href: '/settings' }] : [])
      ]
    },
    {
      label: 'PHASE 2 (LOCKED)',
      items: [
        { title: 'Analytics', icon: BarChart3, locked: true }
      ]
    }
  ];

  return groups;
};

export function CeoSidebar({ activeModule = 'dashboard' }: SidebarProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const { unreadCount } = useNotifications();
  const { hasPermission } = useRbac();
  const hasSettingsAccess = hasPermission(Permission.ACCESS_SETTINGS);
  const storeRole = useAuthStore((state) => state.role);
  const [role, setRole] = useState(storeRole || 'EMPLOYEE');

  React.useEffect(() => {
    if (storeRole) setRole(storeRole);
  }, [storeRole]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => ({ ...prev, [title]: !prev[title] }));
  };
  
  let displayRole = role.replace('_', ' ');
  if (role === 'OM') displayRole = 'Operations Manager';
  else if (role === 'OE') displayRole = 'Operations Executive';
  else if (role === 'CRM') displayRole = 'CRM Executive';

  React.useEffect(() => { setMounted(true); }, []);

  const handleLogout = () => {
    clearSession();
    window.location.href = '/login';
  };

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {/* Brand Header */}
      <div className={`p-5 pb-4 flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between'}`}>
        {!collapsed && (
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug">Naprocs EMS</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5 capitalize">{displayRole} Dashboard</p>
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
        {getNavGroups(role, unreadCount, hasSettingsAccess).map((group, gIndex) => (
          <div key={group.label || gIndex} className="space-y-1.5">
            {!collapsed && group.label && (
              <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 mt-2">
                {group.label}
              </div>
            )}
            {group.items.map((item: any) => {
              if (item.locked) {
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
                      {!collapsed && item.locked && (
                        <Lock className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                      )}
                      {!collapsed && item.badge && !item.locked && (
                        <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
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
                        expandedItems[item.title] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
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
      <div className={`p-4 mt-auto border-t border-slate-100 dark:border-slate-800 ${collapsed ? 'px-2' : ''}`}>
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
          <h2 className="text-base font-bold text-slate-900 dark:text-white capitalize">Naprocs {displayRole}</h2>
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-white dark:bg-slate-950 h-screen border-r border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[64px]' : 'w-[240px]'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
 
