import React from 'react';
import { Metadata } from 'next';
import EmployeeDashboardV2 from '@/components/modules/employee/employee-dashboard-v2';

export const metadata: Metadata = {
  title: 'OE Dashboard | Naprocs EMS',
  description: 'OE Portal for Naprocs Enterprise Management System',
};

export default function OeDashboardPage() {
  return <EmployeeDashboardV2 />;
}
