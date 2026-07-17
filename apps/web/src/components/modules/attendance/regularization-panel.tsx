"use client";
import { usePermissions } from "@/hooks/use-permissions";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, FileText, CheckCircle2, XCircle, Clock, Trash2, ArrowRight } from "lucide-react";
import { RegularizationRequest } from "@/types/attendance";

interface RegularizationPanelProps {
  activeRole: "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
}

import { fetchRegularizations, submitRegularization, actionRegularization } from "@/lib/api/attendance";

export default function RegularizationPanel() {
  const { role } = usePermissions();
  const activeRole = role as any;
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // Form Fields
  const [reqDate, setReqDate] = useState("");
  const [reqReason, setReqReason] = useState("");
  const [reqType, setReqType] = useState<"MISSING_PUNCH" | "INCORRECT_TIME" | "WFH_MARKING">("MISSING_PUNCH");
  const [fileName, setFileName] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: requests = [], refetch } = useQuery<RegularizationRequest[]>({
    queryKey: ["attendanceRegularizations"],
    queryFn: fetchRegularizations,
  });

  // Calculate requests based on role scope
  const filteredRequests = useMemo(() => {
    // Managers and HR review all pending team actions, regular employees see their own list
    return requests;
  }, [requests]);

  // Mutations
  const submitMutation = useMutation({
    mutationFn: submitRegularization,
    onSuccess: () => {
      refetch();
    },
  });

  const actionMutation = useMutation({
    mutationFn: (args: { id: string, action: "APPROVE" | "REJECT", approver: "MANAGER" | "HR" }) =>
      actionRegularization(args.id, args.action, args.approver),
    onSuccess: () => {
      refetch();
    },
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqDate || !reqReason) return;

    submitMutation.mutate({
      attendanceDate: reqDate, // API will parse this
      reason: reqReason,
      correctionType: reqType,
      attachmentName: fileName || undefined,
    });

    // Reset Form
    setReqDate("");
    setReqReason("");
    setReqType("MISSING_PUNCH");
    setFileName("");
    setShowForm(false);
  };

  const handleActionRequest = (id: string, action: "APPROVE" | "REJECT", approver: "MANAGER" | "HR") => {
    actionMutation.mutate({ id, action, approver });
  };

  const handleDeleteRequest = (id: string) => {
    // No delete implemented in backend for now, you can just ignore or add if needed
    console.warn("Delete not supported yet", id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* List Panel (Left/Center) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/30">
            <h3 className="text-sm font-bold text-slate-900">Correction Requests</h3>
            {!showForm && activeRole !== "CTO" && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New Request
              </button>
            )}
          </div>

          {filteredRequests.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <h4 className="text-sm font-bold text-slate-700">No requests submitted</h4>
              <p className="text-xs mt-1">Submit corrections using the form.</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((req) => {
                  const showReviewActions =
                    (activeRole === "MANAGER" && req.managerStatus === "PENDING") ||
                    ((activeRole === "HR" || activeRole === "ADMIN") && req.hrStatus === "PENDING");

                  return (
                    <div key={req.id} className="p-5 flex flex-col sm:flex-row justify-between items-start gap-4 hover:bg-slate-50/20 transition-colors">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {req.id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold text-slate-900 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {req.correctionType.replace("_", " ")}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {req.employeeName ? `${req.employeeName} • ` : ""}
                            Date: {req.attendanceDate}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-normal font-semibold max-w-xl pr-4">
                          {req.reason}
                        </p>
                        {req.attachmentName && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md w-fit font-bold">
                            <FileText className="w-3 h-3 text-slate-400" />
                            {req.attachmentName}
                          </div>
                        )}
                        {req.comments && (
                          <div className="text-[10px] font-bold text-slate-400 italic">
                            Remark: {req.comments}
                          </div>
                        )}

                        {/* Request Horizontal Timeline */}
                        <div className="flex items-center gap-3 pt-2 text-[10px] font-semibold text-slate-500">
                          <div className="flex items-center gap-1 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-300" />
                          <div
                            className={`flex items-center gap-1 font-bold ${req.managerStatus === "APPROVED"
                                ? "text-emerald-600"
                                : req.managerStatus === "REJECTED"
                                  ? "text-rose-600"
                                  : "text-amber-500"
                              }`}
                          >
                            {req.managerStatus === "APPROVED" ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : req.managerStatus === "REJECTED" ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}{" "}
                            Manager
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-300" />
                          <div
                            className={`flex items-center gap-1 font-bold ${req.hrStatus === "APPROVED"
                                ? "text-emerald-600"
                                : req.hrStatus === "REJECTED"
                                  ? "text-rose-600"
                                  : "text-amber-500"
                              }`}
                          >
                            {req.hrStatus === "APPROVED" ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : req.hrStatus === "REJECTED" ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}{" "}
                            HR Manager
                          </div>
                        </div>
                      </div>

                      {/* Pending review approvals for privileged roles */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {showReviewActions ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleActionRequest(
                                  req.id,
                                  "REJECT",
                                  activeRole === "MANAGER" ? "MANAGER" : "HR"
                                )
                              }
                              className="h-8 px-3 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold shadow-sm transition-all"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() =>
                                handleActionRequest(
                                  req.id,
                                  "APPROVE",
                                  activeRole === "MANAGER" ? "MANAGER" : "HR"
                                )
                              }
                              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                            >
                              Approve
                            </button>
                          </div>
                        ) : (
                          activeRole === "EMPLOYEE" && req.managerStatus === "PENDING" && (
                            <button
                              onClick={() => handleDeleteRequest(req.id)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="text-sm font-medium text-slate-500">
                  Showing <span className="font-bold text-slate-900">
                    {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredRequests.length)}
                  </span> of <span className="font-bold text-slate-900">{filteredRequests.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white shadow-sm transition-all text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Prev
                  </button>
                  <button className="flex items-center justify-center w-8 h-8 text-xs font-bold bg-slate-900 text-white rounded-lg shadow-sm">
                    {currentPage}
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredRequests.length / itemsPerPage), p + 1))}
                    disabled={currentPage === Math.ceil(filteredRequests.length / itemsPerPage)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 bg-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Form Panel (Right) */}
      <div className="space-y-6">
        {showForm && (
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Submit Regularization</h4>
              <button onClick={() => setShowForm(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Date of Correction</label>
                <input
                  type="date"
                  required
                  value={reqDate}
                  onChange={(e) => setReqDate(e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Correction Type</label>
                <select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value as any)}
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-lg bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                >
                  <option value="MISSING_PUNCH">Missing Punch</option>
                  <option value="INCORRECT_TIME">Incorrect Time Logged</option>
                  <option value="WFH_MARKING">Remote WFH Attendance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Reason / Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain why the regularization is required..."
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  className="w-full p-3.5 border border-slate-200 rounded-lg text-xs leading-normal font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/20 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Attachment (Optional)</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                  className="w-full text-xs font-semibold text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer cursor-pointer border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Submit Request
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
