"use client";

import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckSquare, Calendar, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { fetchApprovals, approveLeave, rejectLeave, fetchLeaveCalendar, ApiLeaveRequest } from "@/lib/api/leaves";

export default function TeamLeavePage() {
  const { employeeId } = useAuthStore();

  // Fetch Team Approvals
  const { data: approvals = [], refetch, isLoading: isLoadingApprovals } = useQuery<ApiLeaveRequest[]>({
    queryKey: ["leaves-approvals", employeeId],
    queryFn: () => fetchApprovals(employeeId!),
    enabled: !!employeeId,
  });

  // Fetch Team Calendar
  const { data: calendar = [], isLoading: isLoadingCalendar } = useQuery<ApiLeaveRequest[]>({
    queryKey: ["leaves-calendar", employeeId],
    queryFn: () => fetchLeaveCalendar(employeeId!),
    enabled: !!employeeId,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveLeave(id, employeeId!),
    onSuccess: () => refetch(),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectLeave(id, employeeId!, "Manager rejected"),
    onSuccess: () => refetch(),
  });

  const pendingApprovals = approvals.filter(req => req.status === "PENDING" && req.isPendingForMe);

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-screen flex flex-col font-sans overflow-x-hidden">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Leave Management</h1>
      </header>

      {/* Main Content Area */}
      <main className="p-8 max-w-7xl mx-auto w-full space-y-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Leave Approvals</h3>
              <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full">{pendingApprovals.length} Pending</span>
            </div>
            
            <div className="space-y-4">
              {isLoadingApprovals ? (
                <div className="flex items-center justify-center p-8 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
                </div>
              ) : pendingApprovals.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-slate-200 rounded-lg text-slate-400 font-semibold text-sm">
                  No pending leave requests for your team.
                </div>
              ) : (
                pendingApprovals.map((req) => (
                  <div key={req.id} className="bg-slate-50 border border-slate-200 rounded-lg p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                          {req.employee?.firstName.charAt(0)}{req.employee?.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{req.employee?.firstName} {req.employee?.lastName}</div>
                          <div className="text-xs font-semibold text-slate-500 mt-0.5">{req.leaveType?.name} • {req.totalDays} Days</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-700">{new Date(req.startDate).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">to {new Date(req.endDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                    {req.reason && (
                      <div className="text-xs text-slate-600 bg-white p-3 rounded border border-slate-100 mb-4 font-medium italic">
                        "{req.reason}"
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button 
                        onClick={() => rejectMutation.mutate(req.id)}
                        disabled={rejectMutation.isPending || approveMutation.isPending}
                        className="flex-1 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-md transition-colors"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => approveMutation.mutate(req.id)}
                        disabled={rejectMutation.isPending || approveMutation.isPending}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Approved Leaves */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-[500px]">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" /> Team Leave Calendar
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {isLoadingCalendar ? (
                <div className="flex items-center justify-center p-8 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
                </div>
              ) : calendar.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-slate-200 rounded-lg text-slate-400 font-semibold text-sm">
                  No upcoming or recent leaves.
                </div>
              ) : (
                calendar.slice(0, 10).map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {leave.employee?.firstName?.charAt(0) || '?'}{leave.employee?.lastName?.charAt(0) || ''}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{leave.employee?.firstName || 'Unknown'} {leave.employee?.lastName || 'Employee'}</div>
                        <div className="text-[10px] font-semibold text-slate-500 mt-0.5">{leave.leaveType?.name || 'Leave'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-700">{leave.totalDays} Days</div>
                      <div className="text-[10px] font-medium text-slate-400 mt-0.5">{new Date(leave.startDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
