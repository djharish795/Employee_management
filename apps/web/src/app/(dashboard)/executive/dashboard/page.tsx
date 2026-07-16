import React from 'react';
import { Metadata } from 'next';
import { DashboardClient } from './DashboardClient';

export const metadata: Metadata = {
  title: 'Executive Dashboard | Naprocs EMS',
  description: 'CEO and Executive Dashboard for Enterprise Management System',
};

export default function ExecutiveDashboardPage() {
  return <DashboardClient />;
}
