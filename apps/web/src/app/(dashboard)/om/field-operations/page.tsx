"use client";

import React, { useState } from "react";
import { Download, Calendar as CalendarIcon, CheckCircle2, MoreVertical, Check } from "lucide-react";
import { PremiumDashboardLayout, PremiumCard } from '@/components/shared/premium-dashboard';

export default function OmFieldOperationsPage() {
  const [meetingDate, setMeetingDate] = useState("dd-mm-yyyy");

  const meetings = [
    {
      id: 1,
      client: "naprocs technologies",
      leadId: "cmrtf7wvv000lnrt9svhd43jf",
      leadLink: "naprocs.technologies",
      meetingDate: "Jul 20, 2026",
      meetingTime: "12:00",
      meetingType: "Requirement Review",
      outcome: null,
      assigned: { name: "cmrolaz6s00008wf8qdrz8o4i", type: "c" },
      status: "SCHEDULED",
    },
    {
      id: 2,
      client: "naprocs technologies",
      leadId: "LEAD-CMRT pradeep",
      phone: "99100405508",
      meetingDate: "Jul 20, 2026",
      meetingTime: "5:30 PM",
      meetingType: "Discovery Call",
      outcome: "INTERESTED",
      assigned: { name: "Swetha CEM", type: "SC" },
      status: "COMPLETED",
    },
    {
      id: 3,
      client: "Dental Clinic",
      leadId: "lead-123 Dr Smith",
      meetingDate: "Jul 25, 2026",
      meetingTime: "10:00 AM",
      meetingType: "CONSULTATION #5",
      outcome: null,
      assigned: { name: "Junaid", type: "J" },
      status: "SCHEDULED",
    },
    {
      id: 4,
      client: "Dental Clinic",
      leadId: "lead-123 Dr Smith",
      meetingDate: "Jul 25, 2026",
      meetingTime: "10:00 AM",
      meetingType: "CONSULTATION #4",
      outcome: null,
      assigned: { name: "Junaid", type: "J" },
      status: "SCHEDULED",
    },
    {
      id: 5,
      client: "Dental Clinic",
      leadId: "lead-123 Dr Smith",
      meetingDate: "Jul 25, 2026",
      meetingTime: "10:00 AM",
      meetingType: "CONSULTATION #3",
      outcome: null,
      assigned: { name: "Junaid", type: "J" },
      status: "SCHEDULED",
    },
    {
      id: 6,
      client: "Dental Clinic",
      leadId: "lead-123 Dr Smith",
      meetingDate: "Jul 25, 2026",
      meetingTime: "10:00 AM",
      meetingType: "CONSULTATION #2",
      outcome: null,
      assigned: { name: "Junaid", type: "J" },
      status: "SCHEDULED",
    },
  ];

  return (
    <PremiumDashboardLayout className="p-0 bg-transparent min-h-0 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Meeting Management</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Review and execute your scheduled client engagements.</p>
        </div>
        <div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-lg transition-colors shadow-sm">
            <Download className="w-4 h-4" /> EXPORT REPORT
          </button>
        </div>
      </div>

      {/* Main Container */}
      <PremiumCard className="p-0 overflow-hidden border border-slate-200 shadow-sm">
        
        {/* Filters */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row gap-4 items-end w-full">
            <div className="w-full md:w-1/4">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Meeting Date</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full px-3 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-700"
                  style={{ colorScheme: "light" }}
                />
              </div>
            </div>
            <div className="w-full md:w-1/4">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Meeting Type</label>
              <select className="w-full px-3 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-700">
                <option>All Types</option>
                <option>Requirement Review</option>
                <option>Discovery Call</option>
                <option>Consultation</option>
              </select>
            </div>
            <div className="w-full md:w-1/4">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
              <select className="w-full px-3 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-700">
                <option>All Statuses</option>
                <option>Scheduled</option>
                <option>Completed</option>
              </select>
            </div>
            <div className="w-full md:w-1/4">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Assigned Employee</label>
              <select className="w-full px-3 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-700">
                <option>All Employees</option>
                <option>Junaid</option>
                <option>Swetha CEM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider min-w-[250px]">Client & Lead</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider min-w-[150px]">Meeting Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider min-w-[150px]">Meeting Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center min-w-[120px]">Outcome</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider min-w-[200px]">Assigned Employee</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center min-w-[120px]">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center min-w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {meetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-slate-900">{meeting.client}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-1 flex flex-wrap gap-2 items-center">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 truncate max-w-[150px]">
                        {meeting.leadId}
                      </span>
                      {meeting.leadLink && <span className="text-blue-500 hover:underline cursor-pointer">{meeting.leadLink}</span>}
                      {meeting.phone && <span>📞 {meeting.phone}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-700">{meeting.meetingDate}</div>
                    <div className="text-[11px] font-semibold text-slate-400">• {meeting.meetingTime}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">
                    {meeting.meetingType}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {meeting.outcome ? (
                      <span className="inline-block px-2.5 py-1 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-full uppercase tracking-wider">
                        {meeting.outcome}
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {meeting.assigned.type}
                      </div>
                      <span className="text-sm font-semibold text-slate-700 truncate max-w-[140px]">{meeting.assigned.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider
                      ${meeting.status === 'COMPLETED' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {meeting.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors border border-slate-200">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PremiumCard>
    </PremiumDashboardLayout>
  );
}
