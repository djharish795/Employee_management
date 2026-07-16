"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/shared/sidebar';
import { Topbar } from '@/components/shared/topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Client-side auth guard: fires on every mount of any dashboard page.
  // Handles the browser Back-button cache bypass after logout — the server
  // middleware never runs for cached pages, so we enforce auth here.
  React.useEffect(() => {
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

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
