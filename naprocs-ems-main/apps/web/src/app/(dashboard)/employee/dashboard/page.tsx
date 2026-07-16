import React from 'react';
import { Metadata } from 'next';
import EmployeeDashboardPanel from '@/components/modules/employee/employee-dashboard';

export const metadata: Metadata = {
  title: 'Employee Dashboard | Naprocs EMS',
  description: 'Employee Self-Service Portal for Naprocs Enterprise Management System',
};

export default function EmployeeDashboardPage() {
  return (
    <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">My Dashboard</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Welcome to your employee self-service portal.</p>
      </div>
      
      <EmployeeDashboardPanel />
    </div>
  );
}
