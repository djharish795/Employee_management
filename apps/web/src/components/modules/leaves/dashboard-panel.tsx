"use client";
import { usePermissions } from "@/hooks/use-permissions";
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plane, Calendar, FileText, CheckCircle2, UserPlus,
  BookOpen, ArrowRight, AlertCircle, Loader2, Home, Clock
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { fetchMyLeaveKpi, fetchLeaveCalendar, ApiLeaveRequest, ApiLeaveKpi, cancelLeaveRequest } from "@/lib/api/leaves";
import { fetchMyWfh, ApiWfhRequest } from "@/lib/api/wfh";
import { toast } from "react-hot-toast";

interface DashboardPanelProps {
  activeRole: "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function DashboardPanel() {
  const { role } = usePermissions();
  const activeRole = role as any;
  const { employeeId } = useAuthStore();
  const isEmployee = activeRole === "EMPLOYEE";

  const leavePanelRole = ((): "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE" => {
    if (["SUPER_ADMIN", "IT"].includes(activeRole)) return "ADMIN";
    if (["HR", "CHRO"].includes(activeRole)) return "HR";
    if (["CEO", "COO"].includes(activeRole)) return "CEO";
    if (["CTO", "CFO", "FINANCE", "MANAGER", "TEAM_LEAD"].includes(activeRole)) return "MANAGER";
    return "EMPLOYEE";
  })();

