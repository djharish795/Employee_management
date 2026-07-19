"use client";

import { usePermissions } from "@/hooks/use-permissions";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { assetsApi } from "@/lib/api/assets";
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Laptop,
  Monitor,
  Smartphone,
  Headphones,
  ChevronDown,
  Send,
  AlertCircle,
} from "lucide-react";
import { AssetCategory, AssetRequest, AssetRole } from "@/types/assets";
import { FulfillRequestDialog } from "./asset-action-dialogs";

interface RequestsPanelProps {
  
}


const CATEGORY_OPTIONS: { value: AssetCategory; label: string; icon: React.ElementType }[] = [
  { value: "LAPTOP", label: "Laptop", icon: Laptop },
  { value: "MONITOR", label: "Monitor", icon: Monitor },
  { value: "MOBILE_DEVICE", label: "Mobile Device", icon: Smartphone },
  { value: "SIM", label: "SIM Card", icon: Smartphone },
  { value: "ACCESS_CARD", label: "Access Card", icon: Package },
  { value: "SOFTWARE_LICENCE", label: "Software Licence", icon: Monitor },
  { value: "CLOUD_ACCOUNT", label: "Cloud Account", icon: Monitor },
  { value: "OTHER", label: "Other", icon: Package },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-amber-700 bg-amber-50 border border-amber-100",
  PENDING_OM_SELECTION: "text-amber-700 bg-amber-50 border border-amber-100",
  PENDING_CEO_APPROVAL: "text-blue-700 bg-blue-50 border border-blue-100",
  APPROVED: "text-emerald-700 bg-emerald-50 border border-emerald-100",
  REJECTED: "text-rose-700 bg-rose-50 border border-rose-100",
  FULFILLED: "text-slate-900 bg-slate-100 border border-slate-200",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  PENDING: Clock,
  PENDING_OM_SELECTION: Clock,
  PENDING_CEO_APPROVAL: Clock,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
  FULFILLED: CheckCircle2,
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-slate-600 bg-slate-100",
  MEDIUM: "text-amber-700 bg-amber-50 border border-amber-100",
  HIGH: "text-orange-700 bg-orange-50 border border-orange-100",
  URGENT: "text-rose-700 bg-rose-50 border border-rose-100",
};

const STORAGE_KEY = "naprocs_asset_requests"; // kept for legacy cleanup only

