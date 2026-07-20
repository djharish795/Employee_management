"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, LogOut, Loader2 } from "lucide-react";
import { fetchTodayStatus, submitPunch } from "@/lib/api/attendance";
import EarlyCheckoutModal from "@/components/shared/early-checkout-modal";

export function CheckInButton() {
  const queryClient = useQueryClient();

  const todayQuery = useQuery({
    queryKey: ["attendanceStatus"],
    queryFn: fetchTodayStatus,
    refetchInterval: 60_000,
    retry: 1,
  });

  const todayState = todayQuery.data?.state ?? "OUT";
  const isPunchedIn = todayState === "IN" || todayState === "BREAK";

  const punchMutation = useMutation({
    mutationFn: (action: "IN" | "OUT") => submitPunch(action),
    onSuccess: (newData) => {
      queryClient.setQueryData(["attendanceStatus"], newData);
      queryClient.invalidateQueries({ queryKey: ["attendanceKpis"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceLogs"] });
    },
  });

  const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);

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
      <button
        onClick={handlePunch}
        disabled={punchMutation.isPending || todayQuery.isLoading}
        className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${isPunchedIn
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
    </>
  );
}
