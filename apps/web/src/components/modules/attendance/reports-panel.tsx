import { usePermissions } from "@/hooks/use-permissions";
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Download, PieChart, Loader2 } from "lucide-react";
import { fetchOrgReports } from "@/lib/api/attendance";

interface ReportsPanelProps {
  activeRole: "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
}

export default function ReportsPanel() {
  const { role } = usePermissions();
  const activeRole = role as any;
  // Gating access checks
  if (activeRole === "EMPLOYEE") {
    return (
      <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm text-center">
        <p className="text-sm font-semibold text-slate-500">
          You do not have permission to view organizational reports.
        </p>
      </div>
    );
  }

  const { data: metrics, isLoading, isError, error } = useQuery({
    queryKey: ["org-reports"],
    queryFn: fetchOrgReports,
  });

  const handleExportFullReport = () => {
    if (!metrics) return;
    const rows = [
      ["Department", "Headcount", "Attendance Rate"],
      ...metrics.departmentRates.map(d => [d.name, d.count.toString(), `${d.percent}%`])
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `org_attendance_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white border border-slate-200 rounded-xl shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-8 rounded-xl shadow-sm text-center">
        <p className="text-sm font-semibold text-rose-600">Failed to load organizational reports.</p>
        <p className="text-xs text-rose-500 mt-2 whitespace-pre-wrap text-left bg-rose-100 p-4 rounded-md">
          {(error as any)?.response?.data?.message || (error instanceof Error ? error.message : JSON.stringify(error))}
        </p>
      </div>
    );
  }

  const colorMap = ["bg-slate-900", "bg-purple-500", "bg-slate-400", "bg-amber-500", "bg-rose-500", "bg-emerald-500", "bg-indigo-500"];

  return (
    <div className="space-y-6">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Org Attendance Rate</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{metrics.avgAttendance}%</div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1">Target: 95.0%</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Late Check-In Ratio</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{metrics.lateRate}%</div>
          <div className="text-[10px] font-semibold text-rose-500 mt-1">+0.5% MTD change</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg. Time Worked</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{metrics.avgHours}</div>
          <div className="text-[10px] font-semibold text-slate-500 mt-1">Target: 9.0h / Day</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Punches MTD</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{metrics.activeFTE} FTE</div>
          <div className="text-[10px] font-semibold text-slate-900 mt-1">Across 5 departments</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Department Attendance Comparison */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-700" />
              Department Attendance Rates
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Current MTD</span>
          </div>

          <div className="space-y-4">
            {metrics.departmentRates.map((d, idx) => (
              <div key={d.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="font-bold">{d.name}</span>
                  <span>{d.percent}% ({d.count} FTE)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${colorMap[idx % colorMap.length]}`} style={{ width: `${d.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Trends Graph */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Late Check-In Trends
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Monthly Frequency</span>
          </div>

          {/* Simple Vector Graph */}
          <div className="h-44 flex items-end justify-between gap-4 pt-6 px-4">
            {metrics.lateTrends.map((item, idx) => (
              <div key={idx} className="relative flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                {/* count bubble */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded absolute -translate-y-12 z-20 shadow">
                  {item.count} Lates
                </div>
                <div className="w-full bg-slate-100 h-28 rounded-md flex items-end">
                  <div className="w-full bg-rose-500 rounded-md transition-all duration-500" style={{ height: `${item.percent}%` }} />
                </div>
                <span className="text-[10px] font-bold text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CSV Downloads Panel */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-indigo-500" />
          Payroll & Exporters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-slate-800">Monthly Timesheet CSV</h5>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Approved hours log for payroll calculations.</p>
            </div>
            <button
              onClick={handleExportFullReport}
              className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-slate-800">Regularization Correction Log</h5>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Audit log of corrected out-punches.</p>
            </div>
            <button
              onClick={handleExportFullReport}
              className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
