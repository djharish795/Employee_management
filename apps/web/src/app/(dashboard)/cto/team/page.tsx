"use client";

import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Filter, ChevronLeft, ChevronRight, Activity, TrendingUp, Calendar } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface EngineerData {
  id: string;
  name: string;
  initials: string;
  subTeam: string;
  designation: string;
  experience: number;
  status: string;
}

export default function EngineeringTeamPage() {
  const role = useAuthStore((state) => state.role);
  
  // Data State
  const [engineers, setEngineers] = useState<EngineerData[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [totalCount, setTotalCount] = useState(0);

  const tabs = ['All', 'Backend', 'Frontend', 'DevOps', 'QA', 'Mobile', 'Architecture'];

  // Protect route
  if (role !== "CTO") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      
      {/* Top Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Engineering Team</h1>
        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-900" />
          <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-900" />
          <HelpCircle className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-900" />
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center font-bold text-xs shadow-sm">LK</div>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-6">
        
        {/* Filters & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-bold">
            {totalCount} engineers
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search by name or sub-team..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Filter className="w-4 h-4" /> Filter by sub-team
            </button>
          </div>
        </div>

        {/* Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-slate-900 text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Engineer</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sub-Team</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Designation</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Experience</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {engineers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-sm font-medium text-slate-400">
                      Waiting for backend engineer data...
                    </td>
                  </tr>
                ) : (
                  engineers.map(engineer => (
                    <tr key={engineer.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Would render dynamic rows here */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
            <div className="text-sm font-medium text-slate-500">
              Showing 1-8 of {totalCount}
            </div>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-900 text-white font-bold text-sm">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50">
                3
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50">
                4
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uptime Avg.</div>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">99.98%</span>
              <span className="text-xs font-bold text-emerald-600">+0.02%</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sprint Velocity</div>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">124</span>
              <span className="text-sm font-semibold text-slate-500">pts avg.</span>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 shadow-sm text-white relative overflow-hidden flex flex-col justify-center">
            {/* Dark background pattern mimicking the screenshot */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 flex">
               <div className="w-1/4 h-full border-r border-slate-800/50"></div>
               <div className="w-1/4 h-full border-r border-slate-800/50"></div>
               <div className="w-1/4 h-full border-r border-slate-800/50"></div>
            </div>
            <div className="relative z-10">
              <h3 className="text-base font-bold mb-2">Architecture Review</h3>
              <p className="text-sm text-slate-300 font-medium leading-relaxed">
                The quarterly engineering architecture review is scheduled for Friday at 10:00 AM.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
