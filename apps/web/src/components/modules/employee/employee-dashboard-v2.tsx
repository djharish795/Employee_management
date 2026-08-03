"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock, Calendar, LogIn, LogOut, CheckCircle2,
  ChevronRight, CalendarDays, Bell, Coffee, Loader2, AlertCircle,
  MonitorSmartphone, Target, Lock, Check, FileText, ShieldAlert,
  ChevronLeft, MessageSquare
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import {
  fetchTodayStatus,
  fetchMyKpis,
  fetchMyLogs,
  submitPunch,
} from "@/lib/api/attendance";
import { fetchMyLeaveKpi } from "@/lib/api/leaves";
import { fetchMyProfile } from "@/lib/api/profile";
import { assetsApi } from "@/lib/api/assets";
import { workflowsApi } from "@/lib/api/workflows";
import { fetchNotifications } from "@/lib/api/notifications";
import { fetchFieldWorkApprovals } from "@/lib/api/field-work";
import { apiClient } from "@/lib/api/client";
import EarlyCheckoutModal from "@/components/shared/early-checkout-modal";
import { PremiumDashboardLayout, PremiumCard } from '@/components/shared/premium-dashboard';

import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (title: string) => {
  if (title.toLowerCase().includes('meet')) return <Calendar className="w-4 h-4" />;
  if (title.toLowerCase().includes('task') || title.toLowerCase().includes('workflow')) return <CheckCircle2 className="w-4 h-4" />;
  if (title.toLowerCase().includes('leave')) return <FileText className="w-4 h-4" />;
  return <MessageSquare className="w-4 h-4" />;
};

