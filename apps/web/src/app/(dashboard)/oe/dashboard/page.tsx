import React from 'react';
import { Metadata } from 'next';
import OeDashboardView from '@/components/modules/oe/oe-dashboard-view';

export const metadata: Metadata = {
  title: 'OE Dashboard | Naprocs EMS',
  description: 'OE Portal for Naprocs Enterprise Management System',
};

export default function OeDashboardPage() {
  return <OeDashboardView />;
}
