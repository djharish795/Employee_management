"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import {
  Plus,
  RefreshCw,
  MessageSquare,
  Phone,
  Calendar,
  Check,
  X,
  Search,
  Clock,
  UserCheck,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Handshake,
  Target,
  Filter,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface FollowUpLog {
  id: string;
  date: string;
  type: 'CALL' | 'EMAIL' | 'MEETING';
  status: string;
  summary: string;
  nextActionDate?: string;
}

interface BANTQualification {
  budgetConfirmed: boolean;
  authorityIdentified: boolean;
  needValidated: boolean;
  timelineEstablished: boolean;
}

interface LeadProspect {
  id: string;
  prospectName: string;
  company: string;
  industry: string;
  phone: string;
  email: string;
  priority: 'CRITICAL' | 'MEDIUM' | 'LOW';
  stage: 1 | 2 | 3 | 4 | 5 | 6;
  // 1: New, 2: Contacted, 3: Meeting, 4: Follow Up, 5: Qualified, 6: Assigned To CRM
  assignedCem: string;
  createdDate: string;
  updatedDate: string;
  leadSource: string;
  bant: BANTQualification;
  followUps: FollowUpLog[];
  meetings: { date: string; type: string; outcome: string; time: string; status: string; notes: string; id: string }[];
  qualificationScore: number; // 0-100%
  qualificationStatus: string;
  notes: string[];
}

const CEM_STAGE_LABELS = [
  'New Lead',
  'Contacted',
  'Meeting Scheduled',
  'Follow Up',
  'Qualified Lead',
  'Assigned To CRM'
];

