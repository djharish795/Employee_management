"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Scale, FileCheck, ShieldAlert, Inbox, ScrollText, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle, AlertCircle, PieChart } from "lucide-react";
import Link from "next/link";
import { ComplianceRole, ComplianceKPIs } from "@/types/compliance";

interface DashboardPanelProps {
  activeRole: ComplianceRole;
}

const RECENT_ACTIVITIES = [
  { id: 1, title: "Data Deletion Request Fulfilled", user: "John Doe", time: "2 hours ago", status: "success" },
  { id: 2, title: "New IT Security Policy Published", user: "System", time: "5 hours ago", status: "info" },
  { id: 3, title: "Consent Expired - Marketing Data", user: "Jane Smith", time: "1 day ago", status: "warning" },
  { id: 4, title: "Data Access Request Received", user: "Alex T.", time: "1 day ago", status: "pending" },
];

export default function ComplianceDashboardPanel({ activeRole }: DashboardPanelProps) {
  const isPrivileged = ["COMPLIANCE_OFFICER", "ADMIN", "LEGAL", "CEO"].includes(activeRole);

  const { data: kpis } = useQuery<ComplianceKPIs>({
    queryKey: ["complianceKPIs", activeRole],
    queryFn: async () => ({
      complianceScore: 94,
      activeConsents: 8420,
      pendingRequests: 12,
      policyAcknowledgements: 98, // Percentage
      complianceViolations: 2,
    }),
  });

  if (!kpis) return null;

  return (
    <div className="space-y-6">
      
      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="w-9 h-9 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center">
              <Scale className="w-4.5 h-4.5" />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
              <ArrowUpRight className="w-3 h-3" /> 2%
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 relative z-10">{kpis.complianceScore}<span className="text-lg text-slate-400">/100</span></div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 relative z-10">Compliance Score</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <FileCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.activeConsents.toLocaleString()}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active Consents</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <ScrollText className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.policyAcknowledgements}%</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Policy Acceptance</div>
        </div>

        <div className="bg-white border border-amber-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
              <Inbox className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700">{kpis.pendingRequests}</div>
          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-1">Pending Requests</div>
        </div>

        <div className="bg-white border border-rose-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
              <ArrowDownRight className="w-3 h-3" /> 1
            </span>
          </div>
          <div className="text-2xl font-bold text-rose-700">{kpis.complianceViolations}</div>
          <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mt-1">Violations</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Health Overview & Risk ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-80 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Compliance Health Overview</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">30-day trailing compliance score metrics.</p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center bg-slate-50/50">
               {/* Placeholder for chart */}
               <div className="text-center">
                  <PieChart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-400">Health Chart Visualization</p>
               </div>
            </div>
          </div>

          {isPrivileged && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Active Risk Indicators
              </h3>
              <div className="space-y-3">
                <div className="bg-white border border-amber-200 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Overdue Data Deletion Requests</h4>
                    <p className="text-xs text-slate-600 mt-1">2 requests have breached the 30-day SLA window required by GDPR.</p>
                    <button className="text-xs font-bold text-rose-600 mt-2 hover:underline">Review Breaches</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Recent Activity & Actions ──────────────────────────────────── */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Recent Activities</h3>
            </div>
            <div className="p-2">
              {RECENT_ACTIVITIES.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="mt-0.5">
                    {activity.status === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {activity.status === "info" && <ScrollText className="w-4 h-4 text-blue-500" />}
                    {activity.status === "warning" && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    {activity.status === "pending" && <Inbox className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{activity.title}</div>
                    <div className="text-[10px] font-medium text-slate-500 mt-0.5">
                      {activity.user} • {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <Link href="/compliance/requests" className="w-full py-2.5 px-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold rounded-lg transition-colors flex items-center justify-between group">
                Review Pending Requests
                <span className="bg-teal-600 text-white px-2 py-0.5 rounded text-[10px]">{kpis.pendingRequests}</span>
              </Link>
              <Link href="/compliance/policies" className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors text-center">
                Manage Policies
              </Link>
              <button className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors text-center">
                Export Compliance Report
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
