"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CeoSidebar } from '@/components/shared/sidebars/ceo-sidebar';
import { Topbar } from '@/components/shared/topbar';

export default function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  React.useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    };
    const token = getCookie('token');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <CeoSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
