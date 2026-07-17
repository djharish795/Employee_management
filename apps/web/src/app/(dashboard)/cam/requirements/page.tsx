"use client";

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { 
  Plus, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  UserCheck,
  Briefcase,
  AlertTriangle,
  Trash2,
  Edit2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Dependency {
  id: string;
  name: string;
  status: 'Blocked' | 'In Progress' | 'Completed';
}

interface TimelineEvent {
  date: string;
  label: string;
  done: boolean;
}

interface Requirement {
  id: string;
  title: string;
  clientName: string;
  module: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'Draft' | 'In Review' | 'Awaiting Client' | 'Approved' | 'Rejected';
  category: 'Functional' | 'Technical' | 'Integration' | 'Reporting' | 'Security' | 'Compliance';
  businessNeed: string;
  description: string;
  expectedDelivery: string;
  clientNotes: string;
  internalNotes: string;
  
  // Ownership
  owner: string;
  assignedCrm: string;
  createdBy: string;
  
  // Stakeholder Mapping
  requestedBy: string;
  decisionMaker: string;
  approver: string;
  
  // Dependencies with Status
  dependencies: Dependency[];
  
  // Attachments
  attachments: string[];
  
  // Timeline
  timeline: TimelineEvent[];
}

const DEFAULT_REQUIREMENTS: Requirement[] = [
  {
    id: 'REQ-2023-0812',
    title: 'Lead Assignment Automation',
    clientName: 'Global Logistics Inc.',
    module: 'Lead Management',
    priority: 'CRITICAL',
    status: 'In Review',
    category: 'Functional',
    businessNeed: 'Current manual lead routing is causing a 24-hour delay in response times. Sales teams need automated distribution based on territory and product expertise to improve conversion.',
    description: 'Automated routing engine that listens to new Lead objects and assigns them to active Sales Executives based on the predefined Geo-Mapping table. System must handle round-robin within territories.',
    expectedDelivery: '2023-12-15',
    clientNotes: 'Requested a dashboard widget to monitor the routing volume per territory.',
    internalNotes: 'Client budget seems lower than expected. Need CTO approval before proposal.',
    owner: 'Sarah Mitchell',
    assignedCrm: 'John Doe',
    createdBy: 'Alex Sterling',
    requestedBy: 'Operations Head',
    decisionMaker: 'CTO',
    approver: 'CEO',
    dependencies: [
      { id: 'REQ-2023-0401', name: 'Identity & Access Controls', status: 'Completed' },
      { id: 'API-GATEWAY-V2', name: 'API Gateway Routing', status: 'Blocked' }
    ],
    attachments: ['Requirements.pdf', 'Architecture Diagram.png', 'Business Flow.xlsx'],
    timeline: [
      { date: '12 Oct', label: 'Requirement Created', done: true },
      { date: '15 Oct', label: 'Requirement Updated', done: true },
      { date: '18 Oct', label: 'Client Review Requested', done: true },
      { date: '20 Oct', label: 'Client Feedback Received', done: false },
      { date: '24 Oct', label: 'Approved', done: false }
    ]
  },
  {
    id: 'REQ-2023-0815',
    title: 'Real-time Pipeline Analytics',
    clientName: 'Apex Financials',
    module: 'Pipeline Analytics',
    priority: 'HIGH',
    status: 'Approved',
    category: 'Reporting',
    businessNeed: 'Executive leadership lacks immediate visibility into sales performance metrics. Need dynamic dashboard reports.',
    description: 'BI reporting connector to stream transaction pipelines to Postgres database for real-time visualization.',
    expectedDelivery: '2023-11-30',
    clientNotes: 'Reports should download as Excel sheets.',
    internalNotes: 'Requires database optimization. Setup GIN index on schema fields.',
    owner: 'Sarah Mitchell',
    assignedCrm: 'John Doe',
    createdBy: 'Alex Sterling',
    requestedBy: 'CFO Office',
    decisionMaker: 'CFO',
    approver: 'CTO',
    dependencies: [
      { id: 'DB-CONN-01', name: 'Postgres Streaming Replica', status: 'Completed' }
    ],
    attachments: ['BI_Scope.docx'],
    timeline: [
      { date: '14 Oct', label: 'Requirement Created', done: true },
      { date: '18 Oct', label: 'Approved', done: true }
    ]
  },
  {
    id: 'REQ-2023-0819',
    title: 'Contact Synchronization Engine',
    clientName: 'Stellar Tech',
    module: 'Contact Sync',
    priority: 'MEDIUM',
    status: 'Awaiting Client',
    category: 'Integration',
    businessNeed: 'Sales contacts are segregated between old CRM database and new EMS instance.',
    description: 'Sync utility to automatically pull daily active stakeholders and push them down to legacy system.',
    expectedDelivery: '2023-12-05',
    clientNotes: 'Confirm legacy API documentation.',
    internalNotes: 'Authentication endpoints are flaky. Must implement rate limit handling.',
    owner: 'Sarah Mitchell',
    assignedCrm: 'John Doe',
    createdBy: 'Emma Watson',
    requestedBy: 'IT Manager',
    decisionMaker: 'VP Engineering',
    approver: 'CEO',
    dependencies: [
      { id: 'LEGACY-API', name: 'Legacy API access', status: 'In Progress' }
    ],
    attachments: ['Legacy_Spec_v1.pdf'],
    timeline: [
      { date: '16 Oct', label: 'Requirement Created', done: true },
      { date: '21 Oct', label: 'Client Review Requested', done: true }
    ]
  },
  {
    id: 'REQ-2023-0821',
    title: 'Reporting Engine Core',
    clientName: 'Nexa Corp',
    module: 'Reporting Engine',
    priority: 'LOW',
    status: 'Draft',
    category: 'Reporting',
    businessNeed: 'Standard PDF invoice reports are required for regulatory tax compliance.',
    description: 'Build backend PDF rendering logic mapping custom template parameters.',
    expectedDelivery: '2024-01-10',
    clientNotes: 'Needs support for custom logo rendering.',
    internalNotes: 'Will use react-pdf templating inside packages.',
    owner: 'Sarah Mitchell',
    assignedCrm: 'John Doe',
    createdBy: 'Alex Sterling',
    requestedBy: 'Finance Head',
    decisionMaker: 'CFO',
    approver: 'CEO',
    dependencies: [],
    attachments: [],
    timeline: [
      { date: '22 Oct', label: 'Requirement Created', done: true }
    ]
  },
  {
    id: 'REQ-2023-0824',
    title: 'Mobile CRM Application Integration',
    clientName: 'Quantum Systems',
    module: 'Mobile CRM',
    priority: 'CRITICAL',
    status: 'Rejected',
    category: 'Security',
    businessNeed: 'External field executives require remote access to customer information records.',
    description: 'Mobile build connecting to the API gateway. Security measures are crucial.',
    expectedDelivery: '2023-11-15',
    clientNotes: 'Must support biometric authentication.',
    internalNotes: 'Rejected because API endpoints are not exposed to VPN-less environments.',
    owner: 'Sarah Mitchell',
    assignedCrm: 'John Doe',
    createdBy: 'Alex Sterling',
    requestedBy: 'IT Security Lead',
    decisionMaker: 'CTO',
    approver: 'CEO',
    dependencies: [
      { id: 'VPN-GW-01', name: 'VPN Gateway Integration', status: 'Blocked' }
    ],
    attachments: ['Security_Rules.pdf'],
    timeline: [
      { date: '10 Oct', label: 'Requirement Created', done: true },
      { date: '15 Oct', label: 'Rejected by Security Audits', done: true }
    ]
  }
];

export default function RequirementsManagementPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedReqId, setSelectedReqId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Form State
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formModule, setFormModule] = useState('');
  const [formPriority, setFormPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [formStatus, setFormStatus] = useState<Requirement['status']>('Draft');
  const [formCategory, setFormCategory] = useState<Requirement['category']>('Functional');
  const [formBusinessNeed, setFormBusinessNeed] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formExpectedDelivery, setFormExpectedDelivery] = useState('');
  const [formClientNotes, setFormClientNotes] = useState('');
  const [formInternalNotes, setFormInternalNotes] = useState('');
  const [formOwner, setFormOwner] = useState('');
  const [formAssignedCrm, setFormAssignedCrm] = useState('');
  const [formCreatedBy, setFormCreatedBy] = useState('');
  const [formRequestedBy, setFormRequestedBy] = useState('');
  const [formDecisionMaker, setFormDecisionMaker] = useState('');
  const [formApprover, setFormApprover] = useState('');
  const [formDependencies, setFormDependencies] = useState<Dependency[]>([]);
  const [formAttachments, setFormAttachments] = useState<string[]>([]);
  
  // Temporary fields for adding dynamic items inside modal
  const [newDepId, setNewDepId] = useState('');
  const [newDepName, setNewDepName] = useState('');
  const [newDepStatus, setNewDepStatus] = useState<'Blocked' | 'In Progress' | 'Completed'>('In Progress');
  const [newAttachmentName, setNewAttachmentName] = useState('');

  // 1. Initial Data Loading & Fallback Setup
  useEffect(() => {
    async function loadInitialData() {
      try {
        const response = await apiClient.get('/crm/requirements');
        if (response.data && Array.isArray(response.data.data)) {
          setRequirements(response.data.data);
          if (response.data.data.length > 0) {
            setSelectedReqId(response.data.data[0].id);
          }
          return;
        }
      } catch (error) {
        console.log("Backend API not reachable. Checking local storage...");
      }

      // Local storage fallback
      const cached = localStorage.getItem('naprocs_requirements');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRequirements(parsed);
            setSelectedReqId(parsed[0].id);
            return;
          }
        } catch (e) {
          console.error("Error parsing cached requirements:", e);
        }
      }

      // Default Seeding
      localStorage.setItem('naprocs_requirements', JSON.stringify(DEFAULT_REQUIREMENTS));
      setRequirements(DEFAULT_REQUIREMENTS);
      setSelectedReqId(DEFAULT_REQUIREMENTS[0].id);
    }

    loadInitialData();
  }, []);

  const selectedReq = requirements.find(r => r.id === selectedReqId) || requirements[0];

  // Helper to persist current state to LocalStorage
  const syncToLocalStorage = (updated: Requirement[]) => {
    localStorage.setItem('naprocs_requirements', JSON.stringify(updated));
  };

  // 2. Open Modal in Create Mode
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormId(`REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormTitle('');
    setFormClientName('');
    setFormModule('');
    setFormPriority('MEDIUM');
    setFormStatus('Draft');
    setFormCategory('Functional');
    setFormBusinessNeed('');
    setFormDescription('');
    setFormExpectedDelivery(new Date().toISOString().split('T')[0]);
    setFormClientNotes('');
    setFormInternalNotes('');
    setFormOwner('Sarah Mitchell');
    setFormAssignedCrm('John Doe');
    setFormCreatedBy('Alex Sterling');
    setFormRequestedBy('');
    setFormDecisionMaker('');
    setFormApprover('');
    setFormDependencies([]);
    setFormAttachments([]);
    
    setIsModalOpen(true);
  };

  // 3. Open Modal in Edit Mode
  const handleOpenEditModal = (req: Requirement) => {
    setModalMode('edit');
    setFormId(req.id);
    setFormTitle(req.title);
    setFormClientName(req.clientName);
    setFormModule(req.module);
    setFormPriority(req.priority);
    setFormStatus(req.status);
    setFormCategory(req.category);
    setFormBusinessNeed(req.businessNeed);
    setFormDescription(req.description);
    setFormExpectedDelivery(req.expectedDelivery);
    setFormClientNotes(req.clientNotes);
    setFormInternalNotes(req.internalNotes);
    setFormOwner(req.owner);
    setFormAssignedCrm(req.assignedCrm);
    setFormCreatedBy(req.createdBy);
    setFormRequestedBy(req.requestedBy || '');
    setFormDecisionMaker(req.decisionMaker || '');
    setFormApprover(req.approver || '');
    setFormDependencies(req.dependencies || []);
    setFormAttachments(req.attachments || []);
    
    setIsModalOpen(true);
  };

  // 4. Save/Submit Form handler (Create/Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formClientName.trim() || !formBusinessNeed.trim()) {
      toast.error("Please fill in Title, Client Name, and Business Need fields.");
      return;
    }

    const payload: Requirement = {
      id: formId,
      title: formTitle,
      clientName: formClientName,
      module: formModule || 'General',
      priority: formPriority,
      status: formStatus,
      category: formCategory,
      businessNeed: formBusinessNeed,
      description: formDescription,
      expectedDelivery: formExpectedDelivery,
      clientNotes: formClientNotes,
      internalNotes: formInternalNotes,
      owner: formOwner,
      assignedCrm: formAssignedCrm,
      createdBy: formCreatedBy,
      requestedBy: formRequestedBy,
      decisionMaker: formDecisionMaker,
      approver: formApprover,
      dependencies: formDependencies,
      attachments: formAttachments,
      timeline: modalMode === 'create' 
        ? [{ date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' }), label: 'Requirement Created', done: true }]
        : (requirements.find(r => r.id === formId)?.timeline || [])
    };

    let updatedReqs = [...requirements];

    try {
      if (modalMode === 'create') {
        await apiClient.post('/crm/requirements', payload);
        updatedReqs.unshift(payload);
        setSelectedReqId(payload.id);
        toast.success("Requirement created successfully!");
      } else {
        await apiClient.put(`/crm/requirements/${payload.id}`, payload);
        updatedReqs = updatedReqs.map(r => r.id === payload.id ? payload : r);
        toast.success("Requirement updated successfully!");
      }
    } catch (err) {
      // Fallback
      if (modalMode === 'create') {
        updatedReqs.unshift(payload);
        setSelectedReqId(payload.id);
        toast.success("Requirement created locally!");
      } else {
        updatedReqs = updatedReqs.map(r => r.id === payload.id ? payload : r);
        toast.success("Requirement updated locally!");
      }
    }

    setRequirements(updatedReqs);
    syncToLocalStorage(updatedReqs);
    setIsModalOpen(false);
  };

  // 5. Change requirement status directly from right pane
  const handleUpdateStatus = async (newStatus: Requirement['status']) => {
    if (!selectedReq) return;
    
    let updatedReqs = [...requirements];
    const target = updatedReqs.find(r => r.id === selectedReq.id);
    if (!target) return;

    const todayStr = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    const newTimelineEvent = { date: todayStr, label: `Status updated to ${newStatus}`, done: true };
    
    const updatedPayload = {
      ...target,
      status: newStatus,
      timeline: [...target.timeline, newTimelineEvent]
    };

    try {
      await apiClient.put(`/crm/requirements/${selectedReq.id}/status`, { status: newStatus });
    } catch (err) {
      console.log("Backend status API failed, updating locally.");
    }

    updatedReqs = updatedReqs.map(r => r.id === selectedReq.id ? updatedPayload : r);
    setRequirements(updatedReqs);
    syncToLocalStorage(updatedReqs);
    toast.success(`Status updated to ${newStatus}`);
  };

  // 6. Delete a requirement
  const handleDeleteRequirement = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this requirement?")) return;

    let updatedReqs = requirements.filter(r => r.id !== id);

    try {
      await apiClient.delete(`/crm/requirements/${id}`);
    } catch (err) {
      console.log("Backend delete API failed, updating locally.");
    }

    setRequirements(updatedReqs);
    syncToLocalStorage(updatedReqs);
    toast.success("Requirement deleted.");
    if (updatedReqs.length > 0) {
      setSelectedReqId(updatedReqs[0].id);
    } else {
      setSelectedReqId('');
    }
  };

  // Dynamic lists helper inside modal
  const addDependency = () => {
    if (!newDepId.trim() || !newDepName.trim()) {
      toast.error("Enter both Dependency ID and Name.");
      return;
    }
    setFormDependencies([...formDependencies, { id: newDepId.trim(), name: newDepName.trim(), status: newDepStatus }]);
    setNewDepId('');
    setNewDepName('');
  };

  const removeDependency = (index: number) => {
    setFormDependencies(formDependencies.filter((_, idx) => idx !== index));
  };

  const addAttachment = () => {
    if (!newAttachmentName.trim()) return;
    setFormAttachments([...formAttachments, newAttachmentName.trim()]);
    setNewAttachmentName('');
  };

  const removeAttachment = (index: number) => {
    setFormAttachments(formAttachments.filter((_, idx) => idx !== index));
  };

  const filteredRequirements = requirements.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'ALL' || r.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans border-t border-slate-200 dark:border-slate-800 overflow-hidden">
      <Toaster position="top-right" />

      {/* Left Pane: Requirements List Table */}
      <div className="w-[50%] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full overflow-hidden">
        
        {/* Header Title section */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Requirement Management</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
              Manage and track client business needs across CRM modules.
            </p>
          </div>
          <div className="flex gap-2">
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-750 bg-white dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-50 transition-all cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <button 
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 px-4.5 py-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-lg text-xs font-black transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> New Requirement
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/10">
          <input 
            type="text" 
            placeholder="Search by ID, title, or client..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white font-semibold"
          />
        </div>

        {/* List Table */}
        <div className="flex-1 overflow-y-auto">
          {filteredRequirements.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
              <Briefcase className="w-8 h-8 text-slate-350 dark:text-slate-650 animate-pulse mb-3" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">No requirements match your filters</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Get started by adding a new client requirement.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/30 sticky top-0 z-10">
                  <th className="py-4 px-6">Requirement ID</th>
                  <th className="py-4 px-3">Client Name</th>
                  <th className="py-4 px-3">Module</th>
                  <th className="py-4 px-3">Priority</th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs font-semibold text-slate-850 dark:text-slate-200">
                {filteredRequirements.map(req => (
                  <tr 
                    key={req.id} 
                    onClick={() => setSelectedReqId(req.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedReqId === req.id 
                        ? 'bg-blue-50/60 dark:bg-blue-900/20' 
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                    }`}
                  >
                    <td className="py-4.5 px-6 font-bold text-slate-950 dark:text-white">{req.id}</td>
                    <td className="py-4.5 px-3 text-slate-700 dark:text-slate-300">{req.clientName}</td>
                    <td className="py-4.5 px-3 text-slate-500 dark:text-slate-400 font-medium">{req.module}</td>
                    <td className="py-4.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                        req.priority === 'CRITICAL' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border-rose-100 dark:border-rose-900/50' :
                        req.priority === 'HIGH' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-450 border-blue-100 dark:border-blue-900/50' :
                        'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        req.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border border-emerald-150 dark:border-emerald-900/50' :
                        req.status === 'Rejected' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border border-rose-150 dark:border-rose-900/50' :
                        req.status === 'In Review' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-450 border border-blue-150 dark:border-blue-900/50' :
                        req.status === 'Awaiting Client' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-450 border border-amber-150 dark:border-amber-900/50' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 border border-slate-200 dark:border-slate-700'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          req.status === 'Approved' ? 'bg-emerald-500' :
                          req.status === 'Rejected' ? 'bg-rose-500' :
                          req.status === 'In Review' ? 'bg-blue-500' :
                          req.status === 'Awaiting Client' ? 'bg-amber-500' :
                          'bg-slate-400'
                        }`}></span>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50/30 dark:bg-slate-900/10">
          <span>Showing {filteredRequirements.length} of {requirements.length} requirements</span>
          <div className="flex gap-1.5">
            <button className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-8 h-8 rounded border border-slate-950 dark:border-slate-600 bg-slate-950 dark:bg-slate-800 text-white flex items-center justify-center font-bold">1</button>
            <button className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Right Pane: Detailed Panel */}
      <div className="w-[50%] flex flex-col bg-slate-50 dark:bg-slate-950 h-full overflow-hidden">
        {selectedReq ? (
          <>
            {/* Detail Panel Header */}
            <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start flex-shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-750 px-2 py-0.5 rounded">
                    {selectedReq.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    selectedReq.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' :
                    selectedReq.status === 'Rejected' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450' :
                    'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-450'
                  }`}>
                    {selectedReq.status}
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white mt-2 truncate">
                  {selectedReq.title}
                </h2>
                <p className="text-xs text-slate-400 font-semibold">{selectedReq.clientName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleOpenEditModal(selectedReq)}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-350 transition-colors"
                  title="Modify / Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteRequirement(selectedReq.id)}
                  className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/25 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 transition-colors"
                  title="Delete Requirement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable details panel */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Status Flow Progress Tracker */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Requirement Status Progress</h4>
                <div className="flex items-center justify-between relative px-2 py-1 text-[10px] font-bold text-slate-600">
                  {/* Connect line */}
                  <div className="absolute top-[13px] left-6 right-6 h-0.5 bg-slate-100 dark:bg-slate-800 z-0">
                    <div 
                      className="h-full bg-slate-800 dark:bg-white transition-all duration-300"
                      style={{ 
                        width: selectedReq.status === 'Approved' ? '100%' :
                               selectedReq.status === 'Awaiting Client' ? '66%' :
                               selectedReq.status === 'In Review' ? '33%' : '0%'
                      }}
                    ></div>
                  </div>

                  {/* Flow Stages */}
                  {['Draft', 'Review', 'Client Validation', 'Approved'].map((stage, idx) => {
                    const stepNum = idx + 1;
                    const isActive = 
                      (stage === 'Draft' && selectedReq.status === 'Draft') ||
                      (stage === 'Review' && selectedReq.status === 'In Review') ||
                      (stage === 'Client Validation' && selectedReq.status === 'Awaiting Client') ||
                      (stage === 'Approved' && selectedReq.status === 'Approved');
                    
                    const isPassed = 
                      (stage === 'Draft' && ['In Review', 'Awaiting Client', 'Approved'].includes(selectedReq.status)) ||
                      (stage === 'Review' && ['Awaiting Client', 'Approved'].includes(selectedReq.status)) ||
                      (stage === 'Client Validation' && selectedReq.status === 'Approved');

                    return (
                      <div key={stage} className="flex flex-col items-center gap-1.5 relative z-10">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm transition-all duration-300 ${
                          isActive ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-950 font-extrabold scale-110' :
                          isPassed ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        }`}>
                          {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepNum}
                        </div>
                        <span className={`text-[9px] font-black tracking-wider ${isActive ? 'text-slate-950 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{stage}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Requirement Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Module</span>
                  <div className="text-xs font-black text-slate-900 dark:text-white">{selectedReq.module}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Category</span>
                  <div className="text-xs font-black text-slate-900 dark:text-white">{selectedReq.category}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Priority</span>
                  <div className="text-xs font-black text-slate-900 dark:text-white">{selectedReq.priority}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Expected Delivery</span>
                  <div className="text-xs font-black text-slate-900 dark:text-white">{selectedReq.expectedDelivery}</div>
                </div>
              </div>

              {/* Ownership Widgets */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-100 dark:border-slate-800">Ownership Management</h4>
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-slate-700 dark:text-slate-350">
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Requirement Owner</div>
                    <div className="text-slate-950 dark:text-white font-extrabold mt-1">{selectedReq.owner}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Assigned CRM</div>
                    <div className="text-slate-950 dark:text-white font-extrabold mt-1">{selectedReq.assignedCrm}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Created By</div>
                    <div className="text-slate-950 dark:text-white font-extrabold mt-1">{selectedReq.createdBy}</div>
                  </div>
                </div>
              </div>

              {/* Stakeholders Mapping */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-100 dark:border-slate-800">Stakeholder Map</h4>
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-slate-700 dark:text-slate-350">
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Requested By</div>
                    <div className="text-slate-950 dark:text-white font-extrabold mt-1">{selectedReq.requestedBy || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Decision Maker</div>
                    <div className="text-slate-950 dark:text-white font-extrabold mt-1">{selectedReq.decisionMaker || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Approver</div>
                    <div className="text-slate-950 dark:text-white font-extrabold mt-1">{selectedReq.approver || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Requirement Text Details */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Business Need</h4>
                <p className="text-xs font-medium leading-relaxed text-slate-650 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-750 rounded-lg p-3 italic">
                  "{selectedReq.businessNeed}"
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Technical Description</h4>
                <p className="text-xs font-medium leading-relaxed text-slate-650 dark:text-slate-300">
                  {selectedReq.description || 'No description provided.'}
                </p>
              </div>

              {/* Dependency Status Tracker */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-100 dark:border-slate-800">Dependency Status Map</h4>
                <div className="space-y-2">
                  {selectedReq.dependencies && selectedReq.dependencies.length > 0 ? (
                    selectedReq.dependencies.map((dep) => (
                      <div key={dep.id} className="flex justify-between items-center text-xs font-semibold p-2.5 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-650">
                            {dep.id}
                          </span>
                          <span className="text-slate-800 dark:text-slate-200">{dep.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                          dep.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/50' :
                          dep.status === 'Blocked' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border-rose-250 dark:border-rose-900/50 font-bold' :
                          'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-250 dark:border-amber-900/50'
                        }`}>
                          {dep.status === 'Blocked' && <AlertTriangle className="w-3 h-3 inline mr-1 text-rose-600 align-middle" />}
                          {dep.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-450 dark:text-slate-550">No external dependencies declared</span>
                  )}
                </div>
              </div>

              {/* Attachments & Documents Section */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Attachments</h4>
                </div>
                <div className="space-y-2">
                  {selectedReq.attachments && selectedReq.attachments.length > 0 ? (
                    selectedReq.attachments.map((file) => (
                      <div key={file} className="flex items-center justify-between text-xs font-semibold p-2 border border-slate-100 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-805 transition-colors cursor-pointer bg-white dark:bg-slate-900 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300 underline">{file}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500">Document</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-450 dark:text-slate-550">No documents uploaded yet</span>
                  )}
                </div>
              </div>

              {/* Client Notes & Internal Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
                  <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Client Notes</h4>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-750">
                    {selectedReq.clientNotes || 'No client notes added.'}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
                  <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-slate-800 dark:text-slate-300">Internal Notes</h4>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-amber-50/50 dark:bg-amber-950/10 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/30">
                    {selectedReq.internalNotes || 'No internal notes added.'}
                  </p>
                </div>
              </div>

              {/* Requirement Timeline Widget */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-100 dark:border-slate-800">Requirement Timeline</h4>
                <div className="relative border-l border-slate-150 dark:border-slate-850 pl-3.5 ml-2 py-2 space-y-4">
                  {selectedReq.timeline && selectedReq.timeline.map((event, idx) => (
                    <div key={idx} className="relative text-xs">
                      <div className={`absolute -left-[19.5px] top-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 shadow-sm ${
                        event.done ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-700'
                      }`}></div>
                      <div className="flex justify-between items-start gap-2">
                        <span className={`font-bold ${event.done ? 'text-slate-850 dark:text-slate-200' : 'text-slate-450 dark:text-slate-500'}`}>
                          {event.label}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium shrink-0">{event.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Actions Panel */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-shrink-0 shadow-inner">
              <button 
                onClick={() => handleUpdateStatus('Approved')}
                className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 rounded-lg transition-colors shadow-sm text-center"
              >
                Approve Requirement
              </button>
              <button 
                onClick={() => handleUpdateStatus('In Review')}
                className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors shadow-sm text-center"
              >
                Submit For Review
              </button>
              <button 
                onClick={() => handleUpdateStatus('Awaiting Client')}
                className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors shadow-sm text-center"
              >
                Request Confirmation
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-550 text-xs font-semibold">
            Select a requirement from the list to view its details.
          </div>
        )}
      </div>

      {/* Slide-over Modal for Creating/Editing Requirement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {modalMode === 'create' ? 'Create New Requirement' : `Modify Requirement (${formId})`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Specify details regarding client business requirements and delivery parameters.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800 dark:text-slate-200">
              
              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5">1. Basic Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Requirement Title *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Lead Assignment Routing Engine"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Client Name *</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Global Logistics Inc."
                        value={formClientName}
                        onChange={(e) => setFormClientName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Scope Module</label>
                      <input 
                        type="text"
                        placeholder="e.g. Lead Management"
                        value={formModule}
                        onChange={(e) => setFormModule(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Category</label>
                      <select 
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white font-semibold"
                      >
                        <option value="Functional">Functional</option>
                        <option value="Technical">Technical</option>
                        <option value="Integration">Integration</option>
                        <option value="Reporting">Reporting</option>
                        <option value="Security">Security</option>
                        <option value="Compliance">Compliance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Priority</label>
                      <select 
                        value={formPriority}
                        onChange={(e) => setFormPriority(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white font-semibold"
                      >
                        <option value="CRITICAL">Critical</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Expected Delivery</label>
                      <input 
                        type="date"
                        value={formExpectedDelivery}
                        onChange={(e) => setFormExpectedDelivery(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Ownership & Stakeholders */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5">2. Ownership & Stakeholders</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Requirement Owner</label>
                      <input 
                        type="text"
                        value={formOwner}
                        onChange={(e) => setFormOwner(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Assigned CRM</label>
                      <input 
                        type="text"
                        value={formAssignedCrm}
                        onChange={(e) => setFormAssignedCrm(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Created By</label>
                      <input 
                        type="text"
                        value={formCreatedBy}
                        onChange={(e) => setFormCreatedBy(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Requested By</label>
                      <input 
                        type="text"
                        placeholder="e.g. Finance Head"
                        value={formRequestedBy}
                        onChange={(e) => setFormRequestedBy(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Decision Maker</label>
                      <input 
                        type="text"
                        placeholder="e.g. CTO"
                        value={formDecisionMaker}
                        onChange={(e) => setFormDecisionMaker(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Approver</label>
                      <input 
                        type="text"
                        placeholder="e.g. CEO"
                        value={formApprover}
                        onChange={(e) => setFormApprover(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Core Requirement Fields */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5">3. Business Value & Scope Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Business Need / Problem Statement *</label>
                    <textarea 
                      rows={3}
                      required
                      placeholder="Explain why the client needs this and what benefits it brings."
                      value={formBusinessNeed}
                      onChange={(e) => setFormBusinessNeed(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white font-semibold"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Technical Implementation Description</label>
                    <textarea 
                      rows={3}
                      placeholder="Specify how this will be implemented inside EMS."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white font-semibold"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Client Notes</label>
                      <textarea 
                        rows={2}
                        placeholder="Feedback or comments from the client side."
                        value={formClientNotes}
                        onChange={(e) => setFormClientNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white font-semibold"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Internal Notes</label>
                      <textarea 
                        rows={2}
                        placeholder="Internal team coordination notes."
                        value={formInternalNotes}
                        onChange={(e) => setFormInternalNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white font-semibold"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Dependencies Mapping */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5">4. Dependencies Mapping</h4>
                
                {/* Dependency list */}
                <div className="space-y-2">
                  {formDependencies.map((dep, index) => (
                    <div key={index} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-150 dark:border-slate-700">
                      <div>
                        <span className="font-black bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-350 px-1.5 py-0.5 rounded text-[9px] mr-2">
                          {dep.id}
                        </span>
                        <span className="font-semibold text-slate-850 dark:text-slate-200">{dep.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                          dep.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' :
                          dep.status === 'Blocked' ? 'bg-rose-50 text-rose-700 border-rose-250 font-bold' :
                          'bg-amber-50 text-amber-700 border-amber-250'
                        }`}>
                          {dep.status}
                        </span>
                        <button 
                          type="button"
                          onClick={() => removeDependency(index)}
                          className="text-rose-600 hover:text-rose-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add dependency row */}
                  <div className="grid grid-cols-4 gap-2 pt-2 items-end">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">Dependency ID</label>
                      <input 
                        type="text"
                        placeholder="e.g. DB-SETUP-01"
                        value={newDepId}
                        onChange={(e) => setNewDepId(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-250 dark:border-slate-700 rounded bg-transparent font-semibold"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">Dependency Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. Postgres DB Instance Seeding"
                        value={newDepName}
                        onChange={(e) => setNewDepName(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-250 dark:border-slate-700 rounded bg-transparent font-semibold"
                      />
                    </div>
                    <div>
                      <button 
                        type="button" 
                        onClick={addDependency}
                        className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded font-bold transition-all text-center"
                      >
                        Add Row
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Attachments Mapping */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1.5">5. Attachments & Documents</h4>
                <div className="space-y-2">
                  {formAttachments.map((file, index) => (
                    <div key={index} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-150 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-850 dark:text-slate-200">{file}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-rose-600 hover:text-rose-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="e.g. Business_Requirement_Scope.docx"
                      value={newAttachmentName}
                      onChange={(e) => setNewAttachmentName(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-250 dark:border-slate-700 rounded bg-transparent font-semibold"
                    />
                    <button 
                      type="button"
                      onClick={addAttachment}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded font-bold transition-all"
                    >
                      Attach
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 -mx-6 -mb-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-150 dark:border-slate-800 flex justify-end gap-3 flex-shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-850 dark:hover:bg-slate-100 rounded-lg font-black transition-all shadow-sm"
                >
                  {modalMode === 'create' ? 'Create Requirement' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
