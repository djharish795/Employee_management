"use client";

import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Filter, ChevronLeft, ChevronRight, Activity, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { fetchCtoTeam } from '@/lib/api/cto';
import Link from 'next/link';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    if (role === 'CTO') {
      setIsLoading(true);
      fetchCtoTeam()
        .then((data) => {
          setEngineers(data.engineers || []);
          setTotalCount(data.totalCount || 0);
        })
        .catch((err) => console.error("Failed to fetch CTO team", err))
        .finally(() => setIsLoading(false));
    }
  }, [role]);

  // Generate dynamic tabs based on actual subTeams present in the data
  const tabs = ['All', ...Array.from(new Set(engineers.map(e => e.subTeam)))];
  
  // Filter by Tab & Search Query
  const filteredEngineers = engineers.filter(e => {
    const matchesTab = activeTab === 'All' || e.subTeam === activeTab;
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.subTeam.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredEngineers.length / itemsPerPage);
  const paginatedEngineers = filteredEngineers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>
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
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-sm font-medium text-slate-400">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading engineer data...
                      </div>
                    </td>
                  </tr>
                ) : paginatedEngineers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-sm font-medium text-slate-400">
                      No engineers found matching your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedEngineers.map(engineer => (
                    <tr key={engineer.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {engineer.initials}
                          </div>
                          <span className="text-sm font-bold text-slate-900">{engineer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{engineer.subTeam}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{engineer.designation}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{engineer.experience} yrs</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {engineer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/employees/${engineer.id}`} className="text-slate-400 hover:text-slate-600 font-medium text-sm">
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
              <div className="text-sm font-medium text-slate-500">
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredEngineers.length)} of {filteredEngineers.length}
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold ${
                      currentPage === page 
                        ? 'bg-slate-900 text-white' 
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
