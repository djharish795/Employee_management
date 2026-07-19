import { Metadata } from 'next';
import { requireRole } from '@/lib/auth/server-auth';
import HrDashboardClient from './HrDashboardClient';

export const metadata: Metadata = {
  title: 'HR Dashboard | Naprocs EMS',
  description: 'Human Resources Dashboard for Naprocs EMS',
};

export default async function HrDashboardPage() {
  // Server-side role guard — HR and CHRO only
  await requireRole(['HR', 'CHRO']);
  return <HrDashboardClient />;
}
