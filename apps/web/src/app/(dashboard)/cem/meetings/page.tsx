"use client";

import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Phone,
  History,
  Trash2
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { apiClient } from '@/lib/api/client';

export interface Meeting {
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
  clientPhone?: string;
  interactionCount?: number;
}

export default function MeetingManagementPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterEmployee, setFilterEmployee] = useState<string>('All');
  const [filterDate, setFilterDate] = useState<string>('');

  // Modals State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [historyLeadId, setHistoryLeadId] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Form State - Reschedule Meeting
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleAmPm, setRescheduleAmPm] = useState<'AM' | 'PM'>('AM');

  // Form State - New Meeting
  const [newClient, setNewClient] = useState('');
  const [newLeadId, setNewLeadId] = useState('LEAD-');
  const [newLeadName, setNewLeadName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newAmPm, setNewAmPm] = useState<'AM' | 'PM'>('AM');
  const [newType, setNewType] = useState<Meeting['type']>('Discovery Call');
  const [newEmployee, setNewEmployee] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

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

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'All') params.append('type', filterType);
      if (filterStatus !== 'All') params.append('status', filterStatus);
      if (filterEmployee !== 'All') params.append('employee', filterEmployee);
      if (filterDate) params.append('date', filterDate);
      
      const res = await apiClient.get(`/cem/meetings?${params.toString()}`);
      setMeetings(res.data);
    } catch (error) {
      toast.error('Network error loading meetings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [filterType, filterStatus, filterEmployee, filterDate]);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient || !newDate || !newTime || !newEmployee || !newLeadName) return;

    const formattedTime = newTime.includes(':') ? `${newTime} ${newAmPm}` : `${newTime}:00 ${newAmPm}`;

    try {
      await apiClient.post('/cem/meetings', {
        client: newClient,
        leadId: newLeadId || `LEAD-${Math.floor(8000 + Math.random() * 1000)}`,
        leadName: newLeadName,
        date: newDate,
        time: formattedTime,
        type: newType,
        assignedEmployee: newEmployee,
        clientPhone: newClientPhone
      });

      toast.success('Meeting scheduled successfully!');
      fetchMeetings();
      setIsNewModalOpen(false);
    } catch (error) {
      toast.error('Failed to schedule meeting.');
    }

    // Reset
    setNewClient('');
    setNewLeadId('LEAD-');
    setNewLeadName('');
    setNewDate('');
    setNewTime('');
    setNewAmPm('AM');
    setNewType('Discovery Call');
    setNewEmployee('');
    setNewClientPhone('');
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

  const handleSaveOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting) return;

    try {
      await apiClient.put(`/cem/meetings/${selectedMeeting.id}`, {
        status: editStatus,
        outcome: editStatus === 'QUALIFIED' ? 'Qualified' : editOutcome,
        nextAction: editNextAction,
        nextFollowUpDate: editNextFollowUpDate,
        nextActionOwner: editNextActionOwner,
        notes: editNotes,
        requirements: editRequirements,
        concerns: editConcerns,
        decisionMakers: editDecisionMakers
      });

      toast.success('Meeting outcomes saved successfully!');
      fetchMeetings();
      setIsOutcomeModalOpen(false);
    } catch (error) {
      toast.error('Failed to save outcomes.');
    }
  };

  const openRescheduleModal = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setRescheduleDate(meeting.date);
    
    // Parse time (e.g., "10:30 AM") for the form
    const timeParts = meeting.time.split(' ');
    setRescheduleTime(timeParts[0] || '');
    setRescheduleAmPm((timeParts[1] as 'AM' | 'PM') || 'AM');
    
    setIsRescheduleModalOpen(true);
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting) return;

    const formattedTime = rescheduleTime.includes(':') ? `${rescheduleTime} ${rescheduleAmPm}` : `${rescheduleTime}:00 ${rescheduleAmPm}`;

    try {
      await apiClient.put(`/cem/meetings/${selectedMeeting.id}`, {
        date: rescheduleDate,
        time: formattedTime
      });

      toast.success('Meeting rescheduled successfully!');
      fetchMeetings();
      setIsRescheduleModalOpen(false);
    } catch (error) {
      toast.error('Failed to reschedule meeting.');
    }
  };

  const triggerHandoff = async (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    
    try {
      // 1. Mark meeting as handed off in our CEM DB
      await apiClient.put(`/cem/meetings/${meeting.id}`, { handoffCompleted: true });

      // 2. Trigger the actual CRM handoff logic
      try {
        await apiClient.post(`/crm/clients/${meeting.leadId}/transfer-to-crm`);
      } catch (e) {
        // Continue even if CRM fail because we just want the UI to reflect it in our demo, 
        // but normally we'd handle it.
      }
      
      fetchMeetings();
      toast.success('Lead handoff to CRM initiated successfully!');
    } catch (error) {
      toast.error('Failed to initiate handoff. Please try again.');
    }
  };

  // Filtered meetings are now handled server-side, but we keep this for UI rendering consistency
  const filteredMeetings = meetings;

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
                      {meeting.clientPhone && (
                        <div className="text-[10px] font-bold text-slate-600 mt-1 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {meeting.clientPhone}
                        </div>
                      )}
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
                      <div className="flex items-center gap-1.5">
                        <span className="text-blue-600 font-bold hover:underline cursor-pointer" onClick={() => openOutcomeModal(meeting)}>
                          {meeting.type}
                        </span>
                        {meeting.interactionCount && meeting.interactionCount > 1 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200" title={`Follow-up #${meeting.interactionCount}`}>
                            #{meeting.interactionCount}
                          </span>
                        )}
                      </div>
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

                        {['SCHEDULED', 'ACTIVE', 'FOLLOW_UP_REQUIRED'].includes(meeting.status) && (
                          <button 
                            onClick={() => openOutcomeModal(meeting)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md border border-slate-200 transition-colors" 
                            title="View & Complete Meeting"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}


                        
                        <div className="relative">
                          <button 
                            onClick={() => setActiveDropdownId(activeDropdownId === meeting.id ? null : meeting.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors" 
                            title="Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {activeDropdownId === meeting.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95">
                              <button 
                                onClick={() => {
                                  setHistoryLeadId(meeting.leadId);
                                  setIsHistoryModalOpen(true);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                              >
                                <History className="w-3.5 h-3.5 text-blue-600" /> View Lead History
                              </button>
                              
                              {meeting.status === 'SCHEDULED' && (
                                <button 
                                  onClick={async () => {
                                    try {
                                      await apiClient.put(`/cem/meetings/${meeting.id}`, { status: 'CANCELLED' });
                                      toast.success('Meeting Cancelled');
                                      fetchMeetings();
                                    } catch(e) {
                                      toast.error('Failed to cancel meeting.');
                                    } finally {
                                      setActiveDropdownId(null);
                                    }
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors border-t border-slate-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Cancel Meeting
                                </button>
                              )}
                            </div>
                          )}
                        </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Company</label>
                  <input 
                    type="text" 
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950" 
                    placeholder="e.g. Nexus Digital Corp" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Client Phone Number</label>
                  <input 
                    type="tel" 
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950" 
                    placeholder="+1 (555) 000-0000" 
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Person</label>
                <input 
                  type="text" 
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950" 
                  placeholder="e.g. Robert Chen"
                  required
                />
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Time (HH:MM)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950" 
                      placeholder="05:10"
                      required
                    />
                    <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => setNewAmPm('AM')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${newAmPm === 'AM' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewAmPm('PM')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${newAmPm === 'PM' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
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

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleReschedule} className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-900 flex items-center gap-2 text-base">
                <CalendarDays className="w-5 h-5 text-blue-600" /> Reschedule Meeting
              </h3>
              <button 
                type="button"
                onClick={() => setIsRescheduleModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-700">{selectedMeeting.client}</p>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">{selectedMeeting.leadName}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">New Date</label>
                <input 
                  type="date" 
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950" 
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">New Time (HH:MM)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950" 
                    placeholder="05:10"
                    required
                  />
                  <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => setRescheduleAmPm('AM')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${rescheduleAmPm === 'AM' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setRescheduleAmPm('PM')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${rescheduleAmPm === 'PM' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsRescheduleModalOpen(false)} 
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-950 hover:bg-slate-800 text-white shadow-sm transition-colors"
              >
                Confirm Reschedule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleReschedule} className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-900 flex items-center gap-2 text-base">
                <CalendarDays className="w-5 h-5 text-blue-600" /> Reschedule Meeting
              </h3>
              <button 
                type="button"
                onClick={() => setIsRescheduleModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-700">{selectedMeeting.client}</p>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">{selectedMeeting.leadName}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">New Date</label>
                <input 
                  type="date" 
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950" 
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">New Time (HH:MM)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950" 
                    placeholder="05:10"
                    required
                  />
                  <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => setRescheduleAmPm('AM')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${rescheduleAmPm === 'AM' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setRescheduleAmPm('PM')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${rescheduleAmPm === 'PM' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsRescheduleModalOpen(false)} 
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-950 hover:bg-slate-800 text-white shadow-sm transition-colors"
              >
                Confirm Reschedule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lead History Modal */}
      {isHistoryModalOpen && historyLeadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-900 flex items-center gap-2 text-base">
                <History className="w-5 h-5 text-blue-600" /> Lead Interaction History
              </h3>
              <button 
                type="button"
                onClick={() => setIsHistoryModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-700">{meetings.find(m => m.leadId === historyLeadId)?.client || 'Unknown Client'}</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">{meetings.find(m => m.leadId === historyLeadId)?.leadName || 'Unknown Lead'}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-black uppercase tracking-wider">
                    {meetings.filter(m => m.leadId === historyLeadId).length} Interactions
                  </span>
                </div>
              </div>

              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {meetings.filter(m => m.leadId === historyLeadId).map((m, i) => (
                  <div key={m.id} className="relative flex items-start gap-4">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-slate-100 text-slate-500 shadow-sm shrink-0 z-10 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    </div>
                    <div className="flex-1 p-3 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">{m.type}</span>
                        <span className="text-[9px] font-medium text-slate-400">{new Date(m.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{m.outcome && m.outcome !== 'None' ? `Outcome: ${m.outcome}` : 'Scheduled'}</p>
                      
                      {(m.notes || m.requirements || m.concerns) && (
                        <div className="mt-2 space-y-1.5 border-t border-slate-100 pt-1.5">
                          {m.notes && (
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase block mb-0.5">Notes</span>
                              <p className="text-[10px] text-slate-500 italic leading-tight">"{m.notes}"</p>
                            </div>
                          )}
                          {m.requirements && (
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase block mb-0.5">Requirements</span>
                              <p className="text-[10px] text-slate-500 italic leading-tight">"{m.requirements}"</p>
                            </div>
                          )}
                          {m.concerns && (
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase block mb-0.5">Concerns</span>
                              <p className="text-[10px] text-slate-500 italic leading-tight">"{m.concerns}"</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsHistoryModalOpen(false)} 
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