export default function RequestsPanel() {
  const { role } = usePermissions();
  const activeRole = role as any;
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const forceEmployee = pathname?.includes('/assets/my');
  const isEmployeeLevelRole = ["EMPLOYEE", "MANAGER", "TEAM_LEAD", "CRM", "CEM", "OE"].includes(activeRole);
  const isEmployee = forceEmployee || isEmployeeLevelRole;
  const { isAdmin } = usePermissions();
  const canApprove = (isAdmin || activeRole === "CEO" || activeRole === "OM") && !isEmployee;

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: "",
    assetCategory: "LAPTOP" as AssetCategory,
    justification: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    requestType: "GENERAL" as "GENERAL" | "ONBOARDING" | "OFFBOARDING",
    targetEmployeeId: "",
  });
  const isHRUser = isAdmin || activeRole === "HR";
  const [requestToFulfill, setRequestToFulfill] = useState<AssetRequest | null>(null);

  const { data: rawRequests = [], isLoading } = useQuery({
    queryKey: ["assetRequests", isEmployee],
    queryFn: () => assetsApi.listRequests(undefined, isEmployee ? 'my' : undefined),
    staleTime: 30_000,
  });

  // Map WorkflowInstance shape → AssetRequest UI shape
  const requests: AssetRequest[] = useMemo(() => {
    return rawRequests.map((r: any) => {
      const meta = r.metadata ?? {};
      return {
        id: r.id,
        initiatorId: r.requester?.id || r.initiatedById,
        requestedBy: r.requester
          ? `${r.requester.firstName} ${r.requester.lastName}`
          : r.initiatedBy
            ? `${r.initiatedBy.firstName} ${r.initiatedBy.lastName}`
            : "Unknown",
        targetEmployeeName: r.employee
          ? `${r.employee.firstName} ${r.employee.lastName}`
          : null,
        requestedByAvatar: (r.requester || r.initiatedBy)
          ? `https://api.dicebear.com/7.x/notionists/svg?seed=${(r.requester || r.initiatedBy).firstName}`
          : "",
        department: r.employee?.department?.name ?? r.initiatedBy?.department?.name ?? "",
        assetCategory: (meta.category ?? "OTHER") as AssetCategory,
        description: r.reason || meta.description || `Request for ${r.employee?.firstName || 'Employee'}`,
        justification: r.reason || meta.justification || (Array.isArray(r.requestedItems) ? r.requestedItems.join(", ") : ""),
        priority: (meta.priority ?? "MEDIUM") as AssetRequest["priority"],
        status: r.status as AssetRequest["status"],
        requestDate: new Date(r.createdAt).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        }),
        responseDate: r.completedAt
          ? new Date(r.completedAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })
          : null,
        respondedBy: meta.respondedById ?? null,
        currentStepIndex: r.currentStepIndex ?? 0,
        requestType: (r.type || meta.requestType || "GENERAL") as "GENERAL" | "ONBOARDING" | "OFFBOARDING",
      };
    });
  }, [rawRequests]);

  const submitMutation = useMutation({
    mutationFn: (payload: { 
      category: AssetCategory; 
      description: string; 
      justification: string; 
      priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      requestType?: "GENERAL" | "ONBOARDING" | "OFFBOARDING";
      targetEmployeeId?: string;
    }) => assetsApi.createRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assetRequests"] });
      setShowForm(false);
      setForm({ description: "", assetCategory: "LAPTOP", justification: "", priority: "MEDIUM", requestType: "GENERAL", targetEmployeeId: "" });
    },
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) =>
      assetsApi.respondToRequest(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assetRequests"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      category: form.assetCategory,
      description: form.description,
      justification: form.justification,
      priority: form.priority,
      requestType: form.requestType,
      targetEmployeeId: form.targetEmployeeId || undefined,
    });
  };

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            {isEmployee ? "My Requests" : "Asset Requests"}
          </h2>
          {pendingCount > 0 && (
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {pendingCount} request{pendingCount !== 1 ? "s" : ""} awaiting review
            </p>
          )}
        </div>
        {(isEmployee || isHRUser) && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Request
          </button>
        )}
      </div>

      {/* Request Form */}
      {showForm && (
        <div className="bg-white border border-violet-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">New Asset Request</h3>
              <p className="text-[11px] font-medium text-slate-500">Your request will be reviewed by IT Admin</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isHRUser && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                      Request Type
                    </label>
                    <div className="relative">
                      <select
                        value={form.requestType}
                        onChange={(e) => setForm((f) => ({ ...f, requestType: e.target.value as any }))}
                        className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                      >
                        <option value="REGULAR">General (For Myself)</option>
                        <option value="ONBOARDING">Onboarding (New Hire)</option>
                        <option value="OFFBOARDING">Offboarding (Exit)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  {(form.requestType === "ONBOARDING" || form.requestType === "OFFBOARDING") && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                        Target Employee ID *
                      </label>
                      <input
                        type="text"
                        value={form.targetEmployeeId}
                        onChange={(e) => setForm((f) => ({ ...f, targetEmployeeId: e.target.value }))}
                        placeholder="Employee ID (e.g. EMP123)"
                        className="w-full px-3.5 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                        required
                      />
                    </div>
                  )}
                </>
              )}
              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Asset Category *
                </label>
                <div className="relative">
                  <select
                    value={form.assetCategory}
                    onChange={(e) => setForm((f) => ({ ...f, assetCategory: e.target.value as AssetCategory }))}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                    required
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              {/* Priority */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Priority *
                </label>
                <div className="relative">
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as typeof form.priority }))}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Brief Description *
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Dual monitor setup for design work"
                className="w-full px-3.5 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                required
              />
            </div>
            {/* Justification */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Business Justification *
              </label>
              <textarea
                value={form.justification}
                onChange={(e) => setForm((f) => ({ ...f, justification: e.target.value }))}
                placeholder="Explain why this asset is needed for your work…"
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-none"
                required
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 sm:flex-initial px-5 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />
                {submitMutation.isPending ? "Submitting…" : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-3">
        {requests.map((req) => {
          const StatusIcon = STATUS_ICONS[req.status] || Clock;
          return (
            <div
              key={req.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Avatar + Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    <img
                      src={req.requestedByAvatar}
                      alt={req.requestedBy}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {req.targetEmployeeName 
                          ? `${req.targetEmployeeName} (Req by: ${req.requestedBy})`
                          : req.requestedBy}
                      </span>
                      {req.requestType === "ONBOARDING" && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Onboarding</span>
                      )}
                      {req.requestType === "OFFBOARDING" && (
                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Offboarding</span>
                      )}
                      <span className="text-[10px] font-semibold text-slate-400">{req.department}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${PRIORITY_COLORS[req.priority]}`}>
                        {req.priority}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mt-1">{req.description}</div>
                    <div className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-2">
                      {req.justification}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2.5">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Package className="w-3 h-3" />
                        {req.assetCategory.replace(/_/g, " ")}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Clock className="w-3 h-3" />
                        {req.requestDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col items-end gap-3 min-w-[120px] ml-auto">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      req.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : req.status === "REJECTED"
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : "bg-amber-50 text-amber-600 border border-amber-200"
                    }`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {req.status}
                  </div>

                  {req.status === "REJECTED" && (
                    <div className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100 text-center w-full whitespace-nowrap mt-2">
                      Rejected by {req.currentStepIndex === 0 ? "Operations Manager" : "CEO"}
                    </div>
                  )}

                  {req.status === "APPROVED" && (
                    <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 text-center w-full whitespace-nowrap mt-2">
                      {req.requestType === "OFFBOARDING" ? "Returned by OM" : "Approved by CEO"}
                    </div>
                  )}

                  {canApprove && (
                    <>
                      {activeRole === "OM" && req.status === "PENDING_CEO_APPROVAL" && (
                        <div className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100 text-center w-full whitespace-nowrap mt-2">
                          Sent to CEO for Final Approval
                        </div>
                      )}
                      
                      {activeRole === "CEO" && req.status === "PENDING_OM_SELECTION" && (
                        <div className="text-xs font-semibold text-slate-500 italic mt-2">
                          Awaiting OM approval
                        </div>
                      )}
                      
                      {((activeRole === "OM" && req.status === "PENDING_OM_SELECTION") || 
                        (activeRole === "CEO" && req.status === "PENDING_CEO_APPROVAL")) && (
                        <div className="flex gap-2 w-full mt-2">
                          <Link 
                            href="/approvals/assets"
                            className="flex-1 px-3 py-2 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm text-center"
                          >
                            Review & Process
                          </Link>
                        </div>
                      )}

                      {/* Legacy Workflow Instance Fallback */}
                      {req.status === "PENDING" && (
                        <div className="flex gap-2 w-full mt-2">
                          <Link 
                            href="/approvals/assets"
                            className="flex-1 px-3 py-2 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm text-center"
                          >
                            Review & Process
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {requests.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">No asset requests yet.</p>
          </div>
        )}
      </div>

      <FulfillRequestDialog 
        request={requestToFulfill} 
        onClose={() => setRequestToFulfill(null)} 
      />
    </div>
  );
}
