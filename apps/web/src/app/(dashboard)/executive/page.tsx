import React from 'react';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Components
import { KpiGrid } from '@/components/executive-dashboard/KpiGrid';
import { HeadcountChart } from '@/components/executive-dashboard/HeadcountChart';
import { HighlightsPanel } from '@/components/executive-dashboard/HighlightsPanel';
import { QuickLinks } from '@/components/executive-dashboard/QuickLinks';

// Types
import { KpiMetric, DepartmentHeadcount, Highlight, QuickLinkType } from '@/types/executive-dashboard';

export const metadata: Metadata = {
  title: 'Executive Dashboard | Naprocs EMS',
  description: 'CEO and Executive Dashboard for Enterprise Management System',
};

// Mock Data for Phase 1
const kpiData: KpiMetric[] = [
  { id: '1', title: 'Total Employees', value: '87', subtext: '+4% from last month', iconType: 'users' },
  { id: '2', title: 'Present Today', value: '74', subtext: '85% total attendance', iconType: 'calendar' },
  { id: '3', title: 'On Leave', value: '8', subtext: '3 Pending approvals', iconType: 'umbrella' },
  { id: '4', title: 'New This Month', value: '3', subtext: 'Next onboarding: Mon 23rd', iconType: 'userPlus' },
];

const headcountData: DepartmentHeadcount[] = [
  { department: 'Engineering', count: 34, color: 'bg-blue-600' },
  { department: 'Sales', count: 18, color: 'bg-indigo-600' },
  { department: 'Operations', count: 15, color: 'bg-sky-500' },
  { department: 'HR', count: 12, color: 'bg-slate-400' },
  { department: 'Finance', count: 8, color: 'bg-slate-300' },
];

const highlightsData: Highlight[] = [
  { id: '1', title: '3 new employees joined', description: 'Successfully completed week 1', type: 'success' },
  { id: '2', title: 'Annual compliance review', description: 'Due by December 31st', type: 'warning' },
  { id: '3', title: 'Asset audit completed', description: '100% of laptops accounted for', type: 'success' },
  { id: '4', title: 'Workflows updated', description: 'Leave request policy updated', type: 'info' },
];

const quickLinksData: QuickLinkType[] = [
  { id: '1', title: 'Add employee', href: '/employees/new', iconType: 'userPlus' },
  { id: '2', title: 'View org chart', href: '/org-chart', iconType: 'orgChart' },
  { id: '3', title: 'Audit logs', href: '/audit', iconType: 'audit' },
  { id: '4', title: 'Export report', href: '#', iconType: 'export' },
];

export default function ExecutiveDashboardPage() {
  return (
    <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Organisation overview</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Reporting period: December 2024</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2 bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold shadow-sm">
          <Download className="w-4 h-4" />
          Export report
        </Button>
      </div>

      {/* KPI Grid (Top Row) */}
      <div className="mb-6">
        <KpiGrid metrics={kpiData} />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Headcount chart spans 1 column but might be wider on tablet) */}
        <div className="lg:col-span-1">
          <HeadcountChart data={headcountData} total={87} />
        </div>

        {/* Middle Column (Highlights) */}
        <div className="lg:col-span-1">
          <HighlightsPanel highlights={highlightsData} />
        </div>

        {/* Right Column (Quick Links) */}
        <div className="lg:col-span-1">
          <QuickLinks links={quickLinksData} />
        </div>

      </div>
    </div>
  );
}
