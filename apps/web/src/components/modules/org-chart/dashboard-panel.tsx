"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, Building2, UserCircle, GitFork, UserPlus, ArrowRight, Network 
} from "lucide-react";
import Link from "next/link";
import { OrgRole, OrgKPIs } from "@/types/org-chart";

interface OrgDashboardPanelProps {
  activeRole: OrgRole;
}

const ORG_DISTRIBUTION = [
  { dept: "Engineering", percent: 45, color: "bg-blue-600", count: 185 },
  { dept: "Sales", percent: 25, color: "bg-emerald-500", count: 103 },
  { dept: "Design", percent: 12, color: "bg-violet-500", count: 49 },
  { dept: "HR & Ops", percent: 10, color: "bg-amber-500", count: 41 },
  { dept: "Finance", percent: 8, color: "bg-rose-500", count: 34 },
];

const MANAGEMENT_DISTRIBUTION = [
  { title: "Individual Contributors", percent: 82, color: "bg-slate-300", count: 338 },
  { title: "Managers", percent: 14, color: "bg-indigo-400", count: 58 },
  { title: "Directors & VP", percent: 3, color: "bg-indigo-600", count: 12 },
  { title: "C-Level", percent: 1, color: "bg-indigo-900", count: 4 },
];

export default function OrgDashboardPanel({ activeRole }: OrgDashboardPanelProps) {
  const isEmployee = activeRole === "EMPLOYEE";
  const isManager = activeRole === "MANAGER";
  
  // Use mock data mimicking database fetching
  const { data: kpis } = useQuery<OrgKPIs>({
    queryKey: ["orgKPIs", activeRole],
    queryFn: async () => {
      if (isEmployee) {
        return {
          totalEmployees: 412,
          totalDepartments: 8,
          totalManagers: 74,
          vacantPositions: 0,
          avgSpanOfControl: "—",
        };
      }
      if (isManager) {
        return {
          totalEmployees: 18,
          totalDepartments: 1,
          totalManagers: 2,
          vacantPositions: 2,
          avgSpanOfControl: "4.5",
        };
      }
      return {
        totalEmployees: 412,
        totalDepartments: 8,
        totalManagers: 74,
        vacantPositions: 23,
        avgSpanOfControl: "5.6",
      };
    },
  });

  if (!kpis) return null;

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
          <div className="text-2xl font-bold text-slate-900">{kpis.totalEmployees}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            {isManager ? "Team Size" : "Total Employees"}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.totalDepartments}</div>
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
          <div className="text-2xl font-bold text-slate-900">{kpis.totalManagers}</div>
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
            <div className="text-2xl font-bold text-slate-900">{kpis.vacantPositions}</div>
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
            <div className="text-2xl font-bold text-slate-900">{kpis.avgSpanOfControl}</div>
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
                {ORG_DISTRIBUTION.map((d, i) => (
                  <div key={i} className={`h-full ${d.color}`} style={{ width: `${d.percent}%` }} title={`${d.dept}: ${d.percent}%`} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ORG_DISTRIBUTION.map((d, i) => (
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
              {MANAGEMENT_DISTRIBUTION.map((m, i) => (
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
                <div className="bg-white border border-amber-200 p-3 rounded-lg shadow-sm border-l-4 border-l-amber-500">
                  <div className="text-xs font-bold text-amber-900">Manager Vacancy</div>
                  <div className="text-[10px] font-medium text-amber-700 mt-1">
                    Design Team (UX) currently has no manager assigned.
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm border-l-4 border-l-blue-500">
                  <div className="text-xs font-bold text-slate-900">New Department Created</div>
                  <div className="text-[10px] font-medium text-slate-500 mt-1">
                    "AI Innovations" was added by HR. Needs 3 headcounts.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
