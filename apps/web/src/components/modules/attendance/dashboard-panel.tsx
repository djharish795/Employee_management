"use client";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuthStore } from "@/store/auth";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Square, Coffee, ShieldAlert, CheckCircle2, Clock, Calendar, ArrowRight, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { AttendanceLog, AttendanceKPIs, RegularizationRequest } from "@/types/attendance";
import { fetchTodayStatus, fetchMyLogs, fetchMyKpis, submitPunch, fetchRegularizations, actionRegularization } from "@/lib/api/attendance";
import Image from "next/image";

interface DashboardPanelProps {
  activeRole: "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
}

const formatDecimalHoursToHMS = (hoursDecimal: number): string => {
  if (!hoursDecimal || hoursDecimal === 0) return "0s";
  const totalSeconds = Math.round(hoursDecimal * 3600);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  const parts = [];
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  return parts.join(" ");
};

export default function DashboardPanel() {
  const { role } = usePermissions();
  const activeRole = role as any;
  const employeeId = useAuthStore((state) => state.employeeId);
  const queryClient = useQueryClient();

  // Fetch Attendance logs list via React Query
  const { data: logs = [] } = useQuery<AttendanceLog[]>({
    queryKey: ["attendanceLogs"],
    queryFn: () => fetchMyLogs(),
  });

  // Fetch KPI Data
  const { data: kpis } = useQuery<AttendanceKPIs>({
    queryKey: ["attendanceKpis"],
    queryFn: fetchMyKpis,
  });

  // Fetch Regularization Requests for Team Approvals
  const { data: regularizations = [], refetch: refetchRegs } = useQuery({
    queryKey: ["attendanceRegularizations"],
    queryFn: fetchRegularizations,
  });

  const isManagerRole = ["MANAGER", "CTO", "CEO", "CHRO", "SUPER_ADMIN", "ADMIN"].includes(activeRole);
  const isHrRole = ["HR", "CHRO", "ADMIN", "SUPER_ADMIN"].includes(activeRole);

  const pendingRequests = regularizations.filter(req => 
    req.employeeId !== employeeId && (
      (isManagerRole && req.managerStatus === "PENDING") ||
      (isHrRole && req.hrStatus === "PENDING")
    )
  );

  const actionMutation = useMutation({
    mutationFn: (args: { id: string, action: "APPROVE" | "REJECT", approver: "MANAGER" | "HR" }) =>
      actionRegularization(args.id, args.action, args.approver),
    onSuccess: () => {
      refetchRegs();
    },
  });

  // Fetch Today's Shift Status from Redis Backend
  const { data: statusData } = useQuery({
    queryKey: ["attendanceStatus"],
    queryFn: fetchTodayStatus,
    refetchInterval: 15000, // SYNC STRATEGY: polling every 15s to ensure sync across devices
  });

  // Local clock state that ticks based on backend offset
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [breakSecondsElapsed, setBreakSecondsElapsed] = useState(0);

  // Mini Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Sync internal clock when backend status changes
  useEffect(() => {
    if (statusData) {
      if (statusData.state !== "OUT" && statusData.state !== "BREAK") {
        const now = Date.now();
        const elapsed = Math.round((now - statusData.startTime) / 1000) + statusData.offset;
        setSecondsElapsed(elapsed > 0 ? elapsed : 0);
      } else {
        setSecondsElapsed(statusData.offset);
      }

      if (statusData.state === "BREAK") {
        const now = Date.now();
        const elapsed = Math.round((now - statusData.startTime) / 1000);
        setBreakSecondsElapsed(elapsed > 0 ? elapsed : 0);
      } else {
        setBreakSecondsElapsed(0);
      }
    }
  }, [statusData]);

  // Live timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (statusData?.state === "IN") {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else if (statusData?.state === "BREAK") {
      interval = setInterval(() => {
        setBreakSecondsElapsed((prev) => prev + 1);
        setSecondsElapsed((prev) => prev + 1); // Also tick effective hours during break
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [statusData?.state]);

  // Formatting seconds to standard HH:MM:SS
  const formatTimerValue = (sec: number) => {
    const hrs = Math.floor(sec / 3600).toString().padStart(2, "0");
    const mins = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
    const secs = (sec % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // Punch actions mutations
  const punchMutation = useMutation({
    mutationFn: async (action: "IN" | "BREAK" | "OUT") => {
      return await submitPunch(action);
    },
    onSuccess: (newData) => {
      // Instantly update local state with backend response for zero-latency refresh
      queryClient.setQueryData(["attendanceStatus"], newData);

      // Refresh logs and kpis in the background
      queryClient.invalidateQueries({ queryKey: ["attendanceLogs"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceKpis"] });
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || error.message || "Unknown error";
      alert(`Check In Failed: ${errMsg}`);
      console.error("Punch Mutation Failed:", error);
    }
  });

  const punchState = statusData?.state || "OUT";
  const defaultKpis = kpis || {
    presentToday: 0,
    attendanceRate: 0,
    avgHoursWorked: "0.0h",
    lateArrivals: 0,
    leaveDays: 0,
    wfhDays: 0,
    thisWeekHours: 0,
    weeklyTargetHours: 45,
    thisMonthDays: 0,
    weeklyTrends: []
  };

  const todayDateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const todayLog = logs.find((log) => new Date(log.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) === todayDateStr);

  const checkInDisplay = todayLog?.checkIn ? new Date(todayLog.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--";
  const breakDisplay = punchState === "BREAK" && statusData
    ? new Date(statusData.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : (todayLog?.totalBreakSeconds && todayLog.totalBreakSeconds > 0)
      ? `${Math.ceil(todayLog.totalBreakSeconds / 60)} mins`
      : "--:--";
  let expectedCheckOutStr = "--:--";
  if (!todayLog?.checkOut && todayLog?.checkIn) {
    const shiftMs = 9 * 60 * 60 * 1000;
    const checkInMs = new Date(todayLog.checkIn).getTime();
    const expectedOutMs = checkInMs + shiftMs;
    expectedCheckOutStr = new Date(expectedOutMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const checkOutDisplay = todayLog?.checkOut ? new Date(todayLog.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : expectedCheckOutStr;

  // ── Dynamic Timeline Logic ──────────────────────────────────────────────
  const timelineEvents = useMemo(() => {
    const events = [];
    const shiftMs = 9 * 60 * 60 * 1000; // 9 hours

    if (todayLog?.checkIn) {
      const checkInTime = new Date(todayLog.checkIn).getTime();
      events.push({
        type: "CHECK_IN",
        timestamp: checkInTime,
        label: "Check-In",
        displayTime: new Date(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        position: 0,
      });

      if (todayLog?.breakHistory && Array.isArray(todayLog.breakHistory)) {
        todayLog.breakHistory.forEach((b: any, index: number) => {
          if (b.start) {
            const bStart = new Date(b.start).getTime();
            const bEnd = b.end ? new Date(b.end).getTime() : Date.now();
            const durationMs = bEnd - bStart;
            const durationMins = Math.max(1, Math.round(durationMs / 60000));

            let durationStr = `${durationMins} min`;
            if (durationMins >= 60) {
              const hrs = Math.floor(durationMins / 60);
              const mins = durationMins % 60;
              durationStr = mins > 0 ? `${hrs}hr ${mins}m` : `${hrs}hr`;
            }

            events.push({
              type: "BREAK_MARKER",
              timestamp: bStart,
              label: `${durationStr} Break`,
              displayTime: new Date(bStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              position: Math.min(99, Math.max(1, ((bStart - checkInTime) / shiftMs) * 100)),
            });
          }
        });
      }

      if (todayLog?.checkOut) {
        const checkOutTime = new Date(todayLog.checkOut).getTime();
        events.push({
          type: "CHECK_OUT",
          timestamp: checkOutTime,
          label: "Check-Out",
          displayTime: new Date(checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          position: 100, // Force to end of timeline
        });
      } else {
        const expectedOut = checkInTime + shiftMs;
        events.push({
          type: "CHECK_OUT",
          timestamp: expectedOut,
          label: "Check-Out",
          displayTime: new Date(expectedOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          position: 100, // Force to end of timeline
        });
      }
    }

    // Check-in at 0, Check-out at 100. Sort inner markers by timestamp.
    return events.sort((a, b) => {
      if (a.type === "CHECK_IN") return -1;
      if (b.type === "CHECK_IN") return 1;
      if (a.type === "CHECK_OUT") return 1;
      if (b.type === "CHECK_OUT") return -1;
      return a.timestamp - b.timestamp;
    });
  }, [todayLog, statusData, punchState]);

  const timelineProgress = useMemo(() => {
    if (!todayLog?.checkIn) return 0;
    const checkInTime = new Date(todayLog.checkIn).getTime();
    const shiftMs = 9 * 60 * 60 * 1000;

    if (todayLog?.checkOut) {
      const checkOutTime = new Date(todayLog.checkOut).getTime();
      return Math.min(100, Math.max(0, ((checkOutTime - checkInTime) / shiftMs) * 100));
    }

    const now = Date.now();
    return Math.min(100, Math.max(0, ((now - checkInTime) / shiftMs) * 100));
  }, [todayLog, secondsElapsed]);

  const timelineSegments = useMemo(() => {
    const segments: Array<{ type: string; start: number; end: number }> = [];
    if (!todayLog?.checkIn) return segments;
    const checkInTime = new Date(todayLog.checkIn).getTime();
    const shiftMs = 9 * 60 * 60 * 1000;

    let lastTime = checkInTime;

    if (todayLog?.breakHistory && Array.isArray(todayLog.breakHistory)) {
      todayLog.breakHistory.forEach((b: any) => {
        if (b.start) {
          const bStart = new Date(b.start).getTime();
          // Work segment before break
          segments.push({
            type: "WORK",
            start: Math.min(100, Math.max(0, ((lastTime - checkInTime) / shiftMs) * 100)),
            end: Math.min(100, Math.max(0, ((bStart - checkInTime) / shiftMs) * 100))
          });

          // Break segment
          const bEnd = b.end ? new Date(b.end).getTime() : Date.now();
          segments.push({
            type: "BREAK",
            start: Math.min(100, Math.max(0, ((bStart - checkInTime) / shiftMs) * 100)),
            end: Math.min(100, Math.max(0, ((bEnd - checkInTime) / shiftMs) * 100))
          });
          lastTime = bEnd;
        }
      });
    }

    // Final work segment
    if (punchState === "OUT" && todayLog?.checkOut) {
      // If fully checked out, stretch the final segment to the end
      segments.push({
        type: "WORK",
        start: Math.min(100, Math.max(0, ((lastTime - checkInTime) / shiftMs) * 100)),
        end: 100
      });
    } else {
      const finalEndTime = todayLog?.checkOut ? new Date(todayLog.checkOut).getTime() : Date.now();
      segments.push({
        type: "WORK",
        start: Math.min(100, Math.max(0, ((lastTime - checkInTime) / shiftMs) * 100)),
        end: Math.min(100, Math.max(0, ((finalEndTime - checkInTime) / shiftMs) * 100))
      });
    }

    return segments;
  }, [todayLog, punchState, secondsElapsed]);

  // Dynamic Weekly Trend Data
  const weeklyData = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    // Offset to get Monday
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((dayName, idx) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + idx);
      const dateStr = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

      const dayLog = logs.find((l: any) => new Date(l.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) === dateStr);

      let hours = 0;
      if (dayLog && typeof dayLog.hoursWorked === 'number') {
        hours = dayLog.hoursWorked;
      }

      const isToday = new Date().toDateString() === date.toDateString();
      if (isToday && secondsElapsed > 0 && !dayLog?.checkOut) {
        hours = secondsElapsed / 3600;
      }

      hours = Number(hours.toFixed(1));
      const percent = Math.min(100, Math.round((hours / 9) * 100));

      return { day: dayName, hours, percent };
    });
  }, [logs, secondsElapsed]);

  return (
    <div className="space-y-6">
      {/* Checkout Confirmation Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className={`h-2 ${secondsElapsed >= 32400 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <div className="p-6">
              <div className="flex items-start gap-4 mb-2">
                <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${secondsElapsed >= 32400 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  {secondsElapsed >= 32400 ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {secondsElapsed >= 32400 ? "9 Hours Completed!" : "Checking Out Early?"}
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 mt-1.5 leading-relaxed">
                    {secondsElapsed >= 32400 
                      ? "You have successfully met your 9-hour daily requirement. Great job today! Are you ready to log off?" 
                      : `You have only logged ${formatTimerValue(secondsElapsed)}. Checking out now means you will need to make up this time later to hit your 45-hour weekly goal.`}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-8">
                <button 
                  onClick={() => setShowCheckoutModal(false)}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowCheckoutModal(false);
                    punchMutation.mutate("OUT");
                  }}
                  disabled={punchMutation.isPending}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white transition-colors flex items-center gap-2 ${
                    secondsElapsed >= 32400 
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 shadow-lg" 
                      : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 shadow-lg"
                  }`}
                >
                  <Square className="w-3.5 h-3.5" /> {secondsElapsed >= 32400 ? "Confirm Check Out" : "Check Out Anyway"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs Grid */}
      {activeRole === "EMPLOYEE" ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">This Week</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{defaultKpis.thisWeekHours ?? "0.0"}h / {defaultKpis.weeklyTargetHours ?? 45}h</div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">This Month</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{defaultKpis.thisMonthDays ?? 0} days</div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Late Arrivals</div>
            <div className="text-2xl font-bold text-orange-500 mt-1">{defaultKpis.lateArrivals ?? 0}</div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WFH Days</div>
            <div className="text-2xl font-bold text-blue-500 mt-1">{defaultKpis.wfhDays ?? 0}</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Present Today</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{defaultKpis.presentToday}</div>
            <div className="text-[10px] font-semibold text-emerald-600 mt-1">+2% from yesterday</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{defaultKpis.attendanceRate}%</div>
            <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-slate-900 rounded-full" style={{ width: `${defaultKpis.attendanceRate}%` }} />
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg. Hours/Day Worked</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{defaultKpis.avgHoursWorked}</div>
            <div className="text-[10px] font-semibold text-slate-500 mt-1">Target: 9.0h / Day</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Late Arrivals</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{defaultKpis.lateArrivals} Days</div>
            <div className="text-[10px] font-semibold text-amber-600 mt-1">Check logs to regularize</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leaves Taken</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{defaultKpis.leaveDays} Days</div>
            <div className="text-[10px] font-semibold text-slate-500 mt-1">Approved logs</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WFH Sessions</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{defaultKpis.wfhDays} Days</div>
            <div className="text-[10px] font-semibold text-slate-900 mt-1">Remote connection logs</div>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* Left Column (Timeline, Punch actions, Trend charts) */}
        <div className="xl:col-span-2 space-y-6">

          {/* Timeline Punch Actions Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-900">Your Timeline — Today</h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {punchState === "OUT" ? "Checked Out" : punchState === "BREAK" ? "On Break" : "Currently Checked In"}
              </div>
            </div>

            {/* Horizontal Timeline Tracker */}
            <div className="relative mb-16 px-6 mt-16">
              {/* Tracker lines */}
              <div className="absolute top-2 left-0 right-0 h-1 bg-slate-100 rounded-full -translate-y-1/2" />

              {/* Progress Segments */}
              {timelineSegments.map((seg, i) => (
                <div
                  key={`seg-${i}`}
                  className={`absolute top-2 h-1 rounded-full -translate-y-1/2 transition-all duration-1000 ease-linear ${seg.type === "WORK" ? "bg-slate-900" : "bg-amber-400"
                    }`}
                  style={{
                    left: `${seg.start}%`,
                    width: `${seg.end - seg.start}%`,
                  }}
                />
              ))}

              {/* Render Events */}
              <div className="relative w-full h-4">
                {timelineEvents.map((ev, i, arr) => {
                  let bgColor = "bg-slate-900";
                  let ringColor = "ring-blue-50";
                  if (ev.type.includes("BREAK")) {
                    bgColor = "bg-amber-400";
                    ringColor = "ring-amber-50";
                  } else if (ev.type === "CHECK_OUT") {
                    bgColor = "bg-emerald-500";
                    ringColor = "ring-emerald-50";
                  }

                  const isBreak = ev.type.includes("BREAK");

                  // Calculate break index for 4-level alternating positions
                  let breakIndex = 0;
                  if (isBreak) {
                    breakIndex = arr.slice(0, i).filter(e => e.type.includes("BREAK")).length;
                  }

                  // CheckIn/CheckOut always below (top-6). Breaks stagger across 4 levels.
                  const positions = ["bottom-6", "top-6", "bottom-14", "top-14"];
                  const labelPosition = isBreak ? positions[breakIndex % 4] : "top-6";

                  return (
                    <div
                      key={i}
                      className="absolute flex flex-col items-center group -translate-x-1/2"
                      style={{ left: `${ev.position}%`, top: "-4px" }}
                    >
                      <div className={`w-4 h-4 rounded-full border-[3px] border-white shadow-sm z-10 transition-all ${bgColor} ring-4 ${ringColor}`} />

                      {/* Hover Tooltip */}
                      <div className="absolute top-6 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 border border-slate-700 shadow-lg rounded p-2 z-20 w-max pointer-events-none">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{ev.label}</span>
                        <span className="text-[11px] font-bold text-white">{ev.displayTime}</span>
                      </div>

                      {/* Default visible label */}
                      <div className={`absolute flex flex-col items-center ${labelPosition}`}>
                        <span className="text-[11px] font-bold text-slate-900 whitespace-nowrap">{ev.displayTime}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 whitespace-nowrap">{ev.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Punch Action row */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 border border-slate-100 rounded-lg p-4 gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Effective Hours</div>
                  <div className="text-xl font-bold text-slate-900 font-mono tracking-tight mt-0.5">
                    {formatTimerValue(secondsElapsed)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</div>
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded mt-1.5 inline-block ${punchState === "IN" ? "bg-emerald-100 text-emerald-700" : punchState === "BREAK" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"
                    }`}>
                    {punchState === "IN" ? "On Track" : punchState === "BREAK" ? "Break Session" : "Punch Required"}
                  </span>
                </div>
                {punchState === "BREAK" && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Break Timer</div>
                    <div className="text-xl font-bold text-amber-600 font-mono tracking-tight mt-0.5">
                      {formatTimerValue(breakSecondsElapsed)}
                    </div>
                  </div>
                )}
              </div>

              {/* Punch trigger buttons */}
              <div className="flex gap-2 w-full sm:w-auto">
                {punchState === "OUT" ? (
                  <button
                    disabled={punchMutation.isPending}
                    onClick={() => punchMutation.mutate("IN")}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-3.5 h-3.5" /> {punchMutation.isPending ? "Processing..." : "Check In"}
                  </button>
                ) : (
                  <>
                    <button
                      disabled={punchMutation.isPending}
                      onClick={() => punchMutation.mutate(punchState === "BREAK" ? "IN" : "BREAK")}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg border transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${punchState === "BREAK" ? "bg-amber-500 text-white hover:bg-amber-600 border-amber-500" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      {punchMutation.isPending ? "Processing..." : punchState === "BREAK" ? "End Break" : "Take Break"}
                    </button>
                    <button
                      disabled={punchMutation.isPending}
                      onClick={() => setShowCheckoutModal(true)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Square className="w-3.5 h-3.5" /> {punchMutation.isPending ? "Processing..." : "Check Out"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Attendance Trend Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Weekly Working Hours Trends</h3>

            {/* Custom Bar Chart Visuals */}
            <div className="h-44 flex items-end justify-between gap-4 pt-4 px-2">
              {weeklyData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded absolute -translate-y-14 z-20 shadow">
                    {item.hours}h
                  </div>
                  {/* Column block */}
                  <div className="w-full bg-slate-100 rounded-t-lg h-28 flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${item.hours >= 9.0 ? "bg-slate-900" : item.hours > 0 ? "bg-amber-400" : "bg-transparent"
                        }`}
                      style={{ height: `${item.hours > 0 ? Math.max(2, item.percent) : 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Recent Records */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Recent Attendance Logs</h3>
              <Link href="/attendance/history" className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1">
                View Full Logs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-5 py-2.5">Date</th>
                  <th className="px-5 py-2.5">Check-In</th>
                  <th className="px-5 py-2.5">Check-Out</th>
                  <th className="px-5 py-2.5">Time</th>
                  <th className="px-5 py-2.5">Break</th>
                  <th className="px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-600 divide-y divide-slate-100">
                {logs.slice(0, 4).map((log, idx) => {
                  let badge = "text-slate-600 bg-slate-100 border border-slate-200";
                  if (log.status === "PRESENT") badge = "text-emerald-700 bg-emerald-50 border border-emerald-100";
                  else if (log.status === "LATE") badge = "text-amber-700 bg-amber-50 border border-amber-100";
                  else if (log.status === "EARLY_CHECKOUT") badge = "text-orange-500 bg-orange-50 border border-orange-100";
                  else if (log.status === "ABSENT") badge = "text-rose-700 bg-rose-50 border border-rose-100";
                  else if (log.status === "ON_LEAVE") badge = "text-purple-700 bg-purple-50 border border-purple-100";
                  else if (log.status === "WFH") badge = "text-slate-900 bg-slate-100 border border-slate-200";

                  const formattedDate = new Date(log.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                  const checkIns = log.punchHistory?.filter((p: any) => p.action === 'IN').map((p: any) => new Date(p.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) || [];
                  const checkOuts = log.punchHistory?.filter((p: any) => p.action === 'OUT').map((p: any) => new Date(p.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) || [];
                  
                  const formattedCheckIn = checkIns.length > 0 ? checkIns[0] : (log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—");
                  const formattedCheckOut = checkOuts.length > 0 ? checkOuts[checkOuts.length - 1] : (log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—");
                  const formattedHours = typeof log.hoursWorked === 'number' ? formatDecimalHoursToHMS(log.hoursWorked) : log.hoursWorked;

                  let formattedBreak = "—";
                  if (log.totalBreakSeconds && log.totalBreakSeconds > 0) {
                    const breakMins = Math.round(log.totalBreakSeconds / 60);
                    if (breakMins < 60) {
                      formattedBreak = `${breakMins}m`;
                    } else {
                      const hrs = Math.floor(breakMins / 60);
                      const mins = breakMins % 60;
                      formattedBreak = mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
                    }
                  }

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 font-bold text-slate-900">{formattedDate}</td>
                      <td className="px-5 py-3 font-mono">{formattedCheckIn}</td>
                      <td className="px-5 py-3 font-mono">{formattedCheckOut}</td>
                      <td className="px-5 py-3 font-bold">{formattedHours}</td>
                      <td className="px-5 py-3 font-bold text-amber-600">{formattedBreak}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${badge}`}>{log.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Column (Quick Actions, Mini Calendar, Pending Approvals) */}
        <div className="space-y-6">

          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Shortcuts</h3>
            <div className="flex flex-col gap-2.5">
              {activeRole !== "CTO" && (
                <Link
                  href="/attendance/regularization"
                  className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  Request Regularization
                </Link>
              )}
              <Link
                href="/leaves"
                className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                Apply for Leave
              </Link>
            </div>
          </div>

          {/* Mini Calendar Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Days initials */}
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-slate-400 mb-2">
              <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
            </div>
            {/* Simplified calendar cells */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-700">
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
                  cells.push(<div key={`empty-${i}`} className="p-1.5 opacity-30 text-slate-400"></div>);
                }

                // Actual days
                for (let day = 1; day <= daysInMonth; day++) {
                  const dateStr = new Date(year, month, day).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                  const dayLog = logs.find((l: any) => new Date(l.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) === dateStr);

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
                  const isWeekend = new Date(year, month, day).getDay() === 0 || new Date(year, month, day).getDay() === 6;
                  
                  if (isToday) {
                    bgClass = "bg-slate-900 text-white font-bold shadow-sm ring-2 ring-slate-200 ring-offset-1 hover:bg-slate-800";
                  } else if (isWeekend && !dayLog) {
                    bgClass = "bg-slate-100/70 text-slate-400 hover:bg-slate-200";
                  }

                  cells.push(
                    <div
                      key={`day-${day}`}
                      className="group relative flex items-center justify-center p-1 cursor-pointer"
                    >
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${bgClass}`}>
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
                  cells.push(<div key={`end-empty-${i}`} className="p-1.5 opacity-30 text-slate-400"></div>);
                }

                return cells;
              })()}
            </div>
          </div>

          {/* Pending Approvals Widget - Hidden for Regular Employee */}
          {activeRole !== "EMPLOYEE" && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-900">Team Approvals</h3>
                <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-bold rounded">{pendingRequests.length} Pending</span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mb-4">Awaiting manager authorizations</p>

              <div className="space-y-3">
                {pendingRequests.length === 0 ? (
                  <div className="text-center text-xs font-semibold text-slate-400 py-4">No pending approvals</div>
                ) : (
                  pendingRequests.slice(0, 3).map((req) => (
                    <div key={req.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col gap-2.5">
                      <div className="flex gap-2.5 items-start">
                        <div className="relative w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                          <Image src={`https://api.dicebear.com/7.x/notionists/svg?seed=${req.employeeName || req.id}`} alt="Avatar" className="w-full h-full object-cover" fill style={{ objectFit: "cover" }} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{req.employeeName || "Unknown"}</div>
                          <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{req.attendanceDate} • {req.correctionType.replace("_", " ")}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => actionMutation.mutate({ id: req.id, action: "REJECT", approver: isManagerRole ? "MANAGER" : "HR" })}
                          disabled={actionMutation.isPending}
                          className="flex-1 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold rounded-md transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => actionMutation.mutate({ id: req.id, action: "APPROVE", approver: isManagerRole ? "MANAGER" : "HR" })}
                          disabled={actionMutation.isPending}
                          className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-md transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
