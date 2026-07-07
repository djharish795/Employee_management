"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CeoSidebar } from '@/components/shared/sidebars/ceo-sidebar';
import { EmployeeSidebar } from '@/components/shared/sidebars/employee-sidebar';
import { TeamLeadSidebar } from '@/components/shared/sidebars/team-lead-sidebar';
import { Topbar } from '@/components/shared/topbar';
import { useAuthStore } from '@/store/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const storeRole = useAuthStore((state) => state.role);

  const [activeRole, setActiveRole] = React.useState(() => {
    if (typeof document !== 'undefined') {
      const cookieRole = document.cookie.match(new RegExp('(^| )role=([^;]+)'))?.[2] ?? null;
      return (storeRole || cookieRole)?.toUpperCase() ?? 'EMPLOYEE';
    }
    return storeRole?.toUpperCase() ?? 'EMPLOYEE';
  });

  React.useEffect(() => {
    if (storeRole) {
      setActiveRole(storeRole.toUpperCase());
    }
  }, [storeRole]);

  const [mounted, setMounted] = React.useState(false);

  // Client-side auth guard: fires on every mount of any dashboard page.
  // Handles the browser Back-button cache bypass after logout — the server
  // middleware never runs for cached pages, so we enforce auth here.
  React.useEffect(() => {
    setMounted(true);
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    };
    const token = getCookie('token');
    if (!token) {
      // Token is gone (user logged out) — replace history so Back won't bring them back
      router.replace('/login');
    }
  }, [router]);

  if (!mounted) return null;

  // Determine which sidebar to show
  const isPrivileged = ['CEO', 'COO', 'CTO', 'CFO', 'HR', 'SUPER_ADMIN', 'FINANCE', 'MANAGER', 'IT'].includes(activeRole);
  
  const renderSidebar = () => {
    if (activeRole === 'TEAM_LEAD') return <TeamLeadSidebar />;
    if (isPrivileged) return <CeoSidebar />;
    return <EmployeeSidebar />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-sans transition-colors">
      {renderSidebar()}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
