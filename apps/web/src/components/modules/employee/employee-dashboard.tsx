"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock, Calendar, LogIn, LogOut, CheckCircle2,
  ChevronRight, CalendarDays, Bell, Coffee, Loader2, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import {
  fetchTodayStatus,
  fetchMyKpis,
  submitPunch,
} from "@/lib/api/attendance";
import EarlyCheckoutModal from "@/components/shared/early-checkout-modal";

// Format seconds into h mm string
const fmtHours = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export default function EmployeeDashboardPanel() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const userRole = useAuthStore((state) => state.role) || "EMPLOYEE";

  let userName = "Employee";
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      if (payload.email) {
        userName = payload.email.split('@')[0];
        userName = userName.split('.').map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
      }
    } catch (e) {
      // ignore
    }
  }

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

  const todayState = todayQuery.data?.state ?? "OUT";
  const isPunchedIn = todayState === "IN" || todayState === "BREAK";

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

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

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
      hour: "2-digit",
      minute: "2-digit",
    });
  })();

  // ── Hours worked today ────────────────────────────────────────────────────
  const hoursToday = (() => {
    // Assuming avgHoursWorked is available instead of hoursToday based on AttendanceKPIs type
    if (kpisQuery.data?.avgHoursWorked != null) return kpisQuery.data.avgHoursWorked;
    return null;
  })();

  // ── Leave balance (from kpis if available) ────────────────────────────────
  const leaveBalance = kpisQuery.data?.leaveDays ?? null;

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? "Good Morning" :
      greetingHour < 17 ? "Good Afternoon" :
        "Good Evening";

  return (
    <div className="space-y-6">
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

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Hours Worked Today */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Hours</p>
            {kpisQuery.isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-400 mt-1" />
            ) : (
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {hoursToday ?? "0h 0m"}
              </h3>
            )}
            <p className="text-[10px] font-semibold text-emerald-600 mt-1">
              {todayState === "IN" ? "Currently clocked in" : todayState === "BREAK" ? "On break" : "Not clocked in"}
            </p>
          </div>
        </div>

        {/* Leave Balance */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Balance</p>
            {kpisQuery.isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-400 mt-1" />
            ) : leaveBalance != null ? (
              <h3 className="text-2xl font-black text-slate-900 mt-1">{leaveBalance} Days</h3>
            ) : (
              <h3 className="text-2xl font-black text-slate-900 mt-1">—</h3>
            )}
            <p className="text-[10px] font-semibold text-slate-500 mt-1">Available this year</p>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</p>
            {kpisQuery.isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-400 mt-1" />
            ) : (
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {kpisQuery.data?.attendanceRate != null
                  ? `${Number(kpisQuery.data.attendanceRate).toFixed(0)}%`
                  : "—"}
              </h3>
            )}
            <p className="text-[10px] font-semibold text-slate-500 mt-1">This month</p>
          </div>
        </div>
      </div>

      {/* ── Main Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left Column ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Punch Widget */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-left w-full md:w-auto">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${todayState === "IN"
                      ? "bg-emerald-100 text-emerald-600"
                      : todayState === "BREAK"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                >
                  {todayState === "IN" ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : todayState === "BREAK" ? (
                    <Coffee className="w-8 h-8" />
                  ) : (
                    <Coffee className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {todayState === "IN"
                      ? "You're checked in!"
                      : todayState === "BREAK"
                        ? "On a break"
                        : (todayQuery.data?.offset && todayQuery.data.offset > 0 
                            ? (todayQuery.data.offset < 32341 ? "Early Checkout" : "Checked Out") 
                            : `${greeting}!`)}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">
                    {todayState === "IN" && checkInTimeDisplay
                      ? `Clocked in at ${checkInTimeDisplay}`
                      : todayState === "BREAK"
                        ? "Break in progress..."
                        : (todayQuery.data?.offset && todayQuery.data.offset > 0 
                            ? (todayQuery.data.offset < 32341 ? "Shift ended early today" : "Shift completed today") 
                            : "Ready to start your day?")}
                  </p>
                </div>
              </div>

              <button
                onClick={handlePunch}
                disabled={punchMutation.isPending || todayQuery.isLoading}
                className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${isPunchedIn
                    ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
              >
                {punchMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : todayState === "BREAK" ? (
                  <><Coffee className="w-4 h-4" /> End break</>
                ) : isPunchedIn ? (
                  <><LogOut className="w-4 h-4" /> Clock Out</>
                ) : (
                  <><LogIn className="w-4 h-4" /> Clock In</>
                )}
              </button>
            </div>

            {/* Error banner */}
            {(punchMutation.isError || todayQuery.isError) && (
              <div className="px-6 pb-4 flex items-center gap-2 text-rose-600 text-xs font-semibold">
                <AlertCircle className="w-4 h-4" />
                {punchMutation.isError
                  ? "Failed to record punch. Please try again."
                  : "Could not load today's status from server."}
              </div>
            )}
          </div>

          {/* Pending Tasks / Compliance */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col" style={{ minHeight: "220px" }}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Pending Tasks</h3>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">0</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h4 className="text-base font-bold text-slate-900">You're all caught up!</h4>
              <p className="text-xs text-slate-500 max-w-[250px] mt-2">
                No pending compliance signatures or approvals required today.
              </p>
            </div>
          </div>
        </div>

        {/* ── Right Column ─────────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Announcement */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Bell className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30">
                  Announcement
                </span>
              </div>
              <h3 className="text-lg font-bold leading-tight mb-2">Annual Townhall Meeting</h3>
              <p className="text-xs text-indigo-100/80 mb-6 line-clamp-2">
                Join us this Friday at 3:00 PM IST for our annual townhall. The CEO will discuss our Q4 roadmap and Phase 2 milestones.
              </p>
              <button className="text-xs font-bold text-white flex items-center gap-1 hover:text-indigo-200 transition-colors">
                Read full memo <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: "Apply for Leave", href: "/leaves/apply" },
                { label: "View Timesheet", href: "/attendance/history" },
                { label: "Company Policies", href: "/compliance" },
                { label: "Knowledge Base", href: "/knowledge" },
                { label: "Org Chart", href: "/org-chart" },
                ...(userRole !== "EMPLOYEE" ? [{ label: "Employees", href: "/employees" }] : []),
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-between group"
                >
                  {label}
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
