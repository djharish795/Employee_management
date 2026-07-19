import React from 'react';
import { Metadata } from 'next';
import EmployeeDashboardV2 from '@/components/modules/employee/employee-dashboard-v2';
import { requireRole } from '@/lib/auth/server-auth';

export const metadata: Metadata = {
  title: 'Employee Dashboard | Naprocs EMS',
  description: 'Employee Self-Service Portal for Naprocs Enterprise Management System',
};

export default async function EmployeeDashboardPage() {
  // Server-side role guard — EMPLOYEE, MANAGER, TEAM_LEAD only
  // Redirects to /access-restricted for executive roles, etc.
  await requireRole(['EMPLOYEE', 'MANAGER', 'TEAM_LEAD']);
  return (
    <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
      <EmployeeDashboardV2 />
    </div>
  );
}
