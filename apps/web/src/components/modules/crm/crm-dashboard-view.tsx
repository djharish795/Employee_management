"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, CheckCircle2, AlertCircle, ChevronRight, RefreshCw,
  Download, ExternalLink, Briefcase, Activity, ArrowRight,
  PhoneCall, StickyNote, TrendingUp, Heart, Loader2
} from 'lucide-react';
import { crmApi } from '@/lib/api/crm';
import { PersonalAttendanceWidget } from '@/components/shared/personal-attendance-widget';
import { CheckInButton } from '@/components/shared/check-in-button';
import toast, { Toaster } from 'react-hot-toast';
import { PremiumDashboardLayout, PremiumCard } from '@/components/shared/premium-dashboard';
import { formatDistanceToNow } from 'date-fns';

const ACTION_ICONS: Record<string, React.ReactNode> = {
  'Note Added':            <StickyNote className="w-3.5 h-3.5" />,
  'Call Logged':           <PhoneCall className="w-3.5 h-3.5" />,
  'Stage Updated':         <TrendingUp className="w-3.5 h-3.5" />,
  'Health Status Updated': <Heart className="w-3.5 h-3.5" />,
  'Transferred to CRM':   <ArrowRight className="w-3.5 h-3.5" />,
};

const ACTION_COLORS: Record<string, string> = {
  'Note Added':            'bg-blue-50 text-blue-600',
  'Call Logged':           'bg-emerald-50 text-emerald-600',
  'Stage Updated':         'bg-indigo-50 text-indigo-600',
  'Health Status Updated': 'bg-amber-50 text-amber-600',
  'Transferred to CRM':   'bg-purple-50 text-purple-600',
};

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

  useEffect(() => { fetchDashboardData(); }, []);

  const handleExport = () => {
    if (!pipelineData?.clients?.length) return toast.error("No active clients to export.");
    const headers = ["Company", "Industry", "Stage", "Health", "Updated Date"];
    const rows = pipelineData.clients.map((c: any) => [
      `"${c.company || 'Unknown'}"`, `"${c.industry || 'Unknown'}"`,
      `"Stage ${c.stage || 1}"`, `"${c.clientHealth || c.health || 'ON TRACK'}"`,
      `"${new Date(c.updatedDate || c.createdAt).toLocaleDateString()}"`
    ]);
    const blob = new Blob([[headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n")], { type: 'text/csv;charset=utf-8;' });
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

  const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (isLoading || !pipelineData || !activityData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const kpiCards = [
    { label: "Total Clients",        value: pipelineData.totalClients || 0,         icon: Users,        color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-100" },
    { label: "Active Requirements",  value: pipelineData.activeRequirements || 0,   icon: Briefcase,    color: "text-purple-600",  bg: "bg-purple-50",  border: "border-purple-100" },
    { label: "Pending Clarification",value: pipelineData.pendingClarification || 0, icon: AlertCircle,  color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100" },
    { label: "Completed Deals",      value: pipelineData.completedDeals || 0,       icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  ];

  return (
    <PremiumDashboardLayout className="flex flex-col">
      <Toaster position="top-right" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">CRM Dashboard</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Client portfolio snapshot for {todayFormatted}</p>
        </div>
        <div className="flex items-center gap-3">
          <CheckInButton />
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4 text-slate-500" /> Export CRM Report
          </button>
        </div>
      </div>

      <PersonalAttendanceWidget />

      {/* KPI Cards Row — matching OM dashboard style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard hoverLift decorativeGradient className="p-5 flex flex-col justify-between border-blue-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Total Clients</p>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-3xl font-black text-slate-900">{pipelineData.totalClients || 0}</h3>
            <span className="text-xs font-medium text-slate-500">active clients</span>
          </div>
        </PremiumCard>

        <PremiumCard hoverLift decorativeGradient className="p-5 flex flex-col justify-between border-purple-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Active Requirements</p>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-3xl font-black text-purple-600">{pipelineData.activeRequirements || 0}</h3>
            <span className="text-xs font-medium text-slate-500">open items</span>
          </div>
        </PremiumCard>

        <PremiumCard hoverLift decorativeGradient className="p-5 flex flex-col justify-between border-amber-200">
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Clarification</p>
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-3xl font-black text-amber-500">{pipelineData.pendingClarification || 0}</h3>
            <span className="text-xs font-medium text-slate-500">awaiting input</span>
          </div>
        </PremiumCard>

        <PremiumCard hoverLift decorativeGradient className="p-5 flex flex-col justify-between border-emerald-200">
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Deals</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-3xl font-black text-emerald-500">{pipelineData.completedDeals || 0}</h3>
            <span className="text-xs font-medium text-slate-500">deals closed</span>
          </div>
        </PremiumCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Client Pipeline */}
        <div className="lg:col-span-2">
          <PremiumCard className="overflow-hidden p-0">
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Active Client Pipeline</h2>
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
                        <Link href="/crm/workspace" className="font-bold text-slate-900 hover:text-indigo-600 hover:underline flex items-center gap-1.5">
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
        <PremiumCard className="flex flex-col overflow-hidden p-0 max-h-[480px]">
          <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-900">Recent CRM Activity</h2>
            </div>
            <button onClick={fetchDashboardData} title="Refresh" className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-slate-100">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {activityData && activityData.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {activityData.map((activity: any, idx: number) => {
                  const iconClass = ACTION_COLORS[activity.action] || 'bg-slate-100 text-slate-500';
                  const icon = ACTION_ICONS[activity.action] || <ChevronRight className="w-3.5 h-3.5" />;
                  let timeAgo = 'Recently';
                  try {
                    const ts = activity.createdAt || activity.timestamp;
                    if (ts && !isNaN(new Date(ts).getTime())) {
                      timeAgo = formatDistanceToNow(new Date(ts), { addSuffix: true });
                    }
                  } catch { /* ignore */ }
                  return (
                    <div key={idx} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                      <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${iconClass}`}>{icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{activity.action}</p>
                        <p className="text-xs font-medium text-slate-800 leading-snug">{activity.description}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">{timeAgo}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center space-y-2">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-1">
                  <Activity className="w-4 h-4 text-slate-300" />
                </div>
                <p className="text-xs font-semibold">No recent activity yet</p>
                <p className="text-[10px] text-slate-400">Client interactions like stage updates, notes, and calls will appear here in real time</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 text-center shrink-0 bg-slate-50/50">
            <Link href="/crm/reports" className="text-[11px] font-bold tracking-wide text-indigo-600 hover:text-indigo-700 uppercase">
              View Full History
            </Link>
          </div>
        </PremiumCard>
      </div>
    </PremiumDashboardLayout>
  );
}
