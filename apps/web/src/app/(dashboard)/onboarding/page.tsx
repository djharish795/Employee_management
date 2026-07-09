"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, FileText, RefreshCw, CheckCircle2, ChevronRight, Settings, Plus, Filter, SortDesc, Calendar, User, AlignLeft, Search, Bell, Monitor, BookOpen, MessageSquare, AlertCircle, Info } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export default function OnboardingPage() {
  const role = useAuthStore((state) => state.role);
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''});
  
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['onboarding-metrics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/onboarding/dashboard');
      return data;
    },
    enabled: role === "HR"
  });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({show: false, message: ''}), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message: string) => {
    setToast({ show: true, message });
  };
  
  // Protect route: Only HR can access
  if (role !== "HR") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm">Only HR personnel can view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Employees / Onboarding</div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Onboarding</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Manage new joiners and track their integration lifecycle.</p>
          </div>
          <Link href="/onboarding/new" className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> New Onboarding
          </Link>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight w-20">Upcoming Joiners</div>
              <Users className="w-5 h-5 text-slate-700" />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-slate-900">{isLoading ? '-' : metrics?.upcomingJoiners || 0}</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight w-20">Pending Documents</div>
              <FileText className="w-5 h-5 text-rose-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{isLoading ? '-' : metrics?.pendingDocuments || 0}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight w-20">In Progress</div>
              <RefreshCw className="w-5 h-5 text-slate-700" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{isLoading ? '-' : metrics?.inProgress || 0}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight w-20">Completed (30D)</div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{isLoading ? '-' : metrics?.completed30Days || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Onboarding Pipeline */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-8">Onboarding Pipeline</h3>
              <div className="flex items-center justify-between relative px-4">
                
                {(() => {
                  const pipelineStages = [
                    { id: 'offerAccepted', label: 'Offer Accepted', icon: CheckCircle2, value: metrics?.pipeline?.offerAccepted || 0 },
                    { id: 'documentation', label: 'Documentation', icon: FileText, value: metrics?.pipeline?.documentation || 0 },
                    { id: 'assetAllocation', label: 'Asset Allocation', icon: Monitor, value: metrics?.pipeline?.assetAllocation || 0 },
                    { id: 'training', label: 'Training', icon: BookOpen, value: metrics?.pipeline?.training || 0 },
                    { id: 'managerIntro', label: 'Manager Intro', icon: MessageSquare, value: metrics?.pipeline?.managerIntro || 0 },
                    { id: 'completed', label: 'Completed', icon: CheckCircle2, value: metrics?.completed30Days || 0 }
                  ];

                  const furthestActiveIndex = pipelineStages.reduce((maxIdx, stage, idx) => {
                    return stage.value > 0 ? Math.max(maxIdx, idx) : maxIdx;
                  }, 0);

                  const lineWidth = `${(furthestActiveIndex / (pipelineStages.length - 1)) * 100}%`;

                  return (
                    <>
                      {/* Connecting Line */}
                      <div className="absolute top-6 left-12 right-12 h-1 bg-slate-100 rounded-full z-0">
                        <div className="h-full bg-slate-900 rounded-full transition-all duration-500 ease-in-out" style={{ width: lineWidth }}></div>
                      </div>

                      {/* Steps */}
                      {pipelineStages.map((stage, idx) => {
                        const hasPeople = stage.value > 0;
                        const StageIcon = stage.icon;

                        return (
                          <div key={stage.id} className={`flex flex-col items-center gap-2 relative z-10 w-20 ${!hasPeople ? 'opacity-70' : ''}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors duration-500 ${hasPeople ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              <StageIcon className="w-5 h-5" />
                            </div>
                            <div className={`text-xs font-bold text-center leading-tight ${hasPeople ? 'text-slate-900' : 'text-slate-500'}`}>
                              {stage.label}
                            </div>
                            <div className={`text-sm font-bold mt-1 ${hasPeople ? 'text-slate-900' : 'text-slate-500'}`}>
                              {isLoading ? '-' : stage.value}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}

              </div>
            </div>

            {/* Active Onboarding Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Active Onboarding <span className="text-slate-500 font-medium">({metrics?.inProgress || 0} total)</span></h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => showToast("Filter functionality coming soon!")} className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600"><Filter className="w-4 h-4" /></button>
                  <button onClick={() => showToast("Sorting functionality coming soon!")} className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600"><SortDesc className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {isLoading ? (
                  <div className="col-span-2 py-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full"></div></div>
                ) : metrics?.activeOnboarding?.length > 0 ? (
                  metrics.activeOnboarding.map((session: any) => (
                    <div key={session.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                            {session.employee.firstName[0]}{session.employee.lastName[0]}
                          </div>
                          <div>
                            <div className="text-[13px] font-bold text-slate-900">{session.employee.firstName} {session.employee.lastName}</div>
                            <div className="text-[11px] font-medium text-slate-500">{session.employee.employeeId}</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-900 text-[9px] font-bold uppercase tracking-wider rounded border border-slate-200">{session.stage.replace('_', ' ')}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] mb-5">
                        <div className="flex items-center gap-2 text-slate-600 font-medium col-span-2"><Calendar className="w-3.5 h-3.5" /> Started: {new Date(session.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="mt-auto">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          <span>Checklist Progress</span>
                          <span className="text-slate-700">
                            {session.tasks?.filter((t:any) => t.isCompleted).length || 0}/{session.tasks?.length || 4} Steps
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                          <div className="h-full bg-slate-900 transition-all" style={{ width: `${((session.tasks?.filter((t:any) => t.isCompleted).length || 0) / (session.tasks?.length || 4)) * 100}%`}}></div>
                        </div>
                        <Link href={`/onboarding/${session.id}`} className="w-full text-right text-xs font-bold text-slate-900 hover:text-slate-900 flex justify-end items-center">
                          View Details <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-10 text-center text-sm text-slate-500">No active onboarding sessions.</div>
                )}

              </div>
            </div>

          </div>

          {/* Right Column (Span 1) */}
          <div className="space-y-6">
            
            {/* Pending HR Tasks */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-900">Pending HR Tasks</h3>
                <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">3</div>
              </div>
              <div className="space-y-4 mb-4">
                {isLoading ? (
                  <div className="text-center py-4"><div className="animate-spin w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full mx-auto"></div></div>
                ) : metrics?.pendingHrTasks?.length > 0 ? (
                  metrics.pendingHrTasks.map((task: any) => (
                    <div key={task.id} className="flex items-start gap-3">
                      <input type="checkbox" className="mt-1 border-slate-300 rounded text-slate-900 focus:ring-slate-900" />
                      <div>
                        <Link href={`/onboarding/${task.sessionId}`} className="text-[13px] font-bold text-slate-900 hover:underline">{task.title}</Link>
                        <div className="text-[11px] font-medium text-slate-500">{task.session?.employee?.firstName} {task.session?.employee?.lastName}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs font-medium text-slate-500">No pending HR tasks!</div>
                )}
              </div>
              <button onClick={() => showToast("Full task view coming soon!")} className="w-full text-center text-xs font-bold text-slate-900 hover:text-slate-900 uppercase tracking-wider pt-2 border-t border-slate-100">
                View All Tasks
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6">Recent Activity</h3>
              <div className="relative border-l border-slate-200 ml-2 space-y-6">
                {isLoading ? (
                  <div className="text-center py-4"><div className="animate-spin w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full mx-auto"></div></div>
                ) : metrics?.recentActivity?.length > 0 ? (
                  metrics.recentActivity.map((log: any) => (
                    <div key={log.id} className="relative pl-5">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center">
                        <CheckCircle2 className="w-2.5 h-2.5 text-slate-600" />
                      </div>
                      <p className="text-[13px] text-slate-700 leading-snug">
                        <span className="font-bold text-slate-900">{log.actor?.firstName} {log.actor?.lastName}</span> {log.action.toLowerCase()} ({log.resource})
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-1">{new Date(log.performedAt).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs font-medium text-slate-500">No recent activity.</div>
                )}
              </div>
            </div>

            {/* Onboarding Health */}
            <div className="bg-slate-900 rounded-xl p-6 shadow-md text-white">
              <h3 className="text-sm font-bold text-blue-100 mb-2">Onboarding Health</h3>
              <p className="text-[13px] font-medium leading-relaxed mb-6">
                94% of new joiners are satisfied with their first week experience.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">JD</div>
                  <div className="w-8 h-8 rounded-full bg-blue-300 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-950">MK</div>
                  <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-950">ER</div>
                </div>
                <span className="text-[11px] font-bold text-blue-200">+12 more this month</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Custom Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 z-50">
          <Info className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
