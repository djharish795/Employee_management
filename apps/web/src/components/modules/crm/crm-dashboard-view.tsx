"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Download,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { crmApi } from '@/lib/api/crm';
import { PersonalAttendanceWidget } from '@/components/shared/personal-attendance-widget';
import { CheckInButton } from '@/components/shared/check-in-button';
import toast, { Toaster } from 'react-hot-toast';
import { PremiumDashboardLayout, PremiumCard } from '@/components/shared/premium-dashboard';

export default function CrmDashboardView() {
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [activityData, setActivityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [pipelineRes, activityRes] = await Promise.all([
        crmApi.getPipelineSummary(),
        crmApi.getRecentActivity()
      ]);
      setPipelineData(pipelineRes.data?.data || pipelineRes.data || {});
      const actData = activityRes.data?.data || activityRes.data || [];
      setActivityData(Array.isArray(actData) ? actData : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load CRM dashboard summary.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleExport = () => {
    if (!pipelineData || !pipelineData.clients || pipelineData.clients.length === 0) {
      toast.error("No active clients to export.");
      return;
    }

    const headers = ["Company", "Industry", "Stage", "Health", "Updated Date"];
    const rows = pipelineData.clients.map((c: any) => [
      `"${c.company || 'Unknown'}"`,
      `"${c.industry || 'Unknown'}"`,
      `"Stage ${c.stage || 1}"`,
      `"${c.clientHealth || c.health || 'ON TRACK'}"`,
      `"${new Date(c.updatedDate || c.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `crm_pipeline_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("CRM Report exported successfully.");
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (isLoading || !pipelineData || !activityData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <PremiumDashboardLayout className="flex flex-col">
      <Toaster position="top-right" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">CRM Dashboard</h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Client Portfolio snapshot for {todayFormatted}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CheckInButton />
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold capitalize tracking-wide text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4 text-slate-500" /> Export CRM Report
          </button>
        </div>
      </div>

      <PersonalAttendanceWidget />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard className="p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight w-24">Total Clients</span>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{pipelineData.totalClients || 0}</h3>
        </PremiumCard>

        <PremiumCard className="p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight w-24">Active Requirements</span>
            <Briefcase className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{pipelineData.activeRequirements || 0}</h3>
        </PremiumCard>

        <PremiumCard className="p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight w-24">Pending Clarification</span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{pipelineData.pendingClarification || 0}</h3>
        </PremiumCard>

        <PremiumCard className="p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight w-24">Completed Deals</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{pipelineData.completedDeals || 0}</h3>
        </PremiumCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Client Pipeline */}
          <PremiumCard className="overflow-hidden p-0">
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Active Client Pipeline
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 capitalize bg-slate-50/50">
                    <th className="py-4 px-6">Company</th>
                    <th className="py-4 px-3">Industry</th>
                    <th className="py-4 px-3 text-center">Stage</th>
                    <th className="py-4 px-6 text-right">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                  {pipelineData.clients && pipelineData.clients.length > 0 ? pipelineData.clients.map((client: any) => (
                    <tr key={client.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6">
                        <Link href="/crm/workspace" className="text-left font-bold text-slate-900 hover:text-indigo-600 hover:underline flex items-center gap-1.5">
                          {client.company}
                          <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>
                      <td className="py-4 px-3 text-slate-500 font-medium">{client.industry}</td>
                      <td className="py-4 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                          Stage {client.stage || 1}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${(client.clientHealth || client.health) === 'REVIEW NEEDED' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                          {client.clientHealth || client.health || 'ON TRACK'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-xs font-semibold text-slate-400">
                        No active clients in the pipeline at this time.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="py-4 text-center border-t border-slate-100 bg-slate-50/30">
              <Link href="/crm/workspace" className="inline-flex items-center gap-1 text-xs font-bold capitalize tracking-wide text-slate-500 hover:text-indigo-600 transition-colors">
                Go to Workspace <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </PremiumCard>
        </div>

        {/* Recent Activity */}
        <PremiumCard className="flex flex-col h-full overflow-hidden p-0">
          <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Recent CRM Activity</h2>
            <button onClick={fetchDashboardData} className="text-slate-400 hover:text-indigo-600 transition-colors">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {activityData && activityData.length > 0 ? (
              <div className="space-y-1">
                {activityData.map((activity: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="mt-0.5 p-1.5 bg-indigo-50 text-indigo-600 rounded-full shrink-0">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">{activity.description}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-1">{new Date(activity.timestamp || activity.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center space-y-2">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-1">
                  <RefreshCw className="w-4 h-4 text-slate-300" />
                </div>
                <p className="text-xs font-medium">No recent activity detected</p>
                <p className="text-[10px]">Client interactions will appear here</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 text-center mt-auto bg-slate-50/50">
            <Link href="/crm/reports" className="text-[11px] font-bold tracking-wide text-indigo-600 hover:text-indigo-700 uppercase">
              View Full History
            </Link>
          </div>
        </PremiumCard>
      </div>
    </PremiumDashboardLayout>
  );
}
