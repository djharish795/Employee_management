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
  Loader2,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  UserCheck,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import toast, { Toaster } from 'react-hot-toast';

interface Stakeholder {
  name: string;
  role: string;
  email: string;
  phone: string;
}

interface RequirementItem {
  name: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Approved' | 'Pending' | 'In Review';
  lastUpdated: string;
}

interface MeetingHistoryItem {
  date: string;
  type: string;
  outcome: 'Completed' | 'Awaiting Response' | 'Cancelled';
}

interface ClientLead {
  id: string;
  company: string;
  industry: string;
  phone: string;
  email: string;
  priority: 'CRITICAL' | 'MEDIUM' | 'LOW';
  stage: 1 | 2 | 3 | 4 | 5 | 6; // 1: Assigned, 2: Req Gathering, 3: Req Review, 4: Awaiting Client, 5: Proposal Prep, 6: Sales Handoff
  assignedCem: string;
  leadOwner: string;
  createdDate: string;
  updatedDate: string;
  sourceQuality: 1 | 2 | 3 | 4;
  leadSource: string;
  clientHealth: 'On Track' | 'Awaiting Client' | 'Blocked' | 'Delayed';
  changeRequests: {
    open: number;
    approved: number;
    rejected: number;
  };
  requirementsList: RequirementItem[];
  meetingsHistory: MeetingHistoryItem[];
  attachments: string[];
  stakeholders: Stakeholder[];
  notes?: string[];
  calls?: string[];
}

const STAGE_LABELS = [
  'Assigned',
  'Req Gathering',
  'Req Review',
  'Awaiting Client',
  'Proposal Prep',
  'Sales Handoff'
];

