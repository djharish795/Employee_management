"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CeoSidebar } from '@/components/shared/sidebars/ceo-sidebar';
import { EmployeeSidebar } from '@/components/shared/sidebars/employee-sidebar';
import { TeamLeadSidebar } from '@/components/shared/sidebars/team-lead-sidebar';
import { CemSidebar } from '@/components/shared/sidebars/cem-sidebar';
import { OeSidebar } from '@/components/shared/sidebars/oe-sidebar';
import { Topbar } from '@/components/shared/topbar';
import { getSidebarTypeForRole, SidebarType } from '@naprocs/types';
import { useRbac } from '@/hooks/use-rbac';
import { useAuthStore } from '@/store/auth';
import WelcomeTour from '@/components/common/welcome-tour';
import BirthdayModal from '@/components/common/birthday-modal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const storeRole = useAuthStore((state) => state.role);

  const [activeRole, setActiveRole] = React.useState(() => {
    // Read role exclusively from Zustand store (hydrated from JWT at login).
    // NEVER read the plain 'role' cookie — it is unsigned and can be tampered with.
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
    
    // We check after hydration to allow Zustand to hydrate from localStorage/cookies.
    // This prevents the false-logout flash on login/reload.
    const hydrationTimer = setTimeout(() => {
      const state = useAuthStore.getState();
      const hasLocalStorage = typeof window !== 'undefined' && !!localStorage.getItem('auth-storage');
      const hasCookie = typeof document !== 'undefined' && (document.cookie.includes('role=') || document.cookie.includes('token='));
      
      if (!state.role && !state.accessToken && !hasLocalStorage && !hasCookie) {
        router.replace('/login');
      }
    }, 250);

    return () => clearTimeout(hydrationTimer);
  }, [router, storeRole, accessToken]);

  if (!mounted) return null;

  // Determine which sidebar to show
  const sidebarType = getSidebarTypeForRole(activeRole);
  
  const renderSidebar = () => {
    if (sidebarType === SidebarType.CEM) return <CemSidebar />;
    if (sidebarType === SidebarType.OE) return <OeSidebar />;
    if (sidebarType === SidebarType.TEAM_LEAD) return <TeamLeadSidebar />;
    if (sidebarType === SidebarType.CEO) return <CeoSidebar />;
    return <EmployeeSidebar />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-sans transition-colors">
      <WelcomeTour />
      <BirthdayModal />
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
