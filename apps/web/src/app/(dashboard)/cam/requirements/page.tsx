"use client";

import React, { useState } from 'react';
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
  AlertTriangle
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

export default function RequirementsManagementPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([
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
  ]);

  const [selectedReqId, setSelectedReqId] = useState<string>('REQ-2023-0812');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  const selectedReq = requirements.find(r => r.id === selectedReqId) || requirements[0];

  const handleSaveChanges = () => {
    toast.success('Changes saved successfully!');
  };

  const handleSubmitForReview = () => {
    setRequirements(prev => prev.map(r => {
      if (r.id === selectedReq.id) {
        return { ...r, status: 'In Review' };
      }
      return r;
    }));
    toast.success('Submitted for review!');
  };

  const handleRequestConfirmation = () => {
    setRequirements(prev => prev.map(r => {
      if (r.id === selectedReq.id) {
        return { ...r, status: 'Awaiting Client' };
      }
      return r;
    }));
    toast('Requested client confirmation!', {
      icon: '✉️',
      style: { background: '#0f172a', color: '#fff' }
    });
  };

  const filteredRequirements = requirements.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'ALL' || r.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans border-t border-slate-200 overflow-hidden">
      <Toaster position="top-right" />

      {/* Left Pane: Requirements List Table */}
      <div className="w-[50%] flex flex-col border-r border-slate-200 bg-white h-full overflow-hidden">
        
        {/* Header Title section */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Requirement Management</h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Manage and track client business needs across CRM modules.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /> Filter
            </button>
            <button className="flex items-center gap-1.5 px-4.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-black transition-all shadow-sm">
              <Plus className="w-3.5 h-3.5" /> New Requirement
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/20">
          <input 
            type="text" 
            placeholder="Search requirements or clients..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold"
          />
        </div>

        {/* List Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50 sticky top-0 z-10">
                <th className="py-4 px-6">Requirement ID</th>
                <th className="py-4 px-3">Client Name</th>
                <th className="py-4 px-3">Module</th>
                <th className="py-4 px-3">Priority</th>
                <th className="py-4 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
              {filteredRequirements.map(req => (
                <tr 
                  key={req.id} 
                  onClick={() => setSelectedReqId(req.id)}
                  className={`cursor-pointer transition-colors ${
                    selectedReqId === req.id ? 'bg-blue-50/60' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <td className="py-4.5 px-6 font-bold text-slate-950">{req.id}</td>
                  <td className="py-4.5 px-3 text-slate-700">{req.clientName}</td>
                  <td className="py-4.5 px-3 text-slate-500 font-medium">{req.module}</td>
                  <td className="py-4.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                      req.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      req.priority === 'HIGH' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="py-4.5 px-6 text-right">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                      req.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-150' :
                      req.status === 'In Review' ? 'bg-blue-50 text-blue-700 border border-blue-150' :
                      req.status === 'Awaiting Client' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
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
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50/30">
          <span>Showing {filteredRequirements.length} of {requirements.length} requirements</span>
          <div className="flex gap-1.5">
            <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 bg-white"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-8 h-8 rounded border border-slate-950 bg-slate-950 text-white flex items-center justify-center font-bold">1</button>
            <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 bg-white"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Right Pane: Detailed Panel */}
      <div className="w-[50%] flex flex-col bg-slate-50 h-full overflow-hidden">
        {selectedReq ? (
          <>
            {/* Detail Panel Header */}
            <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-start flex-shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded">
                    {selectedReq.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    selectedReq.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                    selectedReq.status === 'Rejected' ? 'bg-rose-50 text-rose-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {selectedReq.status}
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-950 mt-2 truncate">
                  {selectedReq.title}
                </h2>
              </div>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable details panel */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Status Flow Progress Tracker (New Item 4) */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Requirement Status Progress</h4>
                <div className="flex items-center justify-between relative px-2 py-1 text-[10px] font-bold text-slate-600">
                  {/* Connect line */}
                  <div className="absolute top-[13px] left-6 right-6 h-0.5 bg-slate-100 z-0">
                    <div 
                      className="h-full bg-slate-950 transition-all duration-300"
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
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-all duration-300 ${
                          isActive ? 'bg-slate-950 text-white font-extrabold scale-110' :
                          isPassed ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepNum}
                        </div>
                        <span className={`text-[9px] font-black tracking-wider ${isActive ? 'text-slate-950' : 'text-slate-400'}`}>{stage}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Requirement Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Module</span>
                  <div className="text-xs font-black text-slate-900">{selectedReq.module}</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Category</span>
                  <div className="text-xs font-black text-slate-900">{selectedReq.category}</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Priority</span>
                  <div className="text-xs font-black text-slate-900">{selectedReq.priority}</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Expected Delivery</span>
                  <div className="text-xs font-black text-slate-900">{selectedReq.expectedDelivery}</div>
                </div>
              </div>

              {/* Ownership Widgets (New Item 1) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">Ownership Management</h4>
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-slate-700">
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase">Requirement Owner</div>
                    <div className="text-slate-950 font-extrabold mt-1">{selectedReq.owner}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase">Assigned CRM</div>
                    <div className="text-slate-950 font-extrabold mt-1">{selectedReq.assignedCrm}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase">Created By</div>
                    <div className="text-slate-950 font-extrabold mt-1">{selectedReq.createdBy}</div>
                  </div>
                </div>
              </div>

              {/* Stakeholders Mapping (New Item 7) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">Stakeholder Map</h4>
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-slate-700">
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase">Requested By</div>
                    <div className="text-slate-950 font-extrabold mt-1">{selectedReq.requestedBy}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase">Decision Maker</div>
                    <div className="text-slate-950 font-extrabold mt-1">{selectedReq.decisionMaker}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase">Approver</div>
                    <div className="text-slate-950 font-extrabold mt-1">{selectedReq.approver}</div>
                  </div>
                </div>
              </div>

              {/* Requirement Text Details */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Business Need</h4>
                <p className="text-xs font-medium leading-relaxed text-slate-650 bg-slate-50 border border-slate-100 rounded-lg p-3 italic">
                  "{selectedReq.businessNeed}"
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Technical Description</h4>
                <p className="text-xs font-medium leading-relaxed text-slate-650">
                  {selectedReq.description}
                </p>
              </div>

              {/* Dependency Status Tracker (New Item Biggest: Dependency status) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">Dependency Status Map</h4>
                <div className="space-y-2">
                  {selectedReq.dependencies && selectedReq.dependencies.length > 0 ? (
                    selectedReq.dependencies.map((dep) => (
                      <div key={dep.id} className="flex justify-between items-center text-xs font-semibold p-2.5 border border-slate-100 bg-slate-50/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300">
                            {dep.id}
                          </span>
                          <span className="text-slate-800">{dep.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                          dep.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          dep.status === 'Blocked' ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {dep.status === 'Blocked' && <AlertTriangle className="w-3 h-3 inline mr-1 text-rose-600 align-middle" />}
                          {dep.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-450">No external dependencies declared</span>
                  )}
                </div>
              </div>

              {/* Attachments & Documents Section (New Item 6) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attachments</h4>
                  <button className="text-[9px] font-black uppercase text-blue-600 hover:underline">Upload Document</button>
                </div>
                <div className="space-y-2">
                  {selectedReq.attachments && selectedReq.attachments.length > 0 ? (
                    selectedReq.attachments.map((file) => (
                      <div key={file} className="flex items-center justify-between text-xs font-semibold p-2 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer bg-white shadow-sm">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-700 underline">{file}</span>
                        </div>
                        <span className="text-[9px] text-slate-400">PDF Document</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-450">No documents uploaded yet</span>
                  )}
                </div>
              </div>

              {/* Client Notes & Internal Notes (New Item 5) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Notes</h4>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {selectedReq.clientNotes}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-slate-800">Internal Notes</h4>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                    {selectedReq.internalNotes}
                  </p>
                </div>
              </div>

              {/* Requirement Timeline Widget (New Item 2) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">Requirement Timeline</h4>
                <div className="relative border-l border-slate-150 pl-3.5 ml-2 py-2 space-y-4">
                  {selectedReq.timeline && selectedReq.timeline.map((event, idx) => (
                    <div key={idx} className="relative text-xs">
                      <div className={`absolute -left-[19.5px] top-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                        event.done ? 'bg-slate-900' : 'bg-slate-200'
                      }`}></div>
                      <div className="flex justify-between items-start gap-2">
                        <span className={`font-bold ${event.done ? 'text-slate-850' : 'text-slate-400 font-semibold'}`}>
                          {event.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">{event.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Actions Panel */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 flex-shrink-0 shadow-inner">
              <button 
                onClick={handleSaveChanges}
                className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-slate-950 rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-center"
              >
                Save Changes
              </button>
              <button 
                onClick={handleSubmitForReview}
                className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-sm text-center"
              >
                Submit For Review
              </button>
              <button 
                onClick={handleRequestConfirmation}
                className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-sm text-center"
              >
                Request Client Confirmation
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400 text-xs font-semibold">
            Select a requirement from the list to view its details.
          </div>
        )}
      </div>

    </div>
  );
}
