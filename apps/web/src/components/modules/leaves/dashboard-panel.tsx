"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plane, Calendar, FileText, CheckCircle2, Clock, AlertTriangle, ArrowRight, BookOpen, UserPlus } from "lucide-react";
import Link from "next/link";
import { LeaveRequest, LeaveBalance, Holiday } from "@/types/leaves";

interface DashboardPanelProps {
  activeRole: "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
}

const INITIAL_REQUESTS: LeaveRequest[] = [
  { id: "L-101", type: "CASUAL_LEAVE", startDate: "20 Jun 2026", endDate: "21 Jun 2026", days: 2, reason: "Attending family function", status: "APPROVED", submittedDate: "15 Jun 2026", employeeName: "Arjun Mehta", department: "Engineering", emergencyContact: "+91 9988776655" },
  { id: "L-102", type: "SICK_LEAVE", startDate: "18 Jun 2026", endDate: "18 Jun 2026", days: 1, reason: "Severe migraine", status: "PENDING", submittedDate: "17 Jun 2026", employeeName: "Linda Chen", department: "Product Design", emergencyContact: "+91 8877665544" },
  { id: "L-103", type: "EARNED_LEAVE", startDate: "05 Jul 2026", endDate: "10 Jul 2026", days: 6, reason: "Annual family summer vacation", status: "PENDING", submittedDate: "16 Jun 2026", employeeName: "Marcus Thorne", department: "Legal & Compliance", emergencyContact: "+91 7766554433" },
];

const INITIAL_BALANCES: LeaveBalance[] = [
  { type: "Casual Leave", allocated: 12, used: 4, available: 8, pendingApproval: 0 },
  { type: "Sick Leave", allocated: 10, used: 2, available: 8, pendingApproval: 1 },
  { type: "Earned Leave", allocated: 20, used: 5, available: 15, pendingApproval: 6 },
];

const UPCOMING_HOLIDAYS: Holiday[] = [
  { date: "25 Dec 2026", name: "Christmas Day", type: "PUBLIC" },
  { date: "01 Jan 2027", name: "New Year's Day", type: "PUBLIC" },
  { date: "26 Jan 2027", name: "Republic Day", type: "PUBLIC" },
];

const CACHE_KEY = "naprocs_leave_requests";

export default function DashboardPanel({ activeRole }: DashboardPanelProps) {
  // Fetch leave requests list via React Query
  const fetchLeaveRequests = async (): Promise<LeaveRequest[]> => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(CACHE_KEY);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(CACHE_KEY, JSON.stringify(INITIAL_REQUESTS));
    }
    return INITIAL_REQUESTS;
  };

  const { data: requests = [] } = useQuery<LeaveRequest[]>({
    queryKey: ["leaveRequests"],
    queryFn: fetchLeaveRequests,
  });

  // Calculate dynamic KPIs based on role
  const kpis = useMemo(() => {
    const isEmployee = activeRole === "EMPLOYEE";
    const available = INITIAL_BALANCES.reduce((acc, curr) => acc + curr.available, 0);
    const used = INITIAL_BALANCES.reduce((acc, curr) => acc + curr.used, 0);
    const pending = requests.filter((r) => r.status === "PENDING").length;

    return {
      available: `${available} Days`,
      used: `${used} Days`,
      pending: `${pending} Requests`,
      conflicts: isEmployee ? "0 Conflicts" : "2 Team Conflicts",
      holidays: "3 Holidays MTD",
    };
  }, [requests, activeRole]);

  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Balance</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{kpis.available}</div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1">Ready for time-off</div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Used Leave</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{kpis.used}</div>
          <div className="text-[10px] font-semibold text-slate-500 mt-1">Since Jan 1st</div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Requests</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{kpis.pending}</div>
          <div className="text-[10px] font-semibold text-amber-500 mt-1">Awaiting approval</div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upcoming Holidays</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{kpis.holidays}</div>
          <div className="text-[10px] font-semibold text-blue-600 mt-1">Company-wide calendar</div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Team Leave Conflicts</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{kpis.conflicts}</div>
          <div className="text-[10px] font-semibold text-rose-500 mt-1">Overlapping requests</div>
        </div>
      </div>

      {/* Main Column Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (Leave History & Trend Chart) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* History / Recent List */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/20">
              <h3 className="text-sm font-bold text-slate-900">Recent Leave Applications</h3>
              <Link href="/leaves/apply" className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer">
                <UserPlus className="w-3.5 h-3.5" /> Apply for Leave
              </Link>
            </div>
            
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
                {requests.slice(0, 5).map((req) => {
                  let badge = "text-slate-600 bg-slate-100";
                  if (req.status === "APPROVED") badge = "text-emerald-700 bg-emerald-50 border border-emerald-100";
                  else if (req.status === "PENDING") badge = "text-amber-700 bg-amber-50 border border-amber-100";
                  else if (req.status === "REJECTED") badge = "text-rose-700 bg-rose-50 border border-rose-100";

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">{req.employeeName}</td>
                      <td className="px-5 py-3.5 uppercase text-[9px] tracking-wide text-slate-500 font-bold">{req.type.replace("_", " ")}</td>
                      <td className="px-5 py-3.5">{req.startDate} to {req.endDate}</td>
                      <td className="px-5 py-3.5 text-center font-bold text-slate-900">{req.days}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${badge}`}>{req.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Leave Trends Chart */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Monthly Time-Off Trends
            </h3>
            
            {/* SVG/HTML visual bar representation */}
            <div className="h-44 flex items-end justify-between gap-4 pt-6 px-4">
              {[
                { label: "Jan", days: 6, percent: 30 },
                { label: "Feb", days: 12, percent: 60 },
                { label: "Mar", days: 4, percent: 20 },
                { label: "Apr", days: 8, percent: 40 },
                { label: "May", days: 15, percent: 75 },
                { label: "Jun", days: 20, percent: 100 },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded absolute -translate-y-12 z-20 shadow">
                    {item.days} Days
                  </div>
                  <div className="w-full bg-slate-100 h-28 rounded-md flex items-end">
                    <div className="w-full bg-indigo-500 rounded-md transition-all duration-500" style={{ height: `${item.percent}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Upcoming Holidays & Shortcuts) */}
        <div className="space-y-6">
          
          {/* Quick Shortcuts */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Time-Off Operations</h3>
            <div className="flex flex-col gap-2.5">
              <Link href="/leaves/apply" className="flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-all shadow-sm">
                Apply for Leave
              </Link>
              <Link href="/leaves/policies" className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all shadow-sm">
                <BookOpen className="w-3.5 h-3.5" /> View Policies
              </Link>
            </div>
          </div>

          {/* Holidays list */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Upcoming Holidays
            </h3>
            <div className="space-y-3 pt-2">
              {UPCOMING_HOLIDAYS.map((h, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{h.name}</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{h.type}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 bg-white border border-slate-100 px-2 py-1 rounded">
                    {h.date.split(" ")[0]} {h.date.split(" ")[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
