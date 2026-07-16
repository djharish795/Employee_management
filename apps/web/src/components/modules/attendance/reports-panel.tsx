"use client";

import React, { useMemo } from "react";
import { BarChart3, TrendingUp, Download, PieChart, FileSpreadsheet } from "lucide-react";

interface ReportsPanelProps {
  activeRole: "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
}

export default function ReportsPanel({ activeRole }: ReportsPanelProps) {
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

  // Sample analytics stats
  const metrics = useMemo(() => {
    return {
      avgAttendance: 96.4,
      lateRate: 4.8,
      avgHours: "8.2h",
      activeFTE: 78,
    };
  }, []);

  const handleExportFullReport = () => {
    // Generate a simple CSV representing organization metrics
    const rows = [
      ["Department", "Headcount", "Attendance Rate", "Avg Work Hours", "Late Arrivals (MTD)"],
      ["Engineering", "42", "98.1%", "8.8h", "3"],
      ["Sales & Marketing", "24", "94.5%", "7.9h", "8"],
      ["Operations", "12", "95.0%", "8.2h", "4"],
      ["Product & Design", "8", "97.2%", "8.5h", "1"],
      ["Others", "5", "96.0%", "8.0h", "2"],
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
            {[
              { name: "Engineering", percent: 98.1, count: 42, color: "bg-slate-900" },
              { name: "Product & Design", percent: 97.2, count: 8, color: "bg-purple-500" },
              { name: "Others", percent: 96.0, count: 5, color: "bg-slate-400" },
              { name: "Operations", percent: 95.0, count: 12, color: "bg-amber-500" },
              { name: "Sales & Marketing", percent: 94.5, count: 24, color: "bg-rose-500" },
            ].map((d) => (
              <div key={d.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="font-bold">{d.name}</span>
                  <span>{d.percent}% ({d.count} FTE)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.percent}%` }} />
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
            {[
              { label: "Jan", count: 8, percent: 40 },
              { label: "Feb", count: 5, percent: 25 },
              { label: "Mar", count: 12, percent: 60 },
              { label: "Apr", count: 15, percent: 75 },
              { label: "May", count: 9, percent: 45 },
              { label: "Jun", count: 18, percent: 90 },
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
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
