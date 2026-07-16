"use client";

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Search, 
  SlidersHorizontal,
  ExternalLink,
  Lock,
  UserCheck
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface QualifiedLead {
  id: string;
  company: string;
  contactPerson: string;
  industry: string;
  qualifiedDate: string;
  source: string;
  status: 'AWAITING_HANDOFF' | 'HANDED_OFF' | 'CRM_ACCEPTED';
  assignedCrm?: string;
}

export default function QualificationPage() {
  const [leads, setLeads] = useState<QualifiedLead[]>([
    {
      id: 'L-9823-A',
      company: 'Nebula Systems Inc.',
      contactPerson: 'Sarah Jenkins',
      industry: 'Financial Technology',
      qualifiedDate: '2023-10-24',
      source: 'Strategic Webinar Q4',
      status: 'AWAITING_HANDOFF'
    },
    {
      id: 'L-8109-C',
      company: 'Vertex Logistics',
      contactPerson: 'Elena Markova',
      industry: 'Supply Chain',
      qualifiedDate: '2023-10-23',
      source: 'Direct Outbound Outreach',
      status: 'HANDED_OFF',
      assignedCrm: 'David Sterling'
    },
    {
      id: 'L-3310-X',
      company: 'CloudScale Solutions',
      contactPerson: 'Aria Sterling',
      industry: 'Enterprise SaaS',
      qualifiedDate: '2023-10-22',
      source: 'Referral Program',
      status: 'CRM_ACCEPTED',
      assignedCrm: 'Lisa Miller'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const triggerHandoff = (id: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        toast.success(`Handoff completed for ${l.company}! Staged for CRM Assignment.`);
        return {
          ...l,
          status: 'HANDED_OFF',
          assignedCrm: 'Pending Assignment'
        };
      }
      return l;
    }));
  };

  const filteredLeads = leads.filter(l => 
    l.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <button className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" /> Filter Pipelines
          </button>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search qualified leads..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950" 
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-6">Lead details</th>
                <th className="py-4 px-3">Industry</th>
                <th className="py-4 px-3">Qualification Date</th>
                <th className="py-4 px-3">Lead Source</th>
                <th className="py-4 px-3">CRM Owner</th>
                <th className="py-4 px-3 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
              {filteredLeads.length > 0 ? (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Company details */}
                    <td className="py-5 px-6">
                      <div className="font-bold text-slate-950 flex items-center gap-1.5">
                        {lead.company}
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 border border-slate-200 px-1 py-0.5 rounded">
                          {lead.id}
                        </span>
                      </div>
                      <div className="text-[10px] font-medium text-slate-400 mt-1">{lead.contactPerson}</div>
                    </td>

                    {/* Industry */}
                    <td className="py-5 px-3 text-slate-800">
                      {lead.industry}
                    </td>

                    {/* Date Qualified */}
                    <td className="py-5 px-3 text-slate-500 font-medium">
                      {new Date(lead.qualifiedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Source */}
                    <td className="py-5 px-3 text-slate-600 font-medium">
                      {lead.source}
                    </td>

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

                    {/* Status Dot */}
                    <td className="py-5 px-3 text-center">
                      {lead.status === 'AWAITING_HANDOFF' && (
                        <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-black uppercase tracking-wider">
                          Ready for Handoff
                        </span>
                      )}
                      {lead.status === 'HANDED_OFF' && (
                        <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px] font-black uppercase tracking-wider">
                          Handed Over
                        </span>
                      )}
                      {lead.status === 'CRM_ACCEPTED' && (
                        <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-black uppercase tracking-wider">
                          CRM Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lead.status === 'AWAITING_HANDOFF' ? (
                          <button 
                            onClick={() => triggerHandoff(lead.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[9px] rounded-lg shadow-sm transition-colors"
                          >
                            Handoff to CRM <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-400 font-black uppercase tracking-widest text-[9px] rounded-lg border border-slate-200">
                            Handoff Done <Check className="w-3 h-3 text-emerald-600" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs font-semibold text-slate-400">
                    No qualified leads found.
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
