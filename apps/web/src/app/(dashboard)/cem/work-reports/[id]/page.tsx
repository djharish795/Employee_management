"use client";

import React from "react";
import { PremiumDashboardLayout, PremiumCard } from '@/components/shared/premium-dashboard';
import { FileText, ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import useSWR from 'swr';
import { apiClient } from '@/lib/api/client';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export default function WorkReportViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: report, error, isLoading } = useSWR(`/work-reports/${params.id}`, fetcher);

  if (isLoading) {
    return (
      <PremiumDashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      </PremiumDashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <PremiumDashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-500 font-medium">Report not found or you don't have access.</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 text-blue-600 font-bold hover:underline"
          >
            Go Back
          </button>
        </div>
      </PremiumDashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "text-emerald-600 bg-emerald-50";
      case "REJECTED": return "text-rose-600 bg-rose-50";
      case "NEEDS_REVISION": return "text-amber-600 bg-amber-50";
      default: return "text-blue-600 bg-blue-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED": return <CheckCircle2 className="w-5 h-5" />;
      case "REJECTED": return <XCircle className="w-5 h-5" />;
      case "NEEDS_REVISION": return <Clock className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <PremiumDashboardLayout className="space-y-6 max-w-4xl mx-auto w-full">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <PremiumCard className="p-0 overflow-hidden border border-slate-200">
        <div className="border-b border-slate-100 bg-slate-50/50 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 rounded-md">
                  {report.reportType}
                </span>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                  report.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                  report.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                  report.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {report.priority} PRIORITY
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{report.title}</h1>
              <p className="text-sm text-slate-500 mt-2">
                Submitted on {new Date(report.submittedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm ${getStatusColor(report.status)}`}>
              {getStatusIcon(report.status)}
              {report.status.replace('_', ' ')}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Detailed Report Content
            </h3>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
              {report.content?.details || "No content provided."}
            </div>
          </div>

          {report.rejectionReason && (
            <div>
              <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-500" />
                Reviewer Feedback
              </h3>
              <div className="bg-rose-50 rounded-xl p-5 border border-rose-100 text-rose-700 text-sm leading-relaxed whitespace-pre-wrap">
                {report.rejectionReason}
              </div>
            </div>
          )}
        </div>
      </PremiumCard>
    </PremiumDashboardLayout>
  );
}
