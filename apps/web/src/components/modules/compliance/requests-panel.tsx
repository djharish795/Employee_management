"use client";

import React, { useMemo } from "react";
import { Clock, ShieldAlert, CheckCircle2, UserCircle, Search, Filter, Mail, Trash2, Edit3, ArrowRight } from "lucide-react";
import { ComplianceRole, ComplianceRequest } from "@/types/compliance";

interface RequestsPanelProps {
  activeRole: ComplianceRole;
}

const MOCK_REQUESTS: ComplianceRequest[] = [
  {
    id: "REQ-001",
    employeeId: "EMP-106",
    employeeName: "Anita M.",
    type: "DATA_DELETION",
    status: "REVIEWING",
    dateSubmitted: "2023-11-20T10:00:00Z",
    slaDeadline: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 48h from now
    assignedTo: "LEGAL"
  },
  {
    id: "REQ-002",
    employeeId: "EMP-108",
    employeeName: "Priya Menon",
    type: "DATA_ACCESS",
    status: "RECEIVED",
    dateSubmitted: "2023-11-22T09:15:00Z",
    slaDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days
    assignedTo: "HR"
  },
  {
    id: "REQ-003",
    employeeId: "EMP-099",
    employeeName: "Ex-Employee",
    type: "DATA_DELETION",
    status: "APPROVED",
    dateSubmitted: "2023-11-15T14:30:00Z",
    slaDeadline: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // OVERDUE
    assignedTo: "IT_ADMIN"
  },
  {
    id: "REQ-004",
    employeeId: "EMP-104",
    employeeName: "Sarah Q.",
    type: "DATA_CORRECTION",
    status: "FULFILLED",
    dateSubmitted: "2023-11-10T11:00:00Z",
    slaDeadline: "2023-11-15T00:00:00Z"
  }
];

export default function RequestsPanel({ activeRole }: RequestsPanelProps) {
  // CEO shouldn't be processing requests. They can view, but no actions.
  const canProcess = ["COMPLIANCE_OFFICER", "ADMIN", "LEGAL", "HR"].includes(activeRole);

  const stats = useMemo(() => {
    return {
      total: MOCK_REQUESTS.length,
      pending: MOCK_REQUESTS.filter(r => ["RECEIVED", "REVIEWING", "APPROVED"].includes(r.status)).length,
      overdue: MOCK_REQUESTS.filter(r => new Date(r.slaDeadline).getTime() < Date.now() && r.status !== "FULFILLED" && r.status !== "REJECTED").length
    };
  }, []);

  return (
    <div className="space-y-6">
      
      {/* ── Header Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Requests</div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          </div>
          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
            <Mail className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Resolution</div>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          </div>
          <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white border border-rose-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">SLA Breached</div>
            <div className="text-2xl font-bold text-rose-700">{stats.overdue}</div>
          </div>
          <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── List View ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-900">Privacy Data Requests</h2>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search ID or Employee..." className="w-56 h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium" />
            </div>
          </div>
          <button className="h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 z-10 shadow-sm shadow-slate-200/50">
              <tr>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Request Details</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Type</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">SLA Status</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Workflow Stage</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_REQUESTS.map(req => {
                const isOverdue = new Date(req.slaDeadline).getTime() < Date.now() && !["FULFILLED", "REJECTED"].includes(req.status);
                
                return (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex flex-shrink-0 items-center justify-center text-slate-500 border border-slate-200">
                          <UserCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{req.employeeName}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">{req.id}</div>
                          <div className="text-[10px] font-medium text-slate-400 mt-1">
                            Submitted: {new Date(req.dateSubmitted).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-1.5">
                        {req.type === "DATA_DELETION" ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : 
                         req.type === "DATA_CORRECTION" ? <Edit3 className="w-3.5 h-3.5 text-slate-700" /> : 
                         <Search className="w-3.5 h-3.5 text-teal-500" />}
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{req.type.replace("_", " ")}</span>
                      </div>
                    </td>

                    <td className="p-4 align-top">
                      {["FULFILLED", "REJECTED"].includes(req.status) ? (
                        <span className="text-[10px] font-bold text-slate-400">RESOLVED</span>
                      ) : isOverdue ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded w-max border border-rose-200">
                          <ShieldAlert className="w-3 h-3" /> OVERDUE
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded w-max border border-amber-200">
                          <Clock className="w-3 h-3" /> DUE {new Date(req.slaDeadline).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    <td className="p-4 align-top">
                      {/* Simple Linear Workflow Visualizer */}
                      <div className="flex items-center gap-1 text-[10px] font-bold">
                        <div className={`px-1.5 py-0.5 rounded ${["RECEIVED", "REVIEWING", "APPROVED", "FULFILLED", "REJECTED"].includes(req.status) ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400'}`}>Rcvd</div>
                        <ArrowRight className="w-2.5 h-2.5 text-slate-300" />
                        <div className={`px-1.5 py-0.5 rounded ${["REVIEWING", "APPROVED", "FULFILLED", "REJECTED"].includes(req.status) ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>Revw</div>
                        <ArrowRight className="w-2.5 h-2.5 text-slate-300" />
                        
                        {req.status === "REJECTED" ? (
                           <div className="px-1.5 py-0.5 rounded bg-rose-600 text-white">Rejected</div>
                        ) : (
                          <>
                            <div className={`px-1.5 py-0.5 rounded ${["APPROVED", "FULFILLED"].includes(req.status) ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400'}`}>Appr</div>
                            <ArrowRight className="w-2.5 h-2.5 text-slate-300" />
                            <div className={`px-1.5 py-0.5 rounded ${["FULFILLED"].includes(req.status) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>Done</div>
                          </>
                        )}
                      </div>
                      
                      {canProcess && !["FULFILLED", "REJECTED"].includes(req.status) && (
                        <button className="mt-3 text-[10px] font-bold text-teal-600 hover:underline">Advance Workflow</button>
                      )}
                    </td>

                    <td className="p-4 align-top">
                      {req.assignedTo ? (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded">
                          {req.assignedTo}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
