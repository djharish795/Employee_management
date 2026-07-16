"use client";

import React, { useState } from 'react';
import { 
  PlayCircle, 
  FileText, 
  CalendarDays, 
  Eye, 
  MoreVertical, 
  Plus, 
  Download, 
  X,
  User,
  Clock,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Filter,
  Check,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Meeting {
  id: string;
  client: string;
  leadId: string;
  leadName: string;
  date: string;
  time: string;
  type: 'Discovery Call' | 'Follow-up Call' | 'Product Demo' | 'Stakeholder Meeting' | 'Project Discovery';
  assignedEmployee: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'FOLLOW_UP_REQUIRED' | 'QUALIFIED' | 'REJECTED' | 'CANCELLED';
  outcome?: 'Interested' | 'Needs Follow Up' | 'Qualified' | 'Rejected' | 'None';
  nextAction?: 'Send Proposal' | 'Schedule Demo' | 'Technical Discussion' | 'Waiting Client Response' | 'None';
  nextFollowUpDate?: string;
  nextActionOwner?: string;
  notes?: string;
  requirements?: string;
  concerns?: string;
  decisionMakers?: string;
  handoffCompleted?: boolean;
}

export default function MeetingManagementPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 'MEET-1001',
      client: 'Nexus Digital Corp',
      leadId: 'LEAD-8402',
      leadName: 'Robert Chen',
      date: '2023-10-24',
      time: '10:00 AM',
      type: 'Project Discovery',
      assignedEmployee: 'Alex Sterling',
      status: 'SCHEDULED',
      outcome: 'None',
      nextAction: 'None'
    },
    {
      id: 'MEET-1002',
      client: 'Vertex Logistics',
      leadId: 'LEAD-8109',
      leadName: 'Elena Markova',
      date: '2023-10-24',
      time: '01:30 PM',
      type: 'Follow-up Call',
      assignedEmployee: 'Lisa Miller',
      status: 'QUALIFIED',
      outcome: 'Qualified',
      nextAction: 'Send Proposal',
      nextFollowUpDate: '2023-10-28',
      nextActionOwner: 'Lisa Miller',
      notes: 'Client is extremely interested in the Enterprise plan. Integration with their ERP is main blocker.',
      requirements: 'Need ERP integration checklist and timeline estimation.',
      concerns: 'Budget approval is pending final CFO sign-off.',
      decisionMakers: 'Elena Markova, CTO',
      handoffCompleted: false
    },
    {
      id: 'MEET-1003',
      client: 'Starlight Industries',
      leadId: 'LEAD-7984',
      leadName: 'David Jenkins',
      date: '2023-10-25',
      time: '09:00 AM',
      type: 'Product Demo',
      assignedEmployee: 'James Doe',
      status: 'ACTIVE',
      outcome: 'None',
      nextAction: 'None'
    }
  ]);

  // Filters State
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterEmployee, setFilterEmployee] = useState<string>('All');
  const [filterDate, setFilterDate] = useState<string>('');

  // Modals State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // Form State - New Meeting
  const [newClient, setNewClient] = useState('');
  const [newLeadId, setNewLeadId] = useState('LEAD-');
  const [newLeadName, setNewLeadName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState<Meeting['type']>('Discovery Call');
  const [newEmployee, setNewEmployee] = useState('');

  // Form State - Outcome / Complete Meeting
  const [editStatus, setEditStatus] = useState<Meeting['status']>('COMPLETED');
  const [editOutcome, setEditOutcome] = useState<Meeting['outcome']>('Interested');
  const [editNextAction, setEditNextAction] = useState<Meeting['nextAction']>('Send Proposal');
  const [editNextFollowUpDate, setEditNextFollowUpDate] = useState('');
  const [editNextActionOwner, setEditNextActionOwner] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editRequirements, setEditRequirements] = useState('');
  const [editConcerns, setEditConcerns] = useState('');
  const [editDecisionMakers, setEditDecisionMakers] = useState('');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient || !newDate || !newTime || !newEmployee || !newLeadName) return;

    // Convert newTime (HH:MM) to HH:MM AM/PM
    const [hours, minutes] = newTime.split(':');
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    const formattedHours = parseInt(hours) % 12 || 12;
    const formattedTime = `${formattedHours}:${minutes} ${ampm}`;

    const newMeeting: Meeting = {
      id: `MEET-${Math.floor(1000 + Math.random() * 9000)}`,
      client: newClient,
      leadId: newLeadId || `LEAD-${Math.floor(8000 + Math.random() * 1000)}`,
      leadName: newLeadName,
      date: newDate,
      time: formattedTime,
      type: newType,
      assignedEmployee: newEmployee,
      status: 'SCHEDULED',
      outcome: 'None',
      nextAction: 'None'
    };

    setMeetings([newMeeting, ...meetings]);
    setIsNewModalOpen(false);
    toast.success('Meeting scheduled successfully!');

    // Reset
    setNewClient('');
    setNewLeadId('LEAD-');
    setNewLeadName('');
    setNewDate('');
    setNewTime('');
    setNewType('Discovery Call');
    setNewEmployee('');
  };

  const openOutcomeModal = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setEditStatus(meeting.status === 'SCHEDULED' || meeting.status === 'ACTIVE' ? 'COMPLETED' : meeting.status);
    setEditOutcome(meeting.outcome || 'Interested');
    setEditNextAction(meeting.nextAction || 'Send Proposal');
    setEditNextFollowUpDate(meeting.nextFollowUpDate || '');
    setEditNextActionOwner(meeting.nextActionOwner || meeting.assignedEmployee);
    setEditNotes(meeting.notes || '');
    setEditRequirements(meeting.requirements || '');
    setEditConcerns(meeting.concerns || '');
    setEditDecisionMakers(meeting.decisionMakers || '');
    setIsOutcomeModalOpen(true);
  };

  const handleSaveOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting) return;

    setMeetings(prev => prev.map(m => {
      if (m.id === selectedMeeting.id) {
        return {
          ...m,
          status: editStatus,
          outcome: editOutcome,
          nextAction: editNextAction,
          nextFollowUpDate: editNextFollowUpDate,
          nextActionOwner: editNextActionOwner,
          notes: editNotes,
          requirements: editRequirements,
          concerns: editConcerns,
          decisionMakers: editDecisionMakers,
          // If we manually change status to QUALIFIED, set qualified outcomes
          ...(editStatus === 'QUALIFIED' && { outcome: 'Qualified' })
        };
      }
      return m;
    }));

    setIsOutcomeModalOpen(false);
    toast.success('Meeting outcomes saved successfully!');
  };

  const triggerHandoff = (meetingId: string) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        return { ...m, handoffCompleted: true };
      }
      return m;
    }));
    toast.success('Lead handoff to CRM initiated successfully!');
  };

  // Filtered meetings
  const filteredMeetings = meetings.filter(m => {
    const matchType = filterType === 'All' || m.type === filterType;
    const matchStatus = filterStatus === 'All' || m.status === filterStatus;
    const matchEmployee = filterEmployee === 'All' || m.assignedEmployee.toLowerCase().includes(filterEmployee.toLowerCase());
    const matchDate = !filterDate || m.date === filterDate;
    return matchType && matchStatus && matchEmployee && matchDate;
  });

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full font-sans space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Meeting Management</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Review and execute your scheduled client engagements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4 text-slate-500" /> Export Report
          </button>
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-slate-950 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Meeting
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Meeting Date</label>
          <input 
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Meeting Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950"
          >
            <option value="All">All Types</option>
            <option value="Project Discovery">Discovery Call</option>
            <option value="Follow-up Call">Follow-up Call</option>
            <option value="Product Demo">Product Demo</option>
            <option value="Stakeholder Meeting">Stakeholder Meeting</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950"
          >
            <option value="All">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="FOLLOW_UP_REQUIRED">Follow Up Required</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Assigned Employee</label>
          <select
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950"
          >
            <option value="All">All Employees</option>
            <option value="Alex Sterling">Alex Sterling</option>
            <option value="Lisa Miller">Lisa Miller</option>
            <option value="James Doe">James Doe</option>
          </select>
        </div>
      </div>

      {/* Meeting Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-6">Client & Lead</th>
                <th className="py-4 px-3">Meeting Date</th>
                <th className="py-4 px-3">Meeting Type</th>
                <th className="py-4 px-3">Outcome</th>
                <th className="py-4 px-3">Next Action</th>
                <th className="py-4 px-3">Assigned Employee</th>
                <th className="py-4 px-3 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
              {filteredMeetings.length > 0 ? (
                filteredMeetings.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Client */}
                    <td className="py-5 px-6">
                      <div className="font-bold text-slate-950">{meeting.client}</div>
                      <div className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
                        <span className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200 font-bold">{meeting.leadId}</span>
                        <span>{meeting.leadName}</span>
                      </div>
                    </td>
                    
                    {/* Date & Time */}
                    <td className="py-5 px-3 font-medium text-slate-500">
                      {new Date(meeting.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })} 
                      <span className="text-slate-400"> · </span> 
                      <span className="font-bold text-slate-700">{meeting.time}</span>
                    </td>
                    
                    {/* Type */}
                    <td className="py-5 px-3">
                      <span className="text-blue-600 font-bold hover:underline cursor-pointer" onClick={() => openOutcomeModal(meeting)}>
                        {meeting.type}
                      </span>
                    </td>

                    {/* Outcome Summary */}
                    <td className="py-5 px-3">
                      {meeting.outcome && meeting.outcome !== 'None' ? (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          meeting.outcome === 'Qualified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          meeting.outcome === 'Needs Follow Up' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          meeting.outcome === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {meeting.outcome}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">—</span>
                      )}
                    </td>

                    {/* Next Action */}
                    <td className="py-5 px-3">
                      {meeting.nextAction && meeting.nextAction !== 'None' ? (
                        <div>
                          <div className="font-bold text-slate-900">{meeting.nextAction}</div>
                          {meeting.nextFollowUpDate && (
                            <div className="text-[9px] text-slate-400 mt-0.5">Due: {new Date(meeting.nextFollowUpDate).toLocaleDateString()}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium">—</span>
                      )}
                    </td>
                    
                    {/* Assigned Employee */}
                    <td className="py-5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold text-[9px] flex items-center justify-center border border-slate-300">
                          {getInitials(meeting.assignedEmployee)}
                        </div>
                        <span className="font-bold text-slate-800">{meeting.assignedEmployee}</span>
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="py-5 px-3 text-center">
                      {meeting.status === 'SCHEDULED' && (
                        <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-black uppercase tracking-wider">
                          Scheduled
                        </span>
                      )}
                      {meeting.status === 'ACTIVE' && (
                        <span className="inline-block px-2.5 py-0.5 bg-blue-600 text-white rounded text-[9px] font-black uppercase tracking-wider">
                          Active
                        </span>
                      )}
                      {meeting.status === 'COMPLETED' && (
                        <span className="inline-block px-2.5 py-0.5 bg-slate-950 text-white rounded text-[9px] font-black uppercase tracking-wider">
                          Completed
                        </span>
                      )}
                      {meeting.status === 'FOLLOW_UP_REQUIRED' && (
                        <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-black uppercase tracking-wider">
                          Follow Up
                        </span>
                      )}
                      {meeting.status === 'QUALIFIED' && (
                        <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-black uppercase tracking-wider">
                          Qualified
                        </span>
                      )}
                      {meeting.status === 'REJECTED' && (
                        <span className="inline-block px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[9px] font-black uppercase tracking-wider">
                          Rejected
                        </span>
                      )}
                      {meeting.status === 'CANCELLED' && (
                        <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-400 border border-slate-200 rounded text-[9px] font-black uppercase tracking-wider">
                          Cancelled
                        </span>
                      )}
                    </td>
                    
                    {/* Actions */}
                    <td className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        
                        {meeting.status === 'QUALIFIED' && !meeting.handoffCompleted && (
                          <button 
                            onClick={() => triggerHandoff(meeting.id)}
                            className="mr-2 inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[9px] rounded-lg shadow-sm transition-colors"
                          >
                            Handoff <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {meeting.status === 'QUALIFIED' && meeting.handoffCompleted && (
                          <span className="mr-2 inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-400 font-black uppercase tracking-widest text-[9px] rounded-lg border border-slate-200">
                            Sent to CRM <Check className="w-3 h-3" />
                          </span>
                        )}

                        <button 
                          onClick={() => openOutcomeModal(meeting)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md border border-slate-200 transition-colors" 
                          title="View & Complete Meeting"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>

                        <button className="p-1 text-slate-400 hover:text-slate-700 transition-colors" title="Reschedule">
                          <CalendarDays className="w-4 h-4" />
                        </button>
                        
                        <button className="p-1 text-slate-400 hover:text-slate-700 transition-colors" title="Options">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm font-medium text-slate-500">
                    No meetings found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            Showing {filteredMeetings.length} of {meetings.length} Meetings
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-400 bg-white cursor-not-allowed" disabled>
              Previous
            </button>
            <button className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* New Meeting Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleCreateMeeting} className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900 flex items-center gap-2 text-base">
                <CalendarDays className="w-5 h-5 text-blue-600" /> New Meeting Engagement
              </h3>
              <button 
                type="button"
                onClick={() => setIsNewModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Client / Entity</label>
                <input 
                  type="text" 
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950" 
                  placeholder="e.g. Nexus Digital Corp" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Lead ID</label>
                  <input 
                    type="text" 
                    value={newLeadId}
                    onChange={(e) => setNewLeadId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950" 
                    placeholder="LEAD-8402"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Lead Name</label>
                  <input 
                    type="text" 
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950" 
                    placeholder="Robert Chen"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Time</label>
                  <input 
                    type="time" 
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950" 
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Meeting Type</label>
                <select 
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                >
                  <option value="Discovery Call">Discovery Call</option>
                  <option value="Follow-up Call">Follow-up Call</option>
                  <option value="Product Demo">Product Demo</option>
                  <option value="Stakeholder Meeting">Stakeholder Meeting</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Assigned Employee</label>
                <input 
                  type="text" 
                  value={newEmployee}
                  onChange={(e) => setNewEmployee(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950" 
                  placeholder="e.g. Alex Sterling" 
                  required
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsNewModalOpen(false)} 
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-950 hover:bg-slate-800 text-white shadow-sm transition-colors"
              >
                Create Meeting
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Outcome / Complete Meeting Details Modal */}
      {isOutcomeModalOpen && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <form onSubmit={handleSaveOutcome} className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 tracking-wider">
                  {selectedMeeting.id}
                </span>
                <h3 className="font-black text-slate-950 text-lg mt-1">
                  Meeting Outcomes: {selectedMeeting.client}
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                  Related Lead: <span className="font-bold text-slate-700">{selectedMeeting.leadName} ({selectedMeeting.leadId})</span>
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsOutcomeModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              
              {/* Outcome Status Mapping */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Meeting Status</label>
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FOLLOW_UP_REQUIRED">Follow Up Required</option>
                    <option value="QUALIFIED">Qualified (Ready for Handoff)</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Outcome Summary</label>
                  <select 
                    value={editOutcome}
                    onChange={(e) => setEditOutcome(e.target.value as any)}
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold"
                  >
                    <option value="None">No Outcome</option>
                    <option value="Interested">Interested</option>
                    <option value="Needs Follow Up">Needs Follow Up</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Decision Makers Present</label>
                  <input 
                    type="text" 
                    value={editDecisionMakers}
                    onChange={(e) => setEditDecisionMakers(e.target.value)}
                    className="w-full px-3 py-2 h-10 border border-slate-200 rounded-lg bg-transparent text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                    placeholder="e.g. John Doe (CEO)" 
                  />
                </div>
              </div>

              {/* Next Action Tracks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Next Action</label>
                  <select 
                    value={editNextAction}
                    onChange={(e) => setEditNextAction(e.target.value as any)}
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold"
                  >
                    <option value="None">No Next Action</option>
                    <option value="Send Proposal">Send Proposal</option>
                    <option value="Schedule Demo">Schedule Demo</option>
                    <option value="Technical Discussion">Technical Discussion</option>
                    <option value="Waiting Client Response">Waiting Client Response</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Next Follow-Up Date</label>
                  <input 
                    type="date" 
                    value={editNextFollowUpDate}
                    onChange={(e) => setEditNextFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 h-10 border border-slate-200 rounded-lg bg-transparent text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Next Action Owner</label>
                  <input 
                    type="text" 
                    value={editNextActionOwner}
                    onChange={(e) => setEditNextActionOwner(e.target.value)}
                    className="w-full px-3 py-2 h-10 border border-slate-200 rounded-lg bg-transparent text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                    placeholder="Lisa Miller" 
                  />
                </div>
              </div>

              {/* Text Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Meeting Notes</label>
                  <textarea 
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950" 
                    placeholder="Outline discussion details, takeaways, and timeline constraints..." 
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Requirements Discussed</label>
                    <textarea 
                      value={editRequirements}
                      onChange={(e) => setEditRequirements(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950" 
                      placeholder="List technical integration requirements or feature requests..." 
                      rows={2.5}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Client Concerns</label>
                    <textarea 
                      value={editConcerns}
                      onChange={(e) => setEditConcerns(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950" 
                      placeholder="List security clearance blockers, budget questions, or competitor issues..." 
                      rows={2.5}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
              <div>
                {editStatus === 'QUALIFIED' && (
                  <button 
                    type="button"
                    onClick={() => {
                      triggerHandoff(selectedMeeting.id);
                      setIsOutcomeModalOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider text-xs rounded-lg shadow-md transition-colors animate-pulse"
                  >
                    Move To Qualification <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsOutcomeModalOpen(false)} 
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white shadow-sm transition-colors"
                >
                  Save Outcomes
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
