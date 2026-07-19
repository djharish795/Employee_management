import React from 'react';
import { Metadata } from 'next';
import CemDashboardPanel from '@/components/modules/cem/dashboard-panel';

export const metadata: Metadata = {
  title: 'CEM Dashboard | Naprocs EMS',
  description: 'CEM Portal for Naprocs Enterprise Management System',
};

export default function CemDashboardPage() {
  return (
    <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
      <CemDashboardPanel />
    </div>
  );
}
