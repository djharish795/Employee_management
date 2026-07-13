"use client";
import { usePermissions } from "@/hooks/use-permissions";


import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Info, Loader2, AlertCircle, User, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { fetchApprovals, approveLeave, rejectLeave, ApiLeaveRequest } from "@/lib/api/leaves";
import Image from "next/image";

interface ApprovalsPanelProps {
  activeRole: "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
}

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export default function ApprovalsPanel() {
  const { role } = usePermissions();
  const activeRole = role as any;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("Pending My Approval");
  const [rejectId, setRejectId] = useState<string | null>(null);

  // Derive approverId
  const approverId = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("auth-storage");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?.state?.employeeId ?? null;
      }
    } catch { }
    return null;
  }, []);

  const { data: requests = [], isLoading, error } = useQuery<ApiLeaveRequest[]>({
    queryKey: ["leave-approvals", approverId],
    queryFn: () => fetchApprovals(approverId!),
    enabled: !!approverId,
  });

  const filtered = useMemo(() => {
    let result = [...requests];
    if (activeTab === "Pending My Approval") result = result.filter((r) => r.status === "PENDING");
    if (activeTab === "Approved this month") result = result.filter((r) => r.status === "APPROVED");
    if (activeTab === "Rejected") result = result.filter((r) => r.status === "REJECTED");
    return result;
  }, [requests, activeTab]);

  const approveMutation = useMutation({
    mutationFn: ({ leaveId }: { leaveId: string }) => approveLeave(leaveId, approverId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leave-approvals"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ leaveId }: { leaveId: string }) => rejectLeave(leaveId, approverId!, "Rejected by HR"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-approvals"] });
      setRejectId(null);
    },
  });

  const tabs = [
    { name: "Pending My Approval", count: requests.filter((r) => r.status === "PENDING").length },
    { name: "Approved this month", count: requests.filter((r) => r.status === "APPROVED").length },
    { name: "Rejected", count: requests.filter((r) => r.status === "REJECTED").length },
    { name: "All requests", count: requests.length },
  ];

  return (
    <div className="w-full max-w-5xl space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900">Leave Approval Queue</h2>
        <div className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          Review and manage leave requests pending your approval
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`pb-3 text-sm font-bold whitespace-nowrap transition-colors relative ${activeTab === tab.name ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
          >
            {tab.name} {tab.count > 0 && <span className={activeTab === tab.name ? "" : "opacity-80"}>({tab.count})</span>}
            {activeTab === tab.name && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="py-20 flex flex-col items-center text-slate-400">
          <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
          <p className="font-bold">Error loading approvals</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-slate-400 border border-slate-200 border-dashed rounded-xl bg-slate-50/50">
          <User className="w-10 h-10 mb-3 text-slate-300" />
          <p className="font-bold">No requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-5">

              {/* Card Top */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-900 border border-slate-200 overflow-hidden">
                    {(req.employee as any)?.photoUrl ? (
                      <Image src={(req.employee as any).photoUrl} alt="Avatar" className="w-full h-full object-cover" fill style={{ objectFit: "cover" }} />
                    ) : (
                      `${req.employee?.firstName?.[0] ?? ""}${req.employee?.lastName?.[0] ?? ""}`
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : "Unknown"}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {(req.employee as any)?.designation?.title ?? "Employee"}
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-orange-100 text-orange-800 text-[10px] font-bold rounded-full uppercase tracking-wide">
                  PENDING MY APPROVAL
                </div>
              </div>

              {/* Leave Info */}
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                  {req.leaveType?.name ?? req.leaveTypeId}
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {fmtDate(req.startDate)} - {fmtDate(req.endDate)} • {req.totalDays} day{req.totalDays > 1 ? "s" : ""}
                </span>
              </div>

              {/* Reason */}
              <div className="text-sm text-slate-600 italic">
                "{req.reason}"
              </div>

              {/* Workflow Flow */}
              {req.approvalQueue && req.approvalQueue.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit overflow-x-auto">
                  <span className="bg-slate-200 px-2 py-1 rounded-full text-slate-700 whitespace-nowrap">
                    {req.employee?.firstName || "Employee"}
                  </span>
                  {req.approvalQueue.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span
                        className={`px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap ${step.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : step.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                      >
                        {step.status === "APPROVED" && <Check className="w-3 h-3" />}
                        {step.status === "REJECTED" && <X className="w-3 h-3" />}
                        {step.role}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-sm font-semibold">
                  <span className="text-slate-500">Leave balance: </span>
                  <span className="text-slate-600 font-bold">
                    {/* @ts-ignore - leaveBalance may be added by backend team later */}
                    {req.employee?.leaveBalance !== undefined ? `${req.employee.leaveBalance} days remaining` : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRejectId(req.id)}
                    disabled={rejectMutation.isPending && rejectId === req.id}
                    className="px-5 py-2 border border-rose-500 text-rose-600 font-bold text-xs rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => approveMutation.mutate({ leaveId: req.id })}
                    disabled={approveMutation.isPending}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              </div>

              {/* Quick reject confirmation (inline) */}
              {rejectId === req.id && (
                <div className="pt-3 flex gap-2">
                  <button onClick={() => setRejectId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button
                    onClick={() => rejectMutation.mutate({ leaveId: req.id })}
                    className="px-3 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 flex items-center gap-2"
                  >
                    {rejectMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm Rejection"}
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
