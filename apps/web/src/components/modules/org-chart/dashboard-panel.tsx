"use client";
import { usePermissions } from "@/hooks/use-permissions";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Building2, UserCircle, GitFork, UserPlus, ArrowRight, Network
} from "lucide-react";
import Link from "next/link";
import { OrgRole } from "@/types/org-chart";
import { apiClient } from "@/lib/api/client";

interface OrgDashboardPanelProps {

}



export default function OrgDashboardPanel() {
  const { role } = usePermissions();
  const activeRole = role as any;
  const isEmployee = activeRole === "EMPLOYEE";
  const isManager = activeRole === "MANAGER";

  const { data: stats, isLoading } = useQuery({
    queryKey: ["orgStats"],
    queryFn: async () => {
      const res = await apiClient.get('/employees/org-stats');
      return res.data;
    },
    enabled: !isEmployee // Only fetch if they have access
  });

  if (isEmployee || isLoading || !stats) return null;

  const colors = ["bg-slate-900", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-blue-500", "bg-cyan-500"];
  const orgDistribution = stats.breakdown.map((d: any, i: number) => ({
    dept: d.name,
    percent: d.percentage,
    color: colors[i % colors.length],
    count: d.count
  }));

  const mStruct = stats.managementStructure;
  const totalMStruct = mStruct.cLevel + mStruct.directors + mStruct.managers + mStruct.individualContributors;
  const calcPercent = (val: number) => totalMStruct > 0 ? Math.round((val / totalMStruct) * 100) : 0;

  const managementDistribution = [
    { title: "Individual Contributors", percent: calcPercent(mStruct.individualContributors), color: "bg-sky-400", count: mStruct.individualContributors },
    { title: "Managers", percent: calcPercent(mStruct.managers), color: "bg-indigo-400", count: mStruct.managers },
    { title: "Directors & VP", percent: calcPercent(mStruct.directors), color: "bg-indigo-600", count: mStruct.directors },
    { title: "C-Level", percent: calcPercent(mStruct.cLevel), color: "bg-indigo-900", count: mStruct.cLevel },
  ];

  return (
    <div className="space-y-6">
      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalEmployees}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            {isManager ? "Team Size" : "Total Employees"}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.departments}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Departments
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
              <UserCircle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.managers}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            Managers
          </div>
        </div>

        {(!isEmployee) && (
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                <UserPlus className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.vacantPositions}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Vacant Positions
            </div>
          </div>
        )}

        {(!isEmployee) && (
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <GitFork className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.avgSpanOfControl}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Avg Span of Control
            </div>
          </div>
        )}
      </div>

      {/* ── Visual Summaries ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          {/* Organization Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-900">Organization Breakdown</h3>
              <Link href="/org-chart/departments" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                View Departments <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mb-6">
              <div className="w-full h-4 rounded-full flex overflow-hidden">
                {orgDistribution.map((d: any, i: number) => (
                  <div key={i} className={`h-full ${d.color}`} style={{ width: `${d.percent}%` }} title={`${d.dept}: ${d.percent}%`} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {orgDistribution.map((d: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${d.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{d.dept}</div>
                    <div className="text-[10px] font-semibold text-slate-500">{d.count} Emp ({d.percent}%)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Management Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-6">Management Structure</h3>
            <div className="space-y-4">
              {managementDistribution.map((m, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-32 text-xs font-bold text-slate-700 flex-shrink-0">{m.title}</div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.percent}%` }} />
                  </div>
                  <div className="w-12 text-right text-xs font-bold text-slate-900">{m.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Actions & Previews ───────────────────────────────────── */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/org-chart/hierarchy"
                className="flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                <Network className="w-3.5 h-3.5" />
                View Full Organization Chart
              </Link>
              <Link
                href="/org-chart/reporting"
                className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                <GitFork className="w-3.5 h-3.5" />
                My Reporting Chain
              </Link>
            </div>
          </div>

          {(!isEmployee) && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Structure Notifications</h3>
              <p className="text-xs font-semibold text-slate-500 mb-4">
                Recent changes requiring attention
              </p>
              <div className="space-y-3">
                {stats.notifications && stats.notifications.length > 0 ? (
                  stats.notifications.map((notif: any, idx: number) => (
                    <div
                      key={idx}
                      className={`bg-white border p-3 rounded-lg shadow-sm border-l-4 ${notif.type === 'warning'
                          ? 'border-amber-200 border-l-amber-500'
                          : 'border-slate-200 border-l-blue-500'
                        }`}
                    >
                      <div className={`text-xs font-bold ${notif.type === 'warning' ? 'text-amber-900' : 'text-slate-900'}`}>
                        {notif.title}
                      </div>
                      <div className={`text-[10px] font-medium mt-1 ${notif.type === 'warning' ? 'text-amber-700' : 'text-slate-500'}`}>
                        {notif.message}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 font-medium italic">No structure notifications at this time.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
