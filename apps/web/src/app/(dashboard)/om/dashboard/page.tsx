import React from 'react';
import { Metadata } from 'next';
import EmployeeDashboardV2 from '@/components/modules/employee/employee-dashboard-v2';

export const metadata: Metadata = {
  title: 'OM Dashboard | Naprocs EMS',
  description: 'Operations Manager Portal for Naprocs Enterprise Management System',
};

export default function OmDashboardPage() {
  return (
    <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
      <EmployeeDashboardV2 />
    </div>
  );
}
