"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UserPlus, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown,
  RefreshCw, 
  Share2, 
  Play, 
  Download,
  ExternalLink,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { PersonalAttendanceWidget } from '@/components/shared/personal-attendance-widget';
import { CheckInButton } from '@/components/shared/check-in-button';
import toast, { Toaster } from 'react-hot-toast';
import { PremiumDashboardLayout, PremiumCard } from '@/components/shared/premium-dashboard';

export default function CemDashboardPanel() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState('ALL STATUS');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const { data } = await apiClient.get('/cem/leads/dashboard-summary');
      setSummary(data?.data || data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard summary.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleExport = () => toast.success("Report exported successfully.");

  // Current formatted date
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (isLoading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Pre-calculated stats or defaults
  const kpis = summary.kpis || {};
  const activeLeads = summary.activeLeads || [];
  const todaysMeetings = summary.todaysMeetings || [];
  const neglectedClients = summary.neglectedClients || [];
  const readyForCrm = summary.readyForCrm || [];
  const activities = summary.activities || [];

  const STAGE_NAMES = ['NEW LEAD', 'CONTACTED', 'MEETING SCHEDULED', 'FOLLOW UP', 'QUALIFIED LEAD', 'ASSIGNED TO CRM'];

  return (
    <PremiumDashboardLayout className="flex flex-col">
      <Toaster position="top-right" />
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">CEM Executive Dashboard</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Customer engagement snapshot for {todayFormatted}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CheckInButton />
        </div>
      </div>

      <PersonalAttendanceWidget />

      {/* KPI Cards Row — matching OM/CRM dashboard style */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <PremiumCard hoverLift decorativeGradient className="p-5 flex flex-col justify-between border-blue-200">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider leading-tight w-24">New Leads</span>
            <UserPlus className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpis.newLeadsAssigned < 10 ? `0${kpis.newLeadsAssigned}` : kpis.newLeadsAssigned}</h3>
        </PremiumCard>

        <PremiumCard hoverLift decorativeGradient className="p-5 flex flex-col justify-between border-purple-200">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider leading-tight w-24">Follow-ups Due</span>
            <Phone className="w-4.5 h-4.5 text-purple-500 transform -rotate-90" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpis.followUpsDue < 10 ? `0${kpis.followUpsDue}` : kpis.followUpsDue}</h3>
        </PremiumCard>

        <PremiumCard hoverLift decorativeGradient className="p-5 flex flex-col justify-between border-indigo-200">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider leading-tight w-24">Meetings Today</span>
            <Calendar className="w-5 h-5 text-indigo-500" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpis.meetingsScheduled < 10 ? `0${kpis.meetingsScheduled}` : kpis.meetingsScheduled}</h3>
        </PremiumCard>

        <PremiumCard hoverLift decorativeGradient className="p-5 flex flex-col justify-between border-emerald-200">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider leading-tight w-24">Qualified</span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpis.qualifiedForCrm < 10 ? `0${kpis.qualifiedForCrm}` : kpis.qualifiedForCrm}</h3>
        </PremiumCard>

        <PremiumCard hoverLift decorativeGradient className="p-5 flex flex-col justify-between border-rose-200 col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight w-24">Overdue Actions</span>
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
          <h3 className="text-3xl font-black text-rose-600 tracking-tight">{kpis.overdueActions < 10 ? `0${kpis.overdueActions}` : kpis.overdueActions}</h3>
        </PremiumCard>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Action Required & Full-width Meetings) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Action Required Card */}
          <PremiumCard className="overflow-hidden p-0">
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Action Required <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{activeLeads.length}</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 capitalize bg-slate-50/50">
                    <th className="py-4 px-6">Company</th>
                    <th className="py-4 px-3">Contact Person</th>
                    <th className="py-4 px-3 text-center">Current Stage</th>
                    <th className="py-4 px-3">Next Action</th>
                    <th className="py-4 px-6 text-right">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                  {activeLeads.length > 0 ? activeLeads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6">
                        <Link href="/cem/workspace" className="text-left font-bold text-slate-900 hover:text-indigo-600 hover:underline flex items-center gap-1.5">
                          {lead.company}
                          <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>
                      <td className="py-4 px-3 text-slate-500 font-medium">{lead.prospectName}</td>
                      <td className="py-4 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {STAGE_NAMES[lead.stage - 1] || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="py-4 px-3 font-medium text-slate-700">
                        {lead.followUps && lead.followUps.length > 0 
                          ? new Date(lead.followUps[0].dueDate).toLocaleDateString()
                          : 'Needs Follow-up'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${lead.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                          {lead.priority}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-xs font-semibold text-slate-400">
                        No active leads require action at this time.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="py-4 text-center border-t border-slate-100 bg-slate-50/30">
              <Link href="/cem/workspace" className="inline-flex items-center gap-1 text-xs font-bold capitalize tracking-wide text-slate-500 hover:text-indigo-600 transition-colors">
                Go to Workspace <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </PremiumCard>

          {/* Today's Meetings */}
          <PremiumCard className="overflow-hidden p-0">
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Today's Meetings</h2>
              <span className="text-xs font-semibold text-slate-500 capitalize">
                {todaysMeetings.length} Session{todaysMeetings.length !== 1 ? 's' : ''} Scheduled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 capitalize bg-slate-50/50">
                    <th className="py-4 px-6">Company / Prospect</th>
                    <th className="py-4 px-3">Time</th>
                    <th className="py-4 px-3">Meeting Type</th>
                    <th className="py-4 px-3">Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                  {todaysMeetings.length > 0 ? todaysMeetings.map((meeting: any) => (
                    <tr key={meeting.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{meeting.lead?.company || 'Unknown'}</div>
                        <div className="text-[10px] font-medium text-slate-400 mt-0.5">{meeting.lead?.prospectName || 'Unknown'}</div>
                      </td>
                      <td className="py-4 px-3 text-slate-900 font-bold">{meeting.time}</td>
                      <td className="py-4 px-3 text-slate-500 font-medium capitalize">{meeting.type.toLowerCase()}</td>
                      <td className="py-4 px-3">
                        <span className={`inline-block px-2.5 py-0.5 border rounded text-[9px] font-bold capitalize tracking-wide ${
                          meeting.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {meeting.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link href="/cem/meetings" className="px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm inline-block">
                          Hub
                        </Link>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-xs font-semibold text-slate-400">
                        No meetings scheduled for today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </PremiumCard>

          </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-6 flex flex-col">
          
          {/* Ready For Handoff */}
          <PremiumCard className="p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Ready For Handoff
            </h2>
            
            <div className="space-y-3">
              {readyForCrm.length > 0 ? readyForCrm.map((lead: any) => (
                <div key={lead.id} className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:border-slate-300 transition-all bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{lead.company}</h4>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">{lead.prospectName}</p>
                    </div>
                    <span className="text-[9px] font-bold capitalize tracking-wide text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {lead.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-end mt-1 pt-2 border-t border-slate-100">
                    <Link href="/cem/qualification" className="px-3.5 py-1.5 text-[10px] font-bold tracking-wider uppercase text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors">
                      Qualification Pipeline
                    </Link>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-500 italic">No leads ready for handoff yet.</p>
              )}
            </div>
          </PremiumCard>

          {/* Recent Activity */}
          <PremiumCard className="p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              Recent Activity
              <button onClick={fetchDashboardData} className="text-slate-400 hover:text-slate-600">
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </h2>
            
            <div className="relative pl-2 border-l border-slate-100 ml-2.5 space-y-6 py-2">
              {activities.length > 0 ? activities.map((act: any, i: number) => (
                <div key={i} className="relative pl-6">
                  <div className={`absolute -left-[14.5px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                    act.type === 'LEAD' ? 'bg-slate-900 text-white' :
                    act.type === 'MEETING' ? 'bg-indigo-600 text-white' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {act.type === 'LEAD' && <UserPlus className="w-2.5 h-2.5" />}
                    {act.type === 'MEETING' && <Calendar className="w-2.5 h-2.5" />}
                    {act.type === 'FOLLOW_UP' && <Phone className="w-2.5 h-2.5" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 leading-snug">{act.title}</p>
                    <span className="inline-block text-[10px] font-medium text-slate-400 mt-1">
                      {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-400 italic">No recent activity.</p>
              )}
            </div>
          </PremiumCard>

        </div>
      </div>
    </PremiumDashboardLayout>
  );
}
