"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, FileText, CheckCircle2, XCircle, Clock, Trash2, ArrowRight } from "lucide-react";
import { RegularizationRequest } from "@/types/attendance";

interface RegularizationPanelProps {
  activeRole: "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
}

const INITIAL_REQUESTS: RegularizationRequest[] = [
  {
    id: "REG-101",
    attendanceDate: "14 Jun 2026",
    reason: "Forgot to punch out when leaving for off-site customer deployment.",
    correctionType: "MISSING_PUNCH",
    attachmentName: "deployment_log.pdf",
    managerStatus: "PENDING",
    hrStatus: "PENDING",
    submittedDate: "14 Jun 2026",
    comments: "Direct manager review required",
  },
  {
    id: "REG-102",
    attendanceDate: "10 Jun 2026",
    reason: "Late check-in due to office client VPN connectivity issues.",
    correctionType: "INCORRECT_TIME",
    managerStatus: "APPROVED",
    hrStatus: "APPROVED",
    submittedDate: "10 Jun 2026",
    comments: "Approved by Alex Thompson (CEO)",
  },
];

const LOCAL_REGS_KEY = "naprocs_attendance_regularizations";

export default function RegularizationPanel({ activeRole }: RegularizationPanelProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // Form Fields
  const [reqDate, setReqDate] = useState("");
  const [reqReason, setReqReason] = useState("");
  const [reqType, setReqType] = useState<"MISSING_PUNCH" | "INCORRECT_TIME" | "WFH_MARKING">("MISSING_PUNCH");
  const [fileName, setFileName] = useState("");

  const fetchRequests = async (): Promise<RegularizationRequest[]> => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_REGS_KEY);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(LOCAL_REGS_KEY, JSON.stringify(INITIAL_REQUESTS));
    }
    return INITIAL_REQUESTS;
  };

  const { data: requests = [], refetch } = useQuery<RegularizationRequest[]>({
    queryKey: ["attendanceRegularizations"],
    queryFn: fetchRequests,
  });

  // Calculate requests based on role scope
  const filteredRequests = useMemo(() => {
    // Managers and HR review all pending team actions, regular employees see their own list
    return requests;
  }, [requests]);

  // Mutations
  const updateRequestsMutation = useMutation({
    mutationFn: async (updatedList: RegularizationRequest[]) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_REGS_KEY, JSON.stringify(updatedList));
      }
      return updatedList;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["attendanceRegularizations"], data);
      refetch();
    },
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqDate || !reqReason) return;

    const newReq: RegularizationRequest = {
      id: `REG-${Math.floor(100 + Math.random() * 900)}`,
      attendanceDate: new Date(reqDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      reason: reqReason,
      correctionType: reqType,
      attachmentName: fileName || undefined,
      managerStatus: "PENDING",
      hrStatus: "PENDING",
      submittedDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    };

    updateRequestsMutation.mutate([newReq, ...requests]);

    // Reset Form
    setReqDate("");
    setReqReason("");
    setReqType("MISSING_PUNCH");
    setFileName("");
    setShowForm(false);
  };

  const handleActionRequest = (id: string, action: "APPROVE" | "REJECT", approver: "MANAGER" | "HR") => {
    const updated = requests.map((req) => {
      if (req.id === id) {
        const statusVal = action === "APPROVE" ? ("APPROVED" as const) : ("REJECTED" as const);
        if (approver === "MANAGER") {
          return { ...req, managerStatus: statusVal, comments: `Actioned by Manager (${action})` };
        } else {
          return { ...req, hrStatus: statusVal, comments: `Actioned by HR (${action})` };
        }
      }
      return req;
    });
    updateRequestsMutation.mutate(updated);
  };

  const handleDeleteRequest = (id: string) => {
    const updated = requests.filter((req) => req.id !== id);
    updateRequestsMutation.mutate(updated);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* List Panel (Left/Center) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/30">
            <h3 className="text-sm font-bold text-slate-900">Correction Requests</h3>
            {!showForm && (
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
            <div className="divide-y divide-slate-100">
              {filteredRequests.map((req) => {
                const showReviewActions =
                  (activeRole === "MANAGER" && req.managerStatus === "PENDING") ||
                  ((activeRole === "HR" || activeRole === "ADMIN") && req.hrStatus === "PENDING");

                return (
                  <div key={req.id} className="p-5 flex flex-col sm:flex-row justify-between items-start gap-4 hover:bg-slate-50/20 transition-colors">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-slate-400">{req.id}</span>
                        <span className="text-[10px] font-bold text-slate-900 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {req.correctionType.replace("_", " ")}
                        </span>
                        <span className="text-xs font-bold text-slate-900">For Date: {req.attendanceDate}</span>
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
                          className={`flex items-center gap-1 font-bold ${
                            req.managerStatus === "APPROVED"
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
                          className={`flex items-center gap-1 font-bold ${
                            req.hrStatus === "APPROVED"
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
                  type="text"
                  placeholder="e.g. log_snapshot.jpg"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/20"
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
