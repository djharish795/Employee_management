import { Metadata } from 'next';
import { requireRole } from '@/lib/auth/server-auth';
import CtoDashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'CTO Dashboard | Naprocs EMS',
  description: 'Technology Executive Dashboard for Naprocs EMS',
};

export default async function CtoDashboardPage() {
  // Server-side role guard — CTO only
  await requireRole(['CTO']);
  return <CtoDashboardClient />;
}
