import React from 'react';
import { Metadata } from 'next';
import CamDashboardPanel from '@/components/modules/cam/dashboard-panel';

export const metadata: Metadata = {
  title: 'CAM Dashboard | Naprocs EMS',
  description: 'CAM Portal for Naprocs Enterprise Management System',
};

export default function CamDashboardPage() {
  return (
    <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
      <CamDashboardPanel />
    </div>
  );
}
