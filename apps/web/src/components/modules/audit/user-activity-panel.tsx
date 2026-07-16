"use client";
import { usePermissions } from "@/hooks/use-permissions";

import React from "react";
import { Search, History, MousePointerClick, ShieldCheck, UserCog, Briefcase, FileText } from "lucide-react";
import { AuditRole, AuditEvent } from "@/types/audit";
import Image from "next/image";

interface UserActivityPanelProps {

}

const USER_TIMELINE: Partial<AuditEvent>[] = [
  {
    id: "LOG-9921",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    action: "PERMISSION_GRANTED",
    module: "AUTH",
    details: "Granted 'View Payroll' to employee group [Engineering]",
    status: "SUCCESS"
  },
  {
    id: "LOG-9917",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    action: "LEAVE_APPROVED",
    module: "LEAVES",
    target: { id: "LV-1002", name: "Arjun Mehta (Sick Leave)", type: "SYSTEM" },
    details: "Approved via Email Workflow",
    status: "SUCCESS"
  },
  {
    id: "LOG-9915",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    action: "PROFILE_UPDATED",
    module: "EMPLOYEES",
    target: { id: "EMP-106", name: "Anita M.", type: "USER" },
    details: "Updated reporting manager to EMP-103",
    status: "SUCCESS"
  },
  {
    id: "LOG-9910",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    action: "DATA_EXPORTED",
    module: "EMPLOYEES",
    target: { id: "REP-44", name: "Q3 Headcount Report", type: "REPORT" },
    details: "Exported to CSV via Dashboard",
    status: "WARNING"
  },
  {
    id: "LOG-9905",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    action: "LOGIN_SUCCESS",
    module: "AUTH",
    details: "Authenticated via MFA (Okta)",
    status: "SUCCESS"
  }
];

function getIconForAction(action: string) {
  switch (action) {
    case "PERMISSION_GRANTED": return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    case "LEAVE_APPROVED": return <Briefcase className="w-4 h-4 text-indigo-600" />;
    case "PROFILE_UPDATED": return <UserCog className="w-4 h-4 text-slate-900" />;
    case "DATA_EXPORTED": return <FileText className="w-4 h-4 text-amber-600" />;
    case "LOGIN_SUCCESS": return <MousePointerClick className="w-4 h-4 text-teal-600" />;
    default: return <History className="w-4 h-4 text-slate-600" />;
  }
}

export default function UserActivityPanel() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">

      {/* ── Left Sidebar (Search User) ─────────────────────────────────── */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Target User</h2>
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              defaultValue="Lokesh Kumar"
              className="w-full h-10 pl-9 pr-3 text-sm font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm border border-slate-200 overflow-hidden">
              <Image src="https://api.dicebear.com/7.x/notionists/svg?seed=Lokesh" alt="Lokesh" fill style={{ objectFit: "cover" }} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Lokesh Kumar</div>
              <div className="text-[10px] font-semibold text-slate-500">Chief Technology Officer</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">User Profile Metadata</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-slate-400">EMP ID</span>
              <span className="text-[10px] font-mono font-bold text-slate-900">EMP-101</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-slate-400">LAST LOGIN</span>
              <span className="text-[10px] font-mono font-bold text-slate-900">2 mins ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-slate-400">ACCOUNT STATUS</span>
              <span className="text-[10px] font-bold text-emerald-600">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Column (Timeline) ────────────────────────────────────── */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[700px]">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Activity Timeline</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Chronological record of user actions across all modules.</p>
          </div>
          <button className="text-xs font-bold text-indigo-600 border border-indigo-200 bg-white hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
            Download Timeline
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative border-l-2 border-slate-200 ml-6 space-y-8 py-2">
            {USER_TIMELINE.map((event, index) => {
              const d = new Date(event.timestamp!);
              const dateStr = d.toLocaleDateString();
              const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={event.id} className="relative pl-8 group">
                  {/* Timeline Dot with Icon */}
                  <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${event.action === "DATA_EXPORTED" ? "bg-amber-100" :
                      event.action === "PERMISSION_GRANTED" ? "bg-emerald-100" :
                        "bg-slate-100"
                    }`}>
                    {getIconForAction(event.action!)}
                  </div>

                  {/* Content */}
                  <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-indigo-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {event.module}
                        </span>
                        <span className="text-xs font-bold text-slate-900 font-mono tracking-tight">
                          {event.action}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900">{dateStr}</div>
                        <div className="text-[10px] font-mono text-slate-500">{timeStr}</div>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                      {event.details}
                      {event.target && (
                        <> Target entity: <span className="font-bold text-indigo-700">{event.target.name}</span></>
                      )}
                    </p>

                    {event.status === "WARNING" && (
                      <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold px-3 py-2 rounded-lg flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5" /> High volume data export flagged by automated policy.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <button className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
              Load Older Activity
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
