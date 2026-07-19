"use client";

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  FileText, 
  CheckSquare, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck2, 
  MessageSquare, 
  PhoneCall, 
  Paperclip, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Layers,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import toast, { Toaster } from 'react-hot-toast';

interface Stakeholder {
  name: string;
  role: string;
  email: string;
  phone: string;
  isDecisionMaker?: boolean;
}

interface RequirementItem {
  id: string;
  name: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Approved' | 'Pending' | 'In Review' | 'Validation Needed';
  lastUpdated: string;
}

interface ChangeRequest {
  id: string;
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  status: 'OPEN' | 'APPROVED' | 'REJECTED';
  requestedDate: string;
}

interface ClientAccount {
  id: string;
  company: string;
  industry: string;
  primaryContact: string;
  email: string;
  phone: string;
  stage: 1 | 2 | 3 | 4 | 5 | 6; 
  // 1: Assigned, 2: Requirements Gathering, 3: Requirements Review, 4: Client Validation, 5: Proposal Preparation, 6: Ready For Sales
  accountHealth: 'On Track' | 'Awaiting Client' | 'Blocked' | 'Review Needed';
  readinessScore: number; // 0-100%
  requirementsList: RequirementItem[];
  stakeholders: Stakeholder[];
  changeRequests: ChangeRequest[];
  documents: { name: string; size: string; type: string; date: string }[];
  meetingsHistory: { date: string; title: string; outcome: string }[];
  checklist: { id: string; label: string; completed: boolean }[];
}

const CRM_STAGE_LABELS = [
  'Assigned',
  'Req Gathering',
  'Req Review',
  'Client Validation',
  'Proposal Prep',
  'Ready For Sales'
];

