"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Bell, CheckCircle2, Circle, Clock, Check, AlertCircle, AlertTriangle, Lock, HelpCircle, Calendar } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api/client';

// ─── Interfaces (No Hardcoded Mock Data) ─────────────────────────────────────────
interface ChecklistItem {
  id: string | number;
  label: string;
  status: 'completed' | 'pending' | 'scheduled' | 'locked' | 'pending_manager';
  text?: string;
}

interface OffboardingProcessData {
  id: string;
  name: string;
  designation: string;
  lastDay: string;
  avatarInitials: string;
  status: string;
  noticePeriod: boolean;
  alert: {
    daysRemaining: number;
    tasksPending: number;
    totalTasks: number;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
    target: string;
  };
  checklists: {
    assetRecovery: ChecklistItem[];
    accountDeactivation: ChecklistItem[];
    finalSettlement: ChecklistItem[];
    knowledgeTransfer: ChecklistItem[];
  };
  exitDetails: {
    resignationDate: string;
    lastWorkingDay: string;
    noticePeriod: string;
    exitType: string;
    exitReason: string;
  };
  exitInterview: {
    status: string;
  };
}

export default function OffboardingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const [data, setData] = useState<OffboardingProcessData | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOffboardingDetail = async () => {
    try {
      const response = await apiClient.get(`/lifecycle/offboarding/${params.id}`);
      const record = response.data;
      if (record) {
        const employeeName = record.employee
          ? record.employee.preferredName || `${record.employee.firstName || ''} ${record.employee.lastName || ''}`.trim()
          : "Unknown Employee";

        const assetList = Array.isArray(record.assetChecklist) ? record.assetChecklist : [];
        const deactivationList = Array.isArray(record.deactivationChecklist) ? record.deactivationChecklist : [];
        const settlementList = Array.isArray(record.settlementChecklist) ? record.settlementChecklist : [];
        const ktList = Array.isArray(record.ktChecklist) ? record.ktChecklist : [];

        const totalTasks = assetList.length + deactivationList.length + settlementList.length + ktList.length;
        const completedTasks = [
          ...assetList,
          ...deactivationList,
          ...settlementList,
          ...ktList
        ].filter(item => item.status === "completed").length;

        const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const daysRemaining = Math.max(0, Math.ceil(
          (new Date(record.lastWorkingDay).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ));

        const exitReason = record.exitReason || "Not Specified";
        const hasFeedback = exitReason.includes("[Interview Feedback]:");

        const mappedData: OffboardingProcessData = {
          id: record.employeeId,
          name: employeeName,
          designation: record.employee?.designation?.title || "Employee",
          lastDay: new Date(record.lastWorkingDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          avatarInitials: employeeName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || "EE",
          status: record.status,
          noticePeriod: record.employee?.status === "NOTICE_PERIOD",
          alert: {
            daysRemaining,
            tasksPending: totalTasks - completedTasks,
            totalTasks
          },
          progress: {
            completed: completedTasks,
            total: totalTasks,
            percentage,
            target: new Date(record.lastWorkingDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          },
          checklists: {
            assetRecovery: assetList,
            accountDeactivation: deactivationList,
            finalSettlement: settlementList,
            knowledgeTransfer: ktList
          },
          exitDetails: {
            resignationDate: new Date(record.resignationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            lastWorkingDay: new Date(record.lastWorkingDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            noticePeriod: "30 Days",
            exitType: record.exitType,
            exitReason: exitReason
          },
          exitInterview: {
            status: hasFeedback 
              ? "Completed" 
              : record.exitInterviewDate 
                ? `Scheduled for ${new Date(record.exitInterviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` 
                : "Not Scheduled"
          }
        };
        setData(mappedData);
      }
    } catch (err) {
      console.error("Failed to fetch offboarding details", err);
    }
  };

  const handleCancelOffboarding = async () => {
    if (!confirm('Are you sure you want to cancel this offboarding process?')) return;
    const reason = prompt('Please provide a cancellation reason:');
    if (!reason) return;

    setIsCancelling(true);
    try {
      await apiClient.post(`/lifecycle/offboarding/${params.id}/cancel`, { reason });
      alert('Offboarding successfully cancelled.');
      router.push('/offboarding');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel offboarding');
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {

    if (params.id) {
      fetchOffboardingDetail();
    }
  }, [params.id]);

  // Protect route: Only HR can access
  if (role !== "HR") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm">Only HR personnel can view this page.</p>
      </div>
    );
  }

  const handleToggleChecklist = async (section: string, itemId: string | number, currentStatus: string) => {
    if (currentStatus === 'locked' || currentStatus === 'scheduled') return;
    
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    try {
      await apiClient.patch(`/lifecycle/offboarding/${params.id}/checklist-item`, {
        section,
        itemId: String(itemId),
        status: newStatus
      });

      if (data && newStatus === 'completed') {
        const willBeComplete = (data.progress.completed + 1) === data.progress.total;
        if (willBeComplete && data.status !== 'COMPLETED') {
          // Use setTimeout so the checkbox visibly ticks before the prompt blocks the thread
          setTimeout(async () => {
            const confirmFinalize = window.confirm("All checklist items are done! Are you sure you want to finalize the offboarding?\n\nThis will suspend the employee's login access and lock this record permanently.");
            if (confirmFinalize) {
              try {
                await apiClient.post(`/lifecycle/offboarding/${params.id}/finalize`);
                alert("Offboarding finalized successfully!");
              } catch (err) {
                alert("Failed to finalize offboarding.");
              }
              fetchOffboardingDetail();
            }
          }, 100);
        }
      }

      fetchOffboardingDetail();
    } catch (err) {
      console.error(err);
      alert('Failed to update checklist item');
    }
  };

  const handleInterviewAction = async () => {
    if (!data) return;
    
    if (data.exitInterview.status === "Not Scheduled") {
      const dateStr = prompt("Enter exit interview date (YYYY-MM-DD):");
      if (!dateStr) return;
      
      try {
        await apiClient.patch(`/lifecycle/offboarding/${params.id}`, { exitInterviewDate: new Date(dateStr).toISOString() });
        fetchOffboardingDetail();
      } catch (err) {
        alert("Failed to schedule interview. Please ensure valid date format.");
      }
    } else {
      const feedback = prompt("Enter exit interview notes / feedback:");
      if (!feedback) return;
      
      try {
        await apiClient.post(`/lifecycle/offboarding/${params.id}/interview`, { feedback });
        alert("Interview feedback recorded successfully!");
        fetchOffboardingDetail();
      } catch (err) {
        alert("Failed to record interview feedback.");
      }
    }
  };

  const renderChecklistItem = (item: ChecklistItem, section: string) => {
    let icon = <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />;
    let textNode = null;
    let textClass = "text-[13px] font-medium text-slate-700";

    if (item.status === "completed") {
      icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
      textNode = <span className="ml-auto text-[11px] font-medium text-slate-500">{item.text}</span>;
    } else if (item.status === "pending") {
      if (item.text) {
        textNode = <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-sm border border-slate-200">{item.text}</span>;
      }
    } else if (item.status === "scheduled") {
      icon = <Clock className="w-5 h-5 text-slate-400 flex-shrink-0" />;
      textClass = "text-[13px] font-medium text-slate-500";
    } else if (item.status === "locked") {
      icon = <Lock className="w-5 h-5 text-slate-600 flex-shrink-0" />;
      textClass = "text-[13px] font-medium text-slate-700";
      textNode = <span className="ml-auto text-[11px] font-medium text-slate-500">{item.text}</span>;
    } else if (item.status === "pending_manager") {
      icon = (
        <div className="w-5 h-5 rounded-full border-2 border-dotted border-slate-400 flex items-center justify-center flex-shrink-0">
          <div className="w-1 h-1 bg-slate-300 rounded-full flex-shrink-0"></div>
        </div>
      );
      textNode = <span className="ml-auto text-[11px] font-bold text-orange-500">{item.text}</span>;
    }

    return (
      <div key={item.id} className="flex items-center gap-3 py-2.5">
        <button 
          onClick={() => handleToggleChecklist(section, item.id, item.status)}
          disabled={data?.status === 'COMPLETED' || item.status === 'locked' || item.status === 'scheduled'}
          className={`flex items-center gap-3 flex-1 text-left ${
            data?.status !== 'COMPLETED' && item.status !== 'locked' && item.status !== 'scheduled' ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-not-allowed'
          }`}
        >
          {icon}
          <span className={textClass}>{item.label}</span>
        </button>
        {textNode}
      </div>
    );
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <Clock className="w-10 h-10 text-slate-300 mb-3 animate-pulse" />
        <h2 className="text-xl font-bold text-slate-800">Waiting for backend data...</h2>
        <p className="mt-2 text-sm">Offboarding details for {params.id} are being fetched.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-slate-600">
          <Link href="/offboarding" className="hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold text-slate-900">
            <Link href="/offboarding" className="text-slate-500 hover:text-slate-900">Offboarding</Link> — {data.name}
          </span>
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
        
        {/* Alert Banner */}
        {data.status === 'IN_PROGRESS' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <span className="text-sm font-bold text-orange-800">
              {data.alert.daysRemaining} days remaining until last day. {data.alert.tasksPending} of {data.alert.totalTasks} tasks pending.
            </span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold">
                {data.avatarInitials}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{data.name}</h1>
                <div className="text-xs font-medium text-slate-600 mt-0.5">
                  {data.designation} • Last day: {data.lastDay}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {data.noticePeriod && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider rounded border border-rose-200">
                      NOTICE PERIOD
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-200">
                    {data.id}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">STATUS</div>
              <div className={`text-sm font-bold ${
                data.status === 'COMPLETED' ? 'text-emerald-600' :
                data.status === 'CANCELLED' ? 'text-slate-600' :
                'text-rose-600'
              }`}>{data.status}</div>
            </div>
          </div>
          
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-rose-700">{data.progress.percentage}% complete — {data.progress.completed} of {data.progress.total} tasks done</span>
            <span className="text-xs font-semibold text-slate-500">Target: {data.progress.target}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-rose-700 rounded-full" style={{ width: `${data.progress.percentage}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Checklists) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-8">
            
            {/* Asset Recovery */}
            <div className="mb-8">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Asset Recovery</h3>
              <div className="space-y-1">
                {data.checklists.assetRecovery.map(item => renderChecklistItem(item, 'assetRecovery'))}
              </div>
            </div>

            <div className="border-t border-slate-100 my-6"></div>

            {/* Account Deactivation */}
            <div className="mb-8">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Account Deactivation (On Last Day)</h3>
              <div className="space-y-1">
                {data.checklists.accountDeactivation.map(item => renderChecklistItem(item, 'accountDeactivation'))}
              </div>
            </div>

            <div className="border-t border-slate-100 my-6"></div>

            {/* Final Settlement */}
            <div className="mb-8">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Final Settlement</h3>
              <div className="space-y-1">
                {data.checklists.finalSettlement.map(item => renderChecklistItem(item, 'finalSettlement'))}
              </div>
            </div>

            <div className="border-t border-slate-100 my-6"></div>

            {/* Knowledge Transfer */}
            <div>
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Knowledge Transfer</h3>
              <div className="space-y-1">
                {data.checklists.knowledgeTransfer.map(item => renderChecklistItem(item, 'knowledgeTransfer'))}
              </div>
            </div>


            {data.status === 'IN_PROGRESS' && data.progress.completed === data.progress.total && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <button 
                  onClick={async () => {
                    const confirmFinalize = window.confirm("Are you sure you want to finalize the offboarding?\n\nThis will suspend the employee's login access and lock this record permanently.");
                    if (confirmFinalize) {
                      try {
                        await apiClient.post(`/lifecycle/offboarding/${params.id}/finalize`);
                        alert("Offboarding finalized successfully!");
                        fetchOffboardingDetail();
                      } catch (err) {
                        alert("Failed to finalize offboarding.");
                      }
                    }
                  }}
                  className="w-full py-3 bg-slate-900 text-white hover:bg-slate-800 font-bold text-[14px] rounded-xl transition-colors shadow-lg shadow-slate-900/20"
                >
                  Finalize Offboarding
                </button>
              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Exit Details */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-[15px] font-bold text-slate-900 mb-6">Exit details</h3>
              <div className="space-y-5">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resignation Date</div>
                  <div className="text-[13px] font-semibold text-slate-900">{data.exitDetails.resignationDate}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Working Day</div>
                  <div className="text-[13px] font-semibold text-slate-900">{data.exitDetails.lastWorkingDay}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notice Period</div>
                  <div className="text-[13px] font-semibold text-slate-900">{data.exitDetails.noticePeriod}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Exit Type</div>
                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded border border-slate-200">
                    {data.exitDetails.exitType}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Exit Reason</div>
                  <div className="text-[13px] font-semibold text-slate-900 leading-snug whitespace-pre-wrap">{data.exitDetails.exitReason}</div>
                </div>
              </div>
            </div>

            {/* Exit Interview */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-[15px] font-bold text-slate-900 mb-5">Exit interview</h3>
              <div className="mb-6">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</div>
                <div className="flex items-center gap-1.5 text-[13px] font-bold text-orange-600">
                  <Calendar className="w-4 h-4" />
                  {data.exitInterview.status}
                </div>
              </div>
              <button 
                onClick={handleInterviewAction}
                className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-[13px] rounded-lg transition-colors"
              >
                {data.exitInterview.status === "Not Scheduled" ? "Schedule exit interview" : data.exitInterview.status === "Completed" ? "Update interview feedback" : "Record interview feedback"}
              </button>
            </div>

            {/* Cancel Offboarding */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl shadow-sm p-6">
              <h3 className="text-[15px] font-bold text-rose-900 mb-2">Cancel Offboarding</h3>
              <p className="text-xs text-rose-700 mb-5 leading-snug">
                This will abort the offboarding process, revert the employee's status to ACTIVE, and stop all tasks.
              </p>
              <button 
                onClick={handleCancelOffboarding}
                disabled={isCancelling || data.status === 'COMPLETED' || data.status === 'CANCELLED'}
                className="w-full px-4 py-2 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-[13px] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Offboarding'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
