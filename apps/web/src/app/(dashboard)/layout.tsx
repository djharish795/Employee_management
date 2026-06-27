"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CeoSidebar } from '@/components/shared/sidebars/ceo-sidebar';
import { EmployeeSidebar } from '@/components/shared/sidebars/employee-sidebar';
import { Topbar } from '@/components/shared/topbar';
import { useAuthStore } from '@/store/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const storeRole = useAuthStore((state) => state.role);

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
  const cookieRole = typeof document !== 'undefined'
    ? (document.cookie.match(new RegExp('(^| )role=([^;]+)'))?.[2] ?? null)
    : null;
  const role = (storeRole || cookieRole)?.toUpperCase() ?? 'EMPLOYEE';
  const isPrivileged = ['CEO', 'COO', 'CTO', 'CFO', 'HR', 'SUPER_ADMIN', 'FINANCE', 'MANAGER', 'IT'].includes(role);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {isPrivileged ? <CeoSidebar /> : <EmployeeSidebar />}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
