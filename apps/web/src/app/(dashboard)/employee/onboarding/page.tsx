"use client";

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { CheckCircle2, Loader2, FileText, ChevronRight, CheckCircle, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DPDPAConsentModal } from '@/components/modules/onboarding/dpdpa-consent-modal';

export default function EmployeeOnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''});
  
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({show: false, message: ''}), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['my-onboarding-session'],
    queryFn: async () => {
      const res = await apiClient.get('/onboarding/me');
      return res.data;
    }
  });

  const { data: consentStatus, isLoading: isConsentLoading } = useQuery({
    queryKey: ['dpdpa-consent-status'],
    queryFn: async () => {
      const res = await apiClient.get('/compliance/consents/me/status');
      return res.data;
    }
  });

  const submitDocument = useMutation({
    mutationFn: async ({ taskId, documentKey }: { taskId: string, documentKey: string }) => {
      const res = await apiClient.post(`/onboarding/me/tasks/${taskId}/submit-document`, { documentKey });
      return res.data;
    },
    onSuccess: () => {
      setToast({ show: true, message: 'Task completed successfully!' });
      queryClient.invalidateQueries({ queryKey: ['my-onboarding-session'] });
    }
  });

  if (isLoading || isConsentLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  if (error || !session) return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">Failed to load your onboarding session.</div>;

  const myTasks = session.tasks.filter((t: any) => t.assignedTo === 'Employee');

  const handleUploadClick = (taskId: string) => {
    // Mock S3 upload completion
    submitDocument.mutate({ taskId, documentKey: `mock_document_${Date.now()}.pdf` });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {consentStatus && !consentStatus.hasConsented && (
        <DPDPAConsentModal onConsentGiven={() => {}} />
      )}
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-8 py-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Naprocs!</h1>
            <p className="text-indigo-100 max-w-lg">
              We are so excited to have you on board. Please complete the following tasks to finish setting up your account.
            </p>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Your Tasks</h2>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-full border border-indigo-100">
                Stage: {session.stage.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-4">
              {myTasks.length === 0 ? (
                <p className="text-slate-500 text-sm">You have no pending tasks at the moment.</p>
              ) : (
                myTasks.map((task: any) => (
                  <div key={task.id} className="flex items-start gap-4 p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md transition-all group">
                    <div className="mt-0.5">
                      {task.isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-indigo-400 transition-colors" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`text-base font-bold ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {task.isCompleted ? 'Completed.' : (task.description?.startsWith('Document uploaded') ? 'Document submitted for review.' : 'Action required.')}
                      </p>
                      
                      {!task.isCompleted && (
                        <div className="mt-4">
                          {task.description?.startsWith('Document uploaded') ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Pending HR Review
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleUploadClick(task.id)}
                              disabled={submitDocument.isPending}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                              <UploadCloud className="w-4 h-4" />
                              {submitDocument.isPending ? 'Processing...' : 'Upload Document'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-10 bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900">What happens next?</h4>
                <p className="text-sm text-emerald-800/80 mt-1">
                  Once you complete your tasks, HR will review your documents. Keep an eye on your email for the welcome call schedule!
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {toast.show && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
