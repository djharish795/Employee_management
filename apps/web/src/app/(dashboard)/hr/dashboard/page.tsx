"use client";

import React, { useState, useEffect } from "react";
import { Download, MoreVertical, Check, X as CloseIcon, Lock, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";
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
import { RecentNotificationsWidget } from '@/components/shared/recent-notifications-widget';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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

  const handleDownloadPDF = () => {
    if (!data) return;
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(20);
    doc.text("HR Overview Report", 14, 22);

    // Add Date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Headcount Info
    autoTable(doc, {
      startY: 40,
      head: [["Metric", "Value"]],
      body: [
        ["Total Headcount", data.headcount.total?.toString()],
        ["New Joins (This Month)", data.headcount.newJoins?.toString()],
        ["Present Today", data.attendance.present?.toString()],
        ["On Leave (Planned)", data.attendance.onLeave?.toString()],
        ["Absent", data.attendance.absent?.toString()],
        ["Open Positions", data.recruitment?.openPositions?.toString() || "0"]
      ],
      theme: 'grid',
      headStyles: { fillColor: [63, 131, 248] },
    });

    doc.save("HR_Overview_Report.pdf");
  };

  const handleDownloadExcel = () => {
    if (!data) return;
    const reportData = [
      { Metric: "Total Headcount", Value: data.headcount.total },
      { Metric: "New Joins (This Month)", Value: data.headcount.newJoins },
      { Metric: "Present Today", Value: data.attendance.present },
      { Metric: "On Leave (Planned)", Value: data.attendance.onLeave },
      { Metric: "Absent", Value: data.attendance.absent },
      { Metric: "Open Positions", Value: data.recruitment?.openPositions || 0 }
    ];

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HR Overview");
    XLSX.writeFile(workbook, "HR_Overview_Report.xlsx");
  };

  const attendanceTotal = data?.headcount?.total || 1;
  const vacantCount = (data?.headcount?.total || 0) - (data?.headcount?.active || 0);
  const presentPct = data ? Math.round((data.attendance.present / attendanceTotal) * 100) || 0 : 0;
  const wfhPct = data ? Math.round((data.attendance.wfh / attendanceTotal) * 100) || 0 : 0;
  const absentPct = data ? Math.round((data.attendance.absent / attendanceTotal) * 100) || 0 : 0;
  const vacantPct = data ? Math.round((vacantCount / attendanceTotal) * 100) || 0 : 0;

  const [animPresent, setAnimPresent] = useState(0);
  const [animWfh, setAnimWfh] = useState(0);
  const [animAbsent, setAnimAbsent] = useState(0);
  const [animVacant, setAnimVacant] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!data) return;
    setIsResetting(true);
    setAnimPresent(0);
    setAnimWfh(0);
    setAnimAbsent(0);
    setAnimVacant(0);

    const timer = setTimeout(() => {
      setIsResetting(false);
      setAnimPresent(presentPct);
      setAnimWfh(wfhPct);
      setAnimAbsent(absentPct);
      setAnimVacant(vacantPct);
    }, 50);
    return () => clearTimeout(timer);
  }, [refreshKey, data, presentPct, wfhPct, absentPct, vacantPct]);

  if (isLoading || !data) {
    return (
      <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center justify-center transition-colors">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }



  return (
    <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 dark:bg-slate-900 min-h-screen font-sans transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">HR Overview</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Today is {dateString}</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-md shadow-sm transition-colors focus:outline-none">
                <Download className="w-4 h-4" />
                Export Report
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200">
              <DropdownMenuItem onClick={handleDownloadPDF} className="cursor-pointer py-2.5">
                <FileText className="w-4 h-4 mr-2 text-red-500" />
                <span className="font-medium">Download as PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadExcel} className="cursor-pointer py-2.5">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
                <span className="font-medium">Download as Excel</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <PersonalAttendanceWidget />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
        {/* Total HeadCount */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm transition-colors">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">TOTAL HEADCOUNT</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{data.headcount?.total || 0}</span>
          </div>
        </div>

        {/* Total Employees */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm transition-colors">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">TOTAL EMPLOYEES</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{data.headcount?.active || 0}</span>
          </div>
        </div>

        {/* Vacant */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm transition-colors">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">VACANT</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-slate-500 dark:text-slate-400">{(data.headcount?.total || 0) - (data.headcount?.active || 0)}</span>
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm transition-colors">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">PRESENT TODAY</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{data.attendance.present}</span>
            <span className="text-emerald-500 text-xs font-bold">{presentPct}% Rate</span>
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm transition-colors">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">ON LEAVE</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-500 dark:text-amber-400">{data.attendance.onLeave}</span>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold">Planned</span>
          </div>
        </div>

        {/* Open Positions (Phase 2 Feature) */}
        {process.env.NEXT_PUBLIC_PHASE_2_ENABLED === 'true' ? (
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm transition-colors">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">OPEN POSITIONS</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-slate-500 dark:text-slate-400">{data.recruitment.openPositions}</span>
              <Lock className="w-4 h-4 text-slate-300 dark:text-slate-600" />
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm transition-colors opacity-70">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">RECRUITMENT</p>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Locked in Phase 1</span>
            </div>
          </div>
        )}

        {/* New Joins */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm transition-colors">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">NEW JOINS</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{data.headcount.newJoins}</span>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold">This Month</span>
          </div>
        </div>
      </div>

      {/* Middle Row Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Attendance snapshot */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm flex flex-col transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Attendance snapshot</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="outline-none flex items-center justify-center">
                  <MoreVertical className="w-4 h-4 text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300" />
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
                <DropdownMenuItem asChild><Link href="/attendance/reports">View Details</Link></DropdownMenuItem>
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
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--donut-bg, #f1f5f9)" strokeWidth="12" className="dark:stroke-slate-800" />
                {/* Absent */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * animAbsent) / 100} className={`dark:stroke-slate-700 ${isResetting ? 'transition-none' : 'transition-all duration-[2500ms] ease-out'}`} />
                {/* WFH */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563eb" strokeWidth="12" strokeDashoffset={251.2 - (251.2 * animWfh) / 100} strokeDasharray="251.2" style={{ strokeDashoffset: 251.2 - (251.2 * animWfh) / 100, strokeDasharray: "251.2 251.2", transformOrigin: "center", transform: `rotate(${(absentPct / 100) * 360}deg)` }} className={`${isResetting ? 'transition-none' : 'transition-all duration-[2500ms] ease-out'}`} />
                {/* Present */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#16a34a" strokeWidth="12" strokeDasharray="251.2" style={{ strokeDashoffset: 251.2 - (251.2 * animPresent) / 100, strokeDasharray: "251.2 251.2", transformOrigin: "center", transform: `rotate(${((absentPct + wfhPct) / 100) * 360}deg)` }} className={`${isResetting ? 'transition-none' : 'transition-all duration-[2500ms] ease-out'}`} />
                {/* Vacant */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8B4513" strokeWidth="12" strokeDasharray="251.2" style={{ strokeDashoffset: 251.2 - (251.2 * animVacant) / 100, strokeDasharray: "251.2 251.2", transformOrigin: "center", transform: `rotate(${((absentPct + wfhPct + presentPct) / 100) * 360}deg)` }} className={`${isResetting ? 'transition-none' : 'transition-all duration-[2500ms] ease-out'}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{attendanceTotal}</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">TOTAL</span>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-green-600 dark:bg-green-500"></div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Present ({presentPct}%)</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{data.attendance.present}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-blue-600 dark:bg-blue-500"></div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">WFH ({wfhPct}%)</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{data.attendance.wfh}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                  <span className="text-slate-500 dark:text-slate-500 font-medium">Absent ({absentPct}%)</span>
                </div>
                <span className="font-bold text-red-600 dark:text-red-400">{data.attendance.absent}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#8B4513' }}></div>
                  <span className="text-slate-500 dark:text-slate-500 font-medium">Vacant ({vacantPct}%)</span>
                </div>
                <span className="font-bold" style={{ color: '#8B4513' }}>{vacantCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leave requests pending */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm flex flex-col transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Leave requests pending</h3>
            <Link href="/leaves" className="text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">View all</Link>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-1.5 py-0.5 rounded">{data.leaves.pendingCount}</span>
          </div>
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
            {data.leaves.requests.length === 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No pending leave requests.</div>
            ) : (
              data.leaves.requests.map((req: any, idx: number) => (
                <div key={req.id} className="flex items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
                  <div className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${['bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300', 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'][idx % 3]}`}>
                    {req.initials}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{req.employeeName}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{req.leaveType} • {req.days} days</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button onClick={() => handleReject(req.id)} className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 bg-white dark:bg-slate-950 shadow-sm transition-colors">
                      <CloseIcon className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleApprove(req.id)} className="w-7 h-7 rounded bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white hover:bg-slate-800 dark:hover:bg-slate-700 shadow-sm transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* New joiner checklist */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm flex flex-col transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">New joiner checklist</h3>
          </div>
          <div className="flex-1 flex flex-col gap-6">
            {data.newJoiners.length === 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No new joiners.</div>
            ) : (
              data.newJoiners.map((nj: any, idx: number) => (
                <div key={nj.id}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-900 dark:text-white">{nj.name}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">{nj.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${idx % 2 === 0 ? 'bg-slate-800 dark:bg-slate-400' : 'bg-slate-300 dark:bg-slate-600'}`} style={{ width: `${nj.progress}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 italic">Pending: {nj.pendingTask}</p>
                </div>
              ))
            )}
          </div>
          <Link href="/employees" className="w-full py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-md mt-6 shadow-sm transition-colors flex items-center justify-center">
            Manage Pipeline
          </Link>
        </div>

      </div>

      {/* Bottom Row Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent activity */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6">Recent activity</h3>
          <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-8 pb-4">
            {data.activity.length === 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-400 pl-4 py-2">No recent activity.</div>
            ) : (
              data.activity.map((act: any, idx: number) => {
                const colorMap: any = {
                  success: 'bg-green-600 dark:bg-green-500',
                  info: 'bg-blue-600 dark:bg-blue-500',
                  warning: 'bg-amber-500 dark:bg-amber-500',
                  error: 'bg-red-600 dark:bg-red-500',
                  default: 'bg-slate-900 dark:bg-slate-600'
                };
                return (
                  <div key={act.id} className="relative pl-6">
                    <div className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full ring-4 ring-white dark:ring-slate-950 ${colorMap[act.type] || 'bg-slate-400 dark:bg-slate-500'}`}></div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{act.text}</p>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">{new Date(act.time).toLocaleString()}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div>
          <RecentNotificationsWidget />
        </div>

        {/* Upcoming events */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6">Upcoming events</h3>
          <div className="space-y-4">
            {data.events.length === 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-400 py-2">No upcoming events.</div>
            ) : (
              data.events.map((evt: any, idx: number) => {
                const date = new Date(evt.date);
                const monthStr = date.toLocaleString('default', { month: 'short' }).toUpperCase();
                const dayStr = date.getDate().toString().padStart(2, '0');

                const styleMaps: any = [
                  { bg: 'bg-blue-50 dark:bg-blue-900/20', textM: 'text-blue-800 dark:text-blue-400', textD: 'text-blue-900 dark:text-blue-300' },
                  { bg: 'bg-slate-100 dark:bg-slate-800/50', textM: 'text-slate-500 dark:text-slate-400', textD: 'text-slate-700 dark:text-slate-300' },
                  { bg: 'bg-orange-50 dark:bg-orange-900/20', textM: 'text-orange-800 dark:text-orange-400', textD: 'text-orange-900 dark:text-orange-300' }
                ];
                const s = styleMaps[idx % 3];

                return (
                  <div key={evt.id} className="flex border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden transition-colors">
                    <div className={`${s.bg} w-14 flex flex-col items-center justify-center shrink-0 border-r border-slate-200 dark:border-slate-800 p-2 transition-colors`}>
                      <span className={`text-[10px] font-bold ${s.textM} uppercase leading-none`}>{monthStr}</span>
                      <span className={`text-lg font-extrabold ${s.textD} leading-tight mt-1`}>{dayStr}</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-950 flex-1 min-w-0 transition-colors">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{evt.title}</p>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">{evt.subtext}</p>
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
