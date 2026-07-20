"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Search, 
  SlidersHorizontal,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { apiClient } from '@/lib/api/client';

interface PipelineLead {
  id: string;
  company: string;
  prospectName: string;
  industry: string;
  leadSource: string;
  qualificationStatus: 'AWAITING_HANDOFF' | 'HANDED_OVER' | 'CRM_ACTIVE';
  assignedCrm?: string | null;
  assignedCem?: { firstName: string; lastName: string } | null;
  createdAt: string;
  updatedAt: string;
}

export default function QualificationPage() {
  const [leads, setLeads] = useState<PipelineLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterIndustry, setFilterIndustry] = useState('All');

  // Handoff modal state
  const [handoffTarget, setHandoffTarget] = useState<PipelineLead | null>(null);
  const [crmOwnerInput, setCrmOwnerInput] = useState('');
  const [isHandoffSaving, setIsHandoffSaving] = useState(false);

  const fetchPipeline = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get('/cem/leads/pipeline');
      setLeads(data);
    } catch {
      toast.error('Failed to load qualification pipeline.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  const handleConfirmHandoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoffTarget || !crmOwnerInput.trim()) return;
    setIsHandoffSaving(true);
    try {
      const { data: updated } = await apiClient.post(`/cem/leads/${handoffTarget.id}/confirm-handoff`, {
        crmOwner: crmOwnerInput.trim()
      });
      setLeads(prev => prev.map(l => l.id === handoffTarget.id ? { ...l, ...updated } : l));
      toast.success(`${handoffTarget.company} handed off to ${crmOwnerInput.trim()}!`);
      setHandoffTarget(null);
      setCrmOwnerInput('');
    } catch {
      toast.error('Failed to complete handoff.');
    } finally {
      setIsHandoffSaving(false);
    }
  };

  // Collect unique industries for filter dropdown
  const uniqueIndustries = Array.from(new Set(leads.map(l => l.industry).filter(Boolean)));

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.prospectName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'All' ||
      lead.qualificationStatus === filterStatus;

    const matchesIndustry =
      filterIndustry === 'All' ||
      lead.industry === filterIndustry;

    return matchesSearch && matchesStatus && matchesIndustry;
  });

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full font-sans space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-slate-950" /> Qualification Pipeline
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Review qualified accounts, complete audits, and hand over active mandates to CRM teams.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPipeline}
            className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border rounded-lg transition-colors shadow-sm ${showFilters ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" /> Filter Pipelines
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-bold"
            >
              <option value="All">All Statuses</option>
              <option value="AWAITING_HANDOFF">Ready for Handoff</option>
              <option value="HANDED_OVER">Handed Over</option>
              <option value="CRM_ACTIVE">CRM Active</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Industry</label>
            <select
              value={filterIndustry}
              onChange={e => setFilterIndustry(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-bold"
            >
              <option value="All">All Industries</option>
              {uniqueIndustries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search qualified leads..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950"
          />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} in pipeline
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-6">Lead Details</th>
                <th className="py-4 px-3">Industry</th>
                <th className="py-4 px-3">Qualified Date</th>
                <th className="py-4 px-3">Lead Source</th>
                <th className="py-4 px-3">CRM Owner</th>
                <th className="py-4 px-3 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs font-semibold text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> Loading pipeline...
                  </td>
                </tr>
              ) : filteredLeads.length > 0 ? (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Company */}
                    <td className="py-5 px-6">
                      <div className="font-bold text-slate-950 flex items-center gap-1.5">
                        {lead.company}
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 border border-slate-200 px-1 py-0.5 rounded">
                          {lead.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="text-[10px] font-medium text-slate-400 mt-1">{lead.prospectName}</div>
                    </td>

                    {/* Industry */}
                    <td className="py-5 px-3 text-slate-800">{lead.industry}</td>

                    {/* Qualified Date */}
                    <td className="py-5 px-3 text-slate-500 font-medium">
                      {new Date(lead.updatedAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>

                    {/* Source */}
                    <td className="py-5 px-3 text-slate-600 font-medium">{lead.leadSource || '—'}</td>

                    {/* CRM Owner */}
                    <td className="py-5 px-3">
                      {lead.assignedCrm ? (
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-bold text-slate-700">{lead.assignedCrm}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium">—</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-5 px-3 text-center">
                      {lead.qualificationStatus === 'AWAITING_HANDOFF' && (
                        <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-black uppercase tracking-wider">
                          Ready for Handoff
                        </span>
                      )}
                      {lead.qualificationStatus === 'HANDED_OVER' && (
                        <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px] font-black uppercase tracking-wider">
                          Handed Over
                        </span>
                      )}
                      {lead.qualificationStatus === 'CRM_ACTIVE' && (
                        <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-black uppercase tracking-wider">
                          CRM Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-5 px-6 text-right">
                      {lead.qualificationStatus === 'AWAITING_HANDOFF' ? (
                        <button
                          onClick={() => { setHandoffTarget(lead); setCrmOwnerInput(''); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[9px] rounded-lg shadow-sm transition-colors"
                        >
                          Handoff to CRM <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-400 font-black uppercase tracking-widest text-[9px] rounded-lg border border-slate-200">
                          Handoff Done <Check className="w-3 h-3 text-emerald-600" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs font-semibold text-slate-400">
                    No qualified leads found in the pipeline.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Handoff Confirmation Modal */}
      {handoffTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Handoff to CRM</h2>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Assign a CRM owner for <span className="font-bold text-slate-800">{handoffTarget.company}</span>
              </p>
            </div>
            <form onSubmit={handleConfirmHandoff} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  CRM Owner Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="crm.owner@company.com"
                  value={crmOwnerInput}
                  onChange={e => setCrmOwnerInput(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setHandoffTarget(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isHandoffSaving || !crmOwnerInput.trim()}
                  className="flex-1 py-2.5 bg-slate-950 text-white text-xs font-black rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isHandoffSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
                  Confirm Handoff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
