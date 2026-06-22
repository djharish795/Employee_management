"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Download, ArrowUpDown, Calendar, RefreshCcw } from "lucide-react";
import { AttendanceLog } from "@/types/attendance";

interface HistoryPanelProps {
  activeRole: "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
}

const LOCAL_LOGS_KEY = "naprocs_attendance_logs";

export default function HistoryPanel({ activeRole }: HistoryPanelProps) {
  const [filterMonth, setFilterMonth] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  const fetchLogs = async (): Promise<AttendanceLog[]> => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_LOGS_KEY);
      if (saved) return JSON.parse(saved);
    }
    return [];
  };

  const { data: logs = [], isLoading } = useQuery<AttendanceLog[]>({
    queryKey: ["attendanceLogs"],
    queryFn: fetchLogs,
  });

  // Calculate filtered logs
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (filterStatus) {
      result = result.filter((log) => log.status === filterStatus);
    }

    if (filterMonth) {
      result = result.filter((log) => log.date.includes(filterMonth));
    }

    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      result = result.filter(
        (log) =>
          log.date.toLowerCase().includes(q) ||
          log.remarks.toLowerCase().includes(q) ||
          log.status.toLowerCase().includes(q)
      );
    }

    return result;
  }, [logs, filterStatus, filterMonth, filterSearch]);

  // Export to CSV Functionality
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    
    // Header
    const headers = ["Date", "Check In", "Check Out", "Hours Worked", "Status", "Remarks"];
    const rows = filteredLogs.map((log) => [
      log.date,
      log.checkIn,
      log.checkOut || "—",
      log.hoursWorked,
      log.status,
      `"${log.remarks}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_history_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueMonths = useMemo(() => {
    const months = logs.map((log) => {
      const parts = log.date.split(" ");
      return parts[1] ? `${parts[1]} ${parts[2]}` : "";
    });
    return Array.from(new Set(months.filter(Boolean)));
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Filtering Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Quick Search */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search history remarks..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 transition-all font-semibold text-slate-700"
            />
          </div>

          {/* Month Selector */}
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="h-10 px-3.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 cursor-pointer min-w-[120px]"
          >
            <option value="">All Months</option>
            {uniqueMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-3.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 cursor-pointer min-w-[110px]"
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">PRESENT</option>
            <option value="LATE">LATE</option>
            <option value="WFH">WFH</option>
            <option value="ABSENT">ABSENT</option>
          </select>
        </div>

        {/* Action button */}
        <button
          onClick={handleExportCSV}
          disabled={filteredLogs.length === 0}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* History Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center">
            <RefreshCcw className="w-6 h-6 animate-spin text-slate-900" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700">No logs found</h4>
            <p className="text-xs mt-1">Try relaxing filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Check In</th>
                  <th className="px-6 py-4">Check Out</th>
                  <th className="px-6 py-4">Hours Worked</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                {filteredLogs.map((log, index) => {
                  let badge = "text-slate-600 bg-slate-100";
                  if (log.status === "PRESENT") badge = "text-emerald-700 bg-emerald-50 border border-emerald-200/50";
                  else if (log.status === "LATE") badge = "text-amber-700 bg-amber-50 border border-amber-200/50";
                  else if (log.status === "WFH") badge = "text-slate-900 bg-slate-100 border border-slate-300/50";
                  else if (log.status === "ABSENT") badge = "text-rose-700 bg-rose-50 border border-rose-200/50";

                  return (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{log.date}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">{log.checkIn}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">{log.checkOut || "—"}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{log.hoursWorked}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${badge}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 leading-relaxed max-w-[240px] truncate">
                        {log.remarks}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
