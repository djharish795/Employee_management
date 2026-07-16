"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, ChevronRight, Inbox as InboxIcon } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export default function InboxPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const res = await apiClient.get('/hr/workflows/my-approvals');
      setApprovals(res.data.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const notes = prompt(`Please enter notes for this ${action} (optional):`);
    try {
      await apiClient.post(`/hr/workflows/${id}/${action}`, { notes });
      alert(`Workflow ${action}d successfully`);
      fetchApprovals();
    } catch (e: any) {
      alert(e.response?.data?.message || `Failed to ${action}`);
    }
  };

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50">
      <div className="px-8 py-6 border-b border-slate-200 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <InboxIcon className="w-6 h-6 text-slate-700" /> My Approvals Inbox
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Review and action pending requests assigned to you.</p>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        {isLoading ? (
          <div className="text-slate-500 text-sm font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 animate-spin" /> Loading approvals...
          </div>
        ) : approvals.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
            <InboxIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">You're all caught up!</h3>
            <p className="text-sm text-slate-500 mt-1">There are no pending approvals assigned to you right now.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl">
            {approvals.map(approval => {
              const currentStep = approval.workflow?.steps?.[approval.currentStepIndex];
              return (
                <div key={approval.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider rounded">
                        {approval.resourceType}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 font-mono">{approval.id}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      {approval.workflow?.name} — {currentStep?.title || 'Pending Step'}
                    </h3>
                    <p className="text-sm text-slate-600 mb-2">
                      Initiated by <span className="font-semibold text-slate-900">{approval.initiatedBy?.firstName} {approval.initiatedBy?.lastName}</span> ({approval.initiatedBy?.personalEmail})
                    </p>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Created on {new Date(approval.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction(approval.id, 'reject')}
                      className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button 
                      onClick={() => handleAction(approval.id, 'approve')}
                      className="px-4 py-2 border border-transparent text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
