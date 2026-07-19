"use client";

import React, { useState, useEffect } from 'react';
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
  meetings: { date: string; title: string; outcome: string }[];
  qualificationScore: number; // 0-100%
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
  const [leads, setLeads] = useState<LeadProspect[]>([
    {
      id: 'LEAD-701',
      prospectName: 'David Vance',
      company: 'Apex Digital Systems',
      industry: 'FinTech',
      phone: '+1 (555) 234-8811',
      email: 'd.vance@apexdigital.com',
      priority: 'CRITICAL',
      stage: 4,
      assignedCem: 'Julian Vancore',
      createdDate: '2023-10-10',
      updatedDate: '2023-10-24 11:20',
      leadSource: 'Inbound Web Form',
      qualificationScore: 75,
      bant: {
        budgetConfirmed: true,
        authorityIdentified: true,
        needValidated: true,
        timelineEstablished: false
      },
      followUps: [
        { id: 'F-1', date: '22 Oct', type: 'CALL', summary: 'Discussed Q4 budget allocations with David. Confirmed $120k budget cap.', nextActionDate: '25 Oct' },
        { id: 'F-2', date: '18 Oct', type: 'EMAIL', summary: 'Sent introductory presentation deck and technical capabilities brochure.' }
      ],
      meetings: [
        { date: '20 Oct', title: 'Discovery Sync with Tech Lead', outcome: 'Need validated for real-time transaction processing' }
      ],
      notes: [
        'Client requires completion of onboarding before Q1 FY25.'
      ]
    },
    {
      id: 'LEAD-702',
      prospectName: 'Samantha Green',
      company: 'LogiGlobal Freight',
      industry: 'Supply Chain',
      phone: '+1 (555) 998-1122',
      email: 's.green@logiglobal.com',
      priority: 'MEDIUM',
      stage: 5,
      assignedCem: 'Sarah Jenkins',
      createdDate: '2023-10-14',
      updatedDate: '2023-10-23 15:40',
      leadSource: 'LinkedIn Outreach',
      qualificationScore: 100,
      bant: {
        budgetConfirmed: true,
        authorityIdentified: true,
        needValidated: true,
        timelineEstablished: true
      },
      followUps: [
        { id: 'F-3', date: '21 Oct', type: 'MEETING', summary: 'Final qualification sync completed. All BANT criteria verified.', nextActionDate: '24 Oct' }
      ],
      meetings: [
        { date: '17 Oct', title: 'Scope & Qualification Call', outcome: 'Fully qualified. Ready for CRM Handoff.' }
      ],
      notes: [
        'BANT score 100%. Ready to assign to CRM team for requirement gathering.'
      ]
    }
  ]);

  const [selectedLeadId, setSelectedLeadId] = useState<string>('LEAD-701');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  // Modals
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false);

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

  const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  const handleStageAdvance = () => {
    if (selectedLead.stage >= 6) {
      toast.error('Lead has already been handed off to CRM!');
      return;
    }
    const nextStage = (selectedLead.stage + 1) as LeadProspect['stage'];
    setLeads(prev => prev.map(l => {
      if (l.id === selectedLead.id) {
        return {
          ...l,
          stage: nextStage,
          updatedDate: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
      }
      return l;
    }));
    toast.success(`Lead workflow stage advanced to: ${CEM_STAGE_LABELS[nextStage - 1]}`);
  };

  const handleToggleBANT = (field: keyof BANTQualification) => {
    setLeads(prev => prev.map(l => {
      if (l.id === selectedLead.id) {
        const updatedBant = { ...l.bant, [field]: !l.bant[field] };
        const score = Math.round(
          ((updatedBant.budgetConfirmed ? 1 : 0) +
           (updatedBant.authorityIdentified ? 1 : 0) +
           (updatedBant.needValidated ? 1 : 0) +
           (updatedBant.timelineEstablished ? 1 : 0)) * 25
        );
        return {
          ...l,
          bant: updatedBant,
          qualificationScore: score,
          stage: score === 100 ? (l.stage < 5 ? 5 : l.stage) : l.stage
        };
      }
      return l;
    }));
    toast.success('Qualification criteria updated');
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectName || !company || !email) return;

    const newLeadItem: LeadProspect = {
      id: `LEAD-${Math.floor(700 + Math.random() * 200)}`,
      prospectName,
      company,
      industry: industry || 'Enterprise',
      phone: phone || '+1 (555) 000-0000',
      email,
      priority,
      stage: 1,
      assignedCem: 'Julian Vancore',
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      leadSource: source,
      qualificationScore: 0,
      bant: {
        budgetConfirmed: false,
        authorityIdentified: false,
        needValidated: false,
        timelineEstablished: false
      },
      followUps: [],
      meetings: [],
      notes: []
    };

    setLeads([newLeadItem, ...leads]);
    setSelectedLeadId(newLeadItem.id);
    setIsAddLeadOpen(false);
    toast.success('New prospect lead created in pipeline!');

    // Reset
    setProspectName('');
    setCompany('');
    setIndustry('');
    setPhone('');
    setEmail('');
  };

  const handleLogFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callSummary) return;

    const followItem: FollowUpLog = {
      id: `F-${Math.floor(100 + Math.random() * 900)}`,
      date: 'Today',
      type: 'CALL',
      summary: callSummary,
      nextActionDate: nextActionDate || undefined
    };

    setLeads(prev => prev.map(l => {
      if (l.id === selectedLead.id) {
        return {
          ...l,
          followUps: [followItem, ...l.followUps],
          updatedDate: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
      }
      return l;
    }));

    setCallSummary('');
    setNextActionDate('');
    setIsLogCallOpen(false);
    toast.success('Follow-up activity logged!');
  };

  const handleCRMTransfer = () => {
    if (selectedLead.qualificationScore < 100) {
      toast.error('Lead must achieve 100% BANT qualification before handing off to CRM!');
      return;
    }
    setLeads(prev => prev.map(l => {
      if (l.id === selectedLead.id) {
        return {
          ...l,
          stage: 6
        };
      }
      return l;
    }));
    setIsHandoffModalOpen(false);
    toast.success(`Lead ${selectedLead.company} successfully transferred to CRM Workspace!`);
  };

  const filteredLeads = leads.filter(l => {
    if (filterPriority === 'ALL') return true;
    return l.priority === filterPriority;
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans border-t border-slate-200 text-slate-900">
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
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredLeads.map(l => {
            const isSelected = l.id === selectedLeadId;
            return (
              <div
                key={l.id}
                onClick={() => setSelectedLeadId(l.id)}
                className={`p-4 cursor-pointer transition-all border-l-4 ${
                  isSelected 
                    ? 'bg-indigo-50/60 border-indigo-600 pl-3.5' 
                    : 'hover:bg-slate-50 border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-black text-slate-900 truncate max-w-[170px]">{l.company}</h4>
                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                    l.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>
                    {l.priority}
                  </span>
                </div>
                
                <p className="text-[10px] font-semibold text-slate-500 mt-1 truncate">{l.prospectName}</p>

                <div className="mt-3 flex items-center justify-between text-[9px]">
                  <span className="font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">{l.id}</span>
                  <span className={`font-bold ${l.qualificationScore === 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                    {l.qualificationScore}% Qualified
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT MAIN DETAILS VIEW */}
      <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden">
        {selectedLead && (
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
                <button 
                  onClick={() => setIsLogCallOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" /> Log Follow-Up
                </button>
                <button 
                  onClick={handleStageAdvance}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  Advance Stage <ChevronRight className="w-4 h-4" />
                </button>
                {selectedLead.stage >= 5 && (
                  <button 
                    onClick={() => setIsHandoffModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                  >
                    <Handshake className="w-4 h-4" /> Assign To CRM
                  </button>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              
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
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-300 text-xs ${
                          isActive ? 'bg-indigo-600 text-white font-black ring-4 ring-indigo-100' :
                          isCompleted ? 'bg-indigo-600 text-white font-bold' :
                          'bg-slate-100 text-slate-400 font-semibold'
                        }`}>
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                        </div>
                        <span className={`text-[9px] font-black text-center leading-tight tracking-wider ${
                          isActive ? 'text-indigo-900 font-black' : isCompleted ? 'text-slate-600' : 'text-slate-400'
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
                      <button 
                        onClick={() => setIsLogCallOpen(true)}
                        className="text-[10px] font-bold text-indigo-600 hover:underline"
                      >
                        + Log Activity
                      </button>
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
                              {f.nextActionDate && (
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                  Next Action: {f.nextActionDate}
                                </span>
                              )}
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
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-600" /> Prospect Meeting Log
                    </h3>
                    <div className="space-y-3">
                      {selectedLead.meetings.map((m, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{m.title}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">{m.date}</span>
                          </div>
                          <p className="text-[11px] text-indigo-700 font-bold">{m.outcome}</p>
                        </div>
                      ))}
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
                        <input type="checkbox" checked={selectedLead.bant.budgetConfirmed} onChange={() => {}} className="accent-indigo-600 rounded" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Budget Confirmed</div>
                          <div className="text-[10px] text-slate-500">Financial allocation verified</div>
                        </div>
                      </label>

                      <label 
                        onClick={() => handleToggleBANT('authorityIdentified')}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
                      >
                        <input type="checkbox" checked={selectedLead.bant.authorityIdentified} onChange={() => {}} className="accent-indigo-600 rounded" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Authority Identified</div>
                          <div className="text-[10px] text-slate-500">Decision maker point of contact</div>
                        </div>
                      </label>

                      <label 
                        onClick={() => handleToggleBANT('needValidated')}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
                      >
                        <input type="checkbox" checked={selectedLead.bant.needValidated} onChange={() => {}} className="accent-indigo-600 rounded" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Need Validated</div>
                          <div className="text-[10px] text-slate-500">Business pain point confirmed</div>
                        </div>
                      </label>

                      <label 
                        onClick={() => handleToggleBANT('timelineEstablished')}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
                      >
                        <input type="checkbox" checked={selectedLead.bant.timelineEstablished} onChange={() => {}} className="accent-indigo-600 rounded" />
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
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Next Action Target Date</label>
                <input 
                  type="text" 
                  value={nextActionDate} 
                  onChange={e => setNextActionDate(e.target.value)}
                  placeholder="e.g. 28 Oct" 
                  className="w-full border border-slate-300 rounded p-2 text-slate-900 focus:outline-none"
                />
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

    </div>
  );
}
