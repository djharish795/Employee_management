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
  Briefcase
} from 'lucide-react';

interface Meeting {
  id: string;
  client: string;
  date: string;
  time: string;
  type: string;
  assignedEmployee: string;
  status: 'SCHEDULED' | 'QUALIFIED' | 'ACTIVE';
}

export default function MeetingManagementPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      client: 'Nexus Digital Corp',
      date: 'Oct 24, 2023',
      time: '10:00 AM',
      type: 'Project Discovery',
      assignedEmployee: 'Alex Sterling',
      status: 'SCHEDULED'
    },
    {
      id: '2',
      client: 'Vertex Logistics',
      date: 'Oct 24, 2023',
      time: '01:30 PM',
      type: 'Follow-up Call',
      assignedEmployee: 'Lisa Miller',
      status: 'QUALIFIED'
    },
    {
      id: '3',
      client: 'Starlight Industries',
      date: 'Oct 25, 2023',
      time: '09:00 AM',
      type: 'Product Demo',
      assignedEmployee: 'James Doe',
      status: 'ACTIVE'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState('Project Discovery');
  const [newEmployee, setNewEmployee] = useState('');
  const [newStatus, setNewStatus] = useState<'SCHEDULED' | 'QUALIFIED' | 'ACTIVE'>('SCHEDULED');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient || !newDate || !newTime || !newEmployee) return;

    // Convert newDate (YYYY-MM-DD) to MMM DD, YYYY
    const formattedDate = new Date(newDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Convert newTime (HH:MM) to HH:MM AM/PM
    const [hours, minutes] = newTime.split(':');
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    const formattedHours = parseInt(hours) % 12 || 12;
    const formattedTime = `${formattedHours}:${minutes} ${ampm}`;

    const newMeeting: Meeting = {
      id: (meetings.length + 1).toString(),
      client: newClient,
      date: formattedDate,
      time: formattedTime,
      type: newType,
      assignedEmployee: newEmployee,
      status: newStatus
    };

    setMeetings([newMeeting, ...meetings]);
    setIsModalOpen(false);

    // Reset Form
    setNewClient('');
    setNewDate('');
    setNewTime('');
    setNewType('Project Discovery');
    setNewEmployee('');
    setNewStatus('SCHEDULED');
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full font-sans space-y-6">
      
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
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-slate-950 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Meeting
          </button>
        </div>
      </div>

      {/* Meeting List Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-6">Client</th>
                <th className="py-4 px-3">Meeting Date</th>
                <th className="py-4 px-3">Meeting Type</th>
                <th className="py-4 px-3">Assigned Employee</th>
                <th className="py-4 px-3 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
              {meetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Client */}
                  <td className="py-5 px-6 font-bold text-slate-950">
                    {meeting.client}
                  </td>
                  
                  {/* Date & Time */}
                  <td className="py-5 px-3 font-medium text-slate-500">
                    {meeting.date} <span className="text-slate-400">·</span> <span className="font-bold text-slate-700">{meeting.time}</span>
                  </td>
                  
                  {/* Type */}
                  <td className="py-5 px-3">
                    <span className="text-blue-600 font-bold hover:underline cursor-pointer">{meeting.type}</span>
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
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-wider border border-slate-200">
                        Scheduled
                      </span>
                    )}
                    {meeting.status === 'QUALIFIED' && (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 text-[10px] font-extrabold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Qualified
                      </span>
                    )}
                    {meeting.status === 'ACTIVE' && (
                      <span className="inline-block px-2.5 py-0.5 bg-slate-950 text-white rounded text-[9px] font-black uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </td>
                  
                  {/* Actions */}
                  <td className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end gap-3 text-slate-400">
                      {meeting.status === 'SCHEDULED' && (
                        <>
                          <button className="p-1 hover:text-slate-800 transition-colors" title="Start Meeting">
                            <PlayCircle className="w-4.5 h-4.5" />
                          </button>
                          <button className="p-1 hover:text-slate-800 transition-colors" title="View Document">
                            <FileText className="w-4.5 h-4.5" />
                          </button>
                          <button className="p-1 hover:text-slate-800 transition-colors" title="Reschedule">
                            <CalendarDays className="w-4.5 h-4.5" />
                          </button>
                        </>
                      )}
                      {meeting.status === 'QUALIFIED' && (
                        <>
                          <button className="p-1 hover:text-slate-800 transition-colors" title="View Details">
                            <Eye className="w-4.5 h-4.5" />
                          </button>
                          <button className="p-1 hover:text-slate-800 transition-colors" title="More Options">
                            <MoreVertical className="w-4.5 h-4.5" />
                          </button>
                        </>
                      )}
                      {meeting.status === 'ACTIVE' && (
                        <>
                          <button className="p-1 hover:text-slate-800 transition-colors" title="Start Meeting">
                            <PlayCircle className="w-4.5 h-4.5" />
                          </button>
                          <button className="p-1 hover:text-slate-800 transition-colors" title="More Options">
                            <MoreVertical className="w-4.5 h-4.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            Showing {meetings.length} of {meetings.length} Meetings
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleCreateMeeting} className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" /> New Meeting Engagement
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
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
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                >
                  <option value="Project Discovery">Project Discovery</option>
                  <option value="Follow-up Call">Follow-up Call</option>
                  <option value="Product Demo">Product Demo</option>
                  <option value="Stakeholder Alignment">Stakeholder Alignment</option>
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
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="ACTIVE">Active</option>
                </select>
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
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

    </div>
  );
}
