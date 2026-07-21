"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Users, Clock, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { fetchLeaveCalendar, ApiLeaveRequest } from "@/lib/api/leaves";

/**
 * CEO Read-Only Leave Summary Widget
 * Shown on the Executive Dashboard — CEO can see aggregate data,
 * but CANNOT approve or reject. HR manages the approval queue.
 */
export function LeavesSummaryWidget() {
  const { data, isLoading, error } = useQuery<ApiLeaveRequest[]>({
    queryKey: ["ceo-leaves-calendar"],
    queryFn: fetchLeaveCalendar as any,
    staleTime: 120_000,
    retry: 1,
  });

  // Aggregate from approved leaves
  const stats = React.useMemo(() => {
    if (!data) return { onLeave: 0, upcoming: 0, departments: new Set<string>() };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    let onLeave = 0;
    let upcoming = 0;
    const depts = new Set<string>();

    (data as any[]).forEach((req: any) => {
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      if (start <= today && end >= today) {
        onLeave++;
        if (req.employee?.department?.name) depts.add(req.employee.department.name);
      } else if (start > today && start <= nextWeek) {
        upcoming++;
      }
    });

    return { onLeave, upcoming, departments: depts };
  }, [data]);

  // Recent approved leaves for display
  const recent = React.useMemo(() => {
    if (!data) return [];
    return (data as any[]).slice(0, 4);
  }, [data]);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/70 rounded-xl shadow-sm shadow-slate-200/50 overflow-hidden h-full flex flex-col relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          Workforce Leave Status
        </h3>
        <span className="px-2 py-0.5 text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded uppercase tracking-wide">
          Read Only
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
        {[
          { label: "On Leave Today", value: isLoading ? "..." : stats.onLeave, color: "text-amber-600", icon: Users },
          { label: "Starting This Week", value: isLoading ? "..." : stats.upcoming, color: "text-indigo-600", icon: Clock },
          { label: "Depts Affected", value: isLoading ? "..." : stats.departments.size, color: "text-slate-700", icon: CheckCircle2 },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <div key={i} className="p-3 text-center bg-white/50">
            <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
            <p className={`text-lg font-extrabold ${color}`}>{value}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent leave list */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : error || !data ? (
          <div className="py-6 text-center text-xs text-slate-400 font-semibold">
            Could not load leave data
          </div>
        ) : recent.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-semibold">
            No approved leaves on record
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map((req: any) => (
              <div key={req.id} className="px-4 py-3 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors cursor-default">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : "—"}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 truncate">
                    {req.leaveType?.name ?? "Leave"} · {fmtDate(req.startDate)} – {fmtDate(req.endDate)}
                  </p>
                </div>
                <span className="flex-shrink-0 px-2 py-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded uppercase shadow-sm">
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/30">
        <p className="text-[10px] font-semibold text-slate-400 text-center">
          Leave approvals are managed by HR & Department Heads
        </p>
      </div>
    </div>
  );
}
