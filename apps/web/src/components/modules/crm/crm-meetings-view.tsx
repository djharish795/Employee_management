"use client";

import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Download,
  Phone,
  RefreshCw,
  Video
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { crmApi } from '@/lib/api/crm';

export default function CrmMeetingsView() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterClient, setFilterClient] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const fetchClientsAndMeetings = async () => {
    try {
      setIsLoading(true);
      const meetingsRes = await crmApi.getMeetings();
      const meetingsData = meetingsRes.data?.data || meetingsRes.data || [];
      setMeetings(Array.isArray(meetingsData) ? meetingsData : []);
    } catch (error) {
      toast.error('Network error loading CRM meetings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientsAndMeetings();
  }, []);

  // Derive unique client names from meetings currently loaded
  const uniqueLeads = Array.from(
    new Map(
      meetings
        .filter(m => m.leadId || m.leadName || m.client)
        .map(m => [m.leadId ?? m.leadName ?? m.client, { id: m.leadId ?? m.leadName ?? m.client, name: m.leadName || m.client || m.leadId }])
    ).values()
  );
  const filteredMeetings = meetings.filter(m => {
    let matches = true;
    if (filterDate && m.date !== filterDate) matches = false;
    if (filterClient !== 'All' && m.leadId !== filterClient) matches = false;
    if (filterType !== 'All' && m.type !== filterType) matches = false;
    return matches;
  });

  const handleExport = () => {
    if (!filteredMeetings || filteredMeetings.length === 0) {
      toast.error("No meetings to export.");
      return;
    }

    const headers = ["Date", "Time", "Client", "Type", "Status", "Meet Link"];
    const rows = filteredMeetings.map((m: any) => [
      `"${m.date || ''}"`,
      `"${m.time || ''}"`,
      `"${m.leadName || m.client || 'Unknown Client'}"`,
      `"${m.type || 'General'}"`,
      `"${m.status || 'SCHEDULED'}"`,
      `"${m.meetLink || ''}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `crm_meetings_schedule_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Meetings schedule exported successfully.");
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full font-sans space-y-6 min-h-screen bg-slate-50">
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
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export Schedule
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Meeting Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Client Account</label>
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Clients</option>
            {uniqueLeads.map(lead => (
              <option key={lead.id} value={lead.id}>{lead.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Meeting Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Types</option>
            <option value="Discovery">Discovery Call</option>
            <option value="Requirement Review">Requirement Review</option>
            <option value="Demo">Product Demo</option>
            <option value="Proposal">Proposal Discussion</option>
            <option value="Contract">Contract Negotiation</option>
            <option value="Check-in">General Check-in</option>
          </select>
        </div>
      </div>

      {/* Meeting Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading && meetings.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : filteredMeetings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Meeting Date & Time</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Link / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMeetings.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{meeting.leadName}</div>
                      <div className="text-xs text-slate-500">{meeting.client}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-700">{meeting.date}</div>
                      <div className="text-xs text-slate-500">{meeting.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-bold">
                        {meeting.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        {meeting.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-600 max-w-xs truncate whitespace-pre-wrap">
                        {meeting.notes || 'No notes'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-4">
              <CalendarDays className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No scheduled meetings</h3>
            <p className="text-sm text-slate-500 font-medium">
              You currently have no upcoming meetings with CRM clients.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
