import React from 'react';
import { Metadata } from 'next';
import OmDashboardView from '@/components/modules/om/om-dashboard-view';

export const metadata: Metadata = {
  title: 'OM Dashboard | Naprocs EMS',
  description: 'Operations Manager Portal for Naprocs Enterprise Management System',
};

export default function OmDashboardPage() {
  return <OmDashboardView />;
}