  // ------ 1. My Leave KPI & Balance ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  const kpiQuery = useQuery<ApiLeaveKpi>({
    queryKey: ["leaves-kpi", employeeId],
    queryFn: () => fetchMyLeaveKpi(employeeId!),
    enabled: !!employeeId,
    staleTime: 60_000,
    retry: 2,
  });

  // ------ 2. Leave Calendar (recent requests) ------------------------------------------------------------------------------------------------------
  const calendarQuery = useQuery<ApiLeaveRequest[]>({
    queryKey: ["leaves-dashboard-calendar"],
    queryFn: () => fetchLeaveCalendar(),
    enabled: !!employeeId && ["MANAGER", "HR", "CEO", "ADMIN"].includes(leavePanelRole),
    staleTime: 120_000,
    retry: 1,
  });

  // ------ 3. WFH requests for this month ---------------------------------------------------------------------------------------------------------------------
  const wfhQuery = useQuery<ApiWfhRequest[]>({
    queryKey: ["wfh-my", employeeId],
    queryFn: () => fetchMyWfh(employeeId!),
    enabled: !!employeeId,
    staleTime: 60_000,
    retry: 1,
  });

  // ------ Computed leave KPIs ---------------------------------------------------------------------------------------------------------------------------------------------------------
  const kpi = useMemo(() => {
    if (!kpiQuery.data) return null;
    const { totalLeaves, usedLeaves, pendingLeaves, availableLeaves, details } = kpiQuery.data;

    // Fallback if isPaidLeave is not available from API
    const isPaidDefined = details.length > 0 && details[0].leaveType.isPaidLeave !== undefined;

    const usedPaid = details
      .filter(d => d.id !== 'virtual-sl')
      .filter(d => isPaidDefined ? d.leaveType.isPaidLeave : d.leaveType.code !== "LOP")
      .reduce((sum, d) => sum + Number(d.used), 0);

    const usedUnpaid = (kpiQuery.data as any).usedUnpaidLeaves || 0;

    return {
      available: availableLeaves,
      used: usedLeaves,
      pending: pendingLeaves,
      total: totalLeaves,
      usedPaid,
      usedUnpaid
    };
  }, [kpiQuery.data]);

  // ------ Half-day specific balance ---------------------------------------------------------------------------------------------------------------------------------------
  const halfDayBalance = useMemo(() => {
    if (!kpiQuery.data) return null;
    const hd = kpiQuery.data.details.find(d => d.leaveType.code === "CL_HALF");
    if (!hd) return null;
    const available = Number(hd.allocated) + Number(hd.carriedOver) - Number(hd.used) - Number(hd.pending);
    return { available, allocated: Number(hd.allocated) };
  }, [kpiQuery.data]);

  const maxWfh = 1;

  // ------ WFH this month ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  const wfhThisMonth = useMemo(() => {
    if (!wfhQuery.data) return { used: 0, pending: 0, max: maxWfh };
    const now = new Date();
    const thisMonthWfh = wfhQuery.data.filter(w => {
      const d = new Date(w.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const used = thisMonthWfh.filter(w => w.status === "APPROVED").length;
    const pending = thisMonthWfh.filter(w => w.status === "PENDING").length;
    return { used, pending, max: maxWfh };
  }, [wfhQuery.data, maxWfh]);

  // ------ Recent leave requests ---------------------------------------------------------------------------------------------------------------------------------------------------
  const recentRequests = useMemo(() => {
    if (!calendarQuery.data) return [];
    const items = calendarQuery.data as any[];
    if (employeeId) {
      return items.filter((r) => r.employeeId === employeeId).slice(0, 5);
    }
    return items.slice(0, 5);
  }, [calendarQuery.data, employeeId]);

  // ------ Balance breakdown (excluding CL_HALF, shown separately) ------------------------------------------
  const balanceDetails = (kpiQuery.data?.details ?? []).filter(d => d.leaveType.code !== "CL_HALF");

  const isLoading = kpiQuery.isLoading;

  const handleCancelLeave = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this leave request?")) return;
    try {
      await cancelLeaveRequest(id);
      toast.success("Leave request cancelled successfully");
      calendarQuery.refetch();
      kpiQuery.refetch();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to cancel leave request");
    }
  };

  return (
    <div className="space-y-6">

      {/* ------ Global Summary Cards ------------------------------------------------------------------------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Allocated (Yearly) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BookOpen className="w-16 h-16 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Allocated (Yearly)</p>
            <p className={`text-3xl font-black mt-1 ${isLoading ? "text-slate-600" : "text-white"}`}>
              {isLoading ? "..." : kpiQuery.data?.totalLeaves !== undefined ? `${kpiQuery.data.totalLeaves} Days` : "--"}
            </p>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">Your entire yearly allowance</p>
          </div>
        </div>

        {/* Used Leaves */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Used Leaves</p>
            <p className={`text-3xl font-black mt-1 ${isLoading ? "text-slate-300" : "text-slate-800"}`}>
              {isLoading ? "..." : kpiQuery.data?.usedLeaves !== undefined ? `${kpiQuery.data.usedLeaves} Days` : "--"}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">Total taken this year</p>
          </div>
        </div>

        {/* Currently Active (Accrued) */}
        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl shadow-sm">
          <div>
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Currently Active</p>
            <p className={`text-3xl font-black mt-1 ${isLoading ? "text-emerald-300" : "text-emerald-700"}`}>
              {isLoading ? "..." : kpiQuery.data?.availableLeaves !== undefined ? `${kpiQuery.data.availableLeaves} Days` : "--"}
            </p>
            <p className="text-[11px] font-semibold text-emerald-600/70 mt-1">Accrued & ready to use right now</p>
          </div>
        </div>
      </div>

      {/* ------ Detailed Breakdown Cards ------------------------------------------------------------------------------------------------------------------------ */}
      <h4 className="text-sm font-bold text-slate-700 mb-2 mt-8 border-b border-slate-100 pb-2">Leave Breakdown</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* Full-Day Available */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full-Day Available</p>
              <p className={`text-xl font-bold mt-1 ${isLoading ? "text-slate-300" : "text-emerald-600"}`}>
                {isLoading ? "..." : kpiQuery.data ? (() => {
                  const clFull = kpiQuery.data.details.find((d: any) => d.leaveType.code === "CL");
                  if (!clFull) return "0 Days";
                  const available = Number(clFull.allocated) + Number(clFull.carriedOver) - Number(clFull.used) - Number(clFull.pending);
                  return `${available} Days`;
                })() : "--"}
              </p>
              <p className="text-[10px] font-semibold text-slate-500 mt-1">
                {isLoading ? "..." : (() => {
                  const clFull = kpiQuery.data?.details.find((d: any) => d.leaveType.code === "CL");
                  if (!clFull) return "Ready for time-off";
                  const yearly = Number(clFull.yearlyAllocated) || 0;
                  const currentAllocated = Number(clFull.allocated) || 0;
                  const remainingToAccrue = Math.max(0, yearly - currentAllocated);
                  return `Out of ${yearly} yearly limit (${remainingToAccrue} remaining to accrue)`;
                })()}
              </p>
            </div>
            <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Half-Day Available */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Half-Day Available</p>
              <p className={`text-xl font-bold mt-1 ${isLoading ? "text-slate-300" : "text-indigo-600"}`}>
                {isLoading ? "..." : (() => {
                  if (!kpiQuery.data) return "--";
                  const clHalf = kpiQuery.data.details.find((d: any) => d.leaveType.code === "CL_HALF");
                  if (!clHalf) return "0 Days";
                  const avail = Number(clHalf.allocated) + Number(clHalf.carriedOver) - Number(clHalf.used) - Number(clHalf.pending);
                  return `${avail % 1 === 0 ? avail : avail.toFixed(1)} Days`;
                })()}
              </p>
              <p className="text-[10px] font-semibold text-slate-500 mt-1">
                {isLoading ? "..." : (() => {
                  const clHalf = kpiQuery.data?.details.find((d: any) => d.leaveType.code === "CL_HALF");
                  if (!clHalf) return "Half-day entitlement";
                  const yearly = Number(clHalf.yearlyAllocated) || 0;
                  const used = Number(clHalf.used) || 0;
                  // Total instances they can ever use this year is yearly (e.g. 6). Remaining is 6 - used - available.
                  const remainingToAccrue = Math.max(0, yearly - used - Number(halfDayBalance?.available || 0));
                  return `Out of ${yearly} yearly limit (${remainingToAccrue} remaining to accrue)`;
                })()}
              </p>
            </div>
            <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Optional Leaves */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Optional Leaves</p>
              <p className={`text-xl font-bold mt-1 ${isLoading ? "text-slate-300" : "text-purple-600"}`}>
                {isLoading ? "..." : (() => {
                  if (!kpiQuery.data) return "--";
                  const opt = kpiQuery.data.details.find((d: any) => d.leaveType.code === "OPTIONAL");
                  if (!opt) return "0 Days";
                  const avail = Number(opt.allocated) + Number(opt.carriedOver) - Number(opt.used) - Number(opt.pending);
                  return `${avail % 1 === 0 ? avail : avail.toFixed(1)} Days`;
                })()}
              </p>
              <p className="text-[10px] font-semibold text-slate-500 mt-1">Available holidays</p>
            </div>
            <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-purple-50 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white border border-amber-200 p-5 rounded-xl shadow-sm bg-amber-50/30">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending Approval</p>
              <p className={`text-xl font-bold mt-1 ${isLoading ? "text-amber-300" : "text-amber-600"}`}>
                {isLoading ? "..." : kpi ? `${kpi.pending % 1 === 0 ? kpi.pending : kpi.pending.toFixed(1)} Days` : "--"}
              </p>
              <p className="text-[10px] font-semibold text-amber-700/70 mt-1">Locks available balance</p>
            </div>
            <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Used Paid vs Unpaid Breakdown */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="w-full">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Used Leaves Breakdown</p>
              <div className="flex items-center gap-4 mt-1">
                <div>
                  <p className={`text-xl font-bold ${isLoading ? "text-slate-300" : "text-emerald-600"}`}>
                    {isLoading ? "..." : kpi ? `${kpi.usedPaid % 1 === 0 ? kpi.usedPaid : kpi.usedPaid.toFixed(1)} Days` : "--"}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Paid Leave</p>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div>
                  <p className={`text-xl font-bold ${isLoading ? "text-slate-300" : "text-rose-600"}`}>
                    {isLoading ? "..." : kpi ? `${kpi.usedUnpaid % 1 === 0 ? kpi.usedUnpaid : kpi.usedUnpaid.toFixed(1)} Days` : "--"}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Unpaid Leave</p>
                </div>
              </div>
            </div>
            <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-slate-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </div>

        {/* WFH This Month */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WFH This Month</p>
              <p className={`text-xl font-bold mt-1 ${wfhQuery.isLoading ? "text-slate-300" : wfhThisMonth.used >= wfhThisMonth.max ? "text-rose-600" : "text-sky-600"}`}>
                {wfhQuery.isLoading ? "..." : `${wfhThisMonth.used} / ${wfhThisMonth.max}`}
              </p>
              <p className="text-[10px] font-semibold text-slate-500 mt-1">
                {wfhThisMonth.pending > 0 ? `${wfhThisMonth.pending} pending` : `Max ${wfhThisMonth.max} per month`}
              </p>
            </div>
            <div className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center ${wfhThisMonth.used >= wfhThisMonth.max ? "bg-rose-50" : "bg-sky-50"}`}>
              <Home className={`w-4 h-4 ${wfhThisMonth.used >= wfhThisMonth.max ? "text-rose-500" : "text-sky-500"}`} />
            </div>
          </div>
        </div>
      </div>

      {/* ------ Main Content Grid ------------------------------------------------------------------------------------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* ------ Left: Recent Leave Requests --------------------------------------------------------------------------------------------------------------- */}
        <div className="xl:col-span-2 space-y-6">

          {/* Leave History Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/20">
              <h3 className="text-sm font-bold text-slate-900">
                {isEmployee ? "My Recent Leave Applications" : "Recent Approved Leaves"}
              </h3>
              <Link
                href="/leaves/apply"
                className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" /> Apply for Leave
              </Link>
            </div>

            {calendarQuery.isLoading ? (
              <div className="py-16 flex flex-col items-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <p className="text-xs font-bold">Loading leave records...</p>
              </div>
            ) : calendarQuery.error ? (
              <div className="py-10 flex flex-col items-center text-slate-400">
                <AlertCircle className="w-6 h-6 text-rose-400 mb-2" />
                <p className="text-xs font-bold text-slate-600">Could not load leave data</p>
                <p className="text-xs text-slate-400 mt-1">Check backend connection</p>
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="py-14 flex flex-col items-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-xs font-bold text-slate-600">No leave records found</p>
                <p className="text-xs mt-1">Apply for your first leave to see it here</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-5 py-3">Employee</th>
                    <th className="px-5 py-3">Leave Type</th>
                    <th className="px-5 py-3">Duration</th>
                    <th className="px-5 py-3 text-center">Days</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold text-slate-600 divide-y divide-slate-100">
                  {recentRequests.map((req: any) => {
                    const badge =
                      req.status === "APPROVED"
                        ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                        : req.status === "PENDING"
                          ? "text-amber-700 bg-amber-50 border border-amber-100"
                          : "text-rose-700 bg-rose-50 border border-rose-100";
                    const empName = req.employee
                      ? `${req.employee.firstName} ${req.employee.lastName}`
                      : "Employee";
                    const leaveTypeName = req.leaveType?.name ?? req.leaveTypeId;
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900">{empName}</td>
                        <td className="px-5 py-3.5 uppercase text-[9px] tracking-wide text-slate-500 font-bold">
                          {leaveTypeName}
                        </td>
                        <td className="px-5 py-3.5">{fmtDate(req.startDate)} --- {fmtDate(req.endDate)}</td>
                        <td className="px-5 py-3.5 text-center font-bold text-slate-900">{req.totalDays}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${badge}`}>
                              {req.status}
                            </span>
                            {req.status === 'PENDING' && req.employeeId === employeeId && (
                              <button
                                onClick={() => handleCancelLeave(req.id)}
                                className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* WFH History */}
          {wfhQuery.data && wfhQuery.data.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/20 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">My WFH Requests</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full border border-sky-200">
                  Max {wfhThisMonth.max}/month
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {wfhQuery.data.slice(0, 5).map((wfh) => {
                  const badge =
                    wfh.status === "APPROVED"
                      ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                      : wfh.status === "PENDING"
                        ? "text-amber-700 bg-amber-50 border border-amber-100"
                        : "text-rose-700 bg-rose-50 border border-rose-100";
                  return (
                    <div key={wfh.id} className="px-5 py-3.5 flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-3">
                        <Home className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{fmtDate(wfh.date)}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">{wfh.reason}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${badge}`}>
                        {wfh.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Leave Balance Breakdown */}
          {balanceDetails.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/20">
                <h3 className="text-sm font-bold text-slate-900">Leave Balance Breakdown</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {balanceDetails.map((b: any) => {
                  const allocated = Number(b.allocated) + Number(b.carriedOver);
                  const available = allocated - Number(b.used) - Number(b.pending);
                  const usedPct = allocated > 0 ? Math.round((Number(b.used) / allocated) * 100) : 0;
                  return (
                    <div key={b.id} className="px-5 py-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-bold text-slate-800">{b.leaveType?.name}</p>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                            <span className="text-emerald-600">{available % 1 === 0 ? available : available.toFixed(1)} avail</span>
                            <span className="text-slate-400">/</span>
                            <span>{b.yearlyAllocated} total</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all"
                            style={{ width: `${usedPct}%` }}
                          />
                        </div>
                      </div>
                      {Number(b.pending) > 0 && (
                        <span className="flex-shrink-0 px-2 py-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded uppercase">
                          {b.pending} pending
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ------ Right: Quick Operations ------------------------------------------------------------------------------------------------------------------------------ */}
        <div className="space-y-5">

          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Time-Off Operations</h3>
            <div className="flex flex-col gap-2">
              <Link
                href="/leaves/apply"
                className="flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" /> Apply for Leave
              </Link>
              <Link
                href="/leaves/apply?tab=wfh"
                className="flex items-center justify-center gap-2 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
              >
                <Home className="w-3.5 h-3.5" /> Apply for WFH
              </Link>
              <Link
                href="/leaves/calendar"
                className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" /> Leave Calendar
              </Link>
              <Link
                href="/leaves/policies"
                className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" /> View Policies
              </Link>
              {!isEmployee && activeRole !== "CEO" && (
                <Link
                  href="/leaves/approvals"
                  className="flex items-center justify-center gap-2 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold rounded-lg transition-all shadow-sm"
                >
                  <ArrowRight className="w-3.5 h-3.5" /> Review Pending Queue
                </Link>
              )}
            </div>
          </div>

          {/* Global Leave Summary */}
          {kpiQuery.data && !kpiQuery.isLoading && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Leave Summary
              </h3>
              <div className="space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400">Total Allocated</span>
                  <span className="font-bold text-slate-900">{kpiQuery.data.totalLeaves} days</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400">Used This Year</span>
                  <span className="font-bold text-slate-700">{kpiQuery.data.usedLeaves} days</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400">Pending Approval</span>
                  <span className="font-bold text-amber-600">{kpiQuery.data.pendingLeaves} days</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400">Available Balance</span>
                  <span className="font-bold text-emerald-600">{kpiQuery.data.availableLeaves} days</span>
                </div>
                {halfDayBalance && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Half Days Left</span>
                    <span className="font-bold text-indigo-600">{halfDayBalance.available} / {halfDayBalance.allocated}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WFH Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Home className="w-4 h-4 text-sky-500" />
              Work From Home
            </h3>
            <div className="space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">This Month Used</span>
                <span className={`font-bold ${wfhThisMonth.used >= wfhThisMonth.max ? "text-rose-600" : "text-sky-600"}`}>
                  {wfhThisMonth.used} / {wfhThisMonth.max}
                </span>
              </div>
              {wfhThisMonth.pending > 0 && (
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400">Pending</span>
                  <span className="font-bold text-amber-600">{wfhThisMonth.pending}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Policy</span>
                <span className="font-bold text-slate-500">Max {wfhThisMonth.max}/month for your role</span>
              </div>
            </div>
            {wfhThisMonth.used < wfhThisMonth.max && (
              <Link
                href="/leaves/apply?tab=wfh"
                className="block w-full text-center py-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold rounded-lg transition-all"
              >
                Apply for WFH
              </Link>
            )}
            {wfhThisMonth.used >= wfhThisMonth.max && (
              <div className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-2 text-center">
                Monthly WFH limit reached
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
