"use client";

import { usePermissions } from "@/hooks/use-permissions";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, ShieldAlert, KeyRound, Download, ArrowUpRight, Search, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { AuditRole, AuditDashboardKPIs, AuditEvent } from "@/types/audit";

interface DashboardPanelProps {

}

import { fetchAuditEvents, fetchAuditMetrics } from "@/lib/api/audit";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AuditDashboardPanel() {
  const { role } = usePermissions();
  const activeRole = role as any;
  const isPrivileged = activeRole === "ADMIN" || activeRole === "IT_ADMIN" || activeRole === "COMPLIANCE_OFFICER";

  const { data: kpis, isLoading: isLoadingKPIs, error } = useQuery<AuditDashboardKPIs>({
    queryKey: ["auditKPIs"],
    queryFn: fetchAuditMetrics,
    refetchInterval: 30000,
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery<Partial<AuditEvent>[]>({
    queryKey: ["auditEvents"],
    queryFn: () => fetchAuditEvents(50, 0),
    refetchInterval: 10000,
  });

  const handleGenerateReport = () => {
    if (!events || events.length === 0) {
      toast.error("No events available to generate report.");
      return;
    }
    
    toast.loading("Generating compliance report...", { id: "report" });
    
    // Simulate generation delay
    setTimeout(() => {
      const headers = ["ID", "Timestamp", "Actor", "Action", "Module", "Target", "Status"];
      const csvContent = [
        headers.join(","),
        ...events.map(e => [
          e.id,
          e.timestamp,
          e.actor?.name || 'System',
          e.action,
          e.module,
          e.target?.name || 'N/A',
          e.status
        ].map(v => `"${v}"`).join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `compliance_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Compliance report downloaded successfully", { id: "report" });
    }, 1500);
  };

  if (isLoadingKPIs) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 w-full bg-white border border-slate-200 rounded-xl shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <span className="text-sm font-medium">Loading metrics...</span>
      </div>
    );
  }

  if (error) {
    const isForbidden = (error as any)?.response?.status === 403 || (error as any)?.status === 403;

    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 w-full bg-white border border-slate-200 rounded-xl shadow-sm">
        <span className="text-sm font-medium text-slate-600">
          {isForbidden
            ? "Access Denied. You do not have permission to view Audit Logs."
            : "Failed to load metrics. No data available."}
        </span>
      </div>
    );
  }

  if (!kpis) {
    return null;
  }

  return (
    <div className="space-y-6">

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3" /> 12%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.totalEvents24h.toLocaleString()}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Events (24h)</div>
        </div>

        {isPrivileged && (
          <>
            <div className="bg-white border border-rose-200 p-5 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-full -z-0"></div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="w-9 h-9 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                  <KeyRound className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-rose-700 relative z-10">{kpis.failedLogins24h}</div>
              <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mt-1 relative z-10">Failed Logins</div>
            </div>

            <div className="bg-white border border-amber-200 p-5 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -z-0"></div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="w-9 h-9 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <ShieldAlert className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-700 relative z-10">{kpis.criticalWarnings24h}</div>
              <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-1 relative z-10">Policy Violations</div>
            </div>
          </>
        )}

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center">
              <Download className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.dataExports24h}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Data Exports</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Recent System Activity ─────────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-[500px]">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live System Activity</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Streaming events from all modules</p>
            </div>
            <Link href="/audit/events" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
              View All Events
            </Link>
          </div>

          <div className="flex-1 overflow-auto p-2">
            {isLoadingEvents ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <span className="text-sm font-medium">Loading live events...</span>
              </div>
            ) : !events || events.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-slate-500">
                No recent activity.
              </div>
            ) : (
              <div className="space-y-1">
                {events.map((event) => (
                  <div key={event.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                    <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${event.status === "SUCCESS" ? "bg-emerald-500" :
                        event.status === "FAILED" ? "bg-rose-500" : "bg-amber-500"
                      }`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">{event.actor?.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{event.module}</span>
                      </div>

                      <div className="text-xs font-medium text-slate-600 truncate">
                        Performed <span className="font-bold font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-700">{event.action}</span>
                        {event.target && (
                          <> on <span className="font-semibold text-slate-800">{event.target.name}</span></>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {new Date(event.timestamp!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <button className="text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ──────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Investigator Tools</h3>
            <div className="flex flex-col gap-3">
              <Link
                href="/audit/events"
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-lg transition-colors shadow-sm group"
              >
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center border border-slate-200 shadow-sm group-hover:border-indigo-200">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Query Explorer</div>
                  <div className="text-[10px] font-semibold text-slate-500">Search raw log data</div>
                </div>
              </Link>

              <Link
                href="/audit/users"
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-lg transition-colors shadow-sm group"
              >
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center border border-slate-200 shadow-sm group-hover:border-indigo-200">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">User Activity</div>
                  <div className="text-[10px] font-semibold text-slate-500">Trace employee actions</div>
                </div>
              </Link>

              <button 
                onClick={handleGenerateReport}
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg transition-colors shadow-sm text-left w-full"
              >
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center border border-slate-200 shadow-sm">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Generate Compliance Report</div>
                  <div className="text-[10px] font-semibold text-slate-500">Export filtered dataset</div>
                </div>
              </button>
            </div>
          </div>

          {isPrivileged && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg text-white">
              <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" /> Security Notice
              </h3>
              <p className="text-xs font-medium text-slate-400 leading-relaxed">
                Multiple failed login attempts detected from IP <code className="bg-slate-800 px-1 py-0.5 rounded text-rose-400">192.168.1.45</code> targeting systemic accounts.
              </p>
              <button className="mt-4 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                Investigate IP Address
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
