"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Filter, Users, Calendar as CalendarIcon, Info } from "lucide-react";
import { LeaveRequest } from "@/types/leaves";

interface CalendarPanelProps {
  activeRole: "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
}

const LOCAL_REGS_KEY = "naprocs_leave_requests";

export default function CalendarPanel({ activeRole }: CalendarPanelProps) {
  const [filterDept, setFilterDept] = useState("");

  const fetchRequests = async (): Promise<LeaveRequest[]> => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_REGS_KEY);
      if (saved) return JSON.parse(saved);
    }
    return [];
  };

  const { data: requests = [] } = useQuery<LeaveRequest[]>({
    queryKey: ["leaveRequests"],
    queryFn: fetchRequests,
  });

  const filteredRequests = useMemo(() => {
    if (!filterDept) return requests;
    return requests.filter((r) => r.department === filterDept);
  }, [requests, filterDept]);

  // Unique departments for filter
  const departments = useMemo(() => {
    return Array.from(new Set(requests.map((r) => r.department)));
  }, [requests]);

  return (
    <div className="space-y-6">
      {/* Filtering Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-bold text-slate-900">June 2026</h3>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 bg-white focus:outline-none cursor-pointer w-full sm:w-auto"
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

      {/* Monthly Roster Grid Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 border-t border-l border-slate-200 bg-slate-50 rounded-t-lg">
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, idx) => (
            <div
              key={day}
              className={`p-3 text-[10px] font-bold text-slate-500 text-center border-b border-r border-slate-200 ${
                idx === 0 ? "rounded-tl-lg" : idx === 6 ? "rounded-tr-lg" : ""
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid Body */}
        <div className="grid grid-cols-7 border-l border-slate-200 bg-white text-slate-700">
          {/* Calendar cell items represent standard offset blocks */}
          {Array.from({ length: 14 }).map((_, idx) => {
            const day = idx + 1;
            
            // Map logs manually to create visual items in calendar
            let leavesOnThisDay: LeaveRequest[] = [];
            if (day === 20 || day === 21) {
              leavesOnThisDay = filteredRequests.filter((r) => r.id === "L-101");
            } else if (day === 18) {
              leavesOnThisDay = filteredRequests.filter((r) => r.id === "L-102");
            }

            return (
              <div
                key={day}
                className="h-28 p-2.5 border-b border-r border-slate-200 text-xs font-bold flex flex-col justify-between hover:bg-slate-50/50 transition-colors"
              >
                <span>{day}</span>
                <div className="space-y-1 mt-1.5 overflow-y-auto max-h-[80px] scrollbar-hide">
                  {leavesOnThisDay.map((leave) => {
                    const isApproved = leave.status === "APPROVED";
                    return (
                      <div
                        key={leave.id}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate border shadow-sm ${
                          isApproved
                            ? "bg-blue-50 text-blue-700 border-blue-200/50"
                            : "bg-amber-50 text-amber-700 border-amber-200/50"
                        }`}
                        title={`${leave.employeeName}: ${leave.reason}`}
                      >
                        {leave.employeeName.split(" ")[0]} ({isApproved ? "Approved" : "Pending"})
                      </div>
                    );
                  })}
                  {day === 25 && (
                    <div className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded truncate">
                      Christmas Day
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {/* Empty trailing cells */}
          {Array.from({ length: 16 }).map((_, idx) => (
            <div key={idx} className="h-28 p-2.5 border-b border-r border-slate-200 bg-slate-50/20 text-xs font-semibold text-slate-400">
              {idx + 15}
            </div>
          ))}
        </div>

        {/* Legends */}
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider pt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-blue-50 border border-blue-200 rounded" />
            Approved Leave
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-amber-50 border border-amber-200 rounded" />
            Pending Leave
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-slate-100 border border-slate-200 rounded" />
            Public Holiday
          </div>
        </div>
      </div>
    </div>
  );
}
