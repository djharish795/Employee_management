"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, ShieldAlert, User, Search, Loader2, AlertCircle, HelpCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { fetchApprovals, approveLeave, rejectLeave, ApiLeaveRequest } from "@/lib/api/leaves";

interface ApprovalsPanelProps {
  activeRole: "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
}

// Format ISO date to "20 Jun 2026"
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function ApprovalsPanel({ activeRole }: ApprovalsPanelProps) {
  const queryClient = useQueryClient();
  const accessToken  = useAuthStore((state) => state.accessToken);
  const [selected, setSelected] = useState<ApiLeaveRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("PENDING");

  // ── Derive approverId (employee UUID) from auth token / localStorage ───────
  const approverId = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("auth-storage");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?.state?.employeeId ?? null;
      }
    } catch {}
    return null;
  }, []);

  // ── Fetch approval queue from backend ─────────────────────────────────────
  const { data: requests = [], isLoading, error } = useQuery<ApiLeaveRequest[]>({
    queryKey: ["leave-approvals", approverId],
    queryFn: () => fetchApprovals(approverId!),
    enabled: !!approverId,
    staleTime: 30_000,
    retry: 1,
  });

  // ── Filter / search ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...requests];
    if (filterStatus) result = result.filter((r) => r.status === filterStatus);
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      result = result.filter((r) => {
        const name = r.employee
          ? `${r.employee.firstName} ${r.employee.lastName}`.toLowerCase()
          : "";
        const dept = r.employee?.department?.name?.toLowerCase() ?? "";
        return name.includes(q) || dept.includes(q) || r.reason.toLowerCase().includes(q);
      });
    }
    return result;
  }, [requests, filterStatus, filterSearch]);

  // ── Approve mutation ───────────────────────────────────────────────────────
  const approveMutation = useMutation({
    mutationFn: ({ leaveId }: { leaveId: string }) =>
      approveLeave(leaveId, approverId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-approvals"] });
      setSelected(null);
    },
  });

  // ── Reject mutation ────────────────────────────────────────────────────────
  const rejectMutation = useMutation({
    mutationFn: ({ leaveId, reason }: { leaveId: string; reason: string }) =>
      rejectLeave(leaveId, approverId!, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-approvals"] });
      setSelected(null);
      setRejectReason("");
      setShowRejectBox(false);
    },
  });

  const handleApprove = () => {
    if (!selected || !approverId) return;
    approveMutation.mutate({ leaveId: selected.id });
  };

  const handleReject = () => {
    if (!selected || !approverId) return;
    rejectMutation.mutate({ leaveId: selected.id, reason: rejectReason || "Rejected by approver" });
  };

  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

      {/* ── Approval Queue Table ──────────────────────────────────────────── */}
      <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/20">
          <h3 className="text-sm font-bold text-slate-900">Approvals Queue</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[150px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 bg-white focus:outline-none cursor-pointer"
            >
              <option value="PENDING">Pending Action</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <p className="text-xs font-bold">Loading approvals...</p>
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center text-slate-400">
            <AlertCircle className="w-7 h-7 text-rose-400 mb-2" />
            <p className="text-sm font-bold text-slate-700">Could not load queue</p>
            <p className="text-xs mt-1 text-slate-400">Check your backend connection</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <User className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700">No requests found</h4>
            <p className="text-xs mt-1">
              {filterStatus === "PENDING"
                ? "Approval queue is clear — great work!"
                : "No requests match the selected filter."}
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Leave Type</th>
                <th className="px-5 py-3">Dates</th>
                <th className="px-5 py-3 text-center">Days</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
              {filtered.map((req) => (
                <tr
                  key={req.id}
                  onClick={() => { setSelected(req); setShowRejectBox(false); setRejectReason(""); }}
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                    selected?.id === req.id ? "bg-slate-100/40" : ""
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">
                      {req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : "—"}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                      {req.employee?.department?.name ?? req.employeeId}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 uppercase text-[9px] tracking-wide text-slate-500 font-bold">
                    {req.leaveType?.name ?? req.leaveTypeId}
                  </td>
                  <td className="px-5 py-3.5">
                    {fmtDate(req.startDate)} – {fmtDate(req.endDate)}
                  </td>
                  <td className="px-5 py-3.5 text-center font-bold text-slate-900">{req.totalDays}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                        req.status === "APPROVED"
                          ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                          : req.status === "PENDING"
                          ? "text-amber-700 bg-amber-50 border border-amber-100"
                          : "text-rose-700 bg-rose-50 border border-rose-100"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Detail / Action Panel ─────────────────────────────────────────── */}
      <div className="xl:col-span-1">
        {selected ? (
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">

            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Request Details</h4>
              <button
                onClick={() => { setSelected(null); setShowRejectBox(false); }}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            {/* Overlap warning for pending */}
            {selected.status === "PENDING" && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-[11px] leading-relaxed font-bold flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-extrabold text-amber-800">Pending Approval</span>
                  This request is waiting for your decision.
                </div>
              </div>
            )}

            {/* Employee info */}
            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-900 border border-slate-200/50">
                  {selected.employee
                    ? `${selected.employee.firstName[0]}${selected.employee.lastName[0]}`
                    : "—"}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900 leading-none">
                    {selected.employee
                      ? `${selected.employee.firstName} ${selected.employee.lastName}`
                      : selected.employeeId}
                  </h5>
                  <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                    {selected.employee?.department?.name ?? "Department N/A"}
                  </span>
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-2">
                {[
                  { label: "Leave Type", value: selected.leaveType?.name ?? selected.leaveTypeId, mono: false },
                  { label: "Start Date",  value: fmtDate(selected.startDate), mono: true },
                  { label: "End Date",    value: fmtDate(selected.endDate),   mono: true },
                  { label: "Total Days",  value: `${selected.totalDays} Days`,mono: false },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-400">{label}</span>
                    <span className={`font-bold text-slate-900 ${mono ? "font-mono text-[11px]" : ""}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Reason</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-normal max-h-24 overflow-y-auto">
                  {selected.reason}
                </p>
              </div>

              {/* Approval queue progress */}
              {selected.approvalQueue && selected.approvalQueue.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    Approval Progress
                  </span>
                  <div className="flex flex-col gap-2">
                    {selected.approvalQueue.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                            step.status === "APPROVED"
                              ? "bg-emerald-100 border-emerald-200 text-emerald-700"
                              : step.status === "REJECTED"
                              ? "bg-rose-100 border-rose-200 text-rose-700"
                              : idx === (selected.currentStep ?? 0)
                              ? "bg-amber-100 border-amber-200 text-amber-700 animate-pulse"
                              : "bg-slate-50 border-slate-200 text-slate-400"
                          }`}
                        >
                          {step.status === "APPROVED" ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : step.status === "REJECTED" ? (
                            <X className="w-3.5 h-3.5" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <div className="flex-1 flex justify-between items-center bg-slate-50 border border-slate-100 rounded p-2">
                          <span className="font-bold text-slate-800 text-xs">{step.role}</span>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              step.status === "APPROVED"
                                ? "text-emerald-700 bg-emerald-50"
                                : step.status === "REJECTED"
                                ? "text-rose-700 bg-rose-50"
                                : "text-slate-500 bg-slate-100"
                            }`}
                          >
                            {step.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection reason (if already rejected) */}
              {selected.status === "REJECTED" && selected.rejectionReason && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg">
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wide mb-1">Rejection Reason</p>
                  <p className="text-xs text-rose-700">{selected.rejectionReason}</p>
                </div>
              )}

              {/* Action buttons — only if PENDING and user is an approver (not CEO, not EMPLOYEE) */}
              {selected.status === "PENDING" && !["CEO", "EMPLOYEE"].includes(activeRole) && approverId && (
                <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                  {!showRejectBox ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowRejectBox(true)}
                        disabled={isMutating}
                        className="flex-1 h-9 border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        onClick={handleApprove}
                        disabled={isMutating}
                        className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {approveMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <><Check className="w-3.5 h-3.5" /> Approve</>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        placeholder="Reason for rejection (optional)..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-rose-400/30"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowRejectBox(false)}
                          className="flex-1 h-8 border border-slate-200 text-slate-500 font-bold text-xs rounded-lg hover:bg-slate-50 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={isMutating}
                          className="flex-1 h-8 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {rejectMutation.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            "Confirm Reject"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CEO sees read-only — no action buttons */}
              {selected.status === "PENDING" && activeRole === "CEO" && (
                <div className="pt-3 border-t border-slate-100 p-3 bg-slate-50 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-wide">
                    Read-only view — HR manages leave approvals
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/50 border border-slate-200 border-dashed p-8 rounded-xl text-center text-slate-400">
            <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold">Select a request row to inspect details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
