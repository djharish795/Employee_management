"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  FileText, 
  CheckSquare, 
  Users, 
  Plus, 
  AlertCircle, 
  MessageSquare, 
  Paperclip, 
  ShieldCheck,
  Layers,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  Search
} from 'lucide-react';
import { crmApi } from '@/lib/api/crm';
import toast, { Toaster } from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CRM_STAGE_LABELS = [
  'Assigned',
  'Req Gathering',
  'Req Review',
  'Client Validation',
  'Proposal Prep',
  'Ready For Sales'
];

export default function CrmWorkspaceView() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [filterHealth, setFilterHealth] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddReqOpen, setIsAddReqOpen] = useState(false);
  const [isAddCROpen, setIsAddCROpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [clientMeetings, setClientMeetings] = useState<any[]>([]);
  const [newMeeting, setNewMeeting] = useState({
    date: '',
    time: '12:00',
    ampm: 'PM',
    type: 'Requirement Review',
    notes: ''
  });

  // Form inputs for Requirements
  const [newReqName, setNewReqName] = useState('');
  const [newReqCategory, setNewReqCategory] = useState('Core Feature');
  const [newReqPriority, setNewReqPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  // Form inputs for Change Requests
  const [newCRTitle, setNewCRTitle] = useState('');
  const [newCRDescription, setNewCRDescription] = useState('');

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const res = await crmApi.getClients();
      const clientsData = res.data?.data || res.data || [];
      setAccounts(Array.isArray(clientsData) ? clientsData : []);
      if (clientsData && clientsData.length > 0 && !selectedAccountId) {
        setSelectedAccountId(clientsData[0].id);
      }
    } catch (error) {
      toast.error('Failed to load CRM clients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClientMeetings = async (clientId: string) => {
    try {
      const res = await crmApi.getClientMeetings(clientId);
      const meetingsData = res.data?.data || res.data || [];
      setClientMeetings(Array.isArray(meetingsData) ? meetingsData : []);
    } catch (err) {
      toast.error('Failed to load meetings for client');
    }
  };

  useEffect(() => {
    if (selectedAccountId) {
      fetchClientMeetings(selectedAccountId);
    }
  }, [selectedAccountId]);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  const handleStageAdvance = async () => {
    if (!selectedAccount) return;
    if (selectedAccount.stage >= 6) {
      toast.error('Account is already marked Ready For Sales!');
      return;
    }
    const nextStage = selectedAccount.stage + 1;
    try {
      await crmApi.updateClientStage(selectedAccount.id, nextStage);
      toast.success(`Requirement Lifecycle advanced to: ${CRM_STAGE_LABELS[nextStage - 1]}`);
      fetchClients();
    } catch (err) {
      toast.error('Failed to advance stage');
    }
  };

  const handleCloseDeal = async () => {
    if (!selectedAccount) return;
    try {
      await crmApi.closeDeal(selectedAccount.id);
      toast.success('🎉 Deal Closed! Client marked as Active Project.');
      fetchClients();
    } catch (err) {
      toast.error('Failed to close deal');
    }
  };

  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqName || !selectedAccount) return;
    
    try {
      const generatedId = `REQ-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      await crmApi.addClientRequirement(selectedAccount.id, {
        id: generatedId,
        name: newReqName,
        category: newReqCategory,
        priority: newReqPriority,
        status: 'Pending'
      });
      toast.success('New Requirement specification added!');
      setNewReqName('');
      setIsAddReqOpen(false);
      fetchClients();
    } catch (err) {
      toast.error('Failed to add requirement');
    }
  };

  const handleUpdateReqStatus = async (reqId: string, newStatus: string) => {
    if (!selectedAccount) return;
    try {
      await crmApi.updateClientRequirementStatus(selectedAccount.id, reqId, newStatus);
      toast.success(`Requirement status updated to ${newStatus}`);
      fetchClients();
    } catch (err) {
      toast.error('Failed to update requirement status');
    }
  };

  const handleAddChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCRTitle || !selectedAccount) return;
    
    try {
      const generatedId = `CR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      await crmApi.addClientChangeRequest(selectedAccount.id, {
        id: generatedId,
        title: newCRTitle,
        description: newCRDescription,
        status: 'Pending',
        createdAt: new Date().toISOString()
      });
      toast.success('Change Request added!');
      setNewCRTitle('');
      setNewCRDescription('');
      setIsAddCROpen(false);
      fetchClients();
    } catch (err) {
      toast.error('Failed to add change request');
    }
  };

  const handleUpdateCRStatus = async (crId: string, newStatus: string) => {
    if (!selectedAccount) return;
    try {
      await crmApi.updateClientChangeRequestStatus(selectedAccount.id, crId, newStatus);
      toast.success(`Change Request status updated to ${newStatus}`);
      fetchClients();
    } catch (err) {
      toast.error('Failed to update change request status');
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.date || !newMeeting.time || !selectedAccount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);

      // Convert 12h time + ampm to 24h for backend
      const [hours, minutes] = newMeeting.time.split(':');
      let h = parseInt(hours, 10);
      if (newMeeting.ampm === 'PM' && h < 12) h += 12;
      if (newMeeting.ampm === 'AM' && h === 12) h = 0;
      const time24 = `${h.toString().padStart(2, '0')}:${minutes}`;

      await crmApi.createMeeting({
        client: selectedAccount.company,
        leadId: selectedAccount.id,
        leadName: selectedAccount.company,
        date: newMeeting.date,
        time: time24,
        type: newMeeting.type,
        notes: newMeeting.notes
      });
      toast.success('Meeting scheduled successfully. Zoom link generated.');
      setIsScheduleModalOpen(false);
      fetchClientMeetings(selectedAccount.id);
    } catch (err) {
      toast.error('Failed to schedule meeting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAccount) return;

    try {
      setIsUploading(true);
      const res = await crmApi.uploadDocument(file);
      const objectKey = res.data.data.objectKey;

      const attachmentStr = `${file.name}|${objectKey}`;
      await crmApi.addClientAttachment(selectedAccount.id, attachmentStr);

      toast.success('Document uploaded successfully');
      fetchClients();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadDocument = async (attachment: string) => {
    try {
      const parts = attachment.split('|');
      const objectKey = parts.length > 1 ? parts[1] : parts[0];
      const res = await crmApi.getDownloadUrl(objectKey);
      const url = res.data.data.url;
      window.open(url, '_blank');
    } catch (err) {
      toast.error('Failed to generate download URL');
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    if (filterHealth === 'ALL') return true;
    return acc.health === filterHealth;
  });

  if (isLoading && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-50 text-slate-800 font-sans border-t border-slate-200">
      <Toaster position="top-right" />

      {/* LEFT SIDEBAR: CLIENT PORTFOLIO */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col h-full flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        
        {/* Workspace Brand Header */}
        <div className="p-5 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-wide">CRM Workspace</h2>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Requirement Hub</p>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Filter Sub-header */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Accounts ({filteredAccounts.length})
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 shadow-sm hover:bg-slate-50 focus:outline-none focus:border-indigo-500">
              {filterHealth === 'ALL' ? 'ALL HEALTH' : filterHealth}
              <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[140px] bg-white border border-slate-200 shadow-xl z-50">
              <DropdownMenuItem onClick={() => setFilterHealth('ALL')} className="text-[10px] font-bold cursor-pointer hover:bg-slate-50 focus:bg-slate-50">ALL HEALTH</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterHealth('ON TRACK')} className="text-[10px] font-bold cursor-pointer hover:bg-slate-50 focus:bg-slate-50">ON TRACK</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterHealth('REVIEW NEEDED')} className="text-[10px] font-bold cursor-pointer hover:bg-slate-50 focus:bg-slate-50">REVIEW NEEDED</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterHealth('AWAITING CLIENT')} className="text-[10px] font-bold cursor-pointer hover:bg-slate-50 focus:bg-slate-50">AWAITING CLIENT</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Client Account Portfolio List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredAccounts.map(acc => {
            const isSelected = acc.id === selectedAccountId;
            return (
              <div
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`p-4 cursor-pointer transition-all border-l-4 border-b border-slate-100 ${
                  isSelected 
                    ? 'bg-indigo-50 border-l-indigo-600 pl-3.5' 
                    : 'hover:bg-slate-50 border-l-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-bold text-slate-900 truncate max-w-[170px]">{acc.company}</h4>
                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                    acc.health === 'ON TRACK' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {acc.health || 'ON TRACK'}
                  </span>
                </div>
                
                <p className="text-[10px] font-semibold text-slate-500 mt-1 truncate">{acc.industry}</p>

                <div className="mt-3 flex items-center justify-between text-[9px] text-slate-500">
                  <span className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded">{acc.id}</span>
                  <span className="font-bold text-indigo-600">Stage {acc.stage}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT MAIN VIEW: REQUIREMENT & ACCOUNT DETAILS */}
      <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden relative">
        {selectedAccount ? (
          <>
            {/* Top Bar Header */}
            <div className="px-8 py-5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 flex-shrink-0 z-10 shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">{selectedAccount.company}</h1>
                  <span className="text-[10px] font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                    {selectedAccount.id}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded uppercase tracking-wider">
                    {selectedAccount.industry}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Added on {new Date(selectedAccount.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsAddReqOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Requirement
                </button>
                {selectedAccount.stage === 6 ? (
                  <button 
                    onClick={handleCloseDeal}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    🎉 Close Deal & Convert
                  </button>
                ) : selectedAccount.stage === 7 ? (
                  <button 
                    disabled
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold shadow-sm cursor-not-allowed"
                  >
                    ✓ Deal Closed
                  </button>
                ) : (
                  <button 
                    onClick={handleStageAdvance}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    Advance Lifecycle Stage &gt;
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* REQUIREMENT LIFECYCLE TRACKER (6 STAGES) */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" /> Requirement Lifecycle Stage
                  </h3>
                  <span className="text-xs font-bold text-indigo-600">
                    {selectedAccount.stage > 6 ? 
                      'Current: Deal Closed (Won)' : 
                      `Current: ${CRM_STAGE_LABELS[selectedAccount.stage - 1]} (Stage ${selectedAccount.stage} of 6)`}
                  </span>
                </div>

                <div className="flex items-center justify-between relative px-4 py-2">
                  <div className="absolute top-6 left-12 right-12 h-0.5 bg-slate-100 z-0">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, ((selectedAccount.stage - 1) / (CRM_STAGE_LABELS.length - 1)) * 100)}%` }}
                    ></div>
                  </div>
                  {CRM_STAGE_LABELS.map((label, idx) => {
                    const stepNum = idx + 1;
                    const isActive = selectedAccount.stage === stepNum;
                    const isCompleted = selectedAccount.stage > stepNum;
                    return (
                      <div key={label} className="flex flex-col items-center gap-2 relative z-10 w-24">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white transition-all duration-300 text-xs shadow-sm ${
                          isActive ? 'bg-indigo-600 text-white font-bold ring-4 ring-indigo-50' :
                          isCompleted ? 'bg-indigo-100 text-indigo-700 font-bold' :
                          'bg-slate-100 text-slate-400 font-semibold'
                        }`}>
                          {isCompleted ? <CheckSquare className="w-3.5 h-3.5" /> : stepNum}
                        </div>
                        <span className={`text-[9px] font-bold text-center leading-tight tracking-wider ${
                          isActive ? 'text-indigo-700' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TWO COLUMN WORKSPACE GRID */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* LEFT 2-COLUMNS: REQUIREMENTS SPECIFICATIONS TABLE & CHANGE REQUESTS */}
                <div className="xl:col-span-2 space-y-6">
                  
                  {/* REQUIREMENT SPECIFICATIONS TABLE */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" /> Client Requirement Specifications ({(selectedAccount.requirementsList || []).length})
                      </h3>
                      <button 
                        onClick={() => setIsAddReqOpen(true)}
                        className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Spec
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                            <th className="px-5 py-3">ID & NAME</th>
                            <th className="px-4 py-3">CATEGORY</th>
                            <th className="px-4 py-3">PRIORITY</th>
                            <th className="px-4 py-3">STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {selectedAccount.requirementsList && selectedAccount.requirementsList.length > 0 ? selectedAccount.requirementsList.map((req: any) => (
                            <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3.5">
                                <div className="font-bold text-slate-900">{req.name || req.title}</div>
                                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{req.id}</div>
                              </td>
                              <td className="px-4 py-3.5 font-medium text-slate-600">{req.category || 'Core'}</td>
                              <td className="px-4 py-3.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  req.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                  'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                  {req.priority || 'Medium'}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <select
                                  value={req.status || 'Pending'}
                                  onChange={(e) => handleUpdateReqStatus(req.id || req.name || req.title, e.target.value)}
                                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase cursor-pointer outline-none focus:ring-1 focus:ring-indigo-500 ${
                                    req.status === 'Completed' || req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    req.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                    'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Approved">Approved</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-xs font-semibold text-slate-400">
                                No requirement specifications added yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* CHANGE REQUEST SUMMARY */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500" /> Change Request Log ({(selectedAccount.changeRequests?.logs || []).length})
                      </h3>
                      <button 
                        onClick={() => setIsAddCROpen(true)}
                        className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add CR
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                            <th className="px-5 py-3">ID & TITLE</th>
                            <th className="px-4 py-3">DESCRIPTION</th>
                            <th className="px-4 py-3">STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {selectedAccount.changeRequests?.logs && selectedAccount.changeRequests.logs.length > 0 ? selectedAccount.changeRequests.logs.map((cr: any) => (
                            <tr key={cr.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3.5">
                                <div className="font-bold text-slate-900">{cr.title}</div>
                                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{cr.id}</div>
                              </td>
                              <td className="px-4 py-3.5 text-xs text-slate-600 truncate max-w-xs">{cr.description}</td>
                              <td className="px-4 py-3.5">
                                <select
                                  value={cr.status || 'Pending'}
                                  onChange={(e) => handleUpdateCRStatus(cr.id, e.target.value)}
                                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase cursor-pointer outline-none focus:ring-1 focus:ring-indigo-500 ${
                                    cr.status === 'Completed' || cr.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    cr.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                    cr.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                    'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Approved">Approved</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={3} className="py-8 text-center text-xs font-semibold text-slate-400">
                                <div className="flex flex-col items-center justify-center space-y-2">
                                  <Search className="w-6 h-6 text-slate-200" />
                                  <p>No active change requests</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* RIGHT 1-COLUMN: CLIENT DOCUMENTS & DISCUSSIONS */}
                <div className="space-y-6">
                  
                  {/* CLIENT DOCUMENTS */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-indigo-500" /> Client Documents
                      </h3>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept=".pdf,image/jpeg,image/png,image/webp"
                      />
                      <button 
                        onClick={handleUploadClick}
                        disabled={isUploading}
                        className="text-[10px] font-bold text-indigo-600 hover:underline disabled:opacity-50"
                      >
                        {isUploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>

                    {selectedAccount.attachments && selectedAccount.attachments.length > 0 ? (
                      <div className="space-y-2">
                        {selectedAccount.attachments.map((attachment: string, i: number) => {
                          const parts = attachment.split('|');
                          const name = parts[0];
                          return (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-medium text-slate-700 truncate max-w-[200px]">{name}</span>
                              </div>
                              <button 
                                onClick={() => handleDownloadDocument(attachment)}
                                className="text-[10px] font-bold text-indigo-600 hover:underline"
                              >
                                View
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-slate-400 space-y-2">
                        <FileText className="w-6 h-6 text-slate-200" />
                        <p className="text-xs font-medium">No documents uploaded</p>
                      </div>
                    )}
                  </div>

                  {/* RECENT CLARIFICATION MEETINGS */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-500" /> Requirement Discussions
                      </h3>
                      <button 
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Schedule Call
                      </button>
                    </div>
                    
                    {clientMeetings && clientMeetings.length > 0 ? (
                      <div className="space-y-3">
                        {clientMeetings.map(meeting => (
                          <div key={meeting.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{meeting.type}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${meeting.status === 'SCHEDULED' ? 'text-indigo-600' : 'text-slate-500'}`}>
                                {meeting.status}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {meeting.date} at {meeting.time}
                            </div>
                            {meeting.notes && (
                              <div className="mt-2 text-xs text-slate-600 bg-white p-2 border border-slate-100 rounded whitespace-pre-wrap">
                                {meeting.notes.split('\n\n').map((part: string, idx: number) => {
                                  if (part.startsWith('Zoom Link:')) {
                                    const url = part.replace('Zoom Link:', '').trim();
                                    return (
                                      <div key={idx} className="mt-1">
                                        <a href={url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-medium inline-flex items-center gap-1">
                                          Join Zoom Meeting <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                    );
                                  }
                                  return <div key={idx}>{part}</div>;
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-slate-400 space-y-2">
                        <MessageSquare className="w-6 h-6 text-slate-200" />
                        <p className="text-xs font-medium">No recent discussions</p>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Select a client account to view workspace</p>
          </div>
        )}
      </div>

      {/* MODAL: ADD REQUIREMENT */}
      {isAddReqOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Add Requirement Specification</h3>
            <form onSubmit={handleAddRequirement} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Requirement Title</label>
                <input 
                  type="text" 
                  value={newReqName} 
                  onChange={e => setNewReqName(e.target.value)}
                  placeholder="e.g. Real-time Inventory Webhook" 
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Category</label>
                <input 
                  type="text" 
                  value={newReqCategory} 
                  onChange={e => setNewReqCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Priority</label>
                <select 
                  value={newReqPriority} 
                  onChange={e => setNewReqPriority(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddReqOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-bold text-xs transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-colors shadow-sm">Save Spec</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CHANGE REQUEST */}
      {isAddCROpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Add Change Request (CR)</h3>
            <form onSubmit={handleAddChangeRequest} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">CR Title</label>
                <input 
                  type="text" 
                  value={newCRTitle} 
                  onChange={e => setNewCRTitle(e.target.value)}
                  placeholder="e.g. Add fingerprint login" 
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Description</label>
                <textarea 
                  value={newCRDescription} 
                  onChange={e => setNewCRDescription(e.target.value)}
                  placeholder="Details of the change requested..." 
                  rows={4}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddCROpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-bold text-xs transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition-colors shadow-sm">Save CR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE MEETING */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Schedule Clarification Call</h3>
            <form onSubmit={handleScheduleMeeting} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Date</label>
                  <input 
                    type="date" 
                    value={newMeeting.date} 
                    onChange={e => setNewMeeting({...newMeeting, date: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Time</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="HH:MM"
                      value={newMeeting.time} 
                      onChange={e => setNewMeeting({...newMeeting, time: e.target.value})}
                      className="w-2/3 bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                      pattern="^(0?[1-9]|1[0-2]):[0-5][0-9]$"
                      title="Format: HH:MM (e.g., 5:40 or 11:30)"
                      required 
                    />
                    <select 
                      value={newMeeting.ampm} 
                      onChange={e => setNewMeeting({...newMeeting, ampm: e.target.value})}
                      className="w-1/3 bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                      required 
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Meeting Type</label>
                <select 
                  value={newMeeting.type} 
                  onChange={e => setNewMeeting({...newMeeting, type: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Requirement Review">Requirement Review</option>
                  <option value="Proposal Walkthrough">Proposal Walkthrough</option>
                  <option value="Technical Sync">Technical Sync</option>
                  <option value="General Check-in">General Check-in</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Agenda / Notes</label>
                <textarea 
                  value={newMeeting.notes} 
                  onChange={e => setNewMeeting({...newMeeting, notes: e.target.value})}
                  placeholder="Topics to discuss..." 
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-bold text-xs transition-colors">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-colors shadow-sm disabled:opacity-50">
                  {isLoading ? 'Scheduling...' : 'Schedule Call'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
