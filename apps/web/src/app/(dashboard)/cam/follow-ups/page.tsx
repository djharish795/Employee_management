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
  Clock
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface FollowUp {
  id: string;
  leadName: string;
  role: string;
  company: string;
  type: 'Phone Call' | 'Email' | 'Meeting';
  dueDate: string;
  status: 'Qualified' | 'Pending' | 'Missed' | 'Completed';
  notes?: string[];
}

export default function FollowUpHubPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>(
    [
      {
        id: '1',
        leadName: 'Alex Linderman',
        role: 'Director of Sales',
        company: 'Nexus Corp',
        type: 'Phone Call',
        dueDate: '2023-10-24 14:00',
        status: 'Qualified',
        notes: ['Customer prefers phone call, wants to discuss custom pricing models.']
      },
      {
        id: '2',
        leadName: 'Sarah Kinsley',
        role: 'Operations Lead',
        company: 'CloudFlow Solutions',
        type: 'Email',
        dueDate: '2023-10-24 16:30',
        status: 'Pending',
        notes: []
      },
      {
        id: '3',
        leadName: 'Marcus Reed',
        role: 'CFO',
        company: 'Stellar Systems',
        type: 'Meeting',
        dueDate: '2023-10-24 10:15',
        status: 'Missed',
        notes: ['Missed meeting, client did not join Zoom. Reschedule requested.']
      }
    ]
  );

  const [activeTab, setActiveTab] = useState<'Today' | 'Upcoming' | 'Missed' | 'Completed'>('Today');
  
  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);

  // Form State
  const [newLead, setNewLead] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newType, setNewType] = useState<FollowUp['type']>('Phone Call');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newStatus, setNewStatus] = useState<FollowUp['status']>('Pending');

  // Notes Form
  const [newNoteText, setNewNoteText] = useState('');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead || !newCompany || !newDate || !newTime) return;

    const formattedDueDate = `${newDate} ${newTime}`;

    const newFU: FollowUp = {
      id: (followUps.length + 1).toString(),
      leadName: newLead,
      role: newRole || 'Lead Contact',
      company: newCompany,
      type: newType,
      dueDate: formattedDueDate,
      status: newStatus,
      notes: []
    };

    setFollowUps([newFU, ...followUps]);
    setIsNewModalOpen(false);
    toast.success('Follow-up task created successfully!');

    // Reset Form
    setNewLead('');
    setNewRole('');
    setNewCompany('');
    setNewType('Phone Call');
    setNewDate('');
    setNewTime('');
    setNewStatus('Pending');
  };

  const handleMarkComplete = (id: string) => {
    setFollowUps(prev => prev.map(f => {
      if (f.id === id) {
        toast.success(`Follow-up with ${f.leadName} marked as completed!`);
        return { ...f, status: 'Completed' };
      }
      return f;
    }));
  };

  const openNotesModal = (fu: FollowUp) => {
    setSelectedFollowUp(fu);
    setIsNotesModalOpen(true);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText || !selectedFollowUp) return;

    setFollowUps(prev => prev.map(f => {
      if (f.id === selectedFollowUp.id) {
        return {
          ...f,
          notes: [...(f.notes || []), newNoteText]
        };
      }
      return f;
    }));

    setNewNoteText('');
    setIsNotesModalOpen(false);
    toast.success('Activity log notes added successfully!');
  };

  // Filtering based on tab selection
  const filteredFollowUps = followUps.filter(f => {
    if (activeTab === 'Today') {
      // Show Pending or Qualified due today (or all due today/scheduled)
      return f.status === 'Pending' || f.status === 'Qualified';
    }
    if (activeTab === 'Upcoming') {
      // In a real app we'd compare dates, here show non-missed/non-completed that aren't today's main ones
      return f.status === 'Pending';
    }
    if (activeTab === 'Missed') {
      return f.status === 'Missed';
    }
    if (activeTab === 'Completed') {
      return f.status === 'Completed';
    }
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
          <button className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" /> Filter
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2 flex flex-col justify-center">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Tasks</div>
          <h2 className="text-3xl font-black text-slate-900">24</h2>
          <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +12% from yesterday
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2 flex flex-col justify-center">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversion Rate</div>
          <h2 className="text-3xl font-black text-slate-900">8.2%</h2>
          <div className="text-[11px] font-semibold text-slate-400">
            — Steady velocity
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2 flex flex-col justify-center">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Health</div>
          <p className="text-xs font-semibold text-slate-700 leading-relaxed pt-1">
            Data synchronization is 100% complete for all modules.
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-6">Lead</th>
                <th className="py-4 px-3">Company</th>
                <th className="py-4 px-3">Type</th>
                <th className="py-4 px-3">Due Date</th>
                <th className="py-4 px-3">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
              {filteredFollowUps.length > 0 ? (
                filteredFollowUps.map(fu => (
                  <tr key={fu.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Lead info */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                          {getInitials(fu.leadName)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-950">{fu.leadName}</div>
                          <div className="text-[10px] font-medium text-slate-400 mt-0.5">{fu.role}</div>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-5 px-3 text-slate-900 font-bold">
                      {fu.company}
                    </td>

                    {/* Action Type Badge */}
                    <td className="py-5 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200 text-[10px] font-bold">
                        {fu.type === 'Phone Call' && <Phone className="w-3 h-3 text-slate-500 transform -rotate-90" />}
                        {fu.type === 'Email' && <Mail className="w-3 h-3 text-slate-500" />}
                        {fu.type === 'Meeting' && <Calendar className="w-3 h-3 text-slate-500" />}
                        {fu.type}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="py-5 px-3 text-slate-500 font-medium">
                      {fu.dueDate}
                    </td>

                    {/* Status Dot */}
                    <td className="py-5 px-3">
                      <span className="flex items-center gap-1.5 font-bold">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          fu.status === 'Qualified' ? 'bg-emerald-500' :
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
                      <div className="flex items-center justify-end gap-2.5 text-slate-400">
                        <button 
                          onClick={() => handleMarkComplete(fu.id)}
                          className="p-1 hover:text-emerald-600 transition-colors" 
                          title="Mark Completed"
                          disabled={fu.status === 'Completed'}
                        >
                          <CheckCircle className={`w-4.5 h-4.5 ${fu.status === 'Completed' ? 'text-emerald-500' : ''}`} />
                        </button>
                        
                        <button 
                          onClick={() => openNotesModal(fu)}
                          className="p-1 hover:text-slate-800 transition-colors" 
                          title="Log Notes"
                        >
                          <FileText className="w-4.5 h-4.5" />
                        </button>

                        <button className="p-1 hover:text-slate-800 transition-colors" title="Send Message">
                          <MessageSquare className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs font-semibold text-slate-400">
                    No follow ups in this list view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Follow-Up Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleCreateFollowUp} className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-950 flex items-center gap-2 text-base">
                <Calendar className="w-5 h-5 text-blue-600" /> New Follow-up Schedule
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Time</label>
                  <input 
                    type="time" 
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold" 
                    required
                  />
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Initial Status</label>
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Missed">Missed</option>
                  </select>
                </div>
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

      {/* Log Activity Notes Modal */}
      {isNotesModalOpen && selectedFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleAddNote} className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-950 flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-blue-600" /> Log Engagement Details
              </h3>
              <button type="button" onClick={() => setIsNotesModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Customer: <span className="font-bold text-slate-800">{selectedFollowUp.leadName} ({selectedFollowUp.company})</span>
                </p>
              </div>

              {selectedFollowUp.notes && selectedFollowUp.notes.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged Activities</p>
                  {selectedFollowUp.notes.map((note, index) => (
                    <p key={index} className="text-xs font-semibold text-slate-600 border-l border-slate-300 pl-2 leading-relaxed">
                      {note}
                    </p>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Activity Notes</label>
                <textarea 
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950" 
                  placeholder="Record summary of call, email response details, next follow up requirements..." 
                  rows={4}
                  required
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button type="button" onClick={() => setIsNotesModalOpen(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-950 text-white hover:bg-slate-800">
                Log Activity
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
