"use client";

import React, { useState } from "react";
import { Search, Filter, MoreVertical, Eye, CalendarX, CalendarClock, Copy } from "lucide-react";
import Link from "next/link";

export default function MyRequestsPage() {
  const [activeTab, setActiveTab] = useState("Pending");

  const tabs = ["Pending", "Approved", "Declined", "Rescheduled", "Completed", "Cancelled"];

  const requests = [
    { id: "REQ-1001", name: "Lokesh", initials: "L", role: "Chief Technology Officer", meeting: "Q1 Hiring Plan Sync", date: "Jan 16, 2026", time: "10:30 AM", duration: "30m", status: "Pending", type: "sent" },
    { id: "REQ-1002", name: "Tejesh Kumar", initials: "TK", role: "HR Director", meeting: "Performance Review Process", date: "Jan 18, 2026", time: "2:00 PM", duration: "45m", status: "Pending", type: "sent" },
    { id: "REQ-1003", name: "Anita Menon", initials: "AM", role: "Senior Engineering Manager", meeting: "Architecture Review", date: "Jan 14, 2026", time: "11:00 AM", duration: "60m", status: "Approved", type: "received" },
  ];

  const filteredRequests = activeTab === "All" ? requests : requests.filter(r => r.status === activeTab);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Requests</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Track and manage your meeting requests.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Top Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-2 lg:pb-0">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === tab 
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search meetings..." 
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 transition-all"
              />
            </div>
            <button className="p-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Meeting</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm flex-shrink-0">
                        {req.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{req.name}</p>
                        <p className="text-[11px] font-medium text-slate-500">{req.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-slate-900">{req.meeting}</p>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">ID: {req.id}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-slate-900">{req.date}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{req.time} <span className="mx-1">•</span> {req.duration}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      req.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/connect/requests/${req.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Reschedule">
                        <CalendarClock className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Withdraw/Cancel">
                        <CalendarX className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="More Actions">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-6 h-6 text-slate-300" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">No requests found</h3>
                    <p className="text-xs text-slate-500 mt-1">There are no {activeTab.toLowerCase()} requests matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
