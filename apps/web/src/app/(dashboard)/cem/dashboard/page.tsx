import React from 'react';
import { Metadata } from 'next';
import CemDashboardPanel from '@/components/modules/cem/dashboard-panel';

export const metadata: Metadata = {
  title: 'CEM Dashboard | Naprocs EMS',
  description: 'CEM Portal for Naprocs Enterprise Management System',
};

export default function CemDashboardPage() {
  return <CemDashboardPanel />;
}
