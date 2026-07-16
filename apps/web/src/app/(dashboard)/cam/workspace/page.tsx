"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  RefreshCw, 
  MessageSquare, 
  Phone, 
  FileText, 
  Calendar, 
  Check, 
  X, 
  Sparkles,
  Search,
  Star,
  Clock,
  Loader2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Lead {
  id: string;
  company: string;
  contactPerson: string;
  industry: string;
  phone: string;
  email: string;
  priority: 'CRITICAL' | 'MEDIUM' | 'LOW';
  stage: 1 | 2 | 3 | 4 | 5 | 6; // 1: New, 2: Contacted, 3: Meeting Scheduled, 4: Follow Up, 5: Qualified, 6: Handoff
  assignedCem: string;
  leadOwner: string;
  createdDate: string;
  updatedDate: string;
  sourceQuality: 1 | 2 | 3 | 4; // out of 4 dots
  leadSource: string;
  requirementSummary: string;
  activeMandate: string;
  mandateDueDate: string;
  notes?: string[];
  calls?: string[];
}

const STAGE_LABELS = [
  'NEW',
  'CONTACTED',
  'MEETING SCHEDULED',
  'FOLLOW UP',
  'QUALIFIED',
  'HANDOFF'
];

export default function LeadsWorkspacePage() {
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: 'L-9823-A',
      company: 'Nebula Systems Inc.',
      contactPerson: 'Sarah Jenkins',
      industry: 'Financial Technology',
      phone: '+1 (555) 012-9983',
      email: 's.jenkins@nebulasystems.com',
      priority: 'CRITICAL',
      stage: 3,
      assignedCem: 'Julian Vancore',
      leadOwner: 'Marketing Inbound',
      createdDate: '2023-10-12',
      updatedDate: '2023-10-24 14:32',
      sourceQuality: 3,
      leadSource: 'Strategic Webinar Q4',
      requirementSummary: 'Client is looking for a multi-tenant cloud infrastructure solution that supports high-frequency transaction processing with sub-50ms latency. Expansion into APAC planned for Q2 next year.',
      activeMandate: 'Prepare Stakeholder Presentation',
      mandateDueDate: '2023-10-27',
      notes: ['Spoke with CTO, they want APAC expansion timelines in the proposal.'],
      calls: ['Initial discovery call logged - high interest.']
    },
    {
      id: 'L-7482-B',
      company: 'Vortex Logistics',
      contactPerson: 'Michael Chen',
      industry: 'Supply Chain',
      phone: '+1 (555) 043-1284',
      email: 'm.chen@vortexlogistics.com',
      priority: 'MEDIUM',
      stage: 2,
      assignedCem: 'Julian Vancore',
      leadOwner: 'Outbound Campaign',
      createdDate: '2023-10-15',
      updatedDate: '2023-10-23 11:15',
      sourceQuality: 2,
      leadSource: 'Direct Email Outbound',
      requirementSummary: 'Seeking real-time asset tracking integration API for logistics operations. System needs to sync every 5 seconds.',
      activeMandate: 'Review API payload specifications',
      mandateDueDate: '2023-10-29',
      notes: [],
      calls: []
    },
    {
      id: 'L-3310-X',
      company: 'CloudScale Solutions',
      contactPerson: 'Aria Sterling',
      industry: 'Enterprise SaaS',
      phone: '+1 (555) 076-4321',
      email: 'aria@cloudscalesolutions.io',
      priority: 'LOW',
      stage: 4,
      assignedCem: 'Julian Vancore',
      leadOwner: 'Referral Program',
      createdDate: '2023-10-08',
      updatedDate: '2023-10-22 09:30',
      sourceQuality: 4,
      leadSource: 'CEO Referral',
      requirementSummary: 'Needs multi-region security and DPDPA compliance advisory for their upcoming SaaS platform launch in India.',
      activeMandate: 'Draft compliance roadmap report',
      mandateDueDate: '2023-11-02',
      notes: [],
      calls: []
    },
    {
      id: 'L-8812-K',
      company: 'Titan Manufacturing',
      contactPerson: 'Robert Frost',
      industry: 'Heavy Industry',
      phone: '+1 (555) 089-7612',
      email: 'r.frost@titanmfg.com',
      priority: 'CRITICAL',
      stage: 1,
      assignedCem: 'Julian Vancore',
      leadOwner: 'Inbound Demo Request',
      createdDate: '2023-10-24',
      updatedDate: '2023-10-24 16:45',
      sourceQuality: 3,
      leadSource: 'Website Inbound Form',
      requirementSummary: 'Urgent request for demo of predictive maintenance workflows for factory floor IoT sensors.',
      activeMandate: 'Set up customized IoT sandbox portal',
      mandateDueDate: '2023-10-26',
      notes: [],
      calls: []
    }
  ]);

  const [activeTab, setActiveTab] = useState<'All' | 'New' | 'Contacted' | 'Follow Up' | 'Qualified'>('All');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('L-9823-A');
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  // Quick Action Dialogs State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [callText, setCallText] = useState('');

  // Form State - New Lead
  const [newCompany, setNewCompany] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPriority, setNewPriority] = useState<Lead['priority']>('MEDIUM');
  const [newSource, setNewSource] = useState('');
  const [newRequirements, setNewRequirements] = useState('');

  const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newContact || !newIndustry || !newPhone || !newEmail) return;

    const newLead: Lead = {
      id: `L-${Math.floor(1000 + Math.random() * 9000)}-Z`,
      company: newCompany,
      contactPerson: newContact,
      industry: newIndustry,
      phone: newPhone,
      email: newEmail,
      priority: newPriority,
      stage: 1,
      assignedCem: 'Julian Vancore',
      leadOwner: 'Marketing Inbound',
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      sourceQuality: 3,
      leadSource: newSource || 'Direct Entry',
      requirementSummary: newRequirements || 'No specific requirements logged.',
      activeMandate: 'Complete Initial Discovery outreach',
      mandateDueDate: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0],
      notes: [],
      calls: []
    };

    setLeads([...leads, newLead]);
    setSelectedLeadId(newLead.id);
    setIsNewLeadModalOpen(false);
    toast.success('New lead created successfully!');

    // Reset Form
    setNewCompany('');
    setNewContact('');
    setNewIndustry('');
    setNewPhone('');
    setNewEmail('');
    setNewPriority('MEDIUM');
    setNewSource('');
    setNewRequirements('');
  };

  const handleUpdateStage = () => {
    if (selectedLead.stage >= 6) {
      toast.error('Lead is already in the final Handoff stage!');
      return;
    }
    setLeads(prev => prev.map(l => {
      if (l.id === selectedLead.id) {
        return {
          ...l,
          stage: (l.stage + 1) as Lead['stage'],
          updatedDate: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
      }
      return l;
    }));
    toast.success(`Pipeline updated to stage: ${STAGE_LABELS[selectedLead.stage]}`);
  };

  const handleQualifyLead = () => {
    setLeads(prev => prev.map(l => {
      if (l.id === selectedLead.id) {
        return {
          ...l,
          stage: 5, // Qualified stage
          priority: 'CRITICAL',
          updatedDate: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
      }
      return l;
    }));
    toast.success('Lead marked as QUALIFIED and flagged as CRITICAL for handoff!');
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText) return;
    setLeads(prev => prev.map(l => {
      if (l.id === selectedLead.id) {
        return {
          ...l,
          notes: [...(l.notes || []), noteText],
          updatedDate: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
      }
      return l;
    }));
    setNoteText('');
    setIsNoteModalOpen(false);
    toast.success('Meeting notes added successfully!');
  };

  const handleLogCallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callText) return;
    setLeads(prev => prev.map(l => {
      if (l.id === selectedLead.id) {
        return {
          ...l,
          calls: [...(l.calls || []), callText],
          updatedDate: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
      }
      return l;
    }));
    setCallText('');
    setIsCallModalOpen(false);
    toast.success('Call log submitted successfully!');
  };

  // Filter Leads
  const filteredLeads = leads.filter(l => {
    if (activeTab === 'All') return true;
    if (activeTab === 'New') return l.stage === 1;
    if (activeTab === 'Contacted') return l.stage === 2;
    if (activeTab === 'Follow Up') return l.stage === 4;
    if (activeTab === 'Qualified') return l.stage === 5;
    return true;
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans border-t border-slate-200">
      <Toaster position="top-right" />

      {/* Left Sidebar: Leads List */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col h-full flex-shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Leads</h2>
          <button 
            onClick={() => setIsNewLeadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> New Lead
          </button>
        </div>

        {/* Tab Filters */}
        <div className="px-4 py-3 flex flex-wrap gap-1.5 border-b border-slate-50 bg-slate-50/50">
          {(['All', 'New', 'Contacted', 'Follow Up', 'Qualified'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                activeTab === tab 
                  ? 'bg-slate-950 text-white border-slate-950 shadow-sm' 
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab === 'All' ? 'All Leads' : tab}
            </button>
          ))}
        </div>

        {/* Column Subheader */}
        <div className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between bg-slate-50/20 border-b border-slate-50">
          <span>Company / Contact</span>
          <span>Priority</span>
        </div>

        {/* Leads List Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredLeads.length > 0 ? (
            filteredLeads.map(lead => (
              <div
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className={`p-5 cursor-pointer transition-all flex justify-between items-start ${
                  selectedLeadId === lead.id 
                    ? 'bg-blue-50/60 border-l-4 border-blue-600 pl-4' 
                    : 'hover:bg-slate-50/50 border-l-4 border-transparent'
                }`}
              >
                <div>
                  <h4 className="text-sm font-black text-slate-900">{lead.company}</h4>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{lead.contactPerson} · {lead.industry}</p>
                  <span className="inline-block text-[9px] font-bold text-slate-400 mt-2 bg-slate-100 border border-slate-200 px-1 py-0.5 rounded uppercase tracking-wider">{lead.id}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                  lead.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                  lead.priority === 'MEDIUM' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                  'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {lead.priority}
                </span>
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-xs font-semibold text-slate-400">
              No leads in this filter.
            </div>
          )}
        </div>
      </div>

      {/* Right Main Panel: Lead details */}
      <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden">
        {selectedLead ? (
          <>
            {/* Detail Header */}
            <div className="px-8 py-6 bg-white border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{selectedLead.company}</h1>
                  <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-0.5 rounded">
                    {selectedLead.id}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-400 mt-1">
                  Last updated: {selectedLead.updatedDate} UTC
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleUpdateStage}
                  className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Update Stage
                </button>
                <button 
                  onClick={handleQualifyLead}
                  className="px-4 py-2 text-xs font-black uppercase tracking-wider text-white bg-slate-950 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Qualify Lead
                </button>
              </div>
            </div>

            {/* Main Area Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              
              {/* Execution Pipeline */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Execution Pipeline
                </h3>

                <div className="flex items-center justify-between relative px-6 py-4">
                  {/* Pipeline Connecting Line */}
                  <div className="absolute top-8 left-16 right-16 h-0.5 bg-slate-100 rounded-full z-0">
                    <div 
                      className="h-full bg-slate-950 transition-all duration-300"
                      style={{ width: `${((selectedLead.stage - 1) / (STAGE_LABELS.length - 1)) * 100}%` }}
                    ></div>
                  </div>

                  {/* Steps */}
                  {STAGE_LABELS.map((label, idx) => {
                    const stepNum = idx + 1;
                    const isActive = selectedLead.stage === stepNum;
                    const isCompleted = selectedLead.stage > stepNum;

                    return (
                      <div key={label} className="flex flex-col items-center gap-2.5 relative z-10 w-24">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-300 ${
                          isActive ? 'bg-slate-950 text-white font-extrabold ring-2 ring-slate-200' :
                          isCompleted ? 'bg-slate-950 text-white' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                        </div>
                        <span className={`text-[9px] font-black text-center leading-tight tracking-wider transition-colors ${
                          isActive ? 'text-slate-950 font-black' : 
                          isCompleted ? 'text-slate-600' : 
                          'text-slate-400'
                        }`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detail Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ownership & Timeline */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-3 border-b border-slate-100">
                    Ownership & Timeline
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-y-4 pt-4 text-xs font-semibold">
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Assigned CEM</div>
                      <div className="text-slate-800 font-extrabold mt-1">{selectedLead.assignedCem}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Lead Owner</div>
                      <div className="text-slate-800 font-extrabold mt-1">{selectedLead.leadOwner}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Created</div>
                      <div className="text-slate-600 mt-1">{selectedLead.createdDate}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Updated</div>
                      <div className="text-slate-600 mt-1">{selectedLead.updatedDate}</div>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-3 border-b border-slate-100">
                    Contact Details
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-y-4 pt-4 text-xs font-semibold">
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Contact Person</div>
                      <div className="text-slate-800 font-extrabold mt-1">{selectedLead.contactPerson}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Industry</div>
                      <div className="text-slate-800 font-extrabold mt-1">{selectedLead.industry}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Phone</div>
                      <div className="text-slate-600 mt-1">{selectedLead.phone}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Email</div>
                      <div className="text-slate-600 mt-1 break-all">{selectedLead.email}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Context & Requirements */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                  Lead Context & Requirements
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold pt-2">
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Source Quality</div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(dot => (
                          <span 
                            key={dot} 
                            className={`w-2.5 h-2.5 rounded-full ${
                              dot <= selectedLead.sourceQuality ? 'bg-slate-900' : 'bg-slate-200'
                            }`}
                          ></span>
                        ))}
                      </div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-600">
                        {selectedLead.sourceQuality >= 3 ? 'High' : 'Standard'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Lead Source</div>
                    <div className="text-slate-800 font-extrabold mt-2 leading-relaxed">{selectedLead.leadSource}</div>
                  </div>

                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Requirement Summary</div>
                    <p className="text-slate-600 mt-2 font-medium leading-relaxed">
                      {selectedLead.requirementSummary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes & Logs History if exists */}
              {((selectedLead.notes && selectedLead.notes.length > 0) || (selectedLead.calls && selectedLead.calls.length > 0)) && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Activity History
                  </h3>
                  
                  <div className="space-y-3 text-xs">
                    {selectedLead.notes?.map((note, index) => (
                      <div key={index} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
                        <div>
                          <div className="font-extrabold text-slate-800">Meeting Notes Added</div>
                          <p className="text-slate-600 mt-1 font-medium leading-relaxed">{note}</p>
                        </div>
                      </div>
                    ))}

                    {selectedLead.calls?.map((call, index) => (
                      <div key={index} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <Phone className="w-4 h-4 text-slate-500 mt-0.5" />
                        <div>
                          <div className="font-extrabold text-slate-800">Call Logged</div>
                          <p className="text-slate-600 mt-1 font-medium leading-relaxed">{call}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Mandate Banner */}
              <div className="bg-[#111827] text-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-800 relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-slate-800/10 rotate-12 pointer-events-none"></div>
                <div>
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                    Active Mandate
                  </p>
                  <h4 className="text-base font-black text-slate-100 mt-1.5 tracking-tight">
                    {selectedLead.activeMandate}
                  </h4>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest sm:text-right">
                    Due Date
                  </div>
                  <div className="text-sm font-black text-slate-100 mt-1.5 flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5 text-rose-500" /> {selectedLead.mandateDueDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0 shadow-inner">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsNoteModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider"
                >
                  <FileText className="w-4 h-4 text-slate-500" /> Add Notes
                </button>
                <button 
                  onClick={() => setIsCallModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider"
                >
                  <Phone className="w-4 h-4 text-slate-500" /> Log Call
                </button>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                  Schedule Follow Up
                </button>
                <button className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-slate-950 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                  Schedule Meeting
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        )}
      </div>

      {/* Modal - New Lead */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleCreateLead} className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-950 flex items-center gap-2 text-base">
                <Sparkles className="w-5 h-5 text-blue-600" /> Create New CRM Lead
              </h3>
              <button 
                type="button"
                onClick={() => setIsNewLeadModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Name</label>
                <input 
                  type="text" 
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                  placeholder="e.g. Nebula Systems Inc." 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Person</label>
                  <input 
                    type="text" 
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                    placeholder="Sarah Jenkins"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Industry</label>
                  <input 
                    type="text" 
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                    placeholder="e.g. Fintech"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                  <input 
                    type="text" 
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                    placeholder="+1 (555) 012-9983" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                    placeholder="e.g. s.jenkins@company.com" 
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Lead Priority</label>
                  <select 
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Lead Source</label>
                  <input 
                    type="text" 
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                    placeholder="e.g. Strategic Webinar Q4" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Lead Requirements Summary</label>
                <textarea 
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950" 
                  placeholder="Summarize product needs, technology constraints, and timeline indicators..." 
                  rows={3}
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsNewLeadModalOpen(false)} 
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-white shadow-sm transition-colors"
              >
                Create Lead
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal - Add Note */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleAddNoteSubmit} className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-950 flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-blue-600" /> Add Meeting Notes
              </h3>
              <button type="button" onClick={() => setIsNoteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <textarea 
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950" 
                placeholder="Log critical outcomes, questions raised, and requirements discussed..." 
                rows={4}
                required
              />
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button type="button" onClick={() => setIsNoteModalOpen(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-950 text-white hover:bg-slate-800">
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal - Log Call */}
      {isCallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleLogCallSubmit} className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-950 flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-blue-600" /> Log Client Call
              </h3>
              <button type="button" onClick={() => setIsCallModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <textarea 
                value={callText}
                onChange={(e) => setCallText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950" 
                placeholder="Spoke with contact person, discussed follow-up strategy..." 
                rows={4}
                required
              />
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button type="button" onClick={() => setIsCallModalOpen(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-950 text-white hover:bg-slate-800">
                Log Call
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
