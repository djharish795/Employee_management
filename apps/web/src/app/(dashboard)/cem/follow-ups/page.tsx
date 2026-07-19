"use client";

import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle, 
  FileText, 
  MessageSquare, 
  Plus, 
  SlidersHorizontal,
  X,
  TrendingUp,
  User,
  Clock,
  Briefcase,
  AlertTriangle,
  Award,
  ArrowRight,
  Sparkles,
  History,
  Check
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface FollowUp {
  id: string;
  leadName: string;
  role: string;
  company: string;
  currentStage: 'Contacted' | 'Meeting Done' | 'Follow Up' | 'Qualified';
  type: 'Phone Call' | 'Email' | 'Meeting';
  nextAction: 'Send Proposal' | 'Schedule Demo' | 'Call CTO' | 'Collect Requirements' | 'Waiting Client Response' | 'None';
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  lastNote: string;
  status: 'Pending' | 'Completed' | 'Missed' | 'Qualified';
  outcome?: 'Interested' | 'Needs Follow Up' | 'Meeting Required' | 'Qualified' | 'Rejected' | 'No Response' | 'None';
  
  // Detail Drawer fields
  email: string;
  phone: string;
  assignedCem: string;
  leadOwner: string;
  createdDate: string;
  notesHistory: string[];
  communicationHistory: string[];
  meetingHistory: string[];
}

