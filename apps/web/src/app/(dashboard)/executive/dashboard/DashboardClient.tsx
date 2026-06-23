"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// Components
import { KpiGrid } from '@/components/executive-dashboard/KpiGrid';
import { HeadcountChart } from '@/components/executive-dashboard/HeadcountChart';
import { HighlightsPanel } from '@/components/executive-dashboard/HighlightsPanel';
import { QuickLinks } from '@/components/executive-dashboard/QuickLinks';

// Types
import { QuickLinkType } from '@/types/executive-dashboard';

const quickLinksData: QuickLinkType[] = [
  { id: '1', title: 'Add employee', href: '/employees/add', iconType: 'userPlus' },
  { id: '2', title: 'View org chart', href: '/org-chart', iconType: 'orgChart' },
  { id: '3', title: 'Audit logs', href: '/audit', iconType: 'audit' },
  { id: '4', title: 'Export report', href: '#', iconType: 'export' },
];

export function DashboardClient() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${url}/dashboard/metrics`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return res.json();
    },
    retry: false
  });

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center p-6 md:p-8 bg-slate-50 min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
        <div className="text-red-500 bg-red-50 p-4 rounded-md">Error loading dashboard metrics.</div>
      </div>
    );
  }

  const { kpiData, headcountData, highlightsData } = data;
  
  // Try to find the total headcount from KPI data or sum up the headcount chart
  const totalEmployeesItem = kpiData?.find((k: any) => k.title === 'Total Employees');
  const totalEmployees = totalEmployeesItem ? parseInt(totalEmployeesItem.value, 10) : 
    (headcountData?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0);

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
          <HeadcountChart data={headcountData} total={totalEmployees} />
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
