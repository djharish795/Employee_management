"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, ShieldAlert, User, Search, Filter, HelpCircle, XCircle } from "lucide-react";
import { LeaveRequest } from "@/types/leaves";

interface ApprovalsPanelProps {
  activeRole: "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
}

const LOCAL_REGS_KEY = "naprocs_leave_requests";

export default function ApprovalsPanel({ activeRole }: ApprovalsPanelProps) {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  
  // Filters
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("PENDING");

  const fetchRequests = async (): Promise<LeaveRequest[]> => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_REGS_KEY);
      if (saved) return JSON.parse(saved);
    }
    return [];
  };

  const { data: requests = [], refetch } = useQuery<LeaveRequest[]>({
    queryKey: ["leaveRequests"],
    queryFn: fetchRequests,
  });

  // Calculate filtered queue list
  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (filterStatus) {
      result = result.filter((r) => r.status === filterStatus);
    }

    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      result = result.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q)
      );
    }

    return result;
  }, [requests, filterStatus, filterSearch]);

  // Actions mutation
  const actionMutation = useMutation({
    mutationFn: async ({ id, status, comments }: { id: string; status: LeaveRequest["status"]; comments?: string }) => {
      const updated = requests.map((r) => {
        if (r.id === id) {
          return { ...r, status, comments };
        }
        return r;
      });

      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_REGS_KEY, JSON.stringify(updated));
      }
      return updated;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["leaveRequests"], data);
      refetch();
      // Update selected reference if matching
      if (selectedRequest && selectedRequest.id === variables.id) {
        const found = data.find((r) => r.id === variables.id);
        setSelectedRequest(found || null);
      }
    },
  });

  const handleAction = (id: string, status: LeaveRequest["status"]) => {
    actionMutation.mutate({ id, status, comments: `Actioned by ${activeRole}` });
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Queue Log Table (Left/Center) */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Header & Filter Controls */}
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
                <option value="APPROVED">Approved Requests</option>
                <option value="REJECTED">Rejected Requests</option>
              </select>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <User className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <h4 className="text-sm font-bold text-slate-700">No requests found</h4>
              <p className="text-xs mt-1">Approvals queue is clear.</p>
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
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                      selectedRequest?.id === req.id ? "bg-slate-100/30" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="text-slate-900 font-bold">{req.employeeName}</div>
                      <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{req.department}</div>
                    </td>
                    <td className="px-5 py-3.5 uppercase text-[9px] tracking-wide text-slate-500 font-bold">{req.type.replace("_", " ")}</td>
                    <td className="px-5 py-3.5">{req.startDate} to {req.endDate}</td>
                    <td className="px-5 py-3.5 text-center font-bold text-slate-900">{req.days}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                        req.status === "APPROVED"
                          ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                          : req.status === "PENDING"
                          ? "text-amber-700 bg-amber-50 border border-amber-100"
                          : "text-rose-700 bg-rose-50 border border-rose-100"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Slide-over Details Drawer Panel (Right Side Widget) */}
        <div className="xl:col-span-1">
          {selectedRequest ? (
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Request Details</h4>
                <button onClick={() => setSelectedRequest(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                  Close
                </button>
              </div>

              {/* Overlap warnings mock */}
              {selectedRequest.status === "PENDING" && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[11px] leading-relaxed font-bold flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-extrabold text-rose-800">Team Outage Alert!</span>
                    Linda Chen is also on leave during this period. Outage overlap calculated in Product Design.
                  </div>
                </div>
              )}

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs border border-slate-200/50">
                    {selectedRequest.employeeName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 leading-none">{selectedRequest.employeeName}</h5>
                    <span className="text-[10px] font-semibold text-slate-400 mt-1 block">{selectedRequest.department}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Leave Type</span>
                    <span className="text-slate-900 font-bold uppercase">{selectedRequest.type.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Start Date</span>
                    <span className="text-slate-900 font-bold">{selectedRequest.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">End Date</span>
                    <span className="text-slate-900 font-bold">{selectedRequest.endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Duration</span>
                    <span className="text-slate-900 font-bold">{selectedRequest.days} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Submitted</span>
                    <span className="text-slate-500 font-bold">{selectedRequest.submittedDate}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Reason / Details</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-normal max-h-24 overflow-y-auto">
                    {selectedRequest.reason}
                  </p>
                </div>

                {/* Approver Action Panel */}
                {selectedRequest.status === "PENDING" && (
                  <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(selectedRequest.id, "REJECTED")}
                        className="flex-1 h-9 border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleAction(selectedRequest.id, "APPROVED")}
                        className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleAction(selectedRequest.id, "CLARIFICATION")}
                      className="w-full h-9 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      Request Clarification
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/50 border border-slate-200 border-dashed p-8 rounded-xl text-center text-slate-400">
              <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-bold">Select a request row in the queue to inspect details.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
