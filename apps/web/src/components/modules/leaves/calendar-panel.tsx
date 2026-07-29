"use client";
import { usePermissions } from "@/hooks/use-permissions";
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, AlertCircle } from "lucide-react";
import { fetchLeaveCalendar, ApiLeaveRequest } from "@/lib/api/leaves";
import { fetchCompanyHolidays, ApiCompanyHoliday } from "@/lib/api/holidays";
import { useAuthStore } from "@/store/auth";

const safeToISO = (dateVal: any): string => {
  if (!dateVal) return "1970-01-01T00:00:00.000Z";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "1970-01-01T00:00:00.000Z";
  return d.toISOString();
};

interface CalendarPanelProps {
  activeRole: "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
}

export default function CalendarPanel() {
  const { role } = usePermissions();
  const activeRole = role as any;
  const { employeeId } = useAuthStore();
  // Calendar state
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [filterDept, setFilterDept] = useState("");
  const [onlyMyLeaves, setOnlyMyLeaves] = useState(false);

  // Queries
  const { data: requests = [], isLoading: loadingLeaves, error: leavesError } = useQuery<ApiLeaveRequest[]>({
    queryKey: ["leaves-calendar"],
    queryFn: () => fetchLeaveCalendar(),
    retry: 1,
  });

  const { data: holidays = [], isLoading: loadingHolidays, error: holidaysError } = useQuery<ApiCompanyHoliday[]>({
    queryKey: ["company-holidays"],
    queryFn: fetchCompanyHolidays,
    staleTime: 3600_000, // 1 hour
    retry: 1,
  });

  // Unique departments for filter
  const departments = useMemo(() => {
    return Array.from(new Set(requests.map((r) => r.employee?.department?.name).filter(Boolean))) as string[];
  }, [requests]);

  // Filtering
  const filteredRequests = useMemo(() => {
    let result = requests;
    if (onlyMyLeaves && employeeId) {
      result = result.filter((r) => r.employeeId === employeeId);
    }
    if (filterDept) {
      result = result.filter((r) => r.employee?.department?.name === filterDept);
    }
    return result;
  }, [requests, onlyMyLeaves, employeeId, filterDept]);

  // Navigation handlers
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const jumpToToday = () => {
    const d = new Date();
    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  // ── Calendar Grid Math (Monday-start) ──────────────────────────────────
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayObj = new Date(year, month, 1);
  const rawFirstDay = firstDayObj.getDay(); // 0: Sun, 1: Mon, ...
  const startOffset = rawFirstDay === 0 ? 6 : rawFirstDay - 1; // Convert to Mon=0

  const totalCells = Math.ceil((daysInMonth + startOffset) / 7) * 7;
  const trailingBlanks = totalCells - (daysInMonth + startOffset);

  const prevMonthDays = new Date(year, month, 0).getDate();

  // Render logic
  const isLoading = loadingLeaves || loadingHolidays;
  const hasError = !!leavesError || !!holidaysError;

  return (
    <div className="space-y-6">
      {/* Filtering Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">

        {/* Month Navigation */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900 w-32 text-center">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <button onClick={prevMonth} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-md transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={jumpToToday} className="px-3 py-1 text-[10px] font-bold uppercase text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors">
              Today
            </button>
            <button onClick={nextMonth} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-md transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Dropdown & Checkbox */}
        <div className="flex items-center gap-4 w-full sm:w-auto flex-wrap justify-end">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="onlyMyLeaves"
              checked={onlyMyLeaves}
              onChange={(e) => setOnlyMyLeaves(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="onlyMyLeaves" className="text-xs font-bold text-slate-700 select-none cursor-pointer">
              Show only my leaves
            </label>
          </div>

          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="h-10 px-3.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer w-full sm:w-auto shadow-sm"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative">

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
            <p className="text-sm font-bold text-slate-700">Syncing calendar data...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && hasError && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-10">
            <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
            <p className="text-sm font-bold text-slate-900">Failed to load calendar data</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Please try refreshing the page.</p>
          </div>
        )}

        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
            <div
              key={day}
              className="p-3 text-[10px] font-bold text-slate-500 text-center border-r last:border-r-0 border-slate-200"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid Body */}
        <div className="grid grid-cols-7 bg-white text-slate-700">

          {/* Leading Blanks */}
          {Array.from({ length: startOffset }).map((_, idx) => {
            const displayDay = prevMonthDays - startOffset + idx + 1;
            return (
              <div key={`prev-${idx}`} className="min-h-[110px] p-2.5 border-b border-r last:border-r-0 border-slate-100 bg-slate-50/30 text-xs font-semibold text-slate-400">
                {displayDay}
              </div>
            );
          })}

          {/* Actual Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const currentCellDateStr = new Date(year, month, day, 12, 0, 0).toISOString().split("T")[0]; // Use noon to avoid timezone shift

            // 1. Find Holidays for this day
            const holidaysOnThisDay = holidays.filter(h => safeToISO(h.date).startsWith(currentCellDateStr));

            // 2. Find Leave Requests spanning this day
            const leavesOnThisDay = filteredRequests.filter((r) => {
              if (r.status !== "APPROVED" && r.status !== "PENDING") return false; // Hide rejected
              // Use YYYY-MM-DD string comparison to avoid timezone shift issues
              const startStr = safeToISO(r.startDate).split("T")[0];
              const endStr = safeToISO(r.endDate).split("T")[0];
              return currentCellDateStr >= startStr && currentCellDateStr <= endStr;
            });

            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            return (
              <div
                key={day}
                className={`min-h-[110px] p-2.5 border-b border-r border-slate-200 text-xs flex flex-col hover:bg-slate-50/50 transition-colors ${isToday ? "bg-indigo-50/30 ring-1 ring-inset ring-indigo-100" : ""
                  }`}
              >
                {/* Date Number */}
                <div className="flex justify-between items-start mb-1.5">
                  <span className={`font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-indigo-600 text-white" : "text-slate-700"}`}>
                    {day}
                  </span>
                </div>

                {/* Items Container */}
                <div className="space-y-1.5 mt-1 overflow-y-auto max-h-[85px] scrollbar-hide pr-1">

                  {/* Render Holidays */}
                  {holidaysOnThisDay.map((holiday) => (
                    <div
                      key={holiday.id}
                      className="text-[9px] font-bold px-1.5 py-1 bg-violet-100 border border-violet-200 text-violet-800 rounded truncate shadow-sm flex flex-col gap-0.5"
                      title={holiday.description || holiday.name}
                    >
                      <span className="truncate">{holiday.name}</span>
                    </div>
                  ))}

                  {/* Render Leaves */}
                  {leavesOnThisDay.map((leave) => {
                    const isApproved = leave.status === "APPROVED";
                    const empName = leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : "Unknown";
                    const badgeClass = isApproved
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200";

                    return (
                      <div
                        key={`${leave.id}-${day}`}
                        className={`text-[9px] font-bold px-1.5 py-1 rounded truncate border shadow-sm flex flex-col gap-0.5 ${badgeClass}`}
                        title={`${empName}: ${leave.reason}`}
                      >
                        <span className="truncate">{empName}</span>
                        <span className="text-[8px] uppercase opacity-75 truncate">{leave.leaveType?.name || 'Leave'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Trailing Blanks */}
          {Array.from({ length: trailingBlanks }).map((_, idx) => (
            <div key={`next-${idx}`} className="min-h-[110px] p-2.5 border-b border-r last:border-r-0 border-slate-100 bg-slate-50/30 text-xs font-semibold text-slate-400">
              {idx + 1}
            </div>
          ))}
        </div>

        {/* Legends Footer */}
        <div className="bg-slate-50/80 p-4 border-t border-slate-200 flex flex-wrap items-center gap-5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-50 border border-emerald-200 rounded shadow-sm" />
            Approved Leave
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-50 border border-amber-200 rounded shadow-sm" />
            Pending Leave
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-violet-100 border border-violet-200 rounded shadow-sm" />
            Public Holiday
          </div>
        </div>
      </div>
    </div>
  );
}