export default function LeadsWorkspacePage() {
  const role = useAuthStore((state) => state.role) || 'CEM';
  const isCrm = role === 'CRM';

  // State for accepted active clients/leads
  const [leads, setLeads] = useState<ClientLead[]>([
    {
      id: 'CID-88432',
      company: 'Omni-Channel Corp',
      industry: 'Retail & Logistics',
      phone: '+1 (555) 012-9932',
      email: 's.mitchell@omnichannel.com',
      priority: 'MEDIUM',
      stage: 3,
      assignedCem: 'John Doe',
      leadOwner: 'CEM - Global',
      createdDate: '2023-10-12',
      updatedDate: '2023-10-24 14:32',
      sourceQuality: 3,
      leadSource: 'Direct Inquiry',
      clientHealth: 'On Track',
      changeRequests: { open: 3, approved: 1, rejected: 1 },
      attachments: ['BRD.pdf', 'Requirements.xlsx', 'Proposal.docx'],
      stakeholders: [
        { name: 'Sarah Mitchell', role: 'Operations Head', email: 's.mitchell@omnichannel.com', phone: '+1 (555) 012-9932' },
        { name: 'Marcus Thorne', role: 'CTO / Decision Maker', email: 'marcus@omnichannel.com', phone: '+1 (555) 012-9933' },
        { name: 'John Miller', role: 'Finance Manager', email: 'j.miller@omnichannel.com', phone: '+1 (555) 012-9934' }
      ],
      requirementsList: [
        { name: 'Warehouse Integration API', priority: 'High', status: 'Approved', lastUpdated: 'Oct 20' },
        { name: 'Multi-carrier Shipping Logic', priority: 'Medium', status: 'Pending', lastUpdated: 'Oct 22' },
        { name: 'Customs Autocompletion Module', priority: 'High', status: 'In Review', lastUpdated: 'Oct 24' }
      ],
      meetingsHistory: [
        { date: '12 Oct', type: 'Requirement Discussion', outcome: 'Completed' },
        { date: '15 Oct', type: 'Clarification Call', outcome: 'Awaiting Response' }
      ],
      notes: ['Discussed budget thresholds with John Miller. Ready for final review.'],
      calls: ['Call with CTO Marcus confirming APAC scalability metrics.']
    },
    {
      id: 'CID-99281',
      company: 'Naprocs Global Solutions',
      industry: 'Enterprise Technology',
      phone: '+1 (555) 098-7612',
      email: 'p.kumar@naprocsglobal.com',
      priority: 'CRITICAL',
      stage: 2,
      assignedCem: 'Julian Vancore',
      leadOwner: 'Direct Campaign',
      createdDate: '2023-10-14',
      updatedDate: '2023-10-24 16:10',
      sourceQuality: 4,
      leadSource: 'CEO Referral',
      clientHealth: 'Awaiting Client',
      changeRequests: { open: 0, approved: 0, rejected: 0 },
      attachments: ['Initial_Specs.pdf'],
      stakeholders: [
        { name: 'Pradeep Kumar', role: 'Director', email: 'p.kumar@naprocsglobal.com', phone: '+1 (555) 098-7612' }
      ],
      requirementsList: [
        { name: 'Attendance Module', priority: 'High', status: 'Approved', lastUpdated: 'Oct 20' },
        { name: 'Payroll Module', priority: 'Medium', status: 'Pending', lastUpdated: 'Oct 22' },
        { name: 'Asset Module', priority: 'High', status: 'In Review', lastUpdated: 'Oct 24' }
      ],
      meetingsHistory: [
        { date: '16 Oct', type: 'Introduction Sync', outcome: 'Completed' }
      ]
    },
    {
      id: 'CID-77219',
      company: 'Stellar Dynamics',
      industry: 'Aerospace Systems',
      phone: '+1 (555) 032-1244',
      email: 'a.drago@stellar.io',
      priority: 'CRITICAL',
      stage: 5,
      assignedCem: 'Julian Vancore',
      leadOwner: 'Inbound Demo',
      createdDate: '2023-10-09',
      updatedDate: '2023-10-23 10:15',
      sourceQuality: 3,
      leadSource: 'Web Demo Form',
      clientHealth: 'Delayed',
      changeRequests: { open: 1, approved: 2, rejected: 0 },
      attachments: ['Stellar_Specs.docx', 'RFP_Response.pdf'],
      stakeholders: [
        { name: 'Alan Drago', role: 'VP Engineering', email: 'a.drago@stellar.io', phone: '+1 (555) 032-1244' }
      ],
      requirementsList: [
        { name: 'Telemetry Processing Hub', priority: 'High', status: 'Approved', lastUpdated: 'Oct 18' }
      ],
      meetingsHistory: [
        { date: '11 Oct', type: 'RFP Briefing', outcome: 'Completed' }
      ]
    }
  ]);

  // Acceptance Queue State (for Incoming Client Assignments)
  const [incomingAssignments, setIncomingAssignments] = useState([
    {
      id: 'CID-66231',
      company: 'Core Tech Infrastructure',
      assignedBy: 'Julian Vancore (CEM)',
      assignedDate: '2023-10-24',
      priority: 'LOW',
      industry: 'Data Center Ops',
      email: 'billing@coretech.com',
      phone: '+1 (555) 887-3321',
      requirements: 'Provisioning automated compliance checks and client portal SSO setup.',
    },
    {
      id: 'CID-55102',
      company: 'Vertex Logix Inc.',
      assignedBy: 'Sarah Jenkins (CEM)',
      assignedDate: '2023-10-25',
      priority: 'MEDIUM',
      industry: 'Logistics Technology',
      email: 'operations@vertexlogix.com',
      phone: '+1 (555) 441-9922',
      requirements: 'Integration of real-time route tracing feeds into customer notification panel.',
    }
  ]);

  const [activeTab, setActiveTab] = useState<'Active' | 'Incoming'>('Active');
  const [filterPriority, setFilterPriority] = useState<'All' | 'CRITICAL' | 'MEDIUM' | 'LOW'>('All');
  const [selectedClientId, setSelectedClientId] = useState<string>('CID-88432');
  const [selectedIncomingId, setSelectedIncomingId] = useState<string>('CID-66231');

  // Modal Dialogs State
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isAddReqModalOpen, setIsAddReqModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  // Form State variables
  const [newCompany, setNewCompany] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPriority, setNewPriority] = useState<'CRITICAL' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newSource, setNewSource] = useState('');
  
  // Requirement form variables
  const [reqName, setReqName] = useState('');
  const [reqPriority, setReqPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [reqStatus, setReqStatus] = useState<'Approved' | 'Pending' | 'In Review'>('Pending');

  // Input states for notes and calls
  const [noteText, setNoteText] = useState('');
  const [callText, setCallText] = useState('');

  const selectedClient = leads.find(l => l.id === selectedClientId) || leads[0];
  const selectedIncoming = incomingAssignments.find(i => i.id === selectedIncomingId) || incomingAssignments[0];

  // Handoff Actions: Accept / Clarification / Reject
  const handleAcceptAssignment = (incomingId: string) => {
    const item = incomingAssignments.find(i => i.id === incomingId);
    if (!item) return;

    // Convert incoming assignment to Active Client
    const newClient: ClientLead = {
      id: item.id,
      company: item.company,
      industry: item.industry,
      phone: item.phone,
      email: item.email,
      priority: item.priority as any,
      stage: 1, // Start at Assigned
      assignedCem: item.assignedBy.split(' ')[0],
      leadOwner: 'CEM Transition',
      createdDate: item.assignedDate,
      updatedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      sourceQuality: 3,
      leadSource: 'Incoming Handoff',
      clientHealth: 'On Track',
      changeRequests: { open: 0, approved: 0, rejected: 0 },
      attachments: [],
      stakeholders: [
        { name: 'Admin Operations', role: 'Point of Contact', email: item.email, phone: item.phone }
      ],
      requirementsList: [
        { name: 'Initial Implementation Draft', priority: 'Medium', status: 'Pending', lastUpdated: 'Today' }
      ],
      meetingsHistory: []
    };

    setLeads([...leads, newClient]);
    setIncomingAssignments(incomingAssignments.filter(i => i.id !== incomingId));
    setSelectedClientId(newClient.id);
    setActiveTab('Active');
    toast.success(`Client ${item.company} accepted into Active Workspace!`);
  };

  const handleRequestClarification = (incomingId: string) => {
    toast(`Clarification request sent to CEM coordinator for assignment ID ${incomingId}`, {
      icon: '💬',
      style: { background: '#0f172a', color: '#fff' }
    });
  };

  const handleRejectAssignment = (incomingId: string) => {
    setIncomingAssignments(incomingAssignments.filter(i => i.id !== incomingId));
    toast.error(`Assignment ${incomingId} rejected and returned to queue.`);
  };

  // Add a new client manually (CEM functionality)
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newContact || !newIndustry || !newPhone || !newEmail) return;

    const created: ClientLead = {
      id: `CID-${Math.floor(10000 + Math.random() * 90000)}`,
      company: newCompany,
      industry: newIndustry,
      phone: newPhone,
      email: newEmail,
      priority: newPriority,
      stage: 1,
      assignedCem: 'John Doe',
      leadOwner: 'Manual Entry',
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      sourceQuality: 3,
      leadSource: newSource || 'Manual Entry',
      clientHealth: 'On Track',
      changeRequests: { open: 0, approved: 0, rejected: 0 },
      attachments: [],
      stakeholders: [
        { name: newContact, role: 'Primary Contact', email: newEmail, phone: newPhone }
      ],
      requirementsList: [],
      meetingsHistory: []
    };

    setLeads([...leads, created]);
    setSelectedClientId(created.id);
    setIsNewClientModalOpen(false);
    toast.success('New client lead created successfully!');

    // Reset Form
    setNewCompany('');
    setNewContact('');
    setNewIndustry('');
    setNewPhone('');
    setNewEmail('');
    setNewPriority('MEDIUM');
    setNewSource('');
  };

  // Add individual requirement item to table
  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName || !selectedClient) return;

    const newItem: RequirementItem = {
      name: reqName,
      priority: reqPriority,
      status: reqStatus,
      lastUpdated: 'Today'
    };

    setLeads(prev => prev.map(l => {
      if (l.id === selectedClient.id) {
        return {
          ...l,
          requirementsList: [...l.requirementsList, newItem],
          updatedDate: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
      }
      return l;
    }));

    setReqName('');
    setIsAddReqModalOpen(false);
    toast.success('Requirement added to list!');
  };

  const handleUpdateStage = () => {
    if (selectedClient.stage >= 6) {
      toast.error('Client is already in the final Sales Handoff stage!');
      return;
    }
    setLeads(prev => prev.map(l => {
      if (l.id === selectedClient.id) {
        return {
          ...l,
          stage: (l.stage + 1) as ClientLead['stage'],
          updatedDate: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
      }
      return l;
    }));
    toast.success(`Engagement timeline updated to stage: ${STAGE_LABELS[selectedClient.stage]}`);
  };

  const handleUpdateHealth = (health: ClientLead['clientHealth']) => {
    setLeads(prev => prev.map(l => {
      if (l.id === selectedClient.id) {
        return {
          ...l,
          clientHealth: health,
          updatedDate: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
      }
      return l;
    }));
    toast.success(`Operational health set to: ${health}`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText) return;
    setLeads(prev => prev.map(l => {
      if (l.id === selectedClient.id) {
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
    toast.success('Meeting notes successfully saved!');
  };

  const handleLogCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callText) return;
    setLeads(prev => prev.map(l => {
      if (l.id === selectedClient.id) {
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
    toast.success('Call log entry created!');
  };

  // Filters
  const filteredActiveLeads = leads.filter(l => {
    if (filterPriority === 'All') return true;
    return l.priority === filterPriority;
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans border-t border-slate-200">
      <Toaster position="top-right" />

      {/* Left Sidebar: Workspace Listings */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col h-full flex-shrink-0">
        
        {/* Workspace Title Header */}
        <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            {isCrm ? 'Client Workspace' : 'Leads'}
          </h2>
          <button 
            onClick={() => setIsNewClientModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> New Client
          </button>
        </div>

        {/* Tab Selector (Active Clients vs Incoming Assignments Queue) */}
        {isCrm && (
          <div className="px-4 py-3 flex gap-1 border-b border-slate-100 bg-slate-50/50">
            <button
              onClick={() => setActiveTab('Active')}
              className={`flex-1 text-center py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                activeTab === 'Active'
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Active Clients
            </button>
            <button
              onClick={() => setActiveTab('Incoming')}
              className={`flex-1 text-center py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${
                activeTab === 'Incoming'
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Acceptance Queue
              {incomingAssignments.length > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {incomingAssignments.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Filters and Header indicators */}
        <div className="px-4 py-2 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {activeTab === 'Active' ? 'Clients List' : 'Handoff Queue'}
          </span>
          {activeTab === 'Active' && (
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="text-[10px] font-black text-slate-600 bg-transparent border-none focus:outline-none"
            >
              <option value="All">ALL PRIORITIES</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          )}
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {activeTab === 'Active' ? (
            filteredActiveLeads.length > 0 ? (
              filteredActiveLeads.map(lead => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedClientId(lead.id)}
                  className={`p-5 cursor-pointer transition-all flex justify-between items-start ${
                    selectedClientId === lead.id 
                      ? 'bg-blue-50/60 border-l-4 border-blue-600 pl-4' 
                      : 'hover:bg-slate-50/50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black text-slate-900 truncate">{lead.company}</h4>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">{lead.stakeholders?.[0]?.name || lead.industry}</p>
                    <span className="inline-block text-[9px] font-bold text-slate-400 mt-2 bg-slate-100 border border-slate-200 px-1 py-0.5 rounded uppercase tracking-wider">{lead.id}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border shrink-0 ${
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
                No active clients found.
              </div>
            )
          ) : (
            incomingAssignments.length > 0 ? (
              incomingAssignments.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedIncomingId(item.id)}
                  className={`p-5 cursor-pointer transition-all flex justify-between items-start ${
                    selectedIncomingId === item.id 
                      ? 'bg-amber-50/60 border-l-4 border-amber-500 pl-4' 
                      : 'hover:bg-slate-50/50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black text-slate-900 truncate">{item.company}</h4>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Assigned by {item.assignedBy.split(' ')[0]}</p>
                    <span className="inline-block text-[9px] font-bold text-slate-400 mt-2 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded uppercase tracking-wider">{item.id}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border bg-slate-100 text-slate-700">
                    {item.priority}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-xs font-semibold text-slate-400">
                No incoming assignments.
              </div>
            )
          )}
        </div>
      </div>

      {/* Right Main Details View */}
      <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden">
        {activeTab === 'Active' ? (
          selectedClient ? (
            <>
              {/* Client Detail Header */}
              <div className="px-8 py-6 bg-white border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{selectedClient.company}</h1>
                    <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-0.5 rounded">
                      {selectedClient.id}
                    </span>
                    <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border ${
                      selectedClient.clientHealth === 'On Track' ? 'bg-slate-800 text-white border-slate-800' :
                      selectedClient.clientHealth === 'Awaiting Client' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                      selectedClient.clientHealth === 'Blocked' ? 'bg-slate-100 text-slate-800 border-slate-700 font-bold border-2' :
                      'bg-slate-200 text-slate-800 border-slate-400'
                    }`}>
                      {selectedClient.clientHealth}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-400 mt-1.5">
                    Last updated: {selectedClient.updatedDate} UTC
                  </p>
                </div>
                
                {/* Actions and Status Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600">
                    <span>STATUS:</span>
                    <select
                      value={selectedClient.clientHealth}
                      onChange={(e) => handleUpdateHealth(e.target.value as any)}
                      className="bg-transparent border-none text-slate-900 font-extrabold focus:outline-none cursor-pointer uppercase text-xs"
                    >
                      <option value="On Track">On Track</option>
                      <option value="Awaiting Client">Awaiting Client</option>
                      <option value="Blocked">Blocked</option>
                      <option value="Delayed">Delayed</option>
                    </select>
                  </div>
                  <button 
                    onClick={handleUpdateStage}
                    className="px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
                  >
                    Update Stage
                  </button>
                </div>
              </div>

              {/* Detail Content Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                
                {/* Stage Execution Progress */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Engagement Pipeline
                  </h3>
                  <div className="flex items-center justify-between relative px-6 py-4">
                    <div className="absolute top-8 left-16 right-16 h-0.5 bg-slate-100 rounded-full z-0">
                      <div 
                        className="h-full bg-slate-800 transition-all duration-300"
                        style={{ width: `${((selectedClient.stage - 1) / (STAGE_LABELS.length - 1)) * 100}%` }}
                      ></div>
                    </div>
                    {STAGE_LABELS.map((label, idx) => {
                      const stepNum = idx + 1;
                      const isActive = selectedClient.stage === stepNum;
                      const isCompleted = selectedClient.stage > stepNum;
                      return (
                        <div key={label} className="flex flex-col items-center gap-2.5 relative z-10 w-24">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-300 ${
                            isActive ? 'bg-slate-800 text-white font-extrabold ring-2 ring-slate-200' :
                            isCompleted ? 'bg-slate-800 text-white' :
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

                {/* Primary Card Grid Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Change Request Card */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-3 border-b border-slate-100">
                      Change Request Summary
                    </h3>
                    <div className="py-4 space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                        <span>Open Change Requests:</span>
                        <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {selectedClient.changeRequests?.open || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                        <span>Approved:</span>
                        <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {selectedClient.changeRequests?.approved || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                        <span>Rejected:</span>
                        <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {selectedClient.changeRequests?.rejected || 0}
                        </span>
                      </div>
                    </div>
                    <button className="w-full text-center py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                      Manage Change Requests
                    </button>
                  </div>

                  {/* Documents & Attachments Card */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-3 border-b border-slate-100">
                      Attachments & Docs
                    </h3>
                    <div className="py-4 space-y-2.5 flex-1">
                      {selectedClient.attachments && selectedClient.attachments.length > 0 ? (
                        selectedClient.attachments.map((file) => (
                          <div key={file} className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-950 cursor-pointer">
                            <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                            <span className="underline truncate">{file}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No attachments uploaded</span>
                      )}
                    </div>
                    <button className="w-full text-center py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                      Upload Document
                    </button>
                  </div>

                  {/* Ownership & Origin Card */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-3 border-b border-slate-100">
                      Engagement Metadata
                    </h3>
                    <div className="grid grid-cols-2 gap-y-3 pt-3 text-xs font-semibold text-slate-700">
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Assigned CEM</div>
                        <div className="text-slate-900 font-extrabold mt-1">{selectedClient.assignedCem}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Lead Source</div>
                        <div className="text-slate-900 font-extrabold mt-1 truncate">{selectedClient.leadSource}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Created</div>
                        <div className="text-slate-500 mt-1">{selectedClient.createdDate}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Industry</div>
                        <div className="text-slate-500 mt-1 truncate">{selectedClient.industry}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Multiple Stakeholders Section (Replaces single contact details) */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white">
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Client Stakeholders</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                          <th className="py-3 px-6">Name</th>
                          <th className="py-3 px-3">Role</th>
                          <th className="py-3 px-3">Email</th>
                          <th className="py-3 px-6 text-right">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                        {selectedClient.stakeholders && selectedClient.stakeholders.length > 0 ? (
                          selectedClient.stakeholders.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 px-6 font-bold text-slate-950">{s.name}</td>
                              <td className="py-3.5 px-3 text-slate-600">{s.role}</td>
                              <td className="py-3.5 px-3 text-slate-500 break-all">{s.email}</td>
                              <td className="py-3.5 px-6 text-right text-slate-500">{s.phone}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-slate-400">No stakeholders listed</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Requirements List Table (Replaces requirement text block) */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white">
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Requirements</h2>
                    <button 
                      onClick={() => setIsAddReqModalOpen(true)}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-950 text-white rounded text-[10px] font-black uppercase tracking-wider shadow-sm hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add Requirement
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                          <th className="py-3 px-6">Requirement Name</th>
                          <th className="py-3 px-3">Priority</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-6 text-right">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                        {selectedClient.requirementsList && selectedClient.requirementsList.length > 0 ? (
                          selectedClient.requirementsList.map((req, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 px-6 font-bold text-slate-950">{req.name}</td>
                              <td className="py-3.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                  req.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                  req.priority === 'Medium' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                  'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                  {req.priority}
                                </span>
                              </td>
                              <td className="py-3.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                  req.status === 'Approved' ? 'bg-slate-900 text-white' :
                                  req.status === 'In Review' ? 'bg-slate-100 text-slate-800 border border-slate-300' :
                                  'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-6 text-right text-slate-400">{req.lastUpdated}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-slate-400">No requirements mapped</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Meeting History Section */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white">
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Meeting History</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                          <th className="py-3 px-6">Date</th>
                          <th className="py-3 px-3">Type</th>
                          <th className="py-3 px-6 text-right">Outcome</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                        {selectedClient.meetingsHistory && selectedClient.meetingsHistory.length > 0 ? (
                          selectedClient.meetingsHistory.map((meet, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 px-6 font-bold text-slate-950">{meet.date}</td>
                              <td className="py-3.5 px-3 text-slate-600">{meet.type}</td>
                              <td className="py-3.5 px-6 text-right">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                  meet.outcome === 'Completed' ? 'bg-slate-900 text-white' :
                                  meet.outcome === 'Awaiting Response' ? 'bg-slate-100 text-slate-700 border border-slate-350' :
                                  'bg-slate-100 text-slate-400 border border-slate-200'
                                }`}>
                                  {meet.outcome}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-4 text-center text-slate-400">No meetings logged</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes & Call Logs Section */}
                {((selectedClient.notes && selectedClient.notes.length > 0) || (selectedClient.calls && selectedClient.calls.length > 0)) && (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                      Activity Logs
                    </h3>
                    <div className="space-y-3 text-xs">
                      {selectedClient.notes?.map((note, idx) => (
                        <div key={idx} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
                          <div>
                            <div className="font-extrabold text-slate-800">Meeting Notes</div>
                            <p className="text-slate-600 mt-1 font-medium leading-relaxed">{note}</p>
                          </div>
                        </div>
                      ))}
                      {selectedClient.calls?.map((call, idx) => (
                        <div key={idx} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
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
              </div>

              {/* Bottom Sticky Action Panel */}
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
                  <button className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors shadow-sm">
                    Schedule Meeting
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          )
        ) : (
          /* Incoming Acceptance Queue Main Panel View */
          selectedIncoming ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-center flex-shrink-0">
                <div>
                  <span className="text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded tracking-wider">
                    Incoming Assignment Queue
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                    {selectedIncoming.company}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleRequestClarification(selectedIncoming.id)}
                    className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Clarify
                  </button>
                  <button 
                    onClick={() => handleRejectAssignment(selectedIncoming.id)}
                    className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleAcceptAssignment(selectedIncoming.id)}
                    className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" /> Accept Assignment
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Assignment Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4 pt-2 text-xs font-semibold text-slate-700">
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Assigned By (CEM)</div>
                      <div className="text-slate-900 font-extrabold mt-1">{selectedIncoming.assignedBy}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Assignment Date</div>
                      <div className="text-slate-900 font-extrabold mt-1">{selectedIncoming.assignedDate}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Priority</div>
                      <div className="text-slate-900 font-extrabold mt-1">{selectedIncoming.priority}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Industry Sector</div>
                      <div className="text-slate-900 font-extrabold mt-1 truncate">{selectedIncoming.industry}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-3">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                    Requirements Logged by CEM
                  </h3>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 rounded-lg p-4">
                    {selectedIncoming.requirements}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400 text-xs font-semibold">
              No pending client assignments in queue.
            </div>
          )
        )}
      </div>

      {/* Modal Dialogs - New Client */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleCreateClient} className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-950 flex items-center gap-2 text-base">
                <Sparkles className="w-5 h-5 text-blue-600" /> Create New Client Engagement
              </h3>
              <button 
                type="button"
                onClick={() => setIsNewClientModalOpen(false)} 
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Contact</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Source</label>
                  <input 
                    type="text" 
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                    placeholder="e.g. Referral" 
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsNewClientModalOpen(false)} 
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-white shadow-sm transition-colors"
              >
                Create Engagement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Dialogs - Add Requirement */}
      {isAddReqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleAddRequirement} className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-955 flex items-center gap-2 text-base">
                Add Requirement Specs
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddReqModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Requirement Name</label>
                <input 
                  type="text" 
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                  placeholder="e.g. Attendance Module" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority</label>
                  <select 
                    value={reqPriority}
                    onChange={(e) => setReqPriority(e.target.value as any)}
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                  <select 
                    value={reqStatus}
                    onChange={(e) => setReqStatus(e.target.value as any)}
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="In Review">In Review</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsAddReqModalOpen(false)} 
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-white shadow-sm transition-colors"
              >
                Add Requirement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Dialogs - Add Notes */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleAddNote} className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-955 flex items-center gap-2 text-base">
                Add Meeting Notes
              </h3>
              <button 
                type="button"
                onClick={() => setIsNoteModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <textarea 
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                placeholder="Type your notes here..." 
                rows={4}
                required
              />
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsNoteModalOpen(false)} 
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-white shadow-sm transition-colors"
              >
                Save Notes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Dialogs - Log Call */}
      {isCallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleLogCall} className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-955 flex items-center gap-2 text-base">
                Log Call Details
              </h3>
              <button 
                type="button"
                onClick={() => setIsCallModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <textarea 
                value={callText}
                onChange={(e) => setCallText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                placeholder="Log discussion points of the client call..." 
                rows={4}
                required
              />
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsCallModalOpen(false)} 
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-white shadow-sm transition-colors"
              >
                Log Call
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
