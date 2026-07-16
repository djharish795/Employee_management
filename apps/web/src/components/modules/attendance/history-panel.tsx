"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Download, ArrowUpDown, Calendar, RefreshCcw } from "lucide-react";
import { AttendanceLog } from "@/types/attendance";

import { fetchMyLogs, fetchAllLogs } from "@/lib/api/attendance";

const formatTimeValue = (val: string | null | undefined): string => {
  if (!val) return "—";
  if (val.includes("AM") || val.includes("PM") || val === "--:--" || val === "—") {
    return val;
  }
  const parsed = new Date(val);
  if (isNaN(parsed.getTime())) {
    return val;
  }
  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

interface HistoryPanelProps {
  mode?: "personal" | "org";
}

export default function HistoryPanel({ mode = "personal" }: HistoryPanelProps) {
  const [filterMonth, setFilterMonth] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  const isOrgMode = mode === "org";
  
  const { data: rawLogs = [], isLoading } = useQuery<AttendanceLog[]>({
    queryKey: ["attendanceLogs", isOrgMode ? "all" : "my"],
    queryFn: () => isOrgMode ? fetchAllLogs(1, 500) : fetchMyLogs(),
  });

  const logs = useMemo(() => {
    return rawLogs.map((log) => {
      const formattedDate = new Date(log.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      const formattedCheckIn = formatTimeValue(log.checkIn);
      const formattedCheckOut = formatTimeValue(log.checkOut);
      const formattedHours = typeof log.hoursWorked === 'number' ? `${log.hoursWorked.toFixed(1)}h` : log.hoursWorked;
      
      // Calculate formatted break
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

      return {
        ...log,
        displayDate: formattedDate,
        displayCheckIn: formattedCheckIn,
        displayCheckOut: formattedCheckOut,
        displayHours: formattedHours,
        displayBreak: formattedBreak,
      };
    });
  }, [rawLogs]);

  // Calculate filtered logs
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (filterStatus) {
      result = result.filter((log) => log.status === filterStatus);
    }

    if (filterMonth) {
      result = result.filter((log) => log.displayDate.includes(filterMonth));
    }

    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      result = result.filter(
        (log) =>
          log.displayDate.toLowerCase().includes(q) ||
          log.remarks.toLowerCase().includes(q) ||
          log.status.toLowerCase().includes(q) ||
          ((log as any).employeeName && (log as any).employeeName.toLowerCase().includes(q))
      );
    }

    return result;
  }, [logs, filterStatus, filterMonth, filterSearch]);

  // Export to CSV Functionality
  const handleExportCSV = async () => {
    try {
      // Fetch full dataset to avoid exporting just the paginated subset
      const fullRawLogs = isOrgMode ? await fetchAllLogs(1, 10000) : await fetchMyLogs(1, 10000);
      
      const formattedLogs = fullRawLogs.map((log) => {
        const displayDate = new Date(log.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        const displayCheckIn = formatTimeValue(log.checkIn);
        const displayCheckOut = formatTimeValue(log.checkOut);
        const displayHours = typeof log.hoursWorked === 'number' ? `${log.hoursWorked.toFixed(1)}h` : log.hoursWorked;
        let displayBreak = "—";
        if (log.totalBreakSeconds && log.totalBreakSeconds > 0) {
          const breakMins = Math.round(log.totalBreakSeconds / 60);
          if (breakMins < 60) displayBreak = `${breakMins}m`;
          else {
            const hrs = Math.floor(breakMins / 60);
            const mins = breakMins % 60;
            displayBreak = mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
          }
        }
        return { ...log, displayDate, displayCheckIn, displayCheckOut, displayHours, displayBreak };
      });

      let result = [...formattedLogs];
      if (filterStatus) result = result.filter(log => log.status === filterStatus);
      if (filterMonth) result = result.filter(log => log.displayDate.includes(filterMonth));
      if (filterSearch && isOrgMode) {
        const search = filterSearch.toLowerCase();
        result = result.filter(log => (log as any).employeeName?.toLowerCase().includes(search));
      }

      if (result.length === 0) {
        alert("No records found to export");
        return;
      }

      const escapeCsv = (str: any) => {
        if (str === null || str === undefined) return '""';
        const s = String(str);
        if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };

      const headers = isOrgMode 
        ? ["Employee", "Date", "Check In", "Check Out", "Hours Worked", "Break Time", "Status", "Remarks"]
        : ["Date", "Check In", "Check Out", "Hours Worked", "Break Time", "Status", "Remarks"];
        
      const rows = result.map((log) => {
        const row = [
          escapeCsv(log.displayDate),
          escapeCsv(log.displayCheckIn),
          escapeCsv(log.displayCheckOut),
          escapeCsv(log.displayHours),
          escapeCsv(log.displayBreak),
          escapeCsv(log.status),
          escapeCsv(log.remarks),
        ];
        if (isOrgMode) row.unshift(escapeCsv((log as any).employeeName || 'Unknown'));
        return row.join(",");
      });

      const csvContent = headers.join(",") + "\n" + rows.join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance_history_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
      alert("Failed to export logs");
    }
  };

  const uniqueMonths = useMemo(() => {
    const months = logs.map((log) => {
      const parts = log.displayDate.split(" ");
      return parts[1] ? `${parts[1]} ${parts[2]}` : "";
    });
    return Array.from(new Set(months.filter(Boolean)));
  }, [logs]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterMonth, filterSearch]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
              placeholder="Search name, remarks, or date..."
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
            <option value="EARLY_CHECKOUT">EARLY CHECKOUT</option>
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
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
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
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">
                  {isOrgMode && <th className="px-6 py-4">Employee</th>}
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Check In</th>
                  <th className="px-6 py-4">Check Out</th>
                  <th className="px-6 py-4">Hours Worked</th>
                  <th className="px-6 py-4">Break Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                {paginatedLogs.map((log, idx) => {
                  let badge = "text-slate-600 bg-slate-100";
                  if (log.status === "PRESENT") badge = "text-emerald-700 bg-emerald-50 border border-emerald-200/50";
                  else if (log.status === "LATE") badge = "text-amber-700 bg-amber-50 border border-amber-200/50";
                  else if (log.status === "EARLY_CHECKOUT") badge = "text-orange-500 bg-orange-50 border border-orange-200/50";
                  else if (log.status === "WFH") badge = "text-slate-900 bg-slate-100 border border-slate-300/50";
                  else if (log.status === "ABSENT") badge = "text-rose-700 bg-rose-50 border border-rose-200/50";

                  return (
                    <tr key={(log as any).id || idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      {isOrgMode && (
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {(log as any).employeeName || "Unknown"}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{log.displayDate}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500">{log.displayCheckIn}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">{log.displayCheckOut}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{log.displayHours}</td>
                      <td className="px-6 py-4 font-bold text-amber-600">{log.displayBreak}</td>
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
        
        {/* Pagination Controls */}
        {!isLoading && filteredLogs.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="text-sm font-medium text-slate-500">
              Showing <span className="font-bold text-slate-900">
                {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredLogs.length)}
              </span> of <span className="font-bold text-slate-900">{filteredLogs.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white shadow-sm transition-all text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Prev
              </button>
              <button className="flex items-center justify-center w-8 h-8 text-xs font-bold bg-slate-900 text-white rounded-lg shadow-sm">
                {currentPage}
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 bg-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
