import React from 'react';
import { Metadata } from 'next';
import EmployeeDashboardV2 from '@/components/modules/employee/employee-dashboard-v2';

export const metadata: Metadata = {
  title: 'Employee Dashboard | Naprocs EMS',
  description: 'Employee Self-Service Portal for Naprocs Enterprise Management System',
};

export default function EmployeeDashboardPage() {
  return (
    <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
      <EmployeeDashboardV2 />
    </div>
  );
}
