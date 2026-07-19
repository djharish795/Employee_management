import { Metadata } from 'next';
import { requireRole } from '@/lib/auth/server-auth';

export const metadata: Metadata = {
  title: 'Finance Dashboard | Naprocs EMS',
  description: 'Finance Dashboard for Naprocs EMS',
};

export default async function FinanceDashboardPage() {
  // Server-side role guard — FINANCE and CFO only
  await requireRole(['FINANCE', 'CFO']);
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Finance Dashboard</h1>
      <p className="text-slate-500">Finance module coming soon.</p>
    </div>
  );
}
