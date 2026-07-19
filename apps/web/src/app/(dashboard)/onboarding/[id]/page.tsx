"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ChevronRight, Loader2, Monitor, ShieldCheck, Briefcase, User, Calendar, Mail, Phone, Laptop, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const STAGES = [
  { id: 'OFFER_ACCEPTED', title: 'Offer Accepted', icon: User },
  { id: 'DOCUMENTATION', title: 'Documentation', icon: Briefcase },
  { id: 'ASSET_ALLOCATION', title: 'Asset Allocation', icon: Monitor },
  { id: 'TRAINING', title: 'Training', icon: ShieldCheck },
  { id: 'MANAGER_INTRO', title: 'Manager Intro', icon: Calendar },
  { id: 'COMPLETED', title: 'Completed', icon: CheckCircle2 }
];

export default function OnboardingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role);

  const [toast, setToast] = React.useState<{show: boolean, message: string}>({show: false, message: ''});
  
  React.useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({show: false, message: ''}), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message: string) => {
    setToast({ show: true, message });
  };

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['onboarding-session', id],
    queryFn: async () => {
      const res = await apiClient.get(`/onboarding/${id}`);
      return res.data;
    }
  });

  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [isAssetRequestModalOpen, setIsAssetRequestModalOpen] = React.useState(false);
  const [callDate, setCallDate] = React.useState("");
  const [callTime, setCallTime] = React.useState("10:00");
  const [assetItems, setAssetItems] = React.useState<string[]>([]);
  const [otherAsset, setOtherAsset] = React.useState('');
  const [assetReason, setAssetReason] = React.useState('');

  const sendReminder = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/onboarding/${id}/remind`);
    },
    onSuccess: () => {
      showToast("Reminders sent successfully");
    }
  });

  const scheduleCall = useMutation({
    mutationFn: async ({ startTime, endTime }: { startTime: string, endTime: string }) => {
      await apiClient.post(`/onboarding/${id}/welcome-call`, { startTime, endTime });
    },
    onSuccess: () => {
      showToast("Welcome call scheduled successfully");
      setIsScheduleModalOpen(false);
    }
  });

  const cancelOnboarding = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/onboarding/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-session', id] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-metrics'] });
      setIsCancelModalOpen(false);
      router.push('/onboarding');
    }
  });

  const toggleTask = useMutation({
    mutationFn: async ({ taskId, isCompleted }: { taskId: string, isCompleted: boolean }) => {
      const res = await apiClient.patch(`/onboarding/tasks/${taskId}`, { isCompleted });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-session', id] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-metrics'] });
    }
  });

  const { data: assetRequests = [], refetch: refetchAssetRequests } = useQuery({
    queryKey: ['employee-asset-requests', session?.employee?.id],
    queryFn: async () => {
      const res = await apiClient.get('/assets/requests', { params: { scope: 'all' } });
      const allReqs = res.data?.data || res.data || [];
      return allReqs.filter((r: any) => {
        const targetId = r.employeeId || r.metadata?.targetEmployeeId;
        return targetId === session?.employee?.id || targetId === session?.employee?.employeeId;
      });
    },
    enabled: !!session?.employee?.id
  });

  const requestAsset = useMutation({
    mutationFn: async (finalItems: string[]) => {
      await apiClient.post('/assets/requests', {
        employeeId: session?.employee?.id,
        type: 'ONBOARDING',
        requestedItems: finalItems,
        reason: assetReason
      });
    },
    onSuccess: () => {
      showToast("Asset Request Initiated!");
      setIsAssetRequestModalOpen(false);
      setAssetItems([]);
      setOtherAsset('');
      setAssetReason('');
      refetchAssetRequests();
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || err.message || "Failed to send request");
    }
  });

  if (isLoading) return <div className="flex h-full items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  if (error || !session) return <div className="flex h-full items-center justify-center bg-slate-50 text-slate-500">Failed to load session details.</div>;

  const currentStageIndex = STAGES.findIndex(s => s.id === session.stage);
  const employee = session.employee;
  
  // Group tasks by assignedTo
  const tasksByAssignee = session.tasks.reduce((acc: any, task: any) => {
    if (!acc[task.assignedTo]) acc[task.assignedTo] = [];
    acc[task.assignedTo].push(task);
    return acc;
  }, {});

  const handleTaskToggle = (taskId: string, currentStatus: boolean) => {
    toggleTask.mutate({ taskId, isCompleted: !currentStatus });
  };

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/onboarding" className="text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {employee.firstName} {employee.lastName}
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase">
                {session.stage.replace('_', ' ')}
              </span>
            </h1>
            <p className="text-[11px] font-medium text-slate-500">{employee.employeeId} • {employee.officialEmail}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* Left Sidebar (Stepper) */}
        <div className="w-72 border-r border-slate-200 bg-slate-50/50 p-6 hidden md:block">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Pipeline Stages</h3>
          <div className="space-y-6">
            {STAGES.map((stage, idx) => {
              const isActive = idx === currentStageIndex;
              const isCompleted = idx < currentStageIndex;
              const StageIcon = stage.icon;
              
              let circleClass = "bg-white border-2 border-slate-200 text-slate-400";
              let lineClass = "bg-slate-200";
              
              if (isActive) {
                circleClass = "bg-indigo-600 border-2 border-indigo-600 text-white shadow-md shadow-indigo-600/20";
              }
              if (isCompleted) {
                circleClass = "bg-emerald-500 border-2 border-emerald-500 text-white";
                lineClass = "bg-emerald-500";
              }

              return (
                <div key={stage.id} className="flex flex-col relative group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors ${circleClass}`}>
                    <StageIcon className="w-4 h-4" />
                  </div>
                  {idx !== STAGES.length - 1 && (
                    <div className={`absolute top-10 left-5 bottom-[-24px] w-[2px] -ml-[1px] transition-colors ${lineClass}`} />
                  )}
                  <div className="absolute left-14 top-2 text-sm font-bold text-slate-700">
                    {stage.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 bg-white min-h-full">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    Onboarding Checklist
                  </h2>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    Auto-saved
                  </span>
                </div>
                
                {Object.keys(tasksByAssignee).length === 0 ? (
                  <p className="text-sm text-slate-500">No tasks assigned for this session yet.</p>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(tasksByAssignee).map(([assignee, tasks]: [string, any]) => (
                      <div key={assignee} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-100/50 border-b border-slate-200 px-5 py-3">
                          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            Assigned to: {assignee}
                            <span className="bg-white px-2 py-0.5 rounded-full border border-slate-200 text-[10px] text-slate-500">
                              {tasks.length} tasks
                            </span>
                          </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {tasks.map((task: any) => (
                            <div key={task.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/80 transition-colors">
                              <button 
                                onClick={() => handleTaskToggle(task.id, task.isCompleted)}
                                disabled={toggleTask.isPending}
                                className={`mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                  task.isCompleted 
                                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                                    : 'bg-white border-slate-300 text-transparent hover:border-emerald-500'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <div className="flex-1">
                                <p className={`text-sm font-semibold transition-colors ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                  {task.title}
                                </p>
                                {task.description && !task.description.startsWith('Document uploaded') && (
                                  <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                                )}
                                
                                {!task.isCompleted && task.assignedTo === 'Employee' && task.description?.startsWith('Document uploaded') && (
                                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                                    <span className="font-bold">Needs Review:</span> The employee has submitted this document.
                                    <div className="mt-1 text-slate-500 truncate">{task.description}</div>
                                  </div>
                                )}

                                {task.completedAt && (
                                  <p className="text-[10px] font-medium text-emerald-600 mt-2">
                                    Completed on {new Date(task.completedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">IT & Asset Request</h3>
                  {assetRequests.length === 0 && (
                    <button
                      onClick={() => setIsAssetRequestModalOpen(true)}
                      disabled={requestAsset.isPending}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase rounded transition-colors disabled:opacity-50"
                    >
                      {requestAsset.isPending ? "Initiating..." : "Initiate Request"}
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {assetRequests.length > 0 ? (
                    assetRequests.map((req: any) => {
                      const type = req.type || req.metadata?.requestType || "ONBOARDING";
                      const requestedItems = Array.isArray(req.requestedItems) ? req.requestedItems.join(", ") : (req.metadata?.justification || "Assets");
                      const reason = req.reason || req.metadata?.description;
                      
                      return (
                      <div key={req.id} className="p-3 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{type}</p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                            req.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Requested: {requestedItems}</p>
                        {reason && <p className="text-xs text-slate-400 mt-1">Reason: {reason}</p>}
                      </div>
                    )})
                  ) : (
                    <div className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      No asset requests initiated yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <h3 className="text-sm font-bold text-white/90 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => sendReminder.mutate()}
                    disabled={sendReminder.isPending || session.stage === 'CANCELLED' || session.stage === 'COMPLETED'}
                    className="w-full text-left px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10">
                    {sendReminder.isPending ? 'Sending...' : 'Send Reminder'}
                    <Mail className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                  </button>
                  <button 
                    onClick={() => setIsScheduleModalOpen(true)}
                    disabled={session.stage === 'CANCELLED' || session.stage === 'COMPLETED'}
                    className="w-full text-left px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10">
                    Schedule Welcome Call
                    <Calendar className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                  </button>
                  <button 
                    onClick={() => setIsCancelModalOpen(true)}
                    disabled={session.stage === 'CANCELLED' || session.stage === 'COMPLETED'}
                    className="w-full text-left px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-rose-500/20">
                    Cancel Onboarding
                    <AlertCircle className="w-4 h-4 text-rose-400 group-hover:text-rose-300 transition-colors" />
                  </button>
                  {session.stage === 'CANCELLED' && (
                    <div className="pt-2">
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
                        <p className="text-sm font-bold text-rose-500">This onboarding has been cancelled.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Schedule Welcome Call</h3>
              <p className="text-sm text-slate-500 mt-1">A Zoom link will be sent to the employee.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input 
                  type="date" 
                  value={callDate}
                  onChange={(e) => setCallDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
                <input 
                  type="time" 
                  value={callTime}
                  onChange={(e) => setCallTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (!callDate || !callTime) return alert("Please select date and time");
                  const start = new Date(`${callDate}T${callTime}`);
                  const end = new Date(start.getTime() + 30 * 60000); // 30 mins later
                  scheduleCall.mutate({ startTime: start.toISOString(), endTime: end.toISOString() });
                }}
                disabled={scheduleCall.isPending}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50">
                {scheduleCall.isPending ? 'Scheduling...' : 'Schedule Call'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Cancel Onboarding?</h3>
                <p className="text-sm text-slate-500 mt-1">This will change the employee status to EXITED and suspend their account access immediately.</p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                Keep Onboarding
              </button>
              <button 
                onClick={() => cancelOnboarding.mutate()}
                disabled={cancelOnboarding.isPending}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50">
                {cancelOnboarding.isPending ? 'Canceling...' : 'Yes, Cancel Onboarding'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAssetRequestModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Initiate Asset Request</h3>
              <p className="text-sm text-slate-500 mt-1">Request hardware or software for {employee.firstName}.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Required Assets</label>
                <div className="space-y-2">
                  {['Laptop', 'Monitor', 'Mobile Phone', 'SIM Card', 'Software Licenses'].map(item => (
                    <label key={item} className="flex items-center gap-2 text-sm text-slate-600">
                      <input 
                        type="checkbox" 
                        checked={assetItems.includes(item)}
                        onChange={(e) => {
                          if (e.target.checked) setAssetItems([...assetItems, item]);
                          else setAssetItems(assetItems.filter(i => i !== item));
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      {item}
                    </label>
                  ))}
                </div>
                <div className="mt-3">
                  <input 
                    type="text"
                    value={otherAsset}
                    onChange={(e) => setOtherAsset(e.target.value)}
                    placeholder="Other requirement (type here...)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Notes</label>
                <textarea 
                  value={assetReason}
                  onChange={(e) => setAssetReason(e.target.value)}
                  placeholder="e.g., Required for client calls..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsAssetRequestModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => {
                  const finalItems = [...assetItems];
                  if (otherAsset.trim()) finalItems.push(otherAsset.trim());
                  
                  if (finalItems.length === 0) return showToast("Please select or type at least one asset item");
                  requestAsset.mutate(finalItems);
                }}
                disabled={requestAsset.isPending}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50">
                {requestAsset.isPending ? 'Sending...' : 'Send to Approvals'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
