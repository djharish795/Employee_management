"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { apiClient } from "@/lib/api/client";
import { PremiumDashboardLayout, PremiumCard } from "@/components/shared/premium-dashboard";
import {
  ArrowLeft, Target, Calendar, Clock, MapPin, User, Phone,
  FileText, CheckCircle2, XCircle, Loader2, Download, AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/auth";

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

const StatusBadge = ({ status }: { status: string }) => {
  const s = status?.toUpperCase();
  const classes: Record<string, string> = {
    PENDING:  "bg-amber-100 text-amber-700 border border-amber-200",
    APPROVED: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    REJECTED: "bg-rose-100 text-rose-700 border border-rose-200",
    DRAFT:    "bg-slate-100 text-slate-600 border border-slate-200",
    CANCELLED:"bg-slate-100 text-slate-600 border border-slate-200",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${classes[s] || "bg-slate-100 text-slate-600 border border-slate-200"}`}>
      {status}
    </span>
  );
};

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-sm font-semibold text-slate-800">{value || "—"}</p>
  </div>
);

export default function FieldReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { employeeId } = useAuthStore();
  const [actionPending, setActionPending] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: report, error, isLoading, mutate } = useSWR(
    id ? `/field-work-requests/${id}` : null,
    fetcher
  );

  const handleApprove = async () => {
    setActionPending(true);
    try {
      await apiClient.post(`/field-work-requests/${id}/approve`);
      toast.success("Field report approved! The employee has been notified.");
      mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve report.");
    } finally {
      setActionPending(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return toast.error("Please provide a rejection reason.");
    setActionPending(true);
    try {
      await apiClient.post(`/field-work-requests/${id}/reject`, { reason: rejectReason });
      toast.success("Field report rejected. The employee has been notified.");
      setShowRejectModal(false);
      mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject report.");
    } finally {
      setActionPending(false);
    }
  };

  const handleDownloadPdf = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/field-work-requests/${id}/pdf`, "_blank");
  };

  if (isLoading) {
    return (
      <PremiumDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </PremiumDashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <PremiumDashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="w-12 h-12 text-rose-400" />
          <p className="text-slate-600 font-semibold">Field report not found or access denied.</p>
          <button onClick={() => router.back()} className="text-sm font-bold text-blue-600 hover:text-blue-700">
            ← Go back
          </button>
        </div>
      </PremiumDashboardLayout>
    );
  }

  const isPending = report.status === "PENDING";
  const formattedDate = report.date
    ? new Date(report.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <PremiumDashboardLayout className="p-0 bg-transparent min-h-0 space-y-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Field Report Detail</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Review the full request before taking action</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={report.status} />
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* Employee info strip */}
      <PremiumCard className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-slate-900">{report.employeeName || `${report.employee?.firstName} ${report.employee?.lastName}`}</p>
            <p className="text-sm text-slate-500 font-medium">{report.department || report.employee?.department?.name || "Operations"}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Employee ID</p>
            <p className="text-sm font-bold text-slate-700">{report.employeeId || report.employee?.employeeId || "—"}</p>
          </div>
        </div>
      </PremiumCard>

      {/* Core trip details */}
      <PremiumCard className="p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-500" /> Trip Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Field label="Date of Visit" value={formattedDate} />
          <Field label="Start Time" value={report.startTime} />
          <Field label="End Time" value={report.endTime} />
          <Field label="Return Time" value={report.returnTime} />
          <Field label="Transportation" value={report.transportation} />
          <Field label="Client" value={report.client} />
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <Field label="Destination" value={report.destination} />
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <Field label="Contact at Site" value={report.contact} />
          </div>
        </div>
      </PremiumCard>

      {/* Purpose & Description */}
      <PremiumCard className="p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" /> Purpose & Description
        </h2>
        <div className="space-y-4">
          <Field label="Purpose of Visit" value={report.purpose} />
          {report.description && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Detailed Description</p>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">{report.description}</p>
            </div>
          )}
          {report.remarks && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Additional Remarks</p>
              <p className="text-sm text-slate-700 leading-relaxed bg-amber-50 p-4 rounded-lg border border-amber-100">{report.remarks}</p>
            </div>
          )}
          {report.rejectionReason && (
            <div>
              <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1.5">Rejection Reason</p>
              <p className="text-sm text-rose-700 leading-relaxed bg-rose-50 p-4 rounded-lg border border-rose-100">{report.rejectionReason}</p>
            </div>
          )}
        </div>
      </PremiumCard>

      {/* Action buttons — only show if PENDING and not the requester */}
      {isPending && !report.isOwnRequest && (
        <PremiumCard className="p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-900">Awaiting your decision</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">This request is pending your approval or rejection.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={actionPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm shadow-emerald-600/20 disabled:opacity-50"
              >
                {actionPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Approve
              </button>
            </div>
          </div>
        </PremiumCard>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="h-1.5 bg-rose-500" />
            <div className="p-6">
              <h3 className="text-base font-bold text-slate-900 mb-1">Reject Field Report</h3>
              <p className="text-sm text-slate-500 mb-4">Please provide a reason. The employee will be notified immediately.</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Destination details are incomplete. Please resubmit."
                rows={4}
                className="w-full text-sm border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 resize-none"
              />
              <div className="flex gap-3 mt-4 justify-end">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionPending || !rejectReason.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PremiumDashboardLayout>
  );
}
