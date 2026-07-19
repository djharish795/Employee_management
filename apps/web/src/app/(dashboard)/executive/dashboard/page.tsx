import React from 'react';
import { Metadata } from 'next';
import { DashboardClient } from './DashboardClient';
import { requireRole } from '@/lib/auth/server-auth';

export const metadata: Metadata = {
  title: 'Executive Dashboard | Naprocs EMS',
  description: 'CEO and Executive Dashboard for Enterprise Management System',
};

export default async function ExecutiveDashboardPage() {
  // Server-side role guard — CEO, COO, OPERATIONS_HEAD only
  // Redirects to /access-restricted for any other verified role
  await requireRole(['CEO', 'COO', 'OPERATIONS_HEAD']);
  return <DashboardClient />;
}
