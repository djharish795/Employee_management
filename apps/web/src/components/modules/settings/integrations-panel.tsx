"use client";

import React from "react";
import { Plug, KeyRound, ExternalLink, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { SettingsRole, IntegrationStatus } from "@/types/settings";

interface IntegrationsPanelProps {
  activeRole: SettingsRole;
}

const MOCK_INTEGRATIONS: IntegrationStatus[] = [
  { id: "INT-001", provider: "Microsoft 365", category: "SSO", isConnected: true, lastSync: "2023-11-23T10:00:00Z", health: "GOOD" },
  { id: "INT-002", provider: "Google Workspace", category: "SSO", isConnected: false, health: "UNKNOWN" },
  { id: "INT-003", provider: "Slack", category: "COMMUNICATION", isConnected: true, lastSync: "2023-11-23T10:30:00Z", health: "GOOD" },
  { id: "INT-004", provider: "Microsoft Teams", category: "COMMUNICATION", isConnected: false, health: "UNKNOWN" },
  { id: "INT-005", provider: "AWS S3", category: "STORAGE", isConnected: true, lastSync: "2023-11-23T10:45:00Z", health: "GOOD" },
  { id: "INT-006", provider: "Razorpay Payroll", category: "HRIS", isConnected: true, lastSync: "2023-11-22T00:00:00Z", health: "FAILING" },
];

export default function IntegrationsPanel({ activeRole }: IntegrationsPanelProps) {
  const canManage = ["SUPER_ADMIN", "ADMIN", "IT_ADMIN"].includes(activeRole);

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900">App Integrations & APIs</h2>
          <p className="text-xs font-semibold text-slate-500">Connect third-party services and manage API keys.</p>
        </div>
        {canManage && (
          <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg shadow-sm transition-colors">
            <KeyRound className="w-4 h-4" /> Generate API Key
          </button>
        )}
      </div>

      {/* Connected Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_INTEGRATIONS.map((app) => (
          <div key={app.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Plug className={`w-6 h-6 ${app.isConnected ? 'text-indigo-600' : 'text-slate-400'}`} />
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  app.isConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {app.isConnected ? 'Connected' : 'Not Connected'}
                </div>
              </div>
              
              <h3 className="text-sm font-bold text-slate-900">{app.provider}</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{app.category}</p>
              
              {app.isConnected && app.lastSync && (
                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-medium text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  Last synced: {new Date(app.lastSync).toLocaleString()}
                </div>
              )}
              
              {app.health === "FAILING" && (
                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" /> API Sync Failing (Check Auth)
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              {app.isConnected ? (
                <>
                  <button disabled={!canManage} className="flex-1 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5" /> Configure
                  </button>
                  <button disabled={!canManage} className="px-4 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50">
                    Disconnect
                  </button>
                </>
              ) : (
                <button disabled={!canManage} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  <Plug className="w-3.5 h-3.5" /> Connect Integration
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
