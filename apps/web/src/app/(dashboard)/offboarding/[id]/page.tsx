"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Bell, CheckCircle2, Circle, Clock, Check, AlertCircle, AlertTriangle, Lock, HelpCircle, Calendar } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

// ─── Interfaces (No Hardcoded Mock Data) ─────────────────────────────────────────
interface ChecklistItem {
  id: number;
  label: string;
  status: 'completed' | 'pending' | 'scheduled' | 'locked' | 'pending_manager';
  text?: string;
}

interface OffboardingProcessData {
  id: string;
  name: string;
  designation: string;
  lastDay: string;
  avatarInitials: string;
  status: string;
  noticePeriod: boolean;
  alert: {
    daysRemaining: number;
    tasksPending: number;
    totalTasks: number;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
    target: string;
  };
  checklists: {
    assetRecovery: ChecklistItem[];
    accountDeactivation: ChecklistItem[];
    finalSettlement: ChecklistItem[];
    knowledgeTransfer: ChecklistItem[];
  };
  exitDetails: {
    resignationDate: string;
    lastWorkingDay: string;
    noticePeriod: string;
    exitType: string;
    exitReason: string;
  };
  exitInterview: {
    status: string;
  };
}

export default function OffboardingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const [data, setData] = useState<OffboardingProcessData | null>(null);
  
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

  const renderChecklistItem = (item: ChecklistItem) => {
    let icon = <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />;
    let textNode = null;
    let textClass = "text-[13px] font-medium text-slate-700";

    if (item.status === "completed") {
      icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
      textNode = <span className="ml-auto text-[11px] font-medium text-slate-500">{item.text}</span>;
    } else if (item.status === "pending") {
      if (item.text) {
        textNode = <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-sm border border-slate-200">{item.text}</span>;
      }
    } else if (item.status === "scheduled") {
      icon = <Clock className="w-5 h-5 text-slate-400 flex-shrink-0" />;
      textClass = "text-[13px] font-medium text-slate-500";
    } else if (item.status === "locked") {
      icon = <Lock className="w-5 h-5 text-slate-600 flex-shrink-0" />;
      textClass = "text-[13px] font-medium text-slate-700";
      textNode = <span className="ml-auto text-[11px] font-medium text-slate-500">{item.text}</span>;
    } else if (item.status === "pending_manager") {
      icon = (
        <div className="w-5 h-5 rounded-full border-2 border-dotted border-slate-400 flex items-center justify-center flex-shrink-0">
          <div className="w-1 h-1 bg-slate-300 rounded-full flex-shrink-0"></div>
        </div>
      );
      textNode = <span className="ml-auto text-[11px] font-bold text-orange-500">{item.text}</span>;
    }

    return (
      <div key={item.id} className="flex items-center gap-3 py-2.5">
        {icon}
        <span className={textClass}>{item.label}</span>
        {textNode}
      </div>
    );
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <Clock className="w-10 h-10 text-slate-300 mb-3 animate-pulse" />
        <h2 className="text-xl font-bold text-slate-800">Waiting for backend data...</h2>
        <p className="mt-2 text-sm">Offboarding details for {params.id} are being fetched.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-slate-600">
          <Link href="/offboarding" className="hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold text-slate-900">
            <Link href="/offboarding" className="text-slate-500 hover:text-slate-900">Offboarding</Link> — {data.name}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <button className="hover:text-slate-900"><Bell className="w-5 h-5" /></button>
          <button className="hover:text-slate-900"><HelpCircle className="w-5 h-5" /></button>
          <div className="w-px h-6 bg-slate-200 mx-2"></div>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">TK</div>
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
        
        {/* Alert Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
          <span className="text-sm font-bold text-orange-800">
            {data.alert.daysRemaining} days remaining until last day. {data.alert.tasksPending} of {data.alert.totalTasks} tasks pending.
          </span>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold">
                {data.avatarInitials}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{data.name}</h1>
                <div className="text-xs font-medium text-slate-600 mt-0.5">
                  {data.designation} • Last day: {data.lastDay}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {data.noticePeriod && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider rounded border border-rose-200">
                      NOTICE PERIOD
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-200">
                    {data.id}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">STATUS</div>
              <div className="text-sm font-bold text-rose-600">{data.status}</div>
            </div>
          </div>
          
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-rose-700">{data.progress.percentage}% complete — {data.progress.completed} of {data.progress.total} tasks done</span>
            <span className="text-xs font-semibold text-slate-500">Target: {data.progress.target}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-rose-700 rounded-full" style={{ width: `${data.progress.percentage}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Checklists) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-8">
            
            {/* Asset Recovery */}
            <div className="mb-8">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Asset Recovery</h3>
              <div className="space-y-1">
                {data.checklists.assetRecovery.map(renderChecklistItem)}
              </div>
            </div>

            <div className="border-t border-slate-100 my-6"></div>

            {/* Account Deactivation */}
            <div className="mb-8">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Account Deactivation (On Last Day)</h3>
              <div className="space-y-1">
                {data.checklists.accountDeactivation.map(renderChecklistItem)}
              </div>
            </div>

            <div className="border-t border-slate-100 my-6"></div>

            {/* Final Settlement */}
            <div className="mb-8">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Final Settlement</h3>
              <div className="space-y-1">
                {data.checklists.finalSettlement.map(renderChecklistItem)}
              </div>
            </div>

            <div className="border-t border-slate-100 my-6"></div>

            {/* Knowledge Transfer */}
            <div>
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Knowledge Transfer</h3>
              <div className="space-y-1">
                {data.checklists.knowledgeTransfer.map(renderChecklistItem)}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Exit Details */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-[15px] font-bold text-slate-900 mb-6">Exit details</h3>
              <div className="space-y-5">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resignation Date</div>
                  <div className="text-[13px] font-semibold text-slate-900">{data.exitDetails.resignationDate}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Working Day</div>
                  <div className="text-[13px] font-semibold text-slate-900">{data.exitDetails.lastWorkingDay}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notice Period</div>
                  <div className="text-[13px] font-semibold text-slate-900">{data.exitDetails.noticePeriod}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Exit Type</div>
                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded border border-slate-200">
                    {data.exitDetails.exitType}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Exit Reason</div>
                  <div className="text-[13px] font-semibold text-slate-900 leading-snug">{data.exitDetails.exitReason}</div>
                </div>
              </div>
            </div>

            {/* Exit Interview */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-[15px] font-bold text-slate-900 mb-5">Exit interview</h3>
              <div className="mb-6">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</div>
                <div className="flex items-center gap-1.5 text-[13px] font-bold text-orange-600">
                  <Calendar className="w-4 h-4" />
                  {data.exitInterview.status}
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-[13px] rounded-lg transition-colors">
                Schedule exit interview
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
