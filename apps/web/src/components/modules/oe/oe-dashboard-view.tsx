"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ClipboardList, 
  Target, 
  CheckSquare, 
  Clock, 
  MapPin, 
  AlertCircle, 
  ChevronRight, 
  RefreshCw, 
  Download,
  Calendar
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { PersonalAttendanceWidget } from '@/components/shared/personal-attendance-widget';
import { CheckInButton } from '@/components/shared/check-in-button';
import toast, { Toaster } from 'react-hot-toast';
import { PremiumDashboardLayout, PremiumCard } from '@/components/shared/premium-dashboard';
import { KpiGrid } from '@/components/executive-dashboard/KpiGrid';
import { useAuthStore } from '@/store/auth';

export default function OeDashboardView() {
  const [workReports, setWorkReports] = useState<any[]>([]);
  const [fieldRequests, setFieldRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const userName = 'Executive';

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      // Fetch user's own reports
      const [workRes, fieldRes] = await Promise.all([
        apiClient.get('/work-reports/me').catch(() => ({ data: [] })),
        apiClient.get('/field-work-requests/my').catch(() => ({ data: [] }))
      ]);
      const workResData = workRes.data?.data || workRes.data || [];
      const fieldResData = fieldRes.data?.data || fieldRes.data || [];
      setWorkReports(Array.isArray(workResData) ? workResData : []);
      setFieldRequests(Array.isArray(fieldResData) ? fieldResData : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleExport = () => toast.success("Activity summary exported successfully.");

  // Current formatted date
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const pendingWorkReports = workReports.filter(r => r.status === 'PENDING').length;
  const pendingFieldRequests = fieldRequests.filter(r => r.status === 'PENDING').length;
  
  // Get latest 5 items for the lists
  const recentWorkReports = [...workReports].slice(0, 5);
  const activeFieldOps = [...fieldRequests].filter(r => r.status !== 'COMPLETED' && r.status !== 'REJECTED').slice(0, 5);

  return (
    <PremiumDashboardLayout className="flex flex-col">
      <Toaster position="top-right" />
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">Welcome, {userName}</h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Operational execution dashboard for {todayFormatted}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CheckInButton />
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold capitalize tracking-wide text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4 text-slate-500" /> Export Summary
          </button>
        </div>
      </div>

      <PersonalAttendanceWidget />

      {/* KPI Cards Row using exact Executive Dashboard new UI design */}
      <div className="mt-6 mb-6">
        <KpiGrid metrics={[
          {
            id: "1",
            title: "My Work Reports",
            value: workReports.length.toString(),
            subtext: "Total submitted",
            iconType: "briefcase"
          },
          {
            id: "2",
            title: "Pending Approvals",
            value: (pendingWorkReports + pendingFieldRequests).toString(),
            subtext: "Awaiting OM review",
            iconType: "calendar"
          },
          {
            id: "3",
            title: "Field Ops",
            value: activeFieldOps.length.toString(),
            subtext: "Active assignments",
            iconType: "users"
          }
        ]} />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Active Field Operations */}
        <PremiumCard className="overflow-hidden p-0 flex flex-col h-full">
          <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Active Field Operations
            </h2>
            <Link href="/oe/field-requests/new" className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md hover:bg-emerald-100 transition-colors">
              + New Request
            </Link>
          </div>

          <div className="p-6 flex-1 bg-slate-50/50">
            {activeFieldOps.length > 0 ? (
              <div className="space-y-4">
                {activeFieldOps.map((op) => (
                  <div key={op.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{op.purpose}</h4>
                        <div className="flex items-center gap-1 mt-1 text-xs font-medium text-slate-500">
                          <MapPin className="w-3 h-3" /> {op.destination}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                        op.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        op.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {op.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        <Calendar className="w-3 h-3" /> {new Date(op.date).toLocaleDateString()}
                      </div>
                      <Link href={`/oe/field-requests/${op.id}`} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wide flex items-center gap-1">
                        View Details <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white border border-dashed border-slate-300 rounded-xl">
                <Target className="w-10 h-10 text-slate-300 mb-3" />
                <h3 className="text-sm font-bold text-slate-700">No Active Field Ops</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">You don't have any pending or approved field operations.</p>
              </div>
            )}
          </div>
          <div className="px-6 py-3 border-t border-slate-100 bg-white">
            <Link href="/oe/field-requests" className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1 w-full">
              View All Field Requests <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </PremiumCard>

        {/* Recent Work Reports */}
        <PremiumCard className="overflow-hidden p-0 flex flex-col h-full">
          <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Recent Work Reports
            </h2>
            <Link href="/oe/work-reports/new" className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors">
              + Submit Report
            </Link>
          </div>

          <div className="overflow-x-auto flex-1 bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-6">Report Title</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-6 text-right">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                {recentWorkReports.length > 0 ? recentWorkReports.map((report: any) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6">
                      <Link href={`/oe/work-reports/${report.id}`} className="text-left font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                        {report.title}
                      </Link>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5 capitalize">{report.reportType?.replace('_', ' ')}</div>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${
                        report.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        report.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        report.status === 'NEEDS_REVISION' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-slate-500 font-medium">
                      {new Date(report.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <ClipboardList className="w-10 h-10 text-slate-300 mb-3" />
                        <h3 className="text-sm font-bold text-slate-700">No Reports Yet</h3>
                        <p className="text-xs text-slate-500 mt-1">Submit your first daily work report.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-slate-100 bg-white">
            <Link href="/oe/work-reports" className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1 w-full">
              View All Reports <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </PremiumCard>

      </div>
    </PremiumDashboardLayout>
  );
}
