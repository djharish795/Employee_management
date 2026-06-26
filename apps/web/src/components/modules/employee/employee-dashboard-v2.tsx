"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock, Calendar, LogIn, LogOut, CheckCircle2,
  ChevronRight, CalendarDays, Bell, Coffee, Loader2, AlertCircle,
  MonitorSmartphone, Target, Lock, Check, FileText, ShieldAlert,
  ChevronLeft
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import {
  fetchTodayStatus,
  fetchMyKpis,
  submitPunch,
} from "@/lib/api/attendance";

export default function EmployeeDashboardV2() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

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
    return new Date(todayQuery.data.startTime * 1000).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  })();

  const leaveBalance = kpisQuery.data?.leaveDays ?? 11;
  const assetsAssigned = 3;

  // Header Data
  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? "Good morning" :
    greetingHour < 17 ? "Good afternoon" :
    "Good evening";

  // Assuming user data is available
  const userName = "Ravi"; 

  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const todayFormatted = new Date().toLocaleDateString('en-US', dateOptions);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{greeting}, {userName}</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{todayFormatted}</p>
        </div>
        
        <button
          onClick={handlePunch}
          disabled={punchMutation.isPending || todayQuery.isLoading}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
            isPunchedIn
              ? "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              : "bg-slate-900 text-white hover:bg-slate-800"
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Today's Status */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Today's Status</p>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isPunchedIn ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
              <span className={`text-base font-bold ${isPunchedIn ? 'text-emerald-600' : 'text-slate-600'}`}>
                {isPunchedIn ? 'Present' : 'Not checked in'}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1.5">
              {isPunchedIn && checkInTimeDisplay ? `Checked in ${checkInTimeDisplay}` : 'No punch recorded today'}
            </p>
          </div>
        </div>

        {/* Leave Balance */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Leave Balance</p>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-3xl font-black text-slate-900">{leaveBalance}</h3>
            <span className="text-xs font-medium text-slate-500">days available</span>
          </div>
        </div>

        {/* Assets Assigned */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assets Assigned</p>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-3xl font-black text-slate-900">{assetsAssigned}</h3>
            <span className="text-xs font-medium text-slate-500">active items</span>
          </div>
        </div>

        {/* Goals This Quarter */}
        <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Goals This Quarter</p>
            <Lock className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 italic">Available in Phase 2</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Calendar */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-900">Attendance this month</h3>
            <div className="flex items-center gap-3">
              <button className="text-slate-400 hover:text-slate-600"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-semibold text-slate-900">January 2025</span>
              <button className="text-slate-400 hover:text-slate-600"><ChevronRight className="w-4 h-4" /></button>
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
              {/* Padding for month start (assuming Wed is 1st) */}
              <div></div><div></div>
              {/* Example Days */}
              <div className="flex flex-col items-center gap-1">1<span className="w-1 h-1 rounded-full bg-emerald-500"></span></div>
              <div className="flex flex-col items-center gap-1">2<span className="w-1 h-1 rounded-full bg-emerald-500"></span></div>
              <div className="flex flex-col items-center gap-1">3<span className="w-1 h-1 rounded-full bg-emerald-500"></span></div>
              <div className="flex flex-col items-center gap-1 text-slate-400">4<span className="w-1 h-1 rounded-full bg-slate-300"></span></div>
              <div className="flex flex-col items-center gap-1 text-slate-400">5<span className="w-1 h-1 rounded-full bg-slate-300"></span></div>
              
              <div className="flex flex-col items-center gap-1">6<span className="w-1 h-1 rounded-full bg-emerald-500"></span></div>
              <div className="flex flex-col items-center gap-1">7<span className="w-1 h-1 rounded-full bg-emerald-500"></span></div>
              <div className="flex flex-col items-center gap-1">8<span className="w-1 h-1 rounded-full bg-amber-500"></span></div>
              <div className="flex flex-col items-center gap-1">9<span className="w-1 h-1 rounded-full bg-emerald-500"></span></div>
              <div className="flex flex-col items-center gap-1">10<span className="w-1.5 h-1.5 rounded-full border border-rose-500 bg-white"></span></div>
              <div className="flex flex-col items-center gap-1 text-slate-400">11<span className="w-1 h-1 rounded-full bg-slate-300"></span></div>
              <div className="flex flex-col items-center gap-1 text-slate-400">12<span className="w-1 h-1 rounded-full bg-slate-300"></span></div>

              <div className="flex flex-col items-center gap-1">13<span className="w-1 h-1 rounded-full bg-emerald-500"></span></div>
              <div className="flex flex-col items-center gap-1">14<span className="w-1 h-1 rounded-full bg-emerald-500"></span></div>
              <div className="flex flex-col items-center gap-1 border border-slate-400 rounded bg-slate-100 py-1">15<span className="w-1 h-1 rounded-full bg-emerald-500 mt-1"></span></div>
              <div className="flex flex-col items-center gap-1 text-slate-300">16</div>
              <div className="flex flex-col items-center gap-1 text-slate-300">17</div>
              <div className="flex flex-col items-center gap-1 text-slate-300">18</div>
              <div className="flex flex-col items-center gap-1 text-slate-300">19</div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 mt-8 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full text-[11px] font-bold text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Present 9
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full text-[11px] font-bold text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Late 1
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full text-[11px] font-bold text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full border border-rose-500"></span> Absent 1
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full text-[11px] font-bold text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Weekend 4
              </div>
            </div>
          </div>
        </div>

        {/* Pending For You */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Pending for you</h3>
          <div className="space-y-3">
            {/* Task 1 */}
            <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Sign asset agreement</p>
                  <p className="text-[11px] font-medium text-slate-500">Due tomorrow</p>
                </div>
              </div>
              <button className="px-3 py-1.5 border border-slate-300 rounded-md text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                Sign now
              </button>
            </div>
            
            {/* Task 2 */}
            <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Acknowledge policy update</p>
                  <p className="text-[11px] font-medium text-slate-500">Version 2.4.1</p>
                </div>
              </div>
              <button className="px-3 py-1.5 border border-slate-300 rounded-md text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                Review
              </button>
            </div>

            {/* Task 3 (Completed) */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Leave approved</p>
                  <p className="text-[11px] font-medium text-slate-500">2h ago • Manager: S. Verma</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Recent notifications</h3>
          <Link href="/notifications" className="text-xs font-bold text-blue-600 hover:text-blue-700">View all</Link>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Team lunch invitation for this Friday has been sent to your calendar.</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">1h ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Your leave request for 22 Jan 2025 has been <span className="text-emerald-600">Approved</span>.</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">2h ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
            <div>
              <p className="text-sm font-semibold text-slate-900">A New device (MacBook Pro M3) has been assigned to you. Please confirm delivery.</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Yesterday</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
