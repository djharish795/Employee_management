"use client";

import { usePermissions } from "@/hooks/use-permissions";
import React, { useState, useEffect } from "react";
import { Plug, KeyRound, ExternalLink, Activity, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { SettingsRole, IntegrationStatus } from "@/types/settings";
import { apiClient } from "@/lib/api/client";
import toast from "react-hot-toast";

interface IntegrationsPanelProps {}

export default function IntegrationsPanel() {
  const { isAdmin: canManage } = usePermissions();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const { data } = await apiClient.get('/settings/health');
        setIntegrations(data);
      } catch (err) {
        toast.error("Failed to load integrations health");
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900">System Health & Integrations</h2>
          <p className="text-xs font-semibold text-slate-500">Monitor active services and check system infrastructure health.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading system health...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {integrations.map((app) => (
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
              <div className="flex-1 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Managed via AWS Secrets Manager
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

    </div>
  );
}
