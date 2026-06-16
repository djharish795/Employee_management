"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search, Filter, Plus, FileText, CheckCircle2, History, Users, MoreVertical, X } from "lucide-react";
import { ComplianceRole, PolicyRecord } from "@/types/compliance";

interface PoliciesPanelProps {
  activeRole: ComplianceRole;
}

const MOCK_POLICIES: PolicyRecord[] = [
  {
    id: "POL-SEC-01",
    title: "Data Protection and Privacy Policy",
    version: "v2.1",
    category: "SECURITY",
    status: "PUBLISHED",
    publishedDate: "2023-01-10T00:00:00Z",
    acceptanceRate: 98,
    totalEmployees: 450,
    acceptedEmployees: 441
  },
  {
    id: "POL-HR-01",
    title: "Code of Conduct & Ethics",
    version: "v3.0",
    category: "HR",
    status: "PUBLISHED",
    publishedDate: "2022-11-15T00:00:00Z",
    acceptanceRate: 100,
    totalEmployees: 450,
    acceptedEmployees: 450
  },
  {
    id: "POL-SEC-02",
    title: "Acceptable IT Use Policy",
    version: "v1.5",
    category: "SECURITY",
    status: "PUBLISHED",
    publishedDate: "2023-05-20T00:00:00Z",
    acceptanceRate: 85,
    totalEmployees: 450,
    acceptedEmployees: 382
  },
  {
    id: "POL-LEG-01",
    title: "Anti-Bribery and Corruption Policy",
    version: "v1.0",
    category: "LEGAL",
    status: "DRAFT",
    acceptanceRate: 0,
    totalEmployees: 450,
    acceptedEmployees: 0
  },
  {
    id: "POL-OPS-01",
    title: "Remote Work Guidelines",
    version: "v1.2",
    category: "OPERATIONS",
    status: "ARCHIVED",
    publishedDate: "2020-03-15T00:00:00Z",
    acceptanceRate: 95,
    totalEmployees: 300,
    acceptedEmployees: 285
  }
];

export default function PoliciesPanel({ activeRole }: PoliciesPanelProps) {
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const canManagePolicies = ["COMPLIANCE_OFFICER", "ADMIN", "LEGAL"].includes(activeRole);

  const { data: policies } = useQuery({
    queryKey: ["policies"],
    queryFn: async () => MOCK_POLICIES
  });

  const filteredPolicies = policies?.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative">
      
      {/* ── Left Column: Policy Library ────────────────────────────────── */}
      <div className={`flex-1 transition-all duration-300 ${selectedPolicy ? "lg:mr-96" : ""}`}>
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search policy library..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
              />
            </div>
            <button className="h-9 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" /> Category
            </button>
          </div>

          {canManagePolicies && (
            <button className="h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center">
              <Plus className="w-4 h-4" /> Create Policy
            </button>
          )}
        </div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPolicies.map((policy) => (
            <div 
              key={policy.id} 
              onClick={() => setSelectedPolicy(policy)}
              className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col group ${
                selectedPolicy?.id === policy.id ? 'border-teal-400 ring-1 ring-teal-400' : 'border-slate-200 hover:border-teal-300'
              }`}
            >
              <div className="p-5 border-b border-slate-100 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                    {policy.category}
                  </span>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    policy.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    policy.status === "DRAFT" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    {policy.status}
                  </div>
                </div>
                
                <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                  {policy.title}
                </h3>
                
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <FileText className="w-3.5 h-3.5" /> {policy.version}
                  </div>
                  {policy.publishedDate && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 
                      {new Date(policy.publishedDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>

              {/* Acceptance Progress Bar */}
              <div className="p-4 bg-slate-50/50 rounded-b-xl border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Acceptance Rate</span>
                  <span className={`text-xs font-bold ${policy.acceptanceRate < 90 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {policy.acceptanceRate}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      policy.status === "DRAFT" ? "bg-slate-300" :
                      policy.acceptanceRate < 90 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${policy.acceptanceRate}%` }}
                  />
                </div>
                <div className="text-[10px] font-semibold text-slate-400 mt-2 text-right">
                  {policy.acceptedEmployees} of {policy.totalEmployees} employees
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Column: Policy Details Drawer ──────────────────────── */}
      <div className={`fixed inset-y-0 right-0 w-96 bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 z-50 lg:absolute lg:inset-auto lg:right-0 lg:top-0 lg:bottom-0 lg:shadow-none lg:z-10 ${
        selectedPolicy ? "translate-x-0" : "translate-x-full lg:hidden"
      }`}>
        {selectedPolicy && (
          <div className="flex flex-col h-full bg-white rounded-xl shadow-sm lg:border lg:border-slate-200">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50 lg:rounded-t-xl">
              <div className="flex-1 pr-4">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1 block">Policy Details</span>
                <h2 className="text-sm font-bold text-slate-900 leading-snug">{selectedPolicy.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedPolicy(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              <div className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</div>
                  <div className="text-xs font-bold text-slate-900">{selectedPolicy.status}</div>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Version</div>
                  <div className="text-xs font-bold text-slate-900">{selectedPolicy.version}</div>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Published</div>
                  <div className="text-xs font-bold text-slate-900">
                    {selectedPolicy.publishedDate ? new Date(selectedPolicy.publishedDate).toLocaleDateString() : '-'}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" /> Version History
                </h3>
                <div className="relative border-l-2 border-slate-200 ml-2 space-y-4">
                  <div className="relative pl-4">
                    <div className="absolute w-2.5 h-2.5 bg-teal-500 rounded-full -left-[6px] top-1 border-2 border-white"></div>
                    <div className="text-xs font-bold text-slate-900">{selectedPolicy.version} (Current)</div>
                    <div className="text-[10px] font-medium text-slate-500 mt-0.5">Updated privacy clauses for DPDPA compliance.</div>
                  </div>
                  {selectedPolicy.version !== "v1.0" && (
                    <div className="relative pl-4">
                      <div className="absolute w-2.5 h-2.5 bg-slate-300 rounded-full -left-[6px] top-1 border-2 border-white"></div>
                      <div className="text-xs font-bold text-slate-600">v1.0</div>
                      <div className="text-[10px] font-medium text-slate-400 mt-0.5">Initial policy publication.</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" /> Pending Acceptances
                </h3>
                {selectedPolicy.acceptanceRate === 100 ? (
                  <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> All employees have accepted this version.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">Non-compliant Users</span>
                      <span className="font-bold text-amber-600">{selectedPolicy.totalEmployees - selectedPolicy.acceptedEmployees}</span>
                    </div>
                    {canManagePolicies && (
                      <button className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm mt-2">
                        Send Reminder Notification
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Drawer Footer */}
            {canManagePolicies && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 lg:rounded-b-xl flex gap-3">
                <button className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                  Edit Draft
                </button>
                <button className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
