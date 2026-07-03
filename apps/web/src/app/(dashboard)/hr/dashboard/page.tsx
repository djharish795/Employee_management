"use client";

import React, { useState, useEffect } from "react";
import { Download, MoreVertical, Check, X as CloseIcon, Lock } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Loader2 } from "lucide-react";
import { PersonalAttendanceWidget } from "@/components/shared/personal-attendance-widget";

export default function HrDashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const queryClient = useQueryClient();
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const { data, isLoading } = useQuery({
    queryKey: ['hr-overview'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/hr-overview');
      return res.data;
    }
  });

  const handleApprove = async (id: string) => {
    try {
      await apiClient.post(`/leaves/${id}/approve`, { approverId: 'hr-admin' }); // In a real app we'd pass current user ID
      queryClient.invalidateQueries({ queryKey: ['hr-overview'] });
    } catch (e) { console.error(e); }
  };

  const handleReject = async (id: string) => {
    try {
      await apiClient.post(`/leaves/${id}/reject`, { approverId: 'hr-admin', reason: 'Rejected by HR' });
      queryClient.invalidateQueries({ queryKey: ['hr-overview'] });
    } catch (e) { console.error(e); }
  };

  // TEMPORARY MOCK DATA TO TEST WFH CHART SECTION
  if (data && data.attendance) {
    data.attendance.wfh = 3;
    data.attendance.absent = data.attendance.total - data.attendance.present - 3;
  }

  const attendanceTotal = data?.attendance?.total || 1;
  const presentPct = data ? Math.round((data.attendance.present / attendanceTotal) * 100) || 0 : 0;
  const wfhPct = data ? Math.round((data.attendance.wfh / attendanceTotal) * 100) || 0 : 0;
  const absentPct = data ? Math.round((data.attendance.absent / attendanceTotal) * 100) || 0 : 0;

  const [animPresent, setAnimPresent] = useState(0);
  const [animWfh, setAnimWfh] = useState(0);
  const [animAbsent, setAnimAbsent] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!data) return;
    setIsResetting(true);
    setAnimPresent(0);
    setAnimWfh(0);
    setAnimAbsent(0);
    
    const timer = setTimeout(() => {
      setIsResetting(false);
      setAnimPresent(presentPct);
      setAnimWfh(wfhPct);
      setAnimAbsent(absentPct);
    }, 50);
    return () => clearTimeout(timer);
  }, [refreshKey, data, presentPct, wfhPct, absentPct]);

  if (isLoading || !data) {
    return (
      <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }



  return (
    <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">HR Overview</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Today is {dateString}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-semibold rounded-md shadow-sm transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <PersonalAttendanceWidget />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Total Headcount */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">TOTAL HEADCOUNT</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-slate-900">{data.headcount.total}</span>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-md">+{data.headcount.newJoins}</span>
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">PRESENT TODAY</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600">{data.attendance.present}</span>
            <span className="text-emerald-500 text-xs font-bold">{presentPct}% Rate</span>
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">ON LEAVE</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-500">{data.attendance.onLeave}</span>
            <span className="text-slate-400 text-xs font-semibold">Planned</span>
          </div>
        </div>

        {/* Open Positions */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">OPEN POSITIONS</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-slate-500">{data.recruitment.openPositions}</span>
            <Lock className="w-4 h-4 text-slate-300" />
          </div>
        </div>

        {/* New Joins */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">NEW JOINS</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-600">{data.headcount.newJoins}</span>
            <span className="text-slate-400 text-xs font-semibold">This Month</span>
          </div>
        </div>
      </div>

      {/* Middle Row Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Attendance snapshot */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800">Attendance snapshot</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="outline-none flex items-center justify-center">
                  <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  const csvData = "Metric,Value\\nHeadcount," + data.headcount.total + "\\nPresent," + data.attendance.present + "\\nAbsent," + data.attendance.absent;
                  const blob = new Blob([csvData], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'hr-overview.csv';
                  a.click();
                }}>Export Data</DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/attendance">View Details</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setRefreshKey(prev => prev + 1);
                  queryClient.invalidateQueries({ queryKey: ['hr-overview'] });
                }}>Refresh</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* SVG Donut Chart */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                {/* Absent */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * animAbsent) / 100} className={`${isResetting ? 'transition-none' : 'transition-all duration-[2500ms] ease-out'}`} />
                {/* WFH */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563eb" strokeWidth="12" strokeDashoffset={251.2 - (251.2 * animWfh) / 100} strokeDasharray="251.2" style={{ strokeDashoffset: 251.2 - (251.2 * animWfh) / 100, strokeDasharray: "251.2 251.2", transformOrigin: "center", transform: `rotate(${(absentPct/100) * 360}deg)` }} className={`${isResetting ? 'transition-none' : 'transition-all duration-[2500ms] ease-out'}`} />
                {/* Present */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#16a34a" strokeWidth="12" strokeDasharray="251.2" style={{ strokeDashoffset: 251.2 - (251.2 * animPresent) / 100, strokeDasharray: "251.2 251.2", transformOrigin: "center", transform: `rotate(${((absentPct+wfhPct)/100) * 360}deg)` }} className={`${isResetting ? 'transition-none' : 'transition-all duration-[2500ms] ease-out'}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-900">{data.attendance.total}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">TOTAL</span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-green-600"></div>
                  <span className="text-slate-600 font-medium">Present ({presentPct}%)</span>
                </div>
                <span className="font-bold text-slate-900">{data.attendance.present}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-blue-600"></div>
                  <span className="text-slate-600 font-medium">WFH ({wfhPct}%)</span>
                </div>
                <span className="font-bold text-slate-900">{data.attendance.wfh}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-slate-200"></div>
                  <span className="text-slate-500 font-medium">Absent ({absentPct}%)</span>
                </div>
                <span className="font-bold text-red-600">{data.attendance.absent}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leave requests pending */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800">Leave requests pending</h3>
            <Link href="/leaves" className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-700">View all</Link>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded">{data.leaves.pendingCount}</span>
          </div>
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
            {data.leaves.requests.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-4">No pending leave requests.</div>
            ) : (
              data.leaves.requests.map((req: any, idx: number) => (
                <div key={req.id} className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${['bg-blue-100 text-blue-700', 'bg-slate-200 text-slate-700', 'bg-orange-100 text-orange-700'][idx % 3]}`}>
                    {req.initials}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{req.employeeName}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{req.leaveType} • {req.days} days</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button onClick={() => handleReject(req.id)} className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 bg-white shadow-sm">
                      <CloseIcon className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleApprove(req.id)} className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 shadow-sm">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* New joiner checklist */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800">New joiner checklist</h3>
          </div>
          <div className="flex-1 flex flex-col gap-6">
            {data.newJoiners.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-4">No new joiners.</div>
            ) : (
              data.newJoiners.map((nj: any, idx: number) => (
                <div key={nj.id}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-900">{nj.name}</span>
                    <span className="text-slate-500 font-semibold">{nj.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${idx % 2 === 0 ? 'bg-slate-800' : 'bg-slate-300'}`} style={{ width: `${nj.progress}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 italic">Pending: {nj.pendingTask}</p>
                </div>
              ))
            )}
          </div>
          <Link href="/employees" className="w-full py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-md mt-6 shadow-sm transition-colors flex items-center justify-center">
            Manage Pipeline
          </Link>
        </div>

      </div>

      {/* Bottom Row Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent activity */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6">Recent activity</h3>
          <div className="relative border-l border-slate-200 ml-3 space-y-8 pb-4">
            {data.activity.length === 0 ? (
              <div className="text-sm text-slate-500 pl-4 py-2">No recent activity.</div>
            ) : (
              data.activity.map((act: any, idx: number) => {
                const colorMap: any = {
                  success: 'bg-green-600',
                  info: 'bg-blue-600',
                  warning: 'bg-amber-500',
                  error: 'bg-red-600',
                  default: 'bg-slate-900'
                };
                return (
                  <div key={act.id} className="relative pl-6">
                    <div className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full ring-4 ring-white ${colorMap[act.type] || 'bg-slate-400'}`}></div>
                    <p className="text-sm font-bold text-slate-800">{act.text}</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">{new Date(act.time).toLocaleString()}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6">Upcoming events</h3>
          <div className="space-y-4">
            {data.events.length === 0 ? (
              <div className="text-sm text-slate-500 py-2">No upcoming events.</div>
            ) : (
              data.events.map((evt: any, idx: number) => {
                const date = new Date(evt.date);
                const monthStr = date.toLocaleString('default', { month: 'short' }).toUpperCase();
                const dayStr = date.getDate().toString().padStart(2, '0');
                
                const styleMaps: any = [
                  { bg: 'bg-blue-50', textM: 'text-blue-800', textD: 'text-blue-900' },
                  { bg: 'bg-slate-100', textM: 'text-slate-500', textD: 'text-slate-700' },
                  { bg: 'bg-orange-50', textM: 'text-orange-800', textD: 'text-orange-900' }
                ];
                const s = styleMaps[idx % 3];

                return (
                  <div key={evt.id} className="flex border border-slate-200 rounded-lg overflow-hidden">
                    <div className={`${s.bg} w-14 flex flex-col items-center justify-center shrink-0 border-r border-slate-200 p-2`}>
                      <span className={`text-[10px] font-bold ${s.textM} uppercase leading-none`}>{monthStr}</span>
                      <span className={`text-lg font-extrabold ${s.textD} leading-tight mt-1`}>{dayStr}</span>
                    </div>
                    <div className="p-3 bg-white flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{evt.title}</p>
                      <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5">{evt.subtext}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
