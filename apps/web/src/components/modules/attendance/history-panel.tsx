"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Download, ArrowUpDown, Calendar, RefreshCcw } from "lucide-react";
import { AttendanceLog } from "@/types/attendance";
import { memo } from "react";

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

import { fetchMyLogs, fetchAllLogs, exportAllLogsCsv } from "@/lib/api/attendance";

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

const MemoizedHistoryRow = memo(({ log, isOrgMode }: { log: any, isOrgMode: boolean }) => {
  let badge = "text-slate-600 bg-slate-100";
  if (log.status === "PRESENT") badge = "text-emerald-700 bg-emerald-50 border border-emerald-200/50";
  else if (log.status === "LATE") badge = "text-amber-700 bg-amber-50 border border-amber-200/50";
  else if (log.status === "EARLY_CHECKOUT") badge = "text-orange-500 bg-orange-50 border border-orange-200/50";
  else if (log.status === "WFH") badge = "text-slate-900 bg-slate-100 border border-slate-300/50";
  else if (log.status === "ABSENT") badge = "text-rose-700 bg-rose-50 border border-rose-200/50";

  const [showSplits, setShowSplits] = useState(false);
  const splits = log.punchHistory || [];
  
  // Calculate true split shifts (ignoring breaks)
  let shiftCount = 0;
  for (let i = 0; i < splits.length; i++) {
     if (splits[i].action === 'IN') {
        // If it's the first IN, or the previous was an OUT, it's a new shift.
        if (i === 0 || splits[i-1].action === 'OUT') {
           shiftCount++;
        }
     }
  }
  const hasMultiple = shiftCount > 1;

  return (
    <>
      <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
        {isOrgMode && (
          <td className="px-6 py-4 font-bold text-slate-900">
            {log.employeeName || "Unknown"}
          </td>
        )}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="font-bold text-slate-900">{log.displayDate}</div>
        </td>
        <td className="px-6 py-4 font-mono text-slate-500">
          <div className="flex items-center gap-2">
            {log.displayCheckIn}
            {hasMultiple && (
              <button 
                onClick={() => setShowSplits(!showSplits)} 
                className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded hover:bg-blue-100 transition-colors shadow-sm flex items-center gap-1"
              >
                {showSplits ? "Hide Splits" : "Split Shifts"}
              </button>
            )}
          </div>
        </td>
        <td className="px-6 py-4 font-mono text-slate-500">{log.displayCheckOut}</td>
        <td className="px-6 py-4 font-bold text-slate-900">{log.displayHours}</td>
        <td className="px-6 py-4 font-bold text-amber-600">{log.displayBreak}</td>
        <td className="px-6 py-4">
          <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${badge}`}>
            {log.status}
          </span>
        </td>
        <td className="px-6 py-4 text-slate-500 leading-relaxed max-w-[240px] truncate" title={log.remarks}>
          {log.remarks}
        </td>
      </tr>
      
      {/* Expanded Row for Split Shifts */}
      {showSplits && (
        <tr className="bg-slate-50/80 border-b border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <td colSpan={isOrgMode ? 8 : 7} className="px-6 py-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm inline-block min-w-[300px]">
               <div className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                 Detailed Shift Breakdown
               </div>
               <div className="space-y-3">
                 {(() => {
                   const pairs: any[] = [];
                   let currentIn: string | null = null;
                   splits.forEach((p: any) => {
                     if (p.action === 'IN') currentIn = p.time;
                     if (p.action === 'OUT' && currentIn) {
                       pairs.push({ in: currentIn, out: p.time });
                       currentIn = null;
                     }
                   });
                   if (currentIn) pairs.push({ in: currentIn, out: null });
                   
                   return pairs.map((pair, i) => (
                     <div key={i} className="flex items-center gap-4 text-xs font-mono bg-slate-50 px-3 py-2 rounded-md border border-slate-100">
                       <div className="flex flex-col">
                         <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Check In</span>
                         <span className="text-emerald-600 font-bold">{formatTimeValue(pair.in)}</span>
                       </div>
                       <span className="text-slate-300">→</span>
                       <div className="flex flex-col">
                         <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Check Out</span>
                         <span className="text-rose-600 font-bold">{pair.out ? formatTimeValue(pair.out) : "Active..."}</span>
                       </div>
                     </div>
                   ));
                 })()}
               </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
});

MemoizedHistoryRow.displayName = "MemoizedHistoryRow";

export default function HistoryPanel({ mode = "personal" }: HistoryPanelProps) {
  const [filterMonth, setFilterMonth] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  const isOrgMode = mode === "org";
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: queryResult, isLoading } = useQuery({
    queryKey: ["attendanceLogs", isOrgMode ? "all" : "my", isOrgMode ? currentPage : 1, filterStatus, filterMonth, filterSearch],
    queryFn: async () => {
      if (isOrgMode) {
        return fetchAllLogs(currentPage, itemsPerPage, filterStatus, filterMonth, filterSearch);
      } else {
        const res = await fetchMyLogs(1, 500);
        return { data: res.data || (res as any), total: (res as any).total || 500 };
      }
    },
  });

  const rawLogs = queryResult?.data || [];
  const serverTotal = queryResult?.total || 0;

  const logs = useMemo(() => {
    return rawLogs.map((log) => {
      const formattedDate = new Date(log.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      const checkIns = log.punchHistory?.filter((p: any) => p.action === 'IN').map((p: any) => formatTimeValue(p.time)) || [];
      const checkOuts = log.punchHistory?.filter((p: any) => p.action === 'OUT').map((p: any) => formatTimeValue(p.time)) || [];

      const formattedCheckIn = checkIns.length > 0 ? checkIns[0] : formatTimeValue(log.checkIn);
      const formattedCheckOut = checkOuts.length > 0 ? checkOuts[checkOuts.length - 1] : formatTimeValue(log.checkOut);
      const formattedHours = typeof log.hoursWorked === 'number' ? formatDecimalHoursToHMS(log.hoursWorked) : log.hoursWorked;
      
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
    if (isOrgMode) {
      exportAllLogsCsv();
      return;
    }
    
    try {
      const fullRawLogs = (await fetchMyLogs(1, 10000)).data;
      
      const formattedLogs = fullRawLogs.map((log) => {
        const displayDate = new Date(log.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        const checkIns = log.punchHistory?.filter((p: any) => p.action === 'IN').map((p: any) => formatTimeValue(p.time)) || [];
        const checkOuts = log.punchHistory?.filter((p: any) => p.action === 'OUT').map((p: any) => formatTimeValue(p.time)) || [];

        const displayCheckIn = checkIns.length > 0 ? checkIns[0] : formatTimeValue(log.checkIn);
        const displayCheckOut = checkOuts.length > 0 ? checkOuts[checkOuts.length - 1] : formatTimeValue(log.checkOut);
        const displayHours = typeof log.hoursWorked === 'number' ? formatDecimalHoursToHMS(log.hoursWorked) : log.hoursWorked;
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

      if (result.length === 0) {
        alert("No records found to export");
        return;
      }

      const escapeCsv = (str: any) => {
        if (str === null || str === undefined) return '""';
        let s = String(str);
        if (s.startsWith('=') || s.startsWith('+') || s.startsWith('-') || s.startsWith('@')) s = "'" + s;
        if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };

      const headers = ["Date", "Check In", "Check Out", "Time Worked", "Break Time", "Status", "Remarks"];
      const rows = result.map((log) => [
        escapeCsv(log.displayDate), escapeCsv(log.displayCheckIn), escapeCsv(log.displayCheckOut),
        escapeCsv(log.displayHours), escapeCsv(log.displayBreak), escapeCsv(log.status), escapeCsv(log.remarks)
      ].join(","));

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
    // Keep unique months calculation as is for personal mode, 
    // for org mode we might want to hardcode or fetch, but this is fine for now
    const months = logs.map((log) => {
      const parts = log.displayDate.split(" ");
      return parts[1] ? `${parts[1]} ${parts[2]}` : "";
    });
    return Array.from(new Set(months.filter(Boolean)));
  }, [logs]);

  const [activeTooltipLogId, setActiveTooltipLogId] = useState<string | null>(null);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterMonth, filterSearch]);

  const displayLogs = isOrgMode ? logs : filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalCount = isOrgMode ? serverTotal : filteredLogs.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Invisible overlay to close tooltip when clicking outside */}
      {activeTooltipLogId && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={(e) => {
            e.stopPropagation();
            setActiveTooltipLogId(null);
          }} 
        />
      )}

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
                  <th className="px-6 py-4">Time Worked</th>
                  <th className="px-6 py-4">Break Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                {displayLogs.map((log, idx) => (
                  <MemoizedHistoryRow key={(log as any).id || idx} log={log} isOrgMode={isOrgMode} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {!isLoading && totalCount > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="text-sm font-medium text-slate-500">
              Showing <span className="font-bold text-slate-900">
                {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalCount)}
              </span> of <span className="font-bold text-slate-900">{totalCount}</span>
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
