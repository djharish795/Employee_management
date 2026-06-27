"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Square, Coffee, ShieldAlert, CheckCircle2, Clock, Calendar, ArrowRight, UserCheck } from "lucide-react";
import Link from "next/link";
import { AttendanceLog, AttendanceKPIs } from "@/types/attendance";
import { fetchTodayStatus, fetchMyLogs, fetchMyKpis, submitPunch } from "@/lib/api/attendance";

interface DashboardPanelProps {
  activeRole: "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
}

export default function DashboardPanel({ activeRole }: DashboardPanelProps) {
  const queryClient = useQueryClient();

  // Fetch Attendance logs list via React Query
  const { data: logs = [] } = useQuery<AttendanceLog[]>({
    queryKey: ["attendanceLogs"],
    queryFn: fetchMyLogs,
  });

  // Fetch KPI Data
  const { data: kpis } = useQuery<AttendanceKPIs>({
    queryKey: ["attendanceKpis"],
    queryFn: fetchMyKpis,
  });

  // Fetch Today's Shift Status from Redis Backend
  const { data: statusData } = useQuery({
    queryKey: ["attendanceStatus"],
    queryFn: fetchTodayStatus,
    refetchInterval: 60000, // Optional: Poll every minute to ensure sync across devices
  });

  // Local clock state that ticks based on backend offset
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [breakSecondsElapsed, setBreakSecondsElapsed] = useState(0);

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
      alert("Error: Cannot connect to server or Access Denied. Check console for details.");
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
  const checkOutDisplay = todayLog?.checkOut ? new Date(todayLog.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--";

  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      {activeRole === "EMPLOYEE" ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">This Week</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{defaultKpis.thisWeekHours ?? "0.0"} hrs</div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">This Month</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{defaultKpis.thisMonthDays ?? 0} days</div>
          </div>
          <div className="bg-white border border-slate-200 border-l-[3px] border-l-orange-400 p-5 rounded-xl shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Late Arrivals</div>
            <div className="text-2xl font-bold text-orange-500 mt-1">{defaultKpis.lateArrivals ?? 0}</div>
          </div>
          <div className="bg-white border border-slate-200 border-l-[3px] border-l-blue-500 p-5 rounded-xl shadow-sm">
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
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg. Work Hours</div>
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
            <div className="relative mb-10 px-6">
              {/* Tracker lines */}
              <div className="absolute top-2 left-0 right-0 h-1 bg-slate-100 rounded-full -translate-y-1/2" />
              <div
                className="absolute top-2 left-0 h-1 bg-slate-900 rounded-full -translate-y-1/2 transition-all duration-500"
                style={{
                  width: punchState === "OUT" ? "0%" : punchState === "BREAK" ? "50%" : "100%",
                }}
              />

              <div className="relative flex justify-between">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-[3px] border-white shadow-sm z-10 transition-all ${punchState !== "OUT" ? "bg-slate-900 ring-4 ring-blue-50" : "bg-slate-200"}`} />
                  <span className="text-[11px] font-bold text-slate-900 mt-2">{checkInDisplay}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Check-In</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-[3px] border-white shadow-sm z-10 transition-all ${punchState === "BREAK" || (punchState === "OUT" && secondsElapsed > 0 && todayLog?.totalBreakSeconds) || (punchState === "IN" && todayLog?.totalBreakSeconds) ? "bg-amber-400 ring-4 ring-amber-50" : "bg-slate-200"}`} />
                  <span className="text-[11px] font-bold text-slate-900 mt-2">{breakDisplay}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{punchState === "BREAK" ? "Break Start" : "Break Taken"}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-[3px] border-white shadow-sm z-10 transition-all ${punchState === "OUT" && secondsElapsed > 0 ? "bg-emerald-500 ring-4 ring-emerald-50" : "bg-slate-200"}`} />
                  <span className="text-[11px] font-bold text-slate-900 mt-2">{checkOutDisplay}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Check-Out</span>
                </div>
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
                      onClick={() => punchMutation.mutate("OUT")}
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
              {[
                { day: "Mon", hours: 9.2, percent: 100 },
                { day: "Tue", hours: 8.7, percent: 94 },
                { day: "Wed", hours: 8.7, percent: 94 },
                { day: "Thu", hours: 9.0, percent: 97 },
                { day: "Fri", hours: 8.7, percent: 94 },
                { day: "Sat", hours: 0, percent: 0 },
                { day: "Sun", hours: 0, percent: 0 },
              ].map((item, idx) => (
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
                      style={{ height: `${item.percent}%` }}
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
                  <th className="px-5 py-2.5">Hours</th>
                  <th className="px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-600 divide-y divide-slate-100">
                {logs.slice(0, 4).map((log, idx) => {
                  let badge = "text-slate-600 bg-slate-100";
                  if (log.status === "PRESENT") badge = "text-emerald-700 bg-emerald-50 border border-emerald-100";
                  else if (log.status === "LATE") badge = "text-amber-700 bg-amber-50 border border-amber-100";
                  else if (log.status === "EARLY_CHECKOUT") badge = "text-rose-700 bg-rose-50 border border-rose-100";
                  else if (log.status === "WFH") badge = "text-slate-900 bg-slate-100 border border-slate-200";

                  const formattedDate = new Date(log.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                  const formattedCheckIn = log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—";
                  const formattedCheckOut = log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—";
                  const formattedHours = typeof log.hoursWorked === 'number' ? `${log.hoursWorked.toFixed(1)}h` : log.hoursWorked;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 font-bold text-slate-900">{formattedDate}</td>
                      <td className="px-5 py-3 font-mono">{formattedCheckIn}</td>
                      <td className="px-5 py-3 font-mono">{formattedCheckOut}</td>
                      <td className="px-5 py-3 font-bold">{formattedHours}</td>
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
              <Link
                href="/attendance/regularization"
                className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                Request Regularization
              </Link>
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
              <h3 className="text-sm font-bold text-slate-900">June 2026</h3>
              <div className="text-[10px] font-bold text-slate-400">Monthly Calendar</div>
            </div>
            {/* Days initials */}
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-slate-400 mb-2">
              <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
            </div>
            {/* Simplified calendar cells */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-700">
              {/* Empty offset items for June 2026 starting on Monday */}
              {Array.from({ length: 14 }).map((_, idx) => {
                const day = idx + 1;
                // Add color dots based on logs matching day
                let dot = null;
                if (day === 15) dot = <div className="w-1 h-1 bg-emerald-500 rounded-full mx-auto mt-0.5" />;
                else if (day === 14) dot = <div className="w-1 h-1 bg-amber-500 rounded-full mx-auto mt-0.5" />;
                else if (day === 13) dot = <div className="w-1 h-1 bg-slate-700 rounded-full mx-auto mt-0.5" />;
                else if (day < 13) dot = <div className="w-1 h-1 bg-emerald-500 rounded-full mx-auto mt-0.5" />;

                return (
                  <div
                    key={day}
                    className={`p-1.5 rounded relative hover:bg-slate-50 cursor-pointer ${day === 15 ? "bg-slate-900 text-white hover:bg-slate-900" : ""
                      }`}
                  >
                    {day}
                    {day !== 15 && dot}
                  </div>
                );
              })}
              {/* Fill remaining empty calendar grid slots */}
              {Array.from({ length: 16 }).map((_, idx) => (
                <div key={idx} className="p-1.5 opacity-30 text-slate-400">
                  {idx + 15}
                </div>
              ))}
            </div>
          </div>

          {/* Pending Approvals Widget - Hidden for Regular Employee */}
          {activeRole !== "EMPLOYEE" && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-900">Team Approvals</h3>
                <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-bold rounded">2 Pending</span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mb-4">Awaiting manager authorizations</p>

              <div className="space-y-3">
                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col gap-2.5">
                  <div className="flex gap-2.5 items-start">
                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Linda" alt="Linda" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Linda Chen</div>
                      <div className="text-[10px] font-semibold text-slate-400 mt-0.5">14 Jun • Missing Out Punch</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold rounded-md transition-colors">
                      Reject
                    </button>
                    <button className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-md transition-colors">
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
