"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPendingOvertime, approveOvertime } from "@/lib/api/attendance";
import { toast } from "react-hot-toast";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

export function PendingOvertimeTable() {
  const queryClient = useQueryClient();
  
  const { data: pendingRequests, isLoading, error } = useQuery({
    queryKey: ['pendingOvertime'],
    queryFn: fetchPendingOvertime
  });

  const mutation = useMutation({
    mutationFn: ({ recordId, status }: { recordId: string, status: 'APPROVE' | 'REJECT' }) => 
      approveOvertime(recordId, status),
    onSuccess: (_, variables) => {
      toast.success(`Overtime ${variables.status === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['pendingOvertime'] });
      queryClient.invalidateQueries({ queryKey: ['teamAttendanceView'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Action failed");
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 shadow-sm">
        Error loading pending overtime requests.
      </div>
    );
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return null; // Don't show anything if there are no pending requests
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center gap-2">
        <Clock className="w-5 h-5 text-amber-500" />
        <h2 className="text-base font-extrabold text-slate-900">Pending Overtime Approvals</h2>
        <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
          {pendingRequests.length}
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">MEMBER</th>
              <th className="px-6 py-4">DATE</th>
              <th className="px-6 py-4">HOURS WORKED</th>
              <th className="px-6 py-4">EXTRA HOURS (OVERTIME)</th>
              <th className="px-6 py-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pendingRequests.map((request: any) => (
              <tr key={request.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 overflow-hidden">
                      {request.employee?.photoUrl ? (
                        <img src={request.employee.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        request.employee?.firstName?.charAt(0) + (request.employee?.lastName?.charAt(0) || '')
                      )}
                    </div>
                    <span className="font-bold text-slate-900 text-sm">
                      {request.employee?.firstName} {request.employee?.lastName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-600">
                  {format(new Date(request.date), "dd MMM yyyy")}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-600">
                  {request.workHours}h
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
                    +{request.overtime}h
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => mutation.mutate({ recordId: request.id, status: 'REJECT' })}
                      disabled={mutation.isPending}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
                      title="Reject"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => mutation.mutate({ recordId: request.id, status: 'APPROVE' })}
                      disabled={mutation.isPending}
                      className="flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-md border border-emerald-200 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
