"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { apiClient } from "@/lib/api/client";
import { PremiumDashboardLayout, PremiumCard } from "@/components/shared/premium-dashboard";
import {
  ArrowLeft, Target, Calendar, Clock, MapPin, Phone,
  FileText, Loader2, Download, AlertCircle, Edit, Trash2, Save, X
} from "lucide-react";
import { toast } from "react-hot-toast";

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
  const searchParams = useSearchParams();
  const initialEditMode = searchParams.get('edit') === 'true';
  
  const [isEditMode, setIsEditMode] = useState(initialEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const { data: report, error, isLoading, mutate } = useSWR(
    id ? `/field-work-requests/${id}` : null,
    fetcher
  );

  useEffect(() => {
    if (report && !Object.keys(formData).length) {
      setFormData({
        date: report.date ? new Date(report.date).toISOString().split('T')[0] : "",
        startTime: report.startTime || "",
        endTime: report.endTime || "",
        returnTime: report.returnTime || "",
        transportation: report.transportation || "",
        client: report.client || "",
        destination: report.destination || "",
        contact: report.contact || "",
        purpose: report.purpose || "",
        description: report.description || "",
        remarks: report.remarks || ""
      });
    }
  }, [report, formData]);

  const handleDownloadPdf = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/field-work-requests/${id}/pdf`, "_blank");
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiClient.patch(`/field-work-requests/${id}`, formData);
      toast.success("Field request updated successfully");
      setIsEditMode(false);
      mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update request");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this field request? This action cannot be undone.")) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/field-work-requests/${id}`);
      toast.success("Field request deleted");
      router.push("/oe/field-requests");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete request");
      setIsDeleting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
            onClick={() => router.push("/oe/field-requests")}
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
          
          {isPending && !isEditMode && (
            <>
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-bold hover:bg-amber-100 transition-colors shadow-sm"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm font-bold hover:bg-rose-100 transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
              </button>
            </>
          )}

          {isEditMode && (
            <>
              <button
                onClick={() => setIsEditMode(false)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors shadow-sm"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
              </button>
            </>
          )}

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
          {isEditMode ? (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Date of Visit</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Start Time</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">End Time</label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Return Time</label>
                <input type="time" name="returnTime" value={formData.returnTime} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Transportation</label>
                <input type="text" name="transportation" value={formData.transportation} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Client</label>
                <input type="text" name="client" value={formData.client} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          ) : (
            <>
              <Field label="Date of Visit" value={formattedDate} />
              <Field label="Start Time" value={report.startTime} />
              <Field label="End Time" value={report.endTime} />
              <Field label="Return Time" value={report.returnTime} />
              <Field label="Transportation" value={report.transportation} />
              <Field label="Client" value={report.client} />
            </>
          )}
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-start gap-3 w-full">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            {isEditMode ? (
              <div className="w-full">
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Destination</label>
                <input type="text" name="destination" value={formData.destination} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            ) : (
              <Field label="Destination" value={report.destination} />
            )}
          </div>
          <div className="flex items-start gap-3 w-full">
            <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            {isEditMode ? (
              <div className="w-full">
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Contact at Site</label>
                <input type="text" name="contact" value={formData.contact} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            ) : (
              <Field label="Contact at Site" value={report.contact} />
            )}
          </div>
        </div>
      </PremiumCard>

      {/* Purpose & Description */}
      <PremiumCard className="p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" /> Purpose & Description
        </h2>
        <div className="space-y-4">
          {isEditMode ? (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Purpose of Visit</label>
                <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Detailed Description</label>
                <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Additional Remarks</label>
                <textarea name="remarks" rows={2} value={formData.remarks} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          ) : (
            <>
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
            </>
          )}

          {report.rejectionReason && !isEditMode && (
            <div>
              <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1.5">Rejection Reason</p>
              <p className="text-sm text-rose-700 leading-relaxed bg-rose-50 p-4 rounded-lg border border-rose-100">{report.rejectionReason}</p>
            </div>
          )}
        </div>
      </PremiumCard>

    </PremiumDashboardLayout>
  );
}
