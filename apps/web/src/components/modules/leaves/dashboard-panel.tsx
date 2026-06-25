"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plane, Calendar, FileText, CheckCircle2, UserPlus, BookOpen, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { fetchMyLeaveKpi, fetchLeaveCalendar, ApiLeaveRequest, ApiLeaveKpi } from "@/lib/api/leaves";

interface DashboardPanelProps {
  activeRole: "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
}

// Format ISO date string to "20 Jun 2026"
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function DashboardPanel({ activeRole }: DashboardPanelProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isEmployee = activeRole === "EMPLOYEE";

  // ── 1. Fetch the logged-in employee's leave KPI (balance) ──────────────────
  // The backend endpoint is GET /api/v1/leaves/kpi/:employeeId
  // We derive employeeId from localStorage persisted auth-storage
  const employeeId = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("auth-storage");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?.state?.employeeId ?? null;
      }
    } catch {}
    return null;
  }, []);

  const kpiQuery = useQuery<ApiLeaveKpi>({
    queryKey: ["leaves-kpi", employeeId],
    queryFn: () => fetchMyLeaveKpi(employeeId!),
    enabled: !!employeeId,
    staleTime: 60_000,
    retry: 1,
  });

  // ── 2. Fetch approved leaves for the calendar sidebar ─────────────────────
  const calendarQuery = useQuery<ApiLeaveRequest[]>({
    queryKey: ["leaves-calendar"],
    queryFn: fetchLeaveCalendar as any,
    staleTime: 120_000,
    retry: 1,
  });

  // ── Computed KPI values ───────────────────────────────────────────────────
  const kpi = useMemo(() => {
    if (!kpiQuery.data) return null;
    const { totalLeaves, usedLeaves, pendingLeaves, availableLeaves } = kpiQuery.data;
    return {
      available: `${availableLeaves} Days`,
      used: `${usedLeaves} Days`,
      pending: `${pendingLeaves} Requests`,
    };
  }, [kpiQuery.data]);

  // ── Recent leave requests (from calendar = approved leaves, for display) ──
  const recentRequests = useMemo(() => {
    if (!calendarQuery.data) return [];
    const items = calendarQuery.data as any[];
    // Employee view: filter to own records (employeeId match)
    if (isEmployee && employeeId) {
      return items.filter((r) => r.employeeId === employeeId).slice(0, 5);
    }
    return items.slice(0, 5);
  }, [calendarQuery.data, isEmployee, employeeId]);

  // ── Balance breakdown per leave type ─────────────────────────────────────
  const balanceDetails = kpiQuery.data?.details ?? [];

  return (
    <div className="space-y-6">

      {/* ── KPI Strip ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Available Balance",
            value: kpiQuery.isLoading ? "..." : (kpi?.available ?? "-- Days"),
            sub: "Ready for time-off",
            color: "text-emerald-600",
            icon: CheckCircle2,
          },
          {
            label: "Leave Used",
            value: kpiQuery.isLoading ? "..." : (kpi?.used ?? "-- Days"),
            sub: `Since Jan 1, ${new Date().getFullYear()}`,
            color: "text-slate-700",
            icon: Calendar,
          },
          {
            label: "Pending Requests",
            value: kpiQuery.isLoading ? "..." : (kpi?.pending ?? "-- Requests"),
            sub: "Awaiting approval",
            color: "text-amber-600",
            icon: FileText,
          },
          {
            label: "Upcoming Holidays",
            value: "—",
            sub: "Company-wide calendar",
            color: "text-indigo-600",
            icon: Plane,
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                  <p className={`text-xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                  <p className="text-[10px] font-semibold text-slate-500 mt-1">{card.sub}</p>
                </div>
                <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Content Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* ── Left: Recent Leave Requests ─────────────────────────────────── */}
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
                        <td className="px-5 py-3.5">{fmtDate(req.startDate)} – {fmtDate(req.endDate)}</td>
                        <td className="px-5 py-3.5 text-center font-bold text-slate-900">{req.totalDays}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${badge}`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

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
                            <span className="text-emerald-600">{available} avail</span>
                            <span className="text-slate-400">/</span>
                            <span>{allocated} total</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all"
                            style={{ width: `${usedPct}%` }}
                          />
                        </div>
                      </div>
                      {b.pending > 0 && (
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

        {/* ── Right: Quick Operations ──────────────────────────────────────── */}
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
              {/* Approver-only shortcut */}
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

          {/* Leave Policy Quick Summary */}
          {kpiQuery.data && !kpiQuery.isLoading && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Your Leave Summary
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
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Available Balance</span>
                  <span className="font-bold text-emerald-600">{kpiQuery.data.availableLeaves} days</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