export default function FollowUpHubPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [metrics, setMetrics] = useState({ todayCount: 0, missedCount: 0, qualifiedCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'Today' | 'Upcoming' | 'Missed' | 'Completed'>('Today');

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [filterStage, setFilterStage] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  const fetchFollowUps = async () => {
    try {
      setIsLoading(true);
      const [listRes, summaryRes] = await Promise.all([
        apiClient.get('/cem/follow-ups'),
        apiClient.get('/cem/follow-ups/summary')
      ]);
      setFollowUps(listRes.data);
      setMetrics(summaryRes.data);
    } catch (error) {
      toast.error('Failed to load follow-ups.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  // Modals / Drawer State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);

  // New Follow-Up Form State
  const [newLead, setNewLead] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newStage, setNewStage] = useState<FollowUp['currentStage']>('Contacted');
  const [newType, setNewType] = useState<FollowUp['type']>('Phone Call');
  const [newAction, setNewAction] = useState<FollowUp['nextAction']>('Collect Requirements');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newAmPm, setNewAmPm] = useState<'AM' | 'PM'>('PM');
  const [newPriority, setNewPriority] = useState<FollowUp['priority']>('Medium');
  const [newNote, setNewNote] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Outcome Form State
  const [outcomeSelect, setOutcomeSelect] = useState<FollowUp['outcome']>('Interested');
  const [outcomeNote, setOutcomeNote] = useState('');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDueDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead || !newCompany || !newDate || !newTime || !newEmail || !newPhone) return;

    let [hours, minutes] = newTime.split(':');
    if (!hours || !minutes) {
      toast.error('Invalid time format. Use HH:MM');
      return;
    }
    
    let hoursNum = parseInt(hours, 10);
    if (newAmPm === 'PM' && hoursNum < 12) hoursNum += 12;
    if (newAmPm === 'AM' && hoursNum === 12) hoursNum = 0;
    
    const time24 = `${hoursNum.toString().padStart(2, '0')}:${minutes}`;
    const formattedDueDate = `${newDate}T${time24}:00`;

    try {
      await apiClient.post('/cem/follow-ups', {
        leadName: newLead,
        role: newRole || 'Lead Contact',
        company: newCompany,
        currentStage: newStage,
        type: newType,
        nextAction: newAction,
        dueDate: formattedDueDate,
        priority: newPriority,
        lastNote: newNote || 'Initial task logged.',
        email: newEmail,
        phone: newPhone,
      });

      toast.success('Follow-up task created successfully!');
      fetchFollowUps();
      setIsNewModalOpen(false);

      // Reset Form
      setNewLead('');
      setNewRole('');
      setNewCompany('');
      setNewStage('Contacted');
      setNewType('Phone Call');
      setNewAction('Collect Requirements');
      setNewDate('');
      setNewTime('');
      setNewAmPm('PM');
      setNewPriority('Medium');
      setNewNote('');
      setNewEmail('');
      setNewPhone('');
    } catch (error) {
      toast.error('Failed to create follow-up task.');
    }
  };

  const openOutcomeModal = (fu: FollowUp) => {
    setSelectedFollowUp(fu);
    setOutcomeSelect(fu.outcome !== 'None' ? fu.outcome : 'Interested');
    setOutcomeNote('');
    setIsOutcomeModalOpen(true);
  };

  const handleSaveOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowUp) return;

    try {
      await apiClient.put(`/cem/follow-ups/${selectedFollowUp.id}/outcome`, {
        outcome: outcomeSelect,
        outcomeNote: outcomeNote
      });

      toast.success('Follow-up outcome logged successfully!');
      fetchFollowUps();
      setIsOutcomeModalOpen(false);
    } catch (error) {
      toast.error('Failed to log outcome.');
    }
  };

  const openDetailDrawer = (fu: FollowUp) => {
    setSelectedFollowUp(fu);
    setIsDetailDrawerOpen(true);
  };

  // Summary Metrics calculations
  const { todayCount, missedCount, qualifiedCount } = metrics;

  // Filter list by Active Tab & Filters
  const filteredFollowUps = followUps.filter(f => {
    // 1. Tab Filtering (Date based)
    const dueDate = new Date(f.dueDate);
    const now = new Date();
    
    // Set both to midnight to compare just the date
    const dateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const isToday = dateOnly.getTime() === todayOnly.getTime();
    const isPast = dateOnly.getTime() < todayOnly.getTime();
    const isFuture = dateOnly.getTime() > todayOnly.getTime();

    let tabMatch = false;
    if (activeTab === 'Today') {
      tabMatch = (f.status === 'Pending' || f.status === 'Qualified') && isToday;
    } else if (activeTab === 'Upcoming') {
      tabMatch = f.status === 'Pending' && isFuture;
    } else if (activeTab === 'Missed') {
      tabMatch = f.status === 'Missed' || (f.status === 'Pending' && isPast);
    } else if (activeTab === 'Completed') {
      tabMatch = f.status === 'Completed' || f.status === 'Qualified';
    }

    if (!tabMatch) return false;

    // 2. Dropdown Filtering
    if (filterStage !== 'All' && f.currentStage !== filterStage) return false;
    if (filterType !== 'All' && f.type !== filterType) return false;
    if (filterPriority !== 'All' && f.priority !== filterPriority) return false;

    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full font-sans space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Follow-up Hub</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage client interactions and engagement pipelines.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border rounded-lg transition-colors shadow-sm ${showFilters ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filter
          </button>
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-slate-950 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Follow-up
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200 pb-px font-semibold text-sm">
        {(['Today', 'Upcoming', 'Missed', 'Completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 border-b-2 transition-all ${
              activeTab === tab 
                ? 'border-slate-950 text-slate-950 font-black' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'Today' ? "Today's Follow Ups" : tab}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in slide-in-from-top-2">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Stage</label>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-bold"
            >
              <option value="All">All Stages</option>
              <option value="Contacted">Contacted</option>
              <option value="Meeting Done">Meeting Done</option>
              <option value="Follow Up">Follow Up</option>
              <option value="Qualified">Qualified</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-bold"
            >
              <option value="All">All Types</option>
              <option value="Phone Call">Phone Call</option>
              <option value="Email">Email</option>
              <option value="Meeting">Meeting</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-bold"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      )}

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2 flex flex-col justify-center">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today's Follow Ups</div>
          <h2 className="text-3xl font-black text-slate-900">{todayCount}</h2>
          <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Scheduled for today
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2 flex flex-col justify-center">
          <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Missed Follow Ups</div>
          <h2 className="text-3xl font-black text-rose-600">{missedCount}</h2>
          <div className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Action required immediately
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2 flex flex-col justify-center">
          <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Qualified Leads</div>
          <h2 className="text-3xl font-black text-emerald-600">{qualifiedCount}</h2>
          <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> Ready for CRM Handoff
          </div>
        </div>
      </div>

      {/* Follow Ups Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-6">Lead Name</th>
                <th className="py-4 px-3">Company</th>
                <th className="py-4 px-3 text-center">Current Stage</th>
                <th className="py-4 px-3">Follow Up Type</th>
                <th className="py-4 px-3">Next Action</th>
                <th className="py-4 px-3">Due Date</th>
                <th className="py-4 px-3 text-center">Priority</th>
                <th className="py-4 px-4">Last Note</th>
                <th className="py-4 px-3 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
              {filteredFollowUps.length > 0 ? (
                filteredFollowUps.map(fu => (
                  <tr key={fu.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Lead Name */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                          {getInitials(fu.leadName)}
                        </div>
                        <div>
                          <button 
                            onClick={() => openDetailDrawer(fu)}
                            className="font-bold text-slate-950 hover:text-blue-600 hover:underline text-left"
                          >
                            {fu.leadName}
                          </button>
                          <div className="text-[10px] font-medium text-slate-400 mt-0.5">{fu.role}</div>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-5 px-3 text-slate-900 font-bold">
                      {fu.company}
                    </td>

                    {/* Current Stage */}
                    <td className="py-5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        fu.currentStage === 'Qualified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        fu.currentStage === 'Meeting Done' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        fu.currentStage === 'Follow Up' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {fu.currentStage}
                      </span>
                    </td>

                    {/* Follow Up Type */}
                    <td className="py-5 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 text-[10px] font-bold">
                        {fu.type === 'Phone Call' && <Phone className="w-3 h-3 text-slate-500 transform -rotate-90" />}
                        {fu.type === 'Email' && <Mail className="w-3 h-3 text-slate-500" />}
                        {fu.type === 'Meeting' && <Calendar className="w-3 h-3 text-slate-500" />}
                        {fu.type}
                      </span>
                    </td>

                    {/* Next Action */}
                    <td className="py-5 px-3 text-slate-900 font-black">
                      {fu.nextAction}
                    </td>

                    {/* Due Date */}
                    <td className="py-5 px-3 text-slate-500 font-medium whitespace-nowrap">
                      {formatDueDate(fu.dueDate)}
                    </td>

                    {/* Priority */}
                    <td className="py-5 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                        fu.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        fu.priority === 'Medium' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {fu.priority}
                      </span>
                    </td>

                    {/* Last Note Preview */}
                    <td className="py-5 px-4 max-w-xs truncate font-medium text-slate-500" title={fu.lastNote}>
                      {fu.lastNote}
                    </td>

                    {/* Status */}
                    <td className="py-5 px-3 text-center">
                      <span className="flex items-center justify-center gap-1.5 font-bold">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          fu.status === 'Qualified' ? 'bg-emerald-500 animate-pulse' :
                          fu.status === 'Pending' ? 'bg-slate-400' :
                          fu.status === 'Missed' ? 'bg-rose-500' :
                          'bg-indigo-500'
                        }`}></span>
                        <span className={
                          fu.status === 'Qualified' ? 'text-emerald-700' :
                          fu.status === 'Pending' ? 'text-slate-600' :
                          fu.status === 'Missed' ? 'text-rose-600' :
                          'text-indigo-600'
                        }>
                          {fu.status}
                        </span>
                      </span>
                    </td>

                    {/* Actions Row */}
                    <td className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        <button 
                          onClick={() => openOutcomeModal(fu)}
                          className="p-1 bg-slate-50 border border-slate-200 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" 
                          title="Complete Follow Up & Log Outcome"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        
                        <button 
                          onClick={() => openDetailDrawer(fu)}
                          className="p-1 hover:text-slate-800 transition-colors" 
                          title="View Details"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-xs font-semibold text-slate-400">
                    No follow up engagements staged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            Showing {filteredFollowUps.length} of {followUps.length} Follow Ups
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

      {/* New Follow-Up Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleCreateFollowUp} className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-950 flex items-center gap-2 text-base">
                <Sparkles className="w-5 h-5 text-blue-600" /> New Follow-up Schedule
              </h3>
              <button 
                type="button"
                onClick={() => setIsNewModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Lead Name</label>
                <input 
                  type="text" 
                  value={newLead}
                  onChange={(e) => setNewLead(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                  placeholder="e.g. Alex Linderman" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Role / Designation</label>
                  <input 
                    type="text" 
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                    placeholder="e.g. Director of Sales" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Company</label>
                  <input 
                    type="text" 
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                    placeholder="e.g. Nexus Corp" 
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                    placeholder="e.g. contact@domain.com" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                  <input 
                    type="text" 
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                    placeholder="+1 (555) 012-3456" 
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Stage</label>
                  <select 
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as any)}
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold"
                  >
                    <option value="Contacted">Contacted</option>
                    <option value="Meeting Done">Meeting Done</option>
                    <option value="Follow Up">Follow Up</option>
                    <option value="Qualified">Qualified</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority</label>
                  <select 
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Engagement Type</label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold"
                  >
                    <option value="Phone Call">Phone Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Next Planned Action</label>
                  <select 
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value as any)}
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold"
                  >
                    <option value="Collect Requirements">Collect Requirements</option>
                    <option value="Send Proposal">Send Proposal</option>
                    <option value="Schedule Demo">Schedule Demo</option>
                    <option value="Call CTO">Call CTO</option>
                    <option value="Waiting Client Response">Waiting Client Response</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Date</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Time (HH:MM)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                      placeholder="05:30"
                      required
                    />
                    <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => setNewAmPm('AM')}
                        className={`px-3 py-1 rounded-md text-[10px] font-black transition-colors ${newAmPm === 'AM' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewAmPm('PM')}
                        className={`px-3 py-1 rounded-md text-[10px] font-black transition-colors ${newAmPm === 'PM' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Follow-Up Note Preview</label>
                <textarea 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950" 
                  placeholder="Record initial contextual note to display on table list..." 
                  rows={2.5}
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
                Schedule Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Log Outcome Modal */}
      {isOutcomeModalOpen && selectedFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleSaveOutcome} className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-950 flex items-center gap-2 text-base">
                <CheckCircle className="w-5 h-5 text-emerald-600" /> Log Engagement Outcome
              </h3>
              <button type="button" onClick={() => setIsOutcomeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Lead Target: <span className="font-bold text-slate-800">{selectedFollowUp.leadName} ({selectedFollowUp.company})</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Follow-Up Outcome</label>
                <select 
                  value={outcomeSelect}
                  onChange={(e) => setOutcomeSelect(e.target.value as any)}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold"
                >
                  <option value="Interested">Interested</option>
                  <option value="Needs Follow Up">Needs Follow Up</option>
                  <option value="Meeting Required">Meeting Required</option>
                  <option value="Qualified">Qualified (Ready for Handoff)</option>
                  <option value="Rejected">Rejected</option>
                  <option value="No Response">No Response</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Outcome Notes</label>
                <textarea 
                  value={outcomeNote}
                  onChange={(e) => setOutcomeNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950" 
                  placeholder="Summarize customer feedback, details of budget discussed, or technical blockers..." 
                  rows={4}
                  required
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button type="button" onClick={() => setIsOutcomeModalOpen(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-950 text-white hover:bg-slate-800">
                Save & Complete
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sliding Lead Detail Drawer */}
      {isDetailDrawerOpen && selectedFollowUp && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          {/* Backdrop Click Dismiss */}
          <div className="absolute inset-0" onClick={() => setIsDetailDrawerOpen(false)} />
          
          {/* Sliding Panel */}
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Lead Profile details
                </span>
                <h3 className="text-xl font-black text-slate-950 mt-2">{selectedFollowUp.leadName}</h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5">{selectedFollowUp.role} · <span className="text-slate-800">{selectedFollowUp.company}</span></p>
              </div>
              <button 
                onClick={() => setIsDetailDrawerOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Lead Info Box */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Lead Information
                </h4>
                <div className="grid grid-cols-2 gap-y-3.5 text-xs font-semibold">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">Assigned CEM</div>
                    <div className="text-slate-800 font-extrabold mt-0.5">{selectedFollowUp.assignedCem}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">Lead Owner</div>
                    <div className="text-slate-800 font-extrabold mt-0.5">{selectedFollowUp.leadOwner}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">Email Address</div>
                    <div className="text-slate-600 mt-0.5 break-all font-medium">{selectedFollowUp.email}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">Phone Number</div>
                    <div className="text-slate-600 mt-0.5 font-medium">{selectedFollowUp.phone}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">Created Date</div>
                    <div className="text-slate-600 mt-0.5 font-medium">{selectedFollowUp.createdDate}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">Current Pipeline Stage</div>
                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded text-[9px] font-black mt-1 uppercase tracking-wider">
                      {selectedFollowUp.currentStage}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Planned Action */}
              <div className="bg-[#111827] text-white border border-slate-800 rounded-xl p-5 shadow-md flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Next Planned Action</p>
                  <h4 className="text-sm font-black text-slate-100 mt-1.5">{selectedFollowUp.nextAction}</h4>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Due Date</p>
                  <h4 className="text-xs font-bold text-rose-400 mt-1.5 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedFollowUp.dueDate}</h4>
                </div>
              </div>

              {/* Notes History */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Logged Notes & Activity History
                </h4>
                {selectedFollowUp.notesHistory && selectedFollowUp.notesHistory.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedFollowUp.notesHistory.map((n, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-xs text-slate-600 leading-relaxed font-semibold">
                        {n}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-semibold italic">No notes logged yet.</p>
                )}
              </div>

              {/* Meeting History */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Meeting History
                </h4>
                {selectedFollowUp.meetingHistory && selectedFollowUp.meetingHistory.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFollowUp.meetingHistory.map((m, idx) => (
                      <div key={idx} className="flex gap-3 items-center bg-slate-50/50 border border-slate-100 p-3 rounded-lg text-xs font-semibold text-slate-700">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-semibold italic">No meetings on record.</p>
                )}
              </div>

              {/* Communication History */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <History className="w-3.5 h-3.5" /> Communication Logs
                </h4>
                {selectedFollowUp.communicationHistory && selectedFollowUp.communicationHistory.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFollowUp.communicationHistory.map((c, idx) => (
                      <div key={idx} className="flex gap-3 items-center bg-slate-50/50 border border-slate-100 p-3 rounded-lg text-xs font-semibold text-slate-700">
                        <MessageSquare className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-semibold italic">No communication logs recorded.</p>
                )}
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
              <button 
                onClick={() => setIsDetailDrawerOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
              >
                Close Drawer
              </button>
              <button 
                onClick={() => {
                  setIsDetailDrawerOpen(false);
                  openOutcomeModal(selectedFollowUp);
                }}
                className="px-5 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                Log Outcome <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
