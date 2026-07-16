"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, Shield, Workflow, Plug, FileCheck, ArrowUpRight, CheckCircle2, AlertTriangle, ScrollText 
} from "lucide-react";
import Link from "next/link";
import { SettingsRole, SettingsKPIs } from "@/types/settings";

interface DashboardPanelProps {
  activeRole: SettingsRole;
}

const RECENT_CHANGES = [
  { id: 1, action: "Updated Password Policy", actor: "IT Admin (john.d)", time: "2 hours ago", type: "security" },
  { id: 2, action: "Added New Department: Data Science", actor: "HR Admin (sarah.m)", time: "5 hours ago", type: "org" },
  { id: 3, action: "Modified 'Manager' Role Permissions", actor: "Super Admin", time: "1 day ago", type: "permissions" },
  { id: 4, action: "Connected Slack Integration", actor: "IT Admin (john.d)", time: "1 day ago", type: "integration" },
];

export default function SettingsDashboardPanel({ activeRole }: DashboardPanelProps) {
  const { data: kpis } = useQuery<SettingsKPIs>({
    queryKey: ["settingsKPIs", activeRole],
    queryFn: async () => ({
      totalUsers: 450,
      activeRoles: 12,
      securityAlerts: 3,
      activeWorkflows: 8,
      integrationsConnected: 4,
      complianceStatus: "HEALTHY",
    }),
  });

  if (!kpis) return null;

  return (
    <div className="space-y-6">
      
      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center">
              <Users className="w-4.5 h-4.5" />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              <ArrowUpRight className="w-3 h-3" /> 12
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.totalUsers}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Users</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Shield className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.activeRoles}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active Roles</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
              <Workflow className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.activeWorkflows}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Active Workflows</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Plug className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.integrationsConnected}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Integrations</div>
        </div>

        <div className={`border p-5 rounded-xl shadow-sm ${kpis.securityAlerts > 0 ? 'bg-white border-amber-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpis.securityAlerts > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-400'}`}>
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className={`text-2xl font-bold ${kpis.securityAlerts > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{kpis.securityAlerts}</div>
          <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${kpis.securityAlerts > 0 ? 'text-amber-600' : 'text-slate-400'}`}>Security Alerts</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Recent Configuration Changes ───────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Recent Configuration Changes</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Audit log of administrative actions.</p>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {RECENT_CHANGES.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
                  <div className="mt-0.5">
                    {activity.type === "security" && <Shield className="w-5 h-5 text-indigo-500" />}
                    {activity.type === "org" && <Users className="w-5 h-5 text-slate-700" />}
                    {activity.type === "permissions" && <ScrollText className="w-5 h-5 text-teal-500" />}
                    {activity.type === "integration" && <Plug className="w-5 h-5 text-purple-500" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{activity.action}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">
                      By <span className="font-bold text-slate-700">{activity.actor}</span> • {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ──────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link href="/settings/users" className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-between">
                Invite New User <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link href="/settings/permissions" className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-between">
                Manage Roles <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link href="/settings/security" className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-between">
                Configure Security <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link href="/settings/compliance" className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-between">
                Review Compliance <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <FileCheck className="w-5 h-5 text-teal-600" />
              <h3 className="text-sm font-bold text-teal-900">System Health</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg w-max border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> All Systems Operational
            </div>
            <p className="text-xs text-teal-700 mt-3 font-medium">Last full backup completed 3 hours ago. No critical compliance violations detected.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
