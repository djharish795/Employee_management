"use client";

import React from 'react';
import { MasterAdminSidebar } from '@/components/master-admin/MasterAdminSidebar';
import { MasterAdminTopbar } from '@/components/master-admin/MasterAdminTopbar';
import { getMasterAdminToken } from '@/components/master-admin/MasterAdminEntryPoint';
import { useRouter } from 'next/navigation';

export default function MasterAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Simple client-side guard for the layout
    const token = getMasterAdminToken();
    if (!token) {
      router.replace('/master-auth');
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-sans transition-colors">
      <MasterAdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <MasterAdminTopbar />
        <main className="flex-1 overflow-y-auto outline-none focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
