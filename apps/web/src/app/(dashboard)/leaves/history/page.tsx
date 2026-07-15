"use client";

import React, { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { getMyLeaves, cancelLeaveRequest } from "@/lib/api/leaves";
import LeavesLayout from "@/components/modules/leaves/leaves-layout";
import { Loader2, FileClock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

export default function MyLeavesHistoryPage() {
  const { employeeId, role } = useAuthStore();
  const queryClient = useQueryClient();
  
  const effectiveRole = (() => {
    if (role) return role.toUpperCase();
    if (typeof document !== "undefined") {
      const match = document.cookie.match(new RegExp("(^| )role=([^;]+)"));
      return match ? decodeURIComponent(match[2]).toUpperCase() : "EMPLOYEE";
    }
    return "EMPLOYEE";
  })();

  const { data, isLoading } = useQuery({
    queryKey: ["my-leaves-history", employeeId],
    queryFn: () => getMyLeaves(employeeId!),
    enabled: !!employeeId,
  });

  const handleCancelLeave = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this leave request?")) return;
    try {
      await cancelLeaveRequest(id);
      toast.success("Leave request cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["my-leaves-history", employeeId] });
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to cancel leave request");
    }
  };

  return (
    <LeavesLayout>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/20">
          <div>
            <h3 className="text-lg font-bold text-slate-900">My Leave Requests</h3>
            <p className="text-xs text-slate-500 mt-1">Track the status of your past and pending applications.</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm font-medium">Loading history...</p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileClock className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-sm font-medium">You haven't submitted any leave requests yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Applied On</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Breakdown</th>
                  <th className="px-6 py-4">Status & Queue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((req: any) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">
                      {format(new Date(req.appliedAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {format(new Date(req.startDate), "MMM d, yyyy")}
                        {req.startDate !== req.endDate && ` - ${format(new Date(req.endDate), "MMM d, yyyy")}`}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{Number(req.totalDays)} Day(s)</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                        {req.leaveType?.name || req.leaveTypeId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {Number(req.paidDays) > 0 && (
                          <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700">
                            {Number(req.paidDays)} Paid
                          </span>
                        )}
                        {Number(req.unpaidDays) > 0 && (
                          <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700">
                            {Number(req.unpaidDays)} Unpaid
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {req.status === "PENDING" && (
                          <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs">
                            <AlertCircle className="w-3.5 h-3.5" /> PENDING
                          </div>
                        )}
                        {req.status === "APPROVED" && (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                            <CheckCircle className="w-3.5 h-3.5" /> APPROVED
                          </div>
                        )}
                        {req.status === "REJECTED" && (
                          <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs">
                            <XCircle className="w-3.5 h-3.5" /> REJECTED
                          </div>
                        )}
                        
                        {req.approvalQueue && Array.isArray(req.approvalQueue) && (
                          <div className="text-[10px] text-slate-400 font-medium flex items-center flex-wrap gap-1">
                            {req.approvalQueue.map((q: any, idx: number) => (
                              <React.Fragment key={idx}>
                                <span className={q.status === 'PENDING' ? 'text-amber-500 font-bold' : q.status === 'APPROVED' ? 'text-emerald-500 font-bold' : q.status === 'REJECTED' ? 'text-rose-500 font-bold' : ''}>
                                  {q.role}
                                </span>
                                {idx < req.approvalQueue.length - 1 && <span>→</span>}
                              </React.Fragment>
                            ))}
                          </div>
                        )}

                        {req.status === "PENDING" && req.employeeId === employeeId && (
                          <button
                            onClick={() => handleCancelLeave(req.id)}
                            className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded transition-colors w-max mt-1"
                          >
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </LeavesLayout>
  );
}