export default function EmployeeDashboardV2() {
  const queryClient = useQueryClient();
  const { employeeId, role, isTeamLead } = useAuthStore();
  const router = useRouter();

  const isManagerial = role === "MANAGER" || isTeamLead || role === "OM" || role === "HR" || role === "HRE" || role === "CAM" || role === "CRM" || role === "CTO" || role === "CEO";
  const isOperations = role === "OM" || role === "OE" || role === "CEM" || role === "CRM" || role === "OPERATIONS_HEAD" || role === "CEO";

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const logsQuery = useQuery({
    queryKey: ["attendanceLogs"],
    queryFn: () => fetchMyLogs(),
    staleTime: 60_000,
  });
  const logs = logsQuery.data?.data || [];

  // ── Today's attendance state from backend ─────────────────────────────────
  const todayQuery = useQuery({
    queryKey: ["attendanceStatus"],
    queryFn: fetchTodayStatus,
    refetchInterval: 60_000, // refresh every minute
    retry: 1,
  });

  // ── My KPIs from backend ──────────────────────────────────────────────────
  const kpisQuery = useQuery({
    queryKey: ["attendanceKpis"],
    queryFn: fetchMyKpis,
    staleTime: 120_000,
    retry: 1,
  });

  const leaveKpiQuery = useQuery({
    queryKey: ["leaves-kpi", employeeId],
    queryFn: () => fetchMyLeaveKpi(employeeId!),
    enabled: !!employeeId,
  });

  const profileQuery = useQuery({
    queryKey: ["myProfile"],
    queryFn: fetchMyProfile,
    staleTime: 600_000,
  });

  const assetsQuery = useQuery({
    queryKey: ["myAssets"],
    queryFn: assetsApi.getMy,
    staleTime: 60_000,
  });

  const tasksQuery = useQuery({
    queryKey: ["myTasks"],
    queryFn: workflowsApi.getMyApprovals,
    staleTime: 60_000,
  });

  const notificationsQuery = useQuery({
    queryKey: ["myNotifications"],
    queryFn: fetchNotifications,
    staleTime: 60_000,
  });

  const teamReportsQuery = useQuery({
    queryKey: ["teamReports"],
    queryFn: () => apiClient.get('/work-reports/team').then(res => res.data),
    staleTime: 60_000,
    enabled: isManagerial || isOperations,
  });

  const fieldWorkQuery = useQuery({
    queryKey: ["fieldWorkApprovals"],
    queryFn: fetchFieldWorkApprovals,
    staleTime: 60_000,
    enabled: isManagerial || isOperations,
  });

  const pendingWorkflows = Array.isArray(tasksQuery.data) 
    ? tasksQuery.data.filter((t: any) => t.status === 'PENDING') 
    : [];
  const pendingReports = Array.isArray(teamReportsQuery.data) 
    ? teamReportsQuery.data.filter((r: any) => r.status === 'PENDING' || r.status === 'Pending')
    : [];
  const pendingFieldWork = Array.isArray(fieldWorkQuery.data)
    ? fieldWorkQuery.data.filter((f: any) => f.status === 'PENDING' || f.status === 'Pending')
    : [];
  
  const activeFieldOperations = Array.isArray(fieldWorkQuery.data)
    ? fieldWorkQuery.data.filter((f: any) => f.status === 'IN_PROGRESS' || f.status === 'APPROVED').length
    : 0;

  const totalPendingAction = pendingWorkflows.length + pendingReports.length + pendingFieldWork.length;

  const todayState = todayQuery.data?.state ?? "OUT";
  const isPunchedIn = todayState === "IN" || todayState === "BREAK";
  const hasCompletedShift = !isPunchedIn && todayQuery.data?.offset && todayQuery.data.offset > 0;

  const PHASE_2_ENABLED = process.env.NEXT_PUBLIC_PHASE_2_ENABLED === 'true';

  // ── Punch mutation ────────────────────────────────────────────────────────
  const punchMutation = useMutation({
    mutationFn: (action: "IN" | "BREAK" | "OUT") => submitPunch(action),
    onSuccess: (newData) => {
      // Instantly update local state with backend response
      queryClient.setQueryData(["attendanceStatus"], newData);

      // Refresh background data
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
    
    if (todayState === "BREAK") {
      punchMutation.mutate("IN");
      return;
    }

    const nextAction = isPunchedIn ? "OUT" : "IN";
    if (nextAction === "OUT") {
      setShowCheckoutModal(true);
    } else {
      punchMutation.mutate(nextAction);
    }
  };

  // ── Formatted clock-in time ───────────────────────────────────────────────
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

  // Header Data
  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? "Good morning" :
      greetingHour < 17 ? "Good afternoon" :
        "Good evening";

  let userName = "Employee";
  if (profileQuery.data?.firstName) {
    userName = `${profileQuery.data.firstName} ${profileQuery.data.lastName || ""}`.trim();
  }
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const todayFormatted = new Date().toLocaleDateString('en-US', dateOptions);

  // ── Month Stats Computation ────────────────────────────────────────────────
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let presentCount = 0;
  let earlyCheckoutCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  let weekendCount = 0;
  let onLeaveCount = 0;

  const logsByDateMap = React.useMemo(() => {
    const map = new Map<string, any>();
    logs.forEach((l: any) => {
      const dateStr = new Date(l.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      map.set(dateStr, l);
    });
    return map;
  }, [logs]);

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const dayLog = logsByDateMap.get(dateStr);

    if (d.getDay() === 0 || d.getDay() === 6) {
      weekendCount++;
    }

    if (dayLog) {
      if (dayLog.status === "PRESENT") presentCount++;
      else if (dayLog.status === "EARLY_CHECKOUT") earlyCheckoutCount++;
      else if (dayLog.status === "LATE") lateCount++;
      else if (dayLog.status === "ABSENT") absentCount++;
      else if (dayLog.status === "ON_LEAVE") onLeaveCount++;
    }
  }

  return (
    <PremiumDashboardLayout className="p-0 bg-transparent min-h-0 space-y-6">
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {mounted ? `${greeting}, ${userName}` : `Welcome, ${userName}`}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {mounted ? todayFormatted : "Loading date..."}
          </p>
        </div>

        <button
          onClick={handlePunch}
          disabled={punchMutation.isPending || todayQuery.isLoading}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${isPunchedIn
            ? "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
        >
          {punchMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : todayState === "BREAK" ? (
            <><Coffee className="w-4 h-4" /> End break</>
          ) : isPunchedIn ? (
            <><LogOut className="w-4 h-4" /> Check out</>
          ) : (
            <><Clock className="w-4 h-4" /> Check in</>
          )}
        </button>
      </div>

      {/* KPI Cards */}
      <div id="tour-dashboard-stats" className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Today's Status */}
        <PremiumCard hoverLift decorativeGradient className="p-5 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Today's Status</p>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isPunchedIn ? 'bg-emerald-500' : (todayQuery.data?.offset && todayQuery.data.offset > 0 ? (todayQuery.data.offset < 32341 ? 'bg-orange-500' : 'bg-emerald-500') : 'bg-slate-300')}`}></span>
              <span className={`text-base font-bold ${isPunchedIn ? 'text-emerald-600' : (todayQuery.data?.offset && todayQuery.data.offset > 0 ? (todayQuery.data.offset < 32341 ? 'text-orange-600' : 'text-emerald-600') : 'text-slate-600')}`}>
                {isPunchedIn ? 'Present' : (todayQuery.data?.offset && todayQuery.data.offset > 0 ? (todayQuery.data.offset < 32341 ? 'Early Checkout' : 'Checked Out') : 'Not checked in')}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1.5">
              {isPunchedIn && checkInTimeDisplay
                ? `Checked in ${checkInTimeDisplay}`
                : (todayQuery.data?.offset && todayQuery.data.offset > 0
                  ? (todayQuery.data.offset < 32341 ? 'Shift ended early today' : 'Shift completed today')
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

      {/* Managerial Action Cards (Card 1 & Card 3) */}
      {isOperations && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Card 1: Action Required (Pending Approvals) */}
        <PremiumCard hoverLift decorativeGradient className="p-5 flex flex-col justify-between border-blue-200 dark:border-blue-900/50">
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Action Required</p>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            {tasksQuery.isLoading ? (
              <div className="h-9 w-12 bg-slate-200 animate-pulse rounded-md mb-1"></div>
            ) : (
              <h3 className="text-3xl font-black text-amber-500">
                {totalPendingAction}
              </h3>
            )}
            <span className="text-xs font-medium text-slate-500">pending approvals</span>
          </div>
          <p className="text-xs text-slate-400 mt-3 font-medium">Work reports and field requests waiting on you.</p>
        </PremiumCard>

        {/* Card 3: Active Field Operations */}
        <PremiumCard hoverLift decorativeGradient className="p-5 flex flex-col justify-between border-emerald-200 dark:border-emerald-900/50">
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Field Operations</p>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            {(fieldWorkQuery.isLoading) ? (
              <div className="h-9 w-12 bg-slate-200 animate-pulse rounded-md mb-1"></div>
            ) : (
              <h3 className="text-3xl font-black text-emerald-500">{activeFieldOperations}</h3>
            )}
            <span className="text-xs font-medium text-slate-500">team members in the field</span>
          </div>
          <p className="text-xs text-slate-400 mt-3 font-medium">Live field tracking and updates.</p>
        </PremiumCard>
      </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Attendance Calendar */}
        <PremiumCard className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900">Attendance this month</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-slate-900 w-28 text-center">
                {calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="w-full text-center">
            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                <div key={day} className="text-[10px] font-bold text-slate-400">{day}</div>
              ))}
            </div>
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-sm font-semibold text-slate-700">
              {(() => {
                const year = calendarDate.getFullYear();
                const month = calendarDate.getMonth();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const firstDayOfMonth = new Date(year, month, 1).getDay();
                // Adjust to make Monday the first day of the week (0=Mon, 6=Sun)
                const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

                const cells = [];
                // Empty offset items
                for (let i = 0; i < startOffset; i++) {
                  cells.push(<div key={`empty-${i}`}></div>);
                }

                // Actual days
                for (let day = 1; day <= daysInMonth; day++) {
                  const dateStr = new Date(year, month, day).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                  const dayLog = logsByDateMap.get(dateStr);

                  let bgClass = "bg-transparent text-slate-700 hover:bg-slate-100";
                  if (dayLog) {
                    if (dayLog.status === "PRESENT") bgClass = "bg-emerald-100 text-emerald-700 font-bold hover:bg-emerald-200";
                    else if (dayLog.status === "LATE") bgClass = "bg-amber-100 text-amber-700 font-bold hover:bg-amber-200";
                    else if (dayLog.status === "EARLY_CHECKOUT") bgClass = "bg-orange-100 text-orange-500 font-bold hover:bg-orange-200";
                    else if (dayLog.status === "ABSENT") bgClass = "border border-rose-300 text-rose-600 font-bold hover:bg-rose-50";
                    else if (dayLog.status === "ON_LEAVE") bgClass = "bg-purple-100 text-purple-700 font-bold hover:bg-purple-200";
                    else if (dayLog.status === "WFH") bgClass = "bg-slate-200 text-slate-700 font-bold hover:bg-slate-300";
                  }

                  const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                  const isFuture = new Date(year, month, day) > new Date();
                  const isWeekend = new Date(year, month, day).getDay() === 0 || new Date(year, month, day).getDay() === 6;

                  if (isToday) {
                    bgClass = "bg-slate-900 text-white font-bold shadow-sm ring-2 ring-slate-200 ring-offset-2 hover:bg-slate-800";
                  } else if (isFuture) {
                    bgClass = "bg-transparent text-slate-300";
                  } else if (isWeekend && !dayLog) {
                    bgClass = "bg-slate-100/70 text-slate-400 hover:bg-slate-200";
                  }

                  cells.push(
                    <div
                      key={`day-${day}`}
                      className="group relative flex items-center justify-center py-1 cursor-pointer"
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${bgClass}`}>
                        {day}
                      </div>
                      
                      {/* Custom Tooltip */}
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col items-center">
                        <div className="bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                          {dayLog ? `${dayLog.status === 'EARLY_CHECKOUT' ? 'EARLY CHECKOUT' : dayLog.status}: ${typeof dayLog.hoursWorked === 'number' ? dayLog.hoursWorked.toFixed(1) : dayLog.hoursWorked}h` : (isWeekend ? "Weekend (Off)" : "No Record")}
                        </div>
                        <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                      </div>
                    </div>
                  );
                }

                // Fill remaining
                const remaining = Math.ceil((startOffset + daysInMonth) / 7) * 7 - (startOffset + daysInMonth);
                for (let i = 0; i < remaining; i++) {
                  cells.push(<div key={`end-empty-${i}`}></div>);
                }

                return cells;
              })()}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-8 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full text-[11px] font-bold text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Present {presentCount}
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full text-[11px] font-bold text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Early Checkouts {earlyCheckoutCount}
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full text-[11px] font-bold text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Late {lateCount}
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full text-[11px] font-bold text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full border border-rose-500"></span> Absent {absentCount}
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full text-[11px] font-bold text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> On Leave {onLeaveCount}
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full text-[11px] font-bold text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Weekend {weekendCount}
              </div>
            </div>
          </div>
        </PremiumCard>

        {/* Right Column (Stacked) */}
        <div className="flex flex-col gap-6 lg:col-span-1 h-full">
          {/* Pending For You */}
          <PremiumCard id="tour-quick-actions" className="p-6 flex flex-col flex-1 max-h-[400px]">
            <h3 className="text-base font-bold text-slate-900 mb-4 shrink-0">Pending for you</h3>
            <div className="space-y-3 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-slate-200">
            {(tasksQuery.isLoading || teamReportsQuery.isLoading || fieldWorkQuery.isLoading) ? (
              <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
            ) : totalPendingAction > 0 ? (
              <>
                {pendingWorkflows.slice(0, 2).map((task: any) => (
                  <div key={`wf-${task.id}`} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{task.workflow?.name || "Workflow Task"}</p>
                        <p className="text-[11px] font-medium text-slate-500">From {task.initiatedBy?.firstName} {task.initiatedBy?.lastName}</p>
                      </div>
                    </div>
                    <Link href={`/workflows/${task.id}`} className="px-3 py-1.5 border border-slate-300 rounded-md text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                      Review
                    </Link>
                  </div>
                ))}
                {pendingReports.slice(0, 3).map((report: any) => (
                  <div key={`rep-${report.id}`} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{report.title}</p>
                        <p className="text-[11px] font-medium text-slate-500">From {report.employee?.firstName} {report.employee?.lastName} • {report.reportType}</p>
                      </div>
                    </div>
                    <Link href={`/om/work-reports`} className="px-3 py-1.5 border border-slate-300 rounded-md text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                      Review
                    </Link>
                  </div>
                ))}
                {pendingFieldWork.slice(0, 2).map((fw: any) => (
                  <div key={`fw-${fw.id}`} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Field Work Request</p>
                        <p className="text-[11px] font-medium text-slate-500">From {fw.employeeName} • {fw.client}</p>
                      </div>
                    </div>
                    <Link href={`/om/field-reports`} className="px-3 py-1.5 border border-slate-300 rounded-md text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                      Review
                    </Link>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center p-6 border border-dashed border-slate-200 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-500">You're all caught up!</p>
              </div>
            )}
            </div>
          </PremiumCard>

          {/* Recent Notifications */}
          <PremiumCard className="p-6 flex flex-col flex-1 max-h-[400px]">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-base font-bold text-slate-900">Recent notifications</h3>
              <Link href="/notifications" className="text-xs font-bold text-blue-600 hover:text-blue-700">View all</Link>
            </div>
            <div className="space-y-4 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-slate-200">
          {notificationsQuery.isLoading ? (
            <div className="flex justify-center p-2"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : notificationsQuery.data && notificationsQuery.data.length > 0 ? (
            notificationsQuery.data.slice(0, 4).map((notification: any) => (
              <div key={notification.id} className="group flex items-start gap-3 p-3 -mx-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!notification.isRead ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                  {getNotificationIcon(notification.title)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${!notification.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{notification.title}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{notification.message || "You have a new notification in your inbox."}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">
    {notification.createdAt && !isNaN(new Date(notification.createdAt).getTime()) 
      ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) 
      : 'Recently'}
  </p>
                </div>
                {!notification.isRead && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-3 flex-shrink-0"></span>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm font-medium text-slate-500 text-center py-4">No recent notifications</p>
            )}
            </div>
          </PremiumCard>
        </div>
      </div>
    </PremiumDashboardLayout>
  );
}