export default function CemLeadWorkspacePage() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadProspect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  // Modals
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  // Form states
  const [prospectName, setProspectName] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [priority, setPriority] = useState<'CRITICAL' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [source, setSource] = useState('Direct Inquiry');

  const [callSummary, setCallSummary] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  const [nextActionTime, setNextActionTime] = useState('');
  const [nextActionAmPm, setNextActionAmPm] = useState<'AM' | 'PM'>('PM');

  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingAmPm, setMeetingAmPm] = useState<'AM' | 'PM'>('AM');
  const [meetingType, setMeetingType] = useState('Discovery Call');

  const mapApiLeadToFrontend = (apiLead: any): LeadProspect => ({
    ...apiLead,
    createdDate: apiLead.createdAt ? new Date(apiLead.createdAt).toLocaleDateString() : 'Unknown',
    assignedCem: apiLead.assignedCem ? `${apiLead.assignedCem.firstName} ${apiLead.assignedCem.lastName}` : 'Unassigned',
    bant: {
      budgetConfirmed: apiLead.budgetConfirmed,
      authorityIdentified: apiLead.authorityIdentified,
      needValidated: apiLead.needValidated,
      timelineEstablished: apiLead.timelineEstablished,
    },
    followUps: apiLead.followUps?.map((f: any) => ({
      id: f.id,
      date: new Date(f.createdAt || f.date).toLocaleDateString(),
      type: f.type,
      status: f.status || 'Pending',
      summary: f.lastNote || f.summary || '',
      nextActionDate: (f.dueDate || f.nextActionDate) ? new Date(f.dueDate || f.nextActionDate).toLocaleDateString() : undefined
    })) || [],
    meetings: apiLead.meetings?.map((m: any) => ({
      id: m.id,
      date: new Date(m.date).toLocaleDateString(),
      type: m.type || m.title || 'Meeting',
      time: m.time || '',
      status: m.status || 'SCHEDULED',
      outcome: m.outcome || 'Pending',
      notes: m.notes || ''
    })) || [],
    notes: apiLead.notes || []
  });

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get('/cem/leads');
      const mappedData = data.map(mapApiLeadToFrontend);
      setLeads(mappedData);
      if (mappedData.length > 0 && !selectedLeadId) {
        setSelectedLeadId(mappedData[0].id);
      }
    } catch (err) {
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  const handleStageAdvance = async () => {
    if (!selectedLead) return;
    if (selectedLead.stage >= 6) {
      toast.error('Lead has already been handed off to CRM!');
      return;
    }
    // Block advancing to stage 6 without full BANT from the frontend
    if (selectedLead.stage === 5 && selectedLead.qualificationScore < 100) {
      toast.error('Complete all 4 BANT qualification checkboxes before proceeding to CRM assignment.');
      return;
    }
    const nextStage = (selectedLead.stage + 1) as LeadProspect['stage'];
    setIsSaving(true);
    try {
      const { data: updatedLead } = await apiClient.put(`/cem/leads/${selectedLead.id}/stage`, { stage: nextStage });
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? mapApiLeadToFrontend(updatedLead) : l));
      toast.success(`Lead workflow stage advanced to: ${CEM_STAGE_LABELS[nextStage - 1]}`);
    } catch (err) {
      toast.error('Failed to advance to next step');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleBANT = async (field: keyof BANTQualification) => {
    if (!selectedLead) return;
    const newValue = !selectedLead.bant[field];
    try {
      const { data: updatedLead } = await apiClient.put(`/cem/leads/${selectedLead.id}/bant`, { field, value: newValue });
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? mapApiLeadToFrontend(updatedLead) : l));
      toast.success('Qualification criteria updated');
    } catch (err) {
      toast.error('Failed to update qualification criteria');
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectName || !company || !email) return;

    setIsSaving(true);
    try {
      const { data: newLead } = await apiClient.post('/cem/leads', {
        company,
        prospectName,
        email,
        phone: phone || '+1 (555) 000-0000',
        industry: industry || 'Enterprise',
        priority,
        leadSource: source
      });
      const mappedLead = mapApiLeadToFrontend(newLead);
      setLeads([mappedLead, ...leads]);
      setSelectedLeadId(mappedLead.id);
      setIsAddLeadOpen(false);
      toast.success('New prospect lead created in pipeline!');

      setProspectName('');
      setCompany('');
      setIndustry('');
      setPhone('');
      setEmail('');
    } catch (err) {
      toast.error('Failed to create lead');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callSummary || !selectedLead) return;

    let formattedDueDate = undefined;
    if (nextActionDate) {
      if (nextActionTime) {
        let [hours, minutes] = nextActionTime.split(':');
        if (hours && minutes) {
          let hoursNum = parseInt(hours, 10);
          if (nextActionAmPm === 'PM' && hoursNum < 12) hoursNum += 12;
          if (nextActionAmPm === 'AM' && hoursNum === 12) hoursNum = 0;
          const time24 = `${hoursNum.toString().padStart(2, '0')}:${minutes}`;
          formattedDueDate = `${nextActionDate}T${time24}:00`;
        }
      } else {
        formattedDueDate = `${nextActionDate}T12:00:00`;
      }
    }

    setIsSaving(true);
    try {
      const { data: updatedLead } = await apiClient.post(`/cem/leads/${selectedLead.id}/follow-ups`, {
        type: 'CALL',
        summary: callSummary,
        nextActionDate: formattedDueDate || undefined
      });
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? mapApiLeadToFrontend(updatedLead) : l));

      setCallSummary('');
      setNextActionDate('');
      setNextActionTime('');
      setNextActionAmPm('PM');
      setIsLogCallOpen(false);
      toast.success('Follow-up activity logged!');
    } catch (err) {
      toast.error('Failed to log activity');
    } finally {
      setIsSaving(false);
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingDate || !meetingTime || !selectedLead) return;

    const formattedTime = meetingTime.includes(':') ? `${meetingTime} ${meetingAmPm}` : `${meetingTime}:00 ${meetingAmPm}`;

    setIsSaving(true);
    try {
      const { data: updatedLead } = await apiClient.post(`/cem/leads/${selectedLead.id}/meetings`, {
        date: meetingDate,
        time: formattedTime,
        type: meetingType
      });
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? mapApiLeadToFrontend(updatedLead) : l));

      setMeetingDate('');
      setMeetingTime('');
      setMeetingAmPm('AM');
      setMeetingType('Discovery Call');
      setIsMeetingModalOpen(false);
      toast.success('Meeting scheduled in the Hub!');
    } catch (err) {
      toast.error('Failed to schedule meeting');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCRMTransfer = async () => {
    if (!selectedLead) return;
    if (selectedLead.qualificationScore < 100) {
      toast.error('Lead must achieve 100% BANT qualification before handing off to CRM!');
      return;
    }

    setIsSaving(true);
    try {
      const { data: updatedLead } = await apiClient.post(`/cem/leads/${selectedLead.id}/handoff`);
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? mapApiLeadToFrontend(updatedLead) : l));
      setIsHandoffModalOpen(false);
      toast.success(`Lead ${selectedLead.company} successfully transferred to CRM Workspace!`);
    } catch (err) {
      toast.error('Failed to transfer lead to CRM');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedLead) return;
    setIsSaving(true);
    try {
      const { data: updatedLead } = await apiClient.put(`/cem/leads/${selectedLead.id}/status`, { status });
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? mapApiLeadToFrontend(updatedLead) : l));
      toast.success(status === 'CANCELED' ? 'Lead marked as Canceled' : 'Lead restored');
    } catch (err) {
      toast.error('Failed to update lead status');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredLeads = leads.filter(l => {
    if (filterPriority === 'ALL') return true;
    return l.priority === filterPriority;
  });

  return (
    <div className="flex h-full bg-slate-50 font-sans border-t border-slate-200 text-slate-900">
      <Toaster position="top-right" />

      {/* LEFT SIDEBAR: LEAD PIPELINE */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col h-full flex-shrink-0">

        {/* Workspace Brand Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">CEM Lead Workspace</h2>
              <p className="text-[10px] font-semibold text-slate-500">Prospecting & Qualification</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddLeadOpen(true)}
            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Priority Filter */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Leads Pipeline ({filteredLeads.length})
          </span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none"
          >
            <option value="ALL">ALL PRIORITIES</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        {/* Lead List */}
        <div className="flex-1 overflow-y-auto">
          {filteredLeads.map(l => {
            const isSelected = l.id === selectedLead?.id;
            return (
              <div
                key={l.id}
                onClick={() => setSelectedLeadId(l.id)}
                className={`p-4 cursor-pointer transition-all border-l-4 border-b border-slate-100 ${isSelected
                    ? 'bg-indigo-50 border-l-indigo-600 pl-3.5'
                    : 'hover:bg-slate-50 border-l-transparent'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-black text-slate-900 truncate max-w-[170px]">{l.company}</h4>
                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${l.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-indigo-50 text-indigo-600 border-indigo-100'
                    }`}>
                    {l.priority}
                  </span>
                </div>

                <p className="text-[10px] font-semibold text-slate-500 mt-1 truncate">{l.prospectName}</p>

                <div className="mt-3 flex items-center justify-between text-[9px]">
                  <span className="font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">{l.id}</span>
                  {l.qualificationStatus === 'CANCELED' ? (
                    <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded uppercase">Canceled</span>
                  ) : (
                    <span className={`font-bold ${l.qualificationScore === 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                      {l.qualificationScore}% Qualified
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT MAIN DETAILS VIEW */}
      <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-slate-400 font-bold animate-pulse flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" /> Loading Lead Workspace...
            </div>
          </div>
        ) : selectedLead ? (
          <>
            {/* Top Bar Header */}
            <div className="px-8 py-5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">{selectedLead.company}</h1>
                  <span className="text-[10px] font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                    {selectedLead.id}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded">
                    {selectedLead.industry}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Prospect Contact: <span className="text-slate-900 font-bold">{selectedLead.prospectName}</span> ({selectedLead.email} • {selectedLead.phone})
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {selectedLead.qualificationStatus === 'CANCELED' ? (
                  <>
                    <span className="px-3 py-2 bg-rose-100 text-rose-700 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2">
                      <X className="w-4 h-4" /> Lead Canceled
                    </span>
                    <button
                      onClick={() => handleUpdateStatus('ACTIVE')}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      Restore Lead
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleUpdateStatus('CANCELED')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" /> Mark Canceled
                    </button>
                    <button
                      onClick={() => setIsLogCallOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" /> Log Follow-Up
                    </button>
                    <button
                      onClick={() => setIsMeetingModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Schedule Meeting
                    </button>
                    {selectedLead.stage < 6 && selectedLead.qualificationScore < 100 && (
                      <button
                        onClick={handleStageAdvance}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        Next Step <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                    {selectedLead.qualificationScore === 100 && selectedLead.qualificationStatus === 'ACTIVE' && selectedLead.stage < 6 && (
                      <button
                        onClick={async () => {
                          try {
                            const { data: updated } = await apiClient.post(`/cem/leads/${selectedLead.id}/handoff`);
                            setLeads(prev => prev.map(l => l.id === selectedLead.id ? mapApiLeadToFrontend(updated) : l));
                            toast.success('Lead sent to Qualification Pipeline!');
                            router.push('/cem/qualification');
                          } catch {
                            toast.error('Failed to send lead to pipeline.');
                          }
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                      >
                        <Handshake className="w-4 h-4" /> Send to Qualification
                      </button>
                    )}
                    {selectedLead.qualificationStatus === 'AWAITING_HANDOFF' && (
                      <span className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-black uppercase tracking-wider cursor-default">
                        <ShieldCheck className="w-4 h-4" /> In Qualification Pipeline
                      </span>
                    )}
                    {selectedLead.qualificationStatus === 'HANDED_OVER' && (
                      <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-black uppercase tracking-wider cursor-default">
                        <Check className="w-4 h-4" /> Handed Over to CRM
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className={`flex-1 overflow-y-auto p-8 space-y-6 ${selectedLead.qualificationStatus === 'CANCELED' ? 'opacity-50 pointer-events-none' : ''}`}>

              {/* LEAD PROGRESS TRACKER (6 STAGES) */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" /> Lead Qualification Stage
                  </h3>
                  <span className="text-xs font-bold text-indigo-600">
                    Stage: {CEM_STAGE_LABELS[selectedLead.stage - 1]} ({selectedLead.stage} of 6)
                  </span>
                </div>

                <div className="flex items-center justify-between relative px-4 py-2">
                  <div className="absolute top-6 left-12 right-12 h-0.5 bg-slate-100 z-0">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${((selectedLead.stage - 1) / (CEM_STAGE_LABELS.length - 1)) * 100}%` }}
                    ></div>
                  </div>
                  {CEM_STAGE_LABELS.map((label, idx) => {
                    const stepNum = idx + 1;
                    const isActive = selectedLead.stage === stepNum;
                    const isCompleted = selectedLead.stage > stepNum;
                    return (
                      <div key={label} className="flex flex-col items-center gap-2 relative z-10 w-24">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-300 text-xs ${isActive ? 'bg-indigo-600 text-white font-black ring-4 ring-indigo-100' :
                            isCompleted ? 'bg-indigo-600 text-white font-bold' :
                              'bg-slate-100 text-slate-400 font-semibold'
                          }`}>
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                        </div>
                        <span className={`text-[9px] font-black text-center leading-tight tracking-wider ${isActive ? 'text-indigo-900 font-black' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TWO COLUMN GRID */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* LEFT 2 COLUMNS: FOLLOW-UP LOG & MEETINGS */}
                <div className="xl:col-span-2 space-y-6">

                  {/* FOLLOW-UP HISTORY */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Phone className="w-4 h-4 text-indigo-600" /> Follow-Up Communication Log ({selectedLead.followUps.length})
                      </h3>
                      <Link
                        href="/cem/follow-ups"
                        className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        View in Hub &rarr;
                      </Link>
                    </div>

                    <div className="space-y-3">
                      {selectedLead.followUps.length > 0 ? (
                        selectedLead.followUps.map(f => (
                          <div key={f.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-slate-900 flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-black rounded">{f.type}</span>
                                {f.date}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${f.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                  {f.status}
                                </span>
                                {f.nextActionDate && (
                                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                    Due: {f.nextActionDate}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-slate-700 pt-1 leading-relaxed">{f.summary}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 text-center py-6">No follow-up activity logged yet.</p>
                      )}
                    </div>
                  </div>

                  {/* PROSPECT MEETING HISTORY */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600" /> Prospect Meeting Log ({selectedLead.meetings.length})
                      </h3>
                      <Link
                        href="/cem/meetings"
                        className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        View in Hub &rarr;
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {selectedLead.meetings.length > 0 ? (
                        selectedLead.meetings.map((m) => (
                          <div key={m.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-slate-900 flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black rounded">{m.type}</span>
                                {m.date} {m.time}
                              </span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${m.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  m.status === 'SCHEDULED' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                    'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                {m.status}
                              </span>
                            </div>
                            <div className="pt-1 flex items-center justify-between">
                              <p className="text-slate-700 leading-relaxed max-w-[80%]">{m.notes || m.outcome}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 text-center py-6">No meetings scheduled yet.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* RIGHT 1 COLUMN: BANT QUALIFICATION CHECKLIST */}
                <div className="space-y-6">

                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" /> BANT Qualification Status
                      </h3>
                      <span className="text-xs font-black text-indigo-600">{selectedLead.qualificationScore}%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${selectedLead.qualificationScore}%` }}></div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label
                        onClick={() => handleToggleBANT('budgetConfirmed')}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
                      >
                        <input type="checkbox" checked={selectedLead.bant.budgetConfirmed} onChange={() => { }} className="accent-indigo-600 rounded" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Budget Confirmed</div>
                          <div className="text-[10px] text-slate-500">Financial allocation verified</div>
                        </div>
                      </label>

                      <label
                        onClick={() => handleToggleBANT('authorityIdentified')}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
                      >
                        <input type="checkbox" checked={selectedLead.bant.authorityIdentified} onChange={() => { }} className="accent-indigo-600 rounded" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Authority Identified</div>
                          <div className="text-[10px] text-slate-500">Decision maker point of contact</div>
                        </div>
                      </label>

                      <label
                        onClick={() => handleToggleBANT('needValidated')}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
                      >
                        <input type="checkbox" checked={selectedLead.bant.needValidated} onChange={() => { }} className="accent-indigo-600 rounded" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Need Validated</div>
                          <div className="text-[10px] text-slate-500">Business pain point confirmed</div>
                        </div>
                      </label>

                      <label
                        onClick={() => handleToggleBANT('timelineEstablished')}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
                      >
                        <input type="checkbox" checked={selectedLead.bant.timelineEstablished} onChange={() => { }} className="accent-indigo-600 rounded" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Timeline Established</div>
                          <div className="text-[10px] text-slate-500">Target deployment date set</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* LEAD SOURCE & ORIGIN */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 shadow-sm text-xs">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Lead Origin Details
                    </h3>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Lead Source:</span>
                      <span className="font-bold text-slate-900">{selectedLead.leadSource}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Created Date:</span>
                      <span className="font-bold text-slate-900">{selectedLead.createdDate}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Assigned CEM:</span>
                      <span className="font-bold text-indigo-700">{selectedLead.assignedCem}</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 font-bold">
            No leads in the pipeline. Please create a new lead to begin.
          </div>
        )}
      </div>

      {/* MODAL: ADD NEW LEAD */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 uppercase">Create New Prospect Lead</h3>
            <form onSubmit={handleAddLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Company Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Apex Digital Systems"
                  className="w-full border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Prospect Contact Name</label>
                <input
                  type="text"
                  value={prospectName}
                  onChange={e => setProspectName(e.target.value)}
                  placeholder="e.g. David Vance"
                  className="w-full border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="david@company.com"
                  className="w-full border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    placeholder="e.g. FinTech"
                    className="w-full border border-slate-300 rounded p-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full border border-slate-300 rounded p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddLeadOpen(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded font-bold">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white rounded font-bold">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG FOLLOW UP */}
      {isLogCallOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 uppercase">Log Follow-Up Activity</h3>
            <form onSubmit={handleLogFollowUp} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Communication Summary</label>
                <textarea
                  value={callSummary}
                  onChange={e => setCallSummary(e.target.value)}
                  placeholder="Summary of phone call or email sync..."
                  className="w-full border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-indigo-600 h-24"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Date</label>
                  <input
                    type="date"
                    value={nextActionDate}
                    onChange={e => setNextActionDate(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Time (HH:MM)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nextActionTime}
                      onChange={(e) => setNextActionTime(e.target.value)}
                      className="w-full border border-slate-300 rounded p-2 text-slate-900 focus:outline-none"
                      placeholder="05:30"
                    />
                    <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => setNextActionAmPm('AM')}
                        className={`px-3 py-1 rounded-md text-[10px] font-black transition-colors ${nextActionAmPm === 'AM' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setNextActionAmPm('PM')}
                        className={`px-3 py-1 rounded-md text-[10px] font-black transition-colors ${nextActionAmPm === 'PM' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsLogCallOpen(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded font-bold">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white rounded font-bold">Log Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN TO CRM */}
      {isHandoffModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
              <Handshake className="w-5 h-5 text-emerald-600" /> Assign Lead to CRM Workspace
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to hand off lead <span className="font-bold text-slate-900">{selectedLead.company}</span> to the CRM Client Workspace for requirement gathering?
            </p>
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded text-[11px] text-emerald-800 font-medium">
              ✓ BANT Score: 100% Verified
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsHandoffModalOpen(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded font-bold">Cancel</button>
              <button type="button" onClick={handleCRMTransfer} className="px-4 py-1.5 bg-emerald-600 text-white rounded font-black uppercase tracking-wider">Confirm Handoff</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE MEETING */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 uppercase">Schedule Meeting</h3>
            <form onSubmit={handleScheduleMeeting} className="space-y-4 text-xs">

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Meeting Type</label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-slate-900 focus:outline-none bg-white"
                >
                  <option value="Discovery Call">Discovery Call</option>
                  <option value="Product Demo">Product Demo</option>
                  <option value="Follow-up Call">Follow-up Call</option>
                  <option value="Stakeholder Meeting">Stakeholder Meeting</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={e => setMeetingDate(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-slate-900 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Time (HH:MM)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full border border-slate-300 rounded p-2 text-slate-900 focus:outline-none"
                      placeholder="05:30"
                      required
                    />
                    <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => setMeetingAmPm('AM')}
                        className={`px-3 py-1 rounded-md text-[10px] font-black transition-colors ${meetingAmPm === 'AM' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setMeetingAmPm('PM')}
                        className={`px-3 py-1 rounded-md text-[10px] font-black transition-colors ${meetingAmPm === 'PM' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsMeetingModalOpen(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded font-bold">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-colors disabled:opacity-50">
                  {isSaving ? 'Scheduling...' : 'Schedule Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
