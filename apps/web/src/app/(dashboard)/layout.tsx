"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CeoSidebar } from '@/components/shared/sidebars/ceo-sidebar';
import { EmployeeSidebar } from '@/components/shared/sidebars/employee-sidebar';
import { TeamLeadSidebar } from '@/components/shared/sidebars/team-lead-sidebar';
import { CamSidebar } from '@/components/shared/sidebars/cam-sidebar';
import { Topbar } from '@/components/shared/topbar';
import { getSidebarTypeForRole, SidebarType } from '@naprocs/types';
import { useRbac } from '@/hooks/use-rbac';
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

  const accessToken = useAuthStore((state) => state.accessToken);

  // Client-side auth guard: fires on every mount of any dashboard page.
  // Handles the browser Back-button cache bypass after logout — the server
  // middleware never runs for cached pages, so we enforce auth here.
  React.useEffect(() => {
    setMounted(true);
    
    // We delay the check by 100ms to allow Zustand to hydrate from localStorage.
    // This entirely prevents the false-logout flash on reload, but still catches
    // users trying to use the Back button after logging out.
    const hydrationTimer = setTimeout(() => {
      if (!useAuthStore.getState().role) {
        router.replace('/login');
      }
    }, 100);

    return () => clearTimeout(hydrationTimer);
  }, [router]);

  if (!mounted) return null;

  // Determine which sidebar to show
  const sidebarType = getSidebarTypeForRole(activeRole);
  
  const renderSidebar = () => {
    if (sidebarType === SidebarType.CAM) return <CamSidebar />;
    if (sidebarType === SidebarType.TEAM_LEAD) return <TeamLeadSidebar />;
    if (sidebarType === SidebarType.CEO) return <CeoSidebar />;
    return <EmployeeSidebar />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-sans transition-colors">
      {renderSidebar()}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
