"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTodayStatus, submitPunch } from "@/lib/api/attendance";
import { fetchMyLeaveKpi } from "@/lib/api/leaves";
import { assetsApi } from "@/lib/api/assets";
import { useAuthStore } from "@/store/auth";
import { Clock, LogOut, FileText, Activity, AlertCircle, TrendingUp, TrendingDown, Target, Loader2, Coffee, Lock } from "lucide-react";
import EarlyCheckoutModal from "@/components/shared/early-checkout-modal";

export function PersonalAttendanceWidget({ hideCheckIn = false }: { hideCheckIn?: boolean }) {
  const employeeId = useAuthStore(state => state.employeeId);
  const queryClient = useQueryClient();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

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
    mutationFn: (action: "IN" | "BREAK" | "OUT") => submitPunch(action),
    onSuccess: (newData) => {
      queryClient.setQueryData(["attendanceStatus"], newData);
    },
  });

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

  const getSecondsElapsed = () => {
    let secs = todayQuery.data?.offset || 0;
    if ((todayState === "IN" || todayState === "BREAK") && todayQuery.data?.startTime) {
      secs += Math.floor((Date.now() - new Date(todayQuery.data.startTime).getTime()) / 1000);
    }
    return secs;
  };

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

  const PHASE_2_ENABLED = process.env.NEXT_PUBLIC_PHASE_2_ENABLED === 'true';

  const leaveBalance = leaveKpiQuery.data?.availableLeaves ?? "--";
  const assetsAssigned = assetsQuery.data?.length ?? 0;

  return (
    <>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 sm:mb-8">
        {/* Today's Status */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between transition-colors">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Today's Status</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isPunchedIn ? 'bg-emerald-500' : (todayState === 'HOLIDAY' ? 'bg-purple-500' : (todayQuery.data?.offset && todayQuery.data.offset > 0 ? (todayQuery.data.offset < 32341 ? 'bg-orange-500' : 'bg-emerald-500') : 'bg-slate-300 dark:bg-slate-600'))}`}></span>
                <span className={`text-base font-bold ${isPunchedIn ? 'text-emerald-600 dark:text-emerald-400' : (todayState === 'HOLIDAY' ? 'text-purple-600 dark:text-purple-400' : (todayQuery.data?.offset && todayQuery.data.offset > 0 ? (todayQuery.data.offset < 32341 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400') : 'text-slate-600 dark:text-slate-400'))}`}>
                  {isPunchedIn ? (todayState === "BREAK" ? "On Break" : "Present") : (todayState === 'HOLIDAY' ? "Company Holiday" : (todayQuery.data?.offset && todayQuery.data.offset > 0 ? (todayQuery.data.offset < 32341 ? 'Early Checkout' : 'Checked Out') : 'Not checked in'))}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-500 mt-1">
                {isPunchedIn && checkInTimeDisplay
                  ? `Checked in ${checkInTimeDisplay}`
                  : (todayState === 'HOLIDAY' ? 'Enjoy your holiday! (Punch in optional)' : (todayQuery.data?.offset && todayQuery.data.offset > 0
                    ? (todayQuery.data.offset < 32341 ? 'Shift ended early today' : 'Shift completed today')
                    : 'No punch recorded today'))}
              </p>
            </div>
            {!hideCheckIn && (
              <button 
                onClick={handlePunch}
                disabled={punchMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50"
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
            )}
          </div>
        </div>

        {/* Leave Balance */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between transition-colors">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Leave Balance</p>
          <div className="flex items-baseline gap-1.5">
            {leaveKpiQuery.isLoading ? (
              <div className="h-9 w-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md mb-1"></div>
            ) : (
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{leaveBalance}</h3>
            )}
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">days available</span>
          </div>
        </div>

        {/* Assets Assigned */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between transition-colors">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Assets Assigned</p>
          <div className="flex items-baseline gap-1.5">
            {assetsQuery.isLoading ? (
              <div className="h-9 w-12 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md mb-1"></div>
            ) : (
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{assetsAssigned}</h3>
            )}
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">active items</span>
          </div>
        </div>

        {/* Goals This Quarter */}
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden transition-colors">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Goals This Quarter</p>
            {!PHASE_2_ENABLED && <Lock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />}
          </div>
          <div>
            {!PHASE_2_ENABLED ? (
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 italic">Available in Phase 2</p>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">0</h3>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">active goals</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
