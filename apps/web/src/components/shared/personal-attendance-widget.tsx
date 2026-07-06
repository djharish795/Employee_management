"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, LogOut, Loader2 } from "lucide-react";
import { fetchTodayStatus, submitPunch } from "@/lib/api/attendance";

export function PersonalAttendanceWidget() {
  const queryClient = useQueryClient();

  // ── Today's attendance state from backend ─────────────────────────────────
  const todayQuery = useQuery({
    queryKey: ["attendanceStatus"],
    queryFn: fetchTodayStatus,
    refetchInterval: 60_000, // refresh every minute
    retry: 1,
  });

  const todayState = todayQuery.data?.state ?? "OUT";
  const isPunchedIn = todayState === "IN" || todayState === "BREAK";

  // ── Punch mutation ────────────────────────────────────────────────────────
  const punchMutation = useMutation({
    mutationFn: (action: "IN" | "OUT") => submitPunch(action),
    onSuccess: (newData) => {
      // Instantly update local state with backend response
      queryClient.setQueryData(["attendanceStatus"], newData);

      // Refresh background data
      queryClient.invalidateQueries({ queryKey: ["attendanceKpis"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceLogs"] });
    },
  });

  const handlePunch = () => {
    if (punchMutation.isPending) return;
    const nextAction = isPunchedIn ? "OUT" : "IN";
    punchMutation.mutate(nextAction);
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

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm mb-6 sm:mb-8 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Today's Status</p>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isPunchedIn ? 'bg-emerald-500' : (todayQuery.data?.offset && todayQuery.data.offset > 0 ? (todayQuery.data.offset < 32400 ? 'bg-orange-500' : 'bg-emerald-500') : 'bg-slate-300 dark:bg-slate-600')}`}></span>
            <span className={`text-base font-bold ${isPunchedIn ? 'text-emerald-600 dark:text-emerald-400' : (todayQuery.data?.offset && todayQuery.data.offset > 0 ? (todayQuery.data.offset < 32400 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400') : 'text-slate-600 dark:text-slate-400')}`}>
              {isPunchedIn ? 'Present' : (todayQuery.data?.offset && todayQuery.data.offset > 0 ? (todayQuery.data.offset < 32400 ? 'Early Checkout' : 'Checked Out') : 'Not checked in')}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-500 mt-1">
            {isPunchedIn && checkInTimeDisplay
              ? `Checked in ${checkInTimeDisplay}`
              : (todayQuery.data?.offset && todayQuery.data.offset > 0
                ? (todayQuery.data.offset < 32400 ? 'Shift ended early today' : 'Shift completed today')
                : 'No punch recorded today')}
          </p>
        </div>
      </div>
      
      <button
        onClick={handlePunch}
        disabled={punchMutation.isPending || todayQuery.isLoading}
        className={`px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${isPunchedIn
            ? "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            : "bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700"
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
    </div>
  );
}
