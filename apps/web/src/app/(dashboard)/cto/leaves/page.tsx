"use client";

import React, { useState } from 'react';
import { Search, Info, ChevronLeft, ChevronRight, Plus, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { fetchCtoLeaves, approveLeave, rejectLeave } from '@/lib/api/cto';

// ─── Interfaces (No Hardcoded Mock Data) ─────────────────────────────────────────
interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeInitials: string;
  employeeRole: string;
  department: string;
  type: string;
  dateRange: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  balanceAfterApproval: number;
}

export default function CTOLeavesPage() {
  const role = useAuthStore((state) => state.role);

  // States waiting for backend population
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'calendar'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await approveLeave(id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
    } catch (err) {
      console.error(err);
      alert("Failed to approve leave");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Please enter a rejection reason:");
    if (!reason) return;
    
    setProcessingId(id);
    try {
      await rejectLeave(id, reason);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
    } catch (err) {
      console.error(err);
      alert("Failed to reject leave");
    } finally {
      setProcessingId(null);
    }
  };

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  React.useEffect(() => {
    if (role === 'CTO') {
      setIsLoading(true);
      fetchCtoLeaves()
        .then((data) => {
          setRequests(data || []);
        })
        .catch((err) => console.error("Failed to fetch CTO leaves", err))
        .finally(() => setIsLoading(false));
    }
  }, [role]);

  // Protect route
  if (role !== "CTO") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <Lock className="w-10 h-10 text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
      </div>
    );
  }

  // Calculate counts safely (would normally come from backend)
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;

  const filteredRequests = requests.filter(r => r.status.toLowerCase() === activeTab);

  // Group leaves for calendar view
  const calendarLeaves = requests.filter(r => r.status === 'APPROVED' || r.status === 'PENDING');
  
  const groupedLeaves = calendarLeaves.reduce((acc, req) => {
    if (!acc[req.employeeName]) {
      acc[req.employeeName] = [];
    }
    // Parse dateRange: "YYYY-MM-DD - YYYY-MM-DD"
    const [startStr, endStr] = req.dateRange.split(' - ');
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    acc[req.employeeName].push({ ...req, startDate, endDate });
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      <div className="p-8 max-w-[1000px] mx-auto w-full space-y-6">
        
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-blue-800">
            Showing leave requests from your direct reports
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-8">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'pending' 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Pending 
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                activeTab === 'pending' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {pendingCount}
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('approved')}
              className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'approved' 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Approved this month ({approvedCount})
            </button>
            <button 
              onClick={() => setActiveTab('rejected')}
              className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'rejected' 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
            <button 
              onClick={() => setActiveTab('calendar')}
              className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'calendar' 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Team leave calendar
            </button>
          </div>
        </div>

        {/* Leave Requests List */}
        {activeTab !== 'calendar' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 flex items-center justify-center shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-slate-400" />
                <p className="text-sm font-medium text-slate-500">Loading {activeTab} requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">No requests found</h3>
                <p className="text-sm font-medium text-slate-500">No {activeTab} leave requests at this time.</p>
              </div>
            ) : (
              filteredRequests.map(req => (
                <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {req.employeeInitials}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{req.employeeName}</div>
                      <div className="text-xs text-slate-500">{req.employeeRole} • {req.department}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-0.5">Leave Type</div>
                      <div className="text-sm font-bold text-slate-900">{req.type}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-0.5">Date Range</div>
                      <div className="text-sm font-bold text-slate-900">{req.dateRange} ({req.days} days)</div>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                        req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    {req.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleApprove(req.id)}
                          disabled={processingId === req.id}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                          {processingId === req.id ? '...' : 'Approve'}
                        </button>
                        <button 
                          onClick={() => handleReject(req.id)}
                          disabled={processingId === req.id}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Team Leave Calendar */}
        {activeTab === 'calendar' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-900">Team leave calendar - {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
              <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={handleNextMonth} className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="border border-slate-200 rounded-lg overflow-x-auto relative">
              <table className="w-full border-collapse text-sm min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold text-slate-500 text-left w-40 border-r border-slate-200 shrink-0 sticky left-0 bg-slate-50/80 z-10">Team Member</th>
                    {daysArray.map((day) => (
                      <th key={day} className="py-2 min-w-[30px] font-medium text-slate-400 text-center border-r border-slate-200 last:border-r-0">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={daysInMonth + 1} className="py-12 text-center text-slate-400 font-medium">
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading calendar data...
                        </div>
                      </td>
                    </tr>
                  ) : Object.keys(groupedLeaves).length === 0 ? (
                    <tr>
                      <td colSpan={daysInMonth + 1} className="py-12 text-center text-slate-400 font-medium">
                        No approved or pending leaves for this team.
                      </td>
                    </tr>
                  ) : (
                    Object.entries(groupedLeaves).map(([empName, leaves]) => (
                      <tr key={empName} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-700 text-left w-40 border-r border-slate-200 shrink-0 sticky left-0 bg-white z-10">
                          {empName}
                        </td>
                        {daysArray.map(day => {
                          // Check if this specific day in the current month is covered by any leave
                          const currentCellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                          currentCellDate.setHours(0, 0, 0, 0); // Normalize time

                          // Find if any leave covers this day
                          const activeLeave = leaves.find(l => {
                            const lStart = new Date(l.startDate);
                            lStart.setHours(0, 0, 0, 0);
                            const lEnd = new Date(l.endDate);
                            lEnd.setHours(0, 0, 0, 0);
                            return currentCellDate >= lStart && currentCellDate <= lEnd;
                          });

                          return (
                            <td key={day} className="p-1 min-w-[30px] border-r border-slate-100 last:border-r-0 text-center h-[52px]">
                              {activeLeave && (
                                <div 
                                  title={`${activeLeave.type} (${activeLeave.status})`}
                                  className={`w-full h-full rounded flex items-center justify-center cursor-pointer ${
                                    activeLeave.status === 'APPROVED' 
                                      ? 'bg-emerald-100 border border-emerald-200' 
                                      : 'bg-amber-100 border border-amber-200'
                                  }`}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    activeLeave.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'
                                  }`}></div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
