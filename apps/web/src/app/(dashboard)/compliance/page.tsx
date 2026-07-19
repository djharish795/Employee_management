"use client";

import React, { useState } from 'react';
import { Search, ChevronRight, ShieldCheck, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { AddConsentModal } from '@/components/modules/compliance/add-consent-modal';
import { Trash2 } from 'lucide-react';
import Image from "next/image";

export default function ComplianceDashboardPage() {
  const [isAddConsentOpen, setIsAddConsentOpen] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const getHeaders = () => ({
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  });
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

  // Queries
  const { data: dashboardStats } = useQuery({
    queryKey: ['compliance-dashboard', accessToken],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/compliance/dashboard`, { headers: getHeaders() });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!accessToken
  });

  const { data: consentLogs = [] } = useQuery({
    queryKey: ['compliance-consents', accessToken],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/compliance/consents`, { headers: getHeaders() });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!accessToken
  });

  const { data: erasureRequests = [] } = useQuery({
    queryKey: ['compliance-erasures', accessToken],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/compliance/erasures`, { headers: getHeaders() });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!accessToken
  });

  const { data: grievanceCases = [] } = useQuery({
    queryKey: ['compliance-grievances', accessToken],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/compliance/grievances`, { headers: getHeaders() });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!accessToken
  });

  // Mutations
  const processErasureMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string, action: "APPROVE" | "REJECT" }) => {
      const res = await fetch(`${apiUrl}/compliance/erasures/${id}/process`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ action })
      });
      if (!res.ok) throw new Error("Failed to process request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-erasures'] });
      alert("Request processed successfully.");
    },
    onError: () => {
      alert("Error processing erasure request.");
    }
  });

  const handleProcessErasure = (id: string, action: "APPROVE" | "REJECT") => {
    if (confirm(`Are you sure you want to ${action} this erasure request?${action === 'APPROVE' ? '\\nThis action is irreversible.' : ''}`)) {
      processErasureMutation.mutate({ id, action });
    }
  };

  const revokeConsentMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${apiUrl}/compliance/consents/${id}/revoke`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Failed to revoke consent");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-consents'] });
    },
    onError: () => {
      alert("Error revoking consent.");
    }
  });

  const handleRevokeConsent = (id: string) => {
    if (confirm("Are you sure you want to revoke this consent record?")) {
      revokeConsentMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col min-h-full font-sans bg-slate-50">
      
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg tracking-tight">
            Compliance
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-wider rounded-md border border-blue-100">
            DPDPA 2023
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search data records..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Consent Log */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-[500px]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Consent log</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Purpose</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {consentLogs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-12 text-center text-sm text-slate-400 font-medium">
                        No consent records found.
                      </td>
                    </tr>
                  ) : (
                    consentLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-4 py-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                          {log.employee?.firstName} {log.employee?.lastName}
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-500 line-clamp-2">{log.purpose}</td>
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          {!log.revokedAt ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded border border-emerald-100">Active</span>
                              <button 
                                onClick={() => handleRevokeConsent(log.id)}
                                disabled={revokeConsentMutation.isPending}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors disabled:opacity-50"
                                title="Revoke Consent"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="px-2.5 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 rounded border border-rose-100">Revoked</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 mt-auto">
              <button 
                onClick={() => setIsAddConsentOpen(true)}
                className="w-full py-2.5 bg-white border border-blue-200 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-50 transition-colors"
              >
                Add consent record
              </button>
            </div>
          </div>

          {/* Column 2: Data Erasure Requests */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-[500px]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Data erasure requests
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">
                  {erasureRequests.filter((r: any) => r.status === 'PENDING').length}
                </span>
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {erasureRequests.length === 0 ? (
               <div className="h-full flex items-center justify-center text-sm text-slate-400 font-medium">
                 No erasure requests pending.
               </div>
              ) : (
                erasureRequests.map((req: any) => (
                  <div key={req.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/30">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {req.employee?.photoUrl ? (
                          <Image src={req.employee.photoUrl} alt="Employee" className="w-8 h-8 rounded-full border border-slate-200 object-cover" fill style={{ objectFit: "cover" }} />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {req.employee?.firstName?.charAt(0) || "U"}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-slate-900">{req.employee?.firstName} {req.employee?.lastName}</div>
                          <div className="text-xs font-medium text-slate-500">
                            Requested {new Date(req.requestedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${
                        req.status === 'PENDING' ? 'text-amber-700 bg-amber-100' :
                        req.status === 'PROCESSED' ? 'text-emerald-700 bg-emerald-100' :
                        'text-rose-700 bg-rose-100'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    {req.status === 'PENDING' && (
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <button 
                          onClick={() => handleProcessErasure(req.id, "APPROVE")}
                          disabled={processErasureMutation.isPending}
                          className="py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleProcessErasure(req.id, "REJECT")}
                          disabled={processErasureMutation.isPending}
                          className="py-2 bg-white border border-rose-200 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Grievance cases */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-[500px]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Grievance cases
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">
                  {grievanceCases.filter((c: any) => c.status === 'OPEN').length} open
                </span>
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reporter</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {grievanceCases.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-12 text-center text-sm text-slate-400 font-medium">
                        No grievance records found.
                      </td>
                    </tr>
                  ) : (
                    grievanceCases.map((caseItem: any) => (
                      <tr key={caseItem.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-4 py-4">
                          <div className="text-xs font-bold text-slate-900">{caseItem.id.slice(-6).toUpperCase()}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(caseItem.openedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-600">
                          {caseItem.employee?.firstName} {caseItem.employee?.lastName}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {caseItem.status === 'RESOLVED' ? (
                            <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded border border-emerald-100">Resolved</span>
                          ) : (
                            <span className="px-2.5 py-1 text-[10px] font-bold text-amber-700 bg-amber-50 rounded border border-amber-100">Open</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
          
          <div className="flex items-start justify-between border-b border-slate-100 pb-6">
            <div>
              <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-4">Grievance Officer Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Name</div>
                  <div className="text-sm font-bold text-slate-900">
                    {dashboardStats?.grievanceOfficer?.name || "Not Assigned"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</div>
                  <div className="text-sm font-bold text-slate-900">
                    {dashboardStats?.grievanceOfficer?.email || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</div>
                  <div className="text-sm font-bold text-slate-900">
                    {dashboardStats?.grievanceOfficer?.phone || "N/A"}
                  </div>
                </div>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-bold transition-colors">
              Update contact
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-slate-900 rounded-xl p-5 shadow-sm">
              <div className="text-[11px] font-medium text-slate-400 mb-2">Total Data Volume</div>
              <div className="flex items-end gap-3">
                <span className="text-2xl font-bold text-white">{dashboardStats?.totalDataVolume || "---"}</span>
                <span className="text-[10px] font-bold text-emerald-400 mb-1">Active</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="text-[11px] font-medium text-slate-500 mb-2">Consent Coverage</div>
              <div className="flex items-end gap-3">
                <span className="text-2xl font-bold text-slate-900">{dashboardStats?.consentCoverage ?? 0}%</span>
                <span className="text-[10px] font-bold text-blue-600 mb-1">Target 100%</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="text-[11px] font-medium text-slate-500 mb-2">Avg. Erasure Time</div>
              <div className="flex items-end gap-3">
                <span className="text-2xl font-bold text-slate-900">{dashboardStats?.avgErasureTime || "---"} Days</span>
                <span className="text-[10px] font-bold text-emerald-600 mb-1">Within SLA</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
              <div className="text-[11px] font-medium text-slate-500 mb-2">Encryption Status</div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">{dashboardStats?.encryptionStatus || "Active"}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <AddConsentModal 
        isOpen={isAddConsentOpen} 
        onClose={() => setIsAddConsentOpen(false)} 
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['compliance-consents'] })} 
      />
    </div>
  );
}
