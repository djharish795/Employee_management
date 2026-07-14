"use client";

import React, { useState } from 'react';
import { 
  Download, Plus, Search, Filter, 
  FileBox, CheckCircle2, XCircle, FileClock,
  ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import Image from 'next/image';

export default function OmWorkReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Clean mock data for UI implementation as requested (no hardcoded data fetching logic yet)
  const mockReports = [
    { id: 1, name: "Marcus Chen", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026701d", department: "Digital Marketing", type: "Weekly Sync", title: "Q4 Ad Spend Projection", date: "Oct 24, 2023", priority: "CRITICAL", status: "PENDING" },
    { id: 2, name: "Sarah Jenkins", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026702d", department: "CRM", type: "Daily Standup", title: "Client Onboarding Log", date: "Oct 23, 2023", priority: "MEDIUM", status: "APPROVED" },
    { id: 3, name: "David Miller", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026703d", department: "Operations", type: "Incident Report", title: "Server Rack Maintenance", date: "Oct 23, 2023", priority: "HIGH", status: "PENDING" },
    { id: 4, name: "Elena Rodriguez", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d", department: "CAM", type: "Daily Standup", title: "Budget Reconciliation", date: "Oct 22, 2023", priority: "LOW", status: "REJECTED" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Team Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and review operational submissions from all departments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">
            <Plus className="w-4 h-4" /> Manual Entry
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <FileBox className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">PENDING</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">24</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">APPROVED</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">158</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">REJECTED</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">12</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
            <FileClock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">NEEDS REVISION</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">09</h3>
          </div>
        </div>
      </div>

      {/* Filters and Table Area */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Filter Bar */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="grid grid-cols-1 md:grid-cols-5 xl:grid-cols-6 gap-4 items-end">
            <div className="xl:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Employee, title..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Department</label>
              <select className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Departments</option>
                <option>Digital Marketing</option>
                <option>CRM</option>
                <option>Operations</option>
                <option>CAM</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Report Type</label>
              <select className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Daily Standup</option>
                <option>Weekly Sync</option>
                <option>Incident Report</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Status</label>
              <select className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Status</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Date Range</label>
                <input 
                  type="text" 
                  placeholder="Oct 01 - Oct 31" 
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors h-[38px] w-[38px] flex items-center justify-center flex-shrink-0 mb-[1px]">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">Report Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">Title</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">Priority</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {mockReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors bg-white dark:bg-slate-900">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden relative bg-slate-200">
                        <Image src={report.avatar} alt={report.name} fill style={{ objectFit: 'cover' }} />
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">{report.name.split(' ')[0]}<br/><span className="text-slate-500">{report.name.split(' ')[1]}</span></span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{report.department}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{report.type}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white max-w-[200px] truncate">{report.title}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{report.date.split(',')[0]}<br/>{report.date.split(',')[1]}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider
                      ${report.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 
                        report.priority === 'HIGH' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                        report.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}
                    >
                      {report.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full 
                        ${report.status === 'APPROVED' ? 'bg-emerald-500' : 
                          report.status === 'REJECTED' ? 'bg-rose-500' : 
                          'bg-amber-500'}`}
                      ></span>
                      <span className="text-slate-900 dark:text-white font-medium capitalize">{report.status.toLowerCase()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">Showing 1-10 of 210 reports</p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