export default function CrmWorkspaceView() {
  const [accounts, setAccounts] = useState<ClientAccount[]>([
    {
      id: 'ACC-9012',
      company: 'Omni-Channel Corp',
      industry: 'Retail & Logistics',
      primaryContact: 'Sarah Mitchell (Ops Head)',
      email: 's.mitchell@omnichannel.com',
      phone: '+1 (555) 012-9932',
      stage: 3,
      accountHealth: 'On Track',
      readinessScore: 65,
      stakeholders: [
        { name: 'Sarah Mitchell', role: 'Operations Head', email: 's.mitchell@omnichannel.com', phone: '+1 (555) 012-9932', isDecisionMaker: true },
        { name: 'Marcus Thorne', role: 'CTO / Tech Lead', email: 'marcus@omnichannel.com', phone: '+1 (555) 012-9933', isDecisionMaker: true },
        { name: 'John Miller', role: 'Finance Director', email: 'j.miller@omnichannel.com', phone: '+1 (555) 012-9934' }
      ],
      requirementsList: [
        { id: 'REQ-101', name: 'Warehouse Integration API & Webhook Feed', category: 'API Integration', priority: 'High', status: 'Approved', lastUpdated: 'Today' },
        { id: 'REQ-102', name: 'Multi-carrier Shipping Cost Engine', category: 'Core Logic', priority: 'Medium', status: 'In Review', lastUpdated: 'Yesterday' },
        { id: 'REQ-103', name: 'Customs Autocompletion & Tax Module', category: 'Compliance', priority: 'High', status: 'Validation Needed', lastUpdated: '18 Jul' }
      ],
      changeRequests: [
        { id: 'CR-01', title: 'Add Automated SMS Notifications for Shippers', impact: 'Medium', status: 'OPEN', requestedDate: '16 Jul' },
        { id: 'CR-02', title: 'Expand API Rate limit to 10k req/min', impact: 'High', status: 'APPROVED', requestedDate: '12 Jul' }
      ],
      documents: [
        { name: 'BRD_OmniChannel_v2.pdf', size: '2.4 MB', type: 'PDF', date: '15 Jul' },
        { name: 'Architecture_Diagram.png', size: '1.1 MB', type: 'PNG', date: '17 Jul' },
        { name: 'Proposal_Draft_v1.docx', size: '840 KB', type: 'DOCX', date: '18 Jul' }
      ],
      meetingsHistory: [
        { date: '16 Jul', title: 'Requirements Review Sync', outcome: 'Scope Frozen for Module A' },
        { date: '12 Jul', title: 'Initial Client Discovery Call', outcome: 'BRD Shared for Signoff' }
      ],
      checklist: [
        { id: 'chk-1', label: 'Primary Contact Aligned on BRD Scope', completed: true },
        { id: 'chk-2', label: 'CTO Technical Validation Completed', completed: true },
        { id: 'chk-3', label: 'Change Requests Impact Assessed', completed: false },
        { id: 'chk-4', label: 'Proposal & Commercial Terms Finalized', completed: false },
        { id: 'chk-5', label: 'Ready for Sales Handoff Signoff', completed: false }
      ]
    },
    {
      id: 'ACC-8109',
      company: 'Stellar Dynamics Aerospace',
      industry: 'Aerospace Systems',
      primaryContact: 'Alan Drago (VP Eng)',
      email: 'a.drago@stellar.io',
      phone: '+1 (555) 032-1244',
      stage: 5,
      accountHealth: 'Review Needed',
      readinessScore: 85,
      stakeholders: [
        { name: 'Alan Drago', role: 'VP Engineering', email: 'a.drago@stellar.io', phone: '+1 (555) 032-1244', isDecisionMaker: true },
        { name: 'Elena Rostova', role: 'Security Compliance Manager', email: 'elena@stellar.io', phone: '+1 (555) 032-1245' }
      ],
      requirementsList: [
        { id: 'REQ-201', name: 'Telemetry Real-time Processing Engine', category: 'Data Pipeline', priority: 'High', status: 'Approved', lastUpdated: '14 Jul' },
        { id: 'REQ-202', name: 'Air-gapped Deployment Architecture', category: 'Infrastructure', priority: 'High', status: 'Approved', lastUpdated: '15 Jul' }
      ],
      changeRequests: [
        { id: 'CR-05', title: 'ISO 27001 Security Audit Log Compliance', impact: 'High', status: 'APPROVED', requestedDate: '10 Jul' }
      ],
      documents: [
        { name: 'RFP_Stellar_Response.pdf', size: '4.8 MB', type: 'PDF', date: '10 Jul' },
        { name: 'Security_Compliance_Matrix.xlsx', size: '1.2 MB', type: 'XLSX', date: '14 Jul' }
      ],
      meetingsHistory: [
        { date: '14 Jul', title: 'Proposal Commercial Review', outcome: 'Awaiting Executive Approval' }
      ],
      checklist: [
        { id: 'chk-1', label: 'Primary Contact Aligned on BRD Scope', completed: true },
        { id: 'chk-2', label: 'CTO Technical Validation Completed', completed: true },
        { id: 'chk-3', label: 'Change Requests Impact Assessed', completed: true },
        { id: 'chk-4', label: 'Proposal & Commercial Terms Finalized', completed: true },
        { id: 'chk-5', label: 'Ready for Sales Handoff Signoff', completed: false }
      ]
    }
  ]);

  const [selectedAccountId, setSelectedAccountId] = useState<string>('ACC-9012');
  const [filterHealth, setFilterHealth] = useState<string>('ALL');

  // Modals
  const [isAddReqOpen, setIsAddReqOpen] = useState(false);
  const [isAddCROpen, setIsAddCROpen] = useState(false);
  const [isAddStakeholderOpen, setIsAddStakeholderOpen] = useState(false);

  // Form inputs
  const [newReqName, setNewReqName] = useState('');
  const [newReqCategory, setNewReqCategory] = useState('Core Feature');
  const [newReqPriority, setNewReqPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  const [newCRTitle, setNewCRTitle] = useState('');
  const [newCRImpact, setNewCRImpact] = useState<'High' | 'Medium' | 'Low'>('Medium');

  const [newStkName, setNewStkName] = useState('');
  const [newStkRole, setNewStkRole] = useState('');
  const [newStkEmail, setNewStkEmail] = useState('');
  const [newStkPhone, setNewStkPhone] = useState('');

  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  const handleStageAdvance = () => {
    if (selectedAccount.stage >= 6) {
      toast.error('Account is already marked Ready For Sales!');
      return;
    }
    const nextStage = (selectedAccount.stage + 1) as ClientAccount['stage'];
    setAccounts(prev => prev.map(acc => {
      if (acc.id === selectedAccount.id) {
        return {
          ...acc,
          stage: nextStage,
          readinessScore: Math.min(100, acc.readinessScore + 15)
        };
      }
      return acc;
    }));
    toast.success(`Requirement Lifecycle advanced to: ${CRM_STAGE_LABELS[nextStage - 1]}`);
  };

  const handleToggleChecklist = (checkId: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === selectedAccount.id) {
        const updatedList = acc.checklist.map(item => 
          item.id === checkId ? { ...item, completed: !item.completed } : item
        );
        const completedCount = updatedList.filter(i => i.completed).length;
        const score = Math.round((completedCount / updatedList.length) * 100);
        return {
          ...acc,
          checklist: updatedList,
          readinessScore: score
        };
      }
      return acc;
    }));
  };

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqName) return;
    const item: RequirementItem = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      name: newReqName,
      category: newReqCategory,
      priority: newReqPriority,
      status: 'Pending',
      lastUpdated: 'Today'
    };
    setAccounts(prev => prev.map(acc => {
      if (acc.id === selectedAccount.id) {
        return {
          ...acc,
          requirementsList: [item, ...acc.requirementsList]
        };
      }
      return acc;
    }));
    setNewReqName('');
    setIsAddReqOpen(false);
    toast.success('New Requirement specification added!');
  };

  const handleAddCR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCRTitle) return;
    const cr: ChangeRequest = {
      id: `CR-${Math.floor(10 + Math.random() * 90)}`,
      title: newCRTitle,
      impact: newCRImpact,
      status: 'OPEN',
      requestedDate: 'Today'
    };
    setAccounts(prev => prev.map(acc => {
      if (acc.id === selectedAccount.id) {
        return {
          ...acc,
          changeRequests: [cr, ...acc.changeRequests]
        };
      }
      return acc;
    }));
    setNewCRTitle('');
    setIsAddCROpen(false);
    toast.success('Change Request logged for impact evaluation!');
  };

  const handleAddStakeholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStkName || !newStkRole) return;
    const stk: Stakeholder = {
      name: newStkName,
      role: newStkRole,
      email: newStkEmail,
      phone: newStkPhone
    };
    setAccounts(prev => prev.map(acc => {
      if (acc.id === selectedAccount.id) {
        return {
          ...acc,
          stakeholders: [...acc.stakeholders, stk]
        };
      }
      return acc;
    }));
    setNewStkName('');
    setNewStkRole('');
    setNewStkEmail('');
    setNewStkPhone('');
    setIsAddStakeholderOpen(false);
    toast.success('Stakeholder added to Client Directory!');
  };

  const filteredAccounts = accounts.filter(acc => {
    if (filterHealth === 'ALL') return true;
    return acc.accountHealth === filterHealth;
  });

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans border-t border-slate-800">
      <Toaster position="top-right" />

      {/* LEFT SIDEBAR: CLIENT PORTFOLIO */}
      <div className="w-80 border-r border-slate-800 bg-slate-950 flex flex-col h-full flex-shrink-0">
        
        {/* Workspace Brand Header */}
        <div className="p-5 pb-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white tracking-wide uppercase">CRM Client Workspace</h2>
                <p className="text-[10px] font-semibold text-slate-400">Requirement & Proposal Hub</p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase rounded tracking-widest">
              CRM ROLE
            </span>
          </div>
        </div>

        {/* Portfolio Filter Sub-header */}
        <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-900/40 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Client Accounts ({filteredAccounts.length})
          </span>
          <select
            value={filterHealth}
            onChange={(e) => setFilterHealth(e.target.value)}
            className="text-[10px] font-bold text-slate-300 bg-slate-800 border border-slate-700 rounded px-2 py-1 focus:outline-none"
          >
            <option value="ALL">ALL HEALTH</option>
            <option value="On Track">ON TRACK</option>
            <option value="Review Needed">REVIEW NEEDED</option>
            <option value="Awaiting Client">AWAITING CLIENT</option>
          </select>
        </div>

        {/* Client Account Portfolio List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {filteredAccounts.map(acc => {
            const isSelected = acc.id === selectedAccountId;
            return (
              <div
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`p-4 cursor-pointer transition-all border-l-4 ${
                  isSelected 
                    ? 'bg-slate-800/80 border-emerald-400 pl-3.5' 
                    : 'hover:bg-slate-900/60 border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-bold text-white truncate max-w-[170px]">{acc.company}</h4>
                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                    acc.accountHealth === 'On Track' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {acc.accountHealth}
                  </span>
                </div>
                
                <p className="text-[10px] font-semibold text-slate-400 mt-1 truncate">{acc.primaryContact}</p>

                <div className="mt-3 flex items-center justify-between text-[9px] text-slate-400">
                  <span className="font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">{acc.id}</span>
                  <span className="font-bold text-emerald-400">{acc.readinessScore}% Ready</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT MAIN VIEW: REQUIREMENT & ACCOUNT DETAILS */}
      <div className="flex-1 bg-slate-900 flex flex-col h-full overflow-hidden">
        {selectedAccount && (
          <>
            {/* Top Bar Header */}
            <div className="px-8 py-5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-black text-white tracking-tight">{selectedAccount.company}</h1>
                  <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                    {selectedAccount.id}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                    {selectedAccount.industry}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  Primary Contact: <span className="text-slate-200">{selectedAccount.primaryContact}</span> ({selectedAccount.email})
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsAddReqOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Requirement
                </button>
                <button 
                  onClick={handleStageAdvance}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  Advance Lifecycle Stage <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              
              {/* REQUIREMENT LIFECYCLE TRACKER (6 STAGES) */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" /> Requirement Lifecycle Stage
                  </h3>
                  <span className="text-xs font-bold text-emerald-400">
                    Current: {CRM_STAGE_LABELS[selectedAccount.stage - 1]} (Stage {selectedAccount.stage} of 6)
                  </span>
                </div>

                <div className="flex items-center justify-between relative px-4 py-2">
                  <div className="absolute top-6 left-12 right-12 h-0.5 bg-slate-800 z-0">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${((selectedAccount.stage - 1) / (CRM_STAGE_LABELS.length - 1)) * 100}%` }}
                    ></div>
                  </div>
                  {CRM_STAGE_LABELS.map((label, idx) => {
                    const stepNum = idx + 1;
                    const isActive = selectedAccount.stage === stepNum;
                    const isCompleted = selectedAccount.stage > stepNum;
                    return (
                      <div key={label} className="flex flex-col items-center gap-2 relative z-10 w-24">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-950 transition-all duration-300 text-xs ${
                          isActive ? 'bg-emerald-500 text-slate-950 font-black ring-4 ring-emerald-500/20' :
                          isCompleted ? 'bg-emerald-600 text-white font-bold' :
                          'bg-slate-800 text-slate-500 font-semibold'
                        }`}>
                          {isCompleted ? <CheckSquare className="w-3.5 h-3.5" /> : stepNum}
                        </div>
                        <span className={`text-[9px] font-black text-center leading-tight tracking-wider ${
                          isActive ? 'text-emerald-400' : isCompleted ? 'text-slate-300' : 'text-slate-500'
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
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
                      <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" /> Client Requirement Specifications ({selectedAccount.requirementsList.length})
                      </h3>
                      <button 
                        onClick={() => setIsAddReqOpen(true)}
                        className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Spec
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-900/60 border-b border-slate-800">
                            <th className="px-5 py-3">ID & NAME</th>
                            <th className="px-4 py-3">CATEGORY</th>
                            <th className="px-4 py-3">PRIORITY</th>
                            <th className="px-4 py-3">STATUS</th>
                            <th className="px-4 py-3">UPDATED</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-xs">
                          {selectedAccount.requirementsList.map((req) => (
                            <tr key={req.id} className="hover:bg-slate-900/40 transition-colors">
                              <td className="px-5 py-3.5 font-semibold text-white">
                                <div className="font-bold">{req.name}</div>
                                <div className="text-[10px] font-mono text-slate-500">{req.id}</div>
                              </td>
                              <td className="px-4 py-3.5 font-medium text-slate-300">{req.category}</td>
                              <td className="px-4 py-3.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                  req.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                  'bg-slate-800 text-slate-300'
                                }`}>
                                  {req.priority}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                  req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  req.status === 'Validation Needed' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                  'bg-slate-800 text-slate-400'
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-slate-400 text-[11px]">{req.lastUpdated}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* STAKEHOLDERS MATRIX */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" /> Stakeholder Management Matrix
                      </h3>
                      <button 
                        onClick={() => setIsAddStakeholderOpen(true)}
                        className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Stakeholder
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedAccount.stakeholders.map((stk, idx) => (
                        <div key={idx} className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-white">{stk.name}</h4>
                              <p className="text-[10px] font-semibold text-slate-400">{stk.role}</p>
                            </div>
                            {stk.isDecisionMaker && (
                              <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-black uppercase rounded">
                                Decision Maker
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 space-y-1 font-mono pt-1">
                            <div>📧 {stk.email}</div>
                            <div>📞 {stk.phone}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CHANGE REQUEST SUMMARY */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400" /> Change Request Log ({selectedAccount.changeRequests.length})
                      </h3>
                      <button 
                        onClick={() => setIsAddCROpen(true)}
                        className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded text-[10px] font-bold hover:bg-amber-500/20 transition-all"
                      >
                        + Log Change Request
                      </button>
                    </div>

                    <div className="space-y-3">
                      {selectedAccount.changeRequests.map(cr => (
                        <div key={cr.id} className="p-3.5 bg-slate-900/40 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono text-[10px] text-slate-500 mr-2">{cr.id}</span>
                            <span className="font-bold text-white">{cr.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              cr.impact === 'High' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {cr.impact} Impact
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                              cr.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {cr.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT 1-COLUMN: SALES READINESS CHECKLIST & CLIENT DOCUMENTS */}
                <div className="space-y-6">
                  
                  {/* SALES READINESS CHECKLIST */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> Sales Readiness Checklist
                      </h3>
                      <span className="text-xs font-extrabold text-emerald-400">{selectedAccount.readinessScore}%</span>
                    </div>

                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${selectedAccount.readinessScore}%` }}></div>
                    </div>

                    <div className="space-y-3 pt-2">
                      {selectedAccount.checklist.map(item => (
                        <label 
                          key={item.id} 
                          onClick={() => handleToggleChecklist(item.id)}
                          className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 cursor-pointer transition-colors"
                        >
                          <input 
                            type="checkbox" 
                            checked={item.completed}
                            onChange={() => {}}
                            className="mt-0.5 accent-emerald-500 rounded cursor-pointer" 
                          />
                          <span className={`text-xs font-semibold ${item.completed ? 'text-slate-300 line-through' : 'text-white'}`}>
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* CLIENT DOCUMENTS */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-emerald-400" /> Client Documents
                      </h3>
                      <button className="text-[10px] font-bold text-emerald-400 hover:underline">
                        Upload
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {selectedAccount.documents.map((doc, idx) => (
                        <div key={idx} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-200 truncate">{doc.name}</div>
                              <div className="text-[10px] text-slate-500">{doc.size} • {doc.date}</div>
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 hover:text-emerald-400 cursor-pointer" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RECENT CLARIFICATION MEETINGS */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                      <MessageSquare className="w-4 h-4 text-emerald-400" /> Requirement Discussions
                    </h3>
                    <div className="space-y-3">
                      {selectedAccount.meetingsHistory.map((m, idx) => (
                        <div key={idx} className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{m.title}</span>
                            <span className="text-[10px] text-slate-500">{m.date}</span>
                          </div>
                          <p className="text-[11px] text-emerald-400 font-semibold">{m.outcome}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </>
        )}
      </div>

      {/* MODAL: ADD REQUIREMENT */}
      {isAddReqOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase">Add Requirement Specification</h3>
            <form onSubmit={handleAddRequirement} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Requirement Title</label>
                <input 
                  type="text" 
                  value={newReqName} 
                  onChange={e => setNewReqName(e.target.value)}
                  placeholder="e.g. Real-time Inventory Webhook" 
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  required 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
                <input 
                  type="text" 
                  value={newReqCategory} 
                  onChange={e => setNewReqCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Priority</label>
                <select 
                  value={newReqPriority} 
                  onChange={e => setNewReqPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddReqOpen(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-bold">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-emerald-600 text-white rounded font-bold">Save Spec</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CHANGE REQUEST */}
      {isAddCROpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase">Log Change Request</h3>
            <form onSubmit={handleAddCR} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Change Request Title</label>
                <input 
                  type="text" 
                  value={newCRTitle} 
                  onChange={e => setNewCRTitle(e.target.value)}
                  placeholder="e.g. Scope extension for SMS gateway" 
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-amber-500"
                  required 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Impact Level</label>
                <select 
                  value={newCRImpact} 
                  onChange={e => setNewCRImpact(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddCROpen(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-bold">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-amber-600 text-white rounded font-bold">Log CR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD STAKEHOLDER */}
      {isAddStakeholderOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase">Add Stakeholder to Directory</h3>
            <form onSubmit={handleAddStakeholder} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Name</label>
                <input 
                  type="text" 
                  value={newStkName} 
                  onChange={e => setNewStkName(e.target.value)}
                  placeholder="e.g. Marcus Thorne" 
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none"
                  required 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Role / Designation</label>
                <input 
                  type="text" 
                  value={newStkRole} 
                  onChange={e => setNewStkRole(e.target.value)}
                  placeholder="e.g. CTO / Decision Maker" 
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none"
                  required 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  value={newStkEmail} 
                  onChange={e => setNewStkEmail(e.target.value)}
                  placeholder="marcus@company.com" 
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone</label>
                <input 
                  type="text" 
                  value={newStkPhone} 
                  onChange={e => setNewStkPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000" 
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddStakeholderOpen(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-bold">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-emerald-600 text-white rounded font-bold">Save Stakeholder</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
