"use client";

import React, { useEffect, useState } from 'react';
import { 
  Download, Filter, Plus, ArrowUpRight, Search, CheckCircle2, 
  XCircle, Clock, FileText, ChevronRight, Eye, Briefcase, RefreshCw, Calendar, Lock, LogOut, Loader2
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import toast, { Toaster } from 'react-hot-toast';
import { PremiumDashboardLayout, PremiumCard } from '@/components/shared/premium-dashboard';
import { KpiGrid } from '@/components/executive-dashboard/KpiGrid';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTodayStatus, submitPunch } from "@/lib/api/attendance";
import { fetchMyLeaveKpi } from "@/lib/api/leaves";
import { assetsApi } from "@/lib/api/assets";
import { useAuthStore } from "@/store/auth";
import EarlyCheckoutModal from "@/components/shared/early-checkout-modal";

export default function OmDashboardView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { employeeId } = useAuthStore();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // ── Today's attendance state ─────────────────────────────────
  const todayQuery = useQuery({
    queryKey: ["attendanceStatus"],
    queryFn: fetchTodayStatus,
    refetchInterval: 60_000,
    retry: 1,
  });

  const leaveKpiQuery = useQuery({
    queryKey: ["leaves-kpi", employeeId],
    queryFn: () => fetchMyLeaveKpi(employeeId!),
    enabled: !!employeeId,
  });

  const assetsQuery = useQuery({
    queryKey: ["myAssets"],
    queryFn: assetsApi.getMy,
    staleTime: 60_000,
  });

  const todayState = todayQuery.data?.state ?? "OUT";
  const isPunchedIn = todayState === "IN" || todayState === "BREAK";
  const PHASE_2_ENABLED = process.env.NEXT_PUBLIC_PHASE_2_ENABLED === 'true';

  const punchMutation = useMutation({
    mutationFn: (action: "IN" | "OUT") => submitPunch(action),
    onSuccess: (newData) => {
      queryClient.setQueryData(["attendanceStatus"], newData);
      queryClient.invalidateQueries({ queryKey: ["attendanceKpis"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceLogs"] });
    },
  });

  const getSecondsElapsed = () => {
    let secs = todayQuery.data?.offset || 0;
    if ((todayState === "IN" || todayState === "BREAK") && todayQuery.data?.startTime) {
      secs += Math.floor((Date.now() - new Date(todayQuery.data.startTime).getTime()) / 1000);
    }
    return secs;
  };

  const handlePunch = () => {
    if (punchMutation.isPending) return;
    const nextAction = isPunchedIn ? "OUT" : "IN";
    if (nextAction === "OUT") {
      setShowCheckoutModal(true);
    } else {
      punchMutation.mutate(nextAction);
    }
  };

  const checkInTimeDisplay = (() => {
    if (!todayQuery.data?.startTime) return null;
    return new Date(todayQuery.data.startTime).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  })();

  const leaveBalance = leaveKpiQuery.data?.availableLeaves ?? "--";
  const assetsAssigned = assetsQuery.data?.length ?? 0;
  const [workReports, setWorkReports] = useState<any[]>([]);
  const [fieldRequests, setFieldRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const userName = 'Operations Manager';

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      // Fetch team's reports and field requests
      const [workRes, fieldRes] = await Promise.all([
        apiClient.get('/work-reports/team').catch(() => ({ data: { data: [] } })),
        apiClient.get('/field-work-requests/team').catch(() => ({ data: { data: [] } }))
      ]);
      const workResData = workRes.data?.data || workRes.data || [];
      const fieldResData = fieldRes.data?.data || fieldRes.data || [];
      setWorkReports(Array.isArray(workResData) ? workResData : []);
      setFieldRequests(Array.isArray(fieldResData) ? fieldResData : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load OM dashboard data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleExport = async () => {
    try {
      if (!workReports.length && !fieldRequests.length) {
        toast.error("No data available to export.");
        return;
      }
      
      const { utils, writeFile } = await import('xlsx');
      
      const rows: any[] = [];
      
      workReports.forEach(r => {
        const empName = `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`.trim() || 'Unknown';
        const date = new Date(r.submittedAt || r.createdAt).toLocaleDateString();
        rows.push({
          Type: 'Work Report',
          Status: r.status,
          Employee: empName,
          Date: date,
          Details: r.title || ''
        });
      });
      
      fieldRequests.forEach(r => {
        const empName = `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`.trim() || 'Unknown';
        const date = new Date(r.date || r.createdAt).toLocaleDateString();
        rows.push({
          Type: 'Field Request',
          Status: r.status,
          Employee: empName,
          Date: date,
          Details: r.destination || ''
        });
      });
      
      const worksheet = utils.json_to_sheet(rows);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Activity Summary");
      
      writeFile(workbook, `OM_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success("Activity summary exported successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export data.");
    }
  };

  // Current formatted date
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const pendingWorkReports = workReports.filter(r => r.status === 'PENDING').length;
  const pendingFieldRequests = fieldRequests.filter(r => r.status === 'PENDING').length;
  // Calculate critical/high priority active reports
  const highPriorityCount = workReports.filter(r => r.status === 'PENDING' && (r.priority === 'HIGH' || r.priority === 'CRITICAL')).length;

  return (
    <PremiumDashboardLayout className="p-0 bg-transparent min-h-0 space-y-8 max-w-7xl mx-auto w-full">
      <EarlyCheckoutModal
        isOpen={showCheckoutModal}
        secondsElapsed={getSecondsElapsed()}
        isPending={punchMutation.isPending}
        onClose={() => setShowCheckoutModal(false)}
        onConfirm={() => {
          setShowCheckoutModal(false);
          punchMutation.mutate("OUT");
        }}
      />
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200/50 pb-6">
        <div>
          <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Welcome back, {userName}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Here is the operations summary for {todayFormatted}.</p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={handlePunch}
            disabled={punchMutation.isPending || todayQuery.isLoading}
            className={`px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${isPunchedIn
              ? "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              : "bg-slate-900 text-white hover:bg-slate-800 border border-transparent"
              }`}
          >
            {punchMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPunchedIn ? (
              <><LogOut className="w-4 h-4" /> Check out</>
            ) : (
              <><Clock className="w-4 h-4" /> Check in</>
            )}
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-lg transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Personal KPI Cards Row */}
      <div id="tour-dashboard-stats" className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {/* Today's Status */}
        <PremiumCard hoverLift decorativeGradient className="p-5 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Today's Status</p>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isPunchedIn ? 'bg-emerald-500' : (todayQuery.data?.offset && todayQuery.data.offset > 0 ? (todayQuery.data.offset < 32400 ? 'bg-orange-500' : 'bg-emerald-500') : 'bg-slate-300')}`}></span>
              <span className={`text-base font-bold ${isPunchedIn ? 'text-emerald-600' : (todayQuery.data?.offset && todayQuery.data.offset > 0 ? (todayQuery.data.offset < 32400 ? 'text-orange-600' : 'text-emerald-600') : 'text-slate-600')}`}>
                {isPunchedIn ? 'Present' : (todayQuery.data?.offset && todayQuery.data.offset > 0 ? (todayQuery.data.offset < 32400 ? 'Early Checkout' : 'Checked Out') : 'Not checked in')}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1.5">
              {isPunchedIn && checkInTimeDisplay
                ? `Checked in ${checkInTimeDisplay}`
                : (todayQuery.data?.offset && todayQuery.data.offset > 0
                  ? (todayQuery.data.offset < 32400 ? 'Shift ended early today' : 'Shift completed today')
                  : 'No punch recorded today')}
            </p>
          </div>
        </PremiumCard>

        {/* Leave Balance */}
        <PremiumCard hoverLift decorativeGradient className="p-5 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Leave Balance</p>
          <div className="flex items-baseline gap-1.5">
            {leaveKpiQuery.isLoading ? (
              <div className="h-9 w-16 bg-slate-200 animate-pulse rounded-md mb-1"></div>
            ) : (
              <h3 className="text-3xl font-black text-slate-900">{leaveBalance}</h3>
            )}
            <span className="text-xs font-medium text-slate-500">days available</span>
          </div>
        </PremiumCard>

        {/* Assets Assigned */}
        <PremiumCard hoverLift decorativeGradient className="p-5 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assets Assigned</p>
          <div className="flex items-baseline gap-1.5">
            {assetsQuery.isLoading ? (
              <div className="h-9 w-12 bg-slate-200 animate-pulse rounded-md mb-1"></div>
            ) : (
              <h3 className="text-3xl font-black text-slate-900">{assetsAssigned}</h3>
            )}
            <span className="text-xs font-medium text-slate-500">active items</span>
          </div>
        </PremiumCard>

        {/* Goals This Quarter */}
        <PremiumCard className="p-5 flex flex-col justify-between bg-slate-50 opacity-70">
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Goals This Quarter</p>
            {!PHASE_2_ENABLED && <Lock className="w-3.5 h-3.5 text-slate-300" />}
          </div>
          <div>
            {!PHASE_2_ENABLED ? (
              <p className="text-xs font-medium text-slate-400 italic">Available in Phase 2</p>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-3xl font-black text-slate-900">0</h3>
                <span className="text-xs font-medium text-slate-500">active goals</span>
              </div>
            )}
          </div>
        </PremiumCard>
      </div>

      {/* Team KPI Cards Row */}
      <div className="mt-2 mb-6">
        <KpiGrid metrics={[
          {
            id: "1",
            title: "Pending Field Requests",
            value: pendingFieldRequests.toString(),
            subtext: "Awaiting OM approval",
            iconType: "umbrella"
          },
          {
            id: "2",
            title: "Pending Work Reports",
            value: pendingWorkReports.toString(),
            subtext: "Awaiting your review",
            iconType: "briefcase"
          },
          {
            id: "3",
            title: "Total Team Activity",
            value: (workReports.length + fieldRequests.length).toString(),
            subtext: "Reports & requests",
            iconType: "calendar"
          },
          {
            id: "4",
            title: "High Priority",
            value: highPriorityCount.toString(),
            subtext: "Needs immediate attention",
            iconType: "users"
          }
        ]} />
      </div>

      <div id="tour-quick-actions" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PremiumCard className="p-0 border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Team Work Reports</h2>
              <p className="text-[12px] font-medium text-slate-500 mt-0.5">Latest reports needing your review.</p>
            </div>
            <button 
              onClick={() => router.push('/om/reports')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400">Loading reports...</div>
            ) : workReports.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                <FileText className="w-8 h-8 opacity-20" />
                <span className="text-sm font-medium">No team reports found</span>
              </div>
            ) : (
              <div className="space-y-1">
                {workReports.slice(0, 5).map((r: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors group cursor-pointer border border-transparent hover:border-slate-100" onClick={() => router.push(`/om/reports/${r.id}`)}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{r.title || 'Untitled Report'}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{r.employee?.firstName} {r.employee?.lastName}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-[11px] font-medium text-slate-500">{new Date(r.submittedAt || r.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                      r.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                      r.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PremiumCard>
        
        <PremiumCard className="p-0 border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Field Requests</h2>
              <p className="text-[12px] font-medium text-slate-500 mt-0.5">Latest field requests needing your approval.</p>
            </div>
            <button 
              onClick={() => router.push('/om/field-requests')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400">Loading requests...</div>
            ) : fieldRequests.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                <Clock className="w-8 h-8 opacity-20" />
                <span className="text-sm font-medium">No field requests found</span>
              </div>
            ) : (
              <div className="space-y-1">
                {fieldRequests.slice(0, 5).map((r: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.status === 'PENDING' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{r.destination || 'Unknown Location'}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{r.employee?.firstName} {r.employee?.lastName}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-[11px] font-medium text-slate-500">{new Date(r.date || r.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                      r.status === 'PENDING' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                      r.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PremiumCard>
      </div>
    </PremiumDashboardLayout>
  );
}
