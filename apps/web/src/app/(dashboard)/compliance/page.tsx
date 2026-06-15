"use client";

import React from 'react';
import { Download, ShieldCheck, AlertCircle, AlertTriangle, FileText, Activity, Clock, CheckCircle2, ChevronRight, Play, MoreVertical, Filter, Shield } from 'lucide-react';

export default function CompliancePage() {
  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Compliance Management Hub</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Manage data privacy, consent records, and institutional audit readiness.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              Export Reports
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Play className="w-4 h-4 fill-current" /> Run Compliance Audit
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Employees</div>
            <div className="text-3xl font-bold text-slate-900 mb-1">1,248</div>
            <div className="text-[11px] font-semibold text-slate-500">Across 4 regions</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Active Consents</div>
            <div className="flex items-end gap-2 mb-1">
              <div className="text-3xl font-bold text-slate-900">1,182</div>
              <div className="text-sm font-bold text-emerald-600 mb-1">94.7%</div>
            </div>
            <div className="w-full h-1 bg-emerald-100 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-emerald-500 w-[94.7%]"></div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pending Requests</div>
            <div className="text-3xl font-bold text-slate-900 mb-1">14</div>
            <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Action required
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Deletion Req.</div>
            <div className="text-3xl font-bold text-slate-900 mb-1">3</div>
            <div className="text-[11px] font-bold text-rose-600">SLA: 48h remaining</div>
          </div>
          <div className="bg-blue-700 text-white rounded-xl p-5 shadow-md flex flex-col justify-center relative overflow-hidden">
            <Shield className="w-24 h-24 absolute -right-4 -bottom-4 opacity-10 text-white" />
            <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-2 relative z-10">Compliance Score</div>
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="text-4xl font-extrabold tracking-tight">98.2%</div>
              <div className="px-2 py-0.5 bg-blue-500 text-white rounded text-[11px] font-bold flex items-center gap-1">
                <Activity className="w-3 h-3" /> +1.4%
              </div>
            </div>
            <div className="text-[11px] font-medium text-blue-100 italic relative z-10">"Institutional excellence maintained"</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Employee Consent Management */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Employee Consent Management</h3>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-slate-50 text-slate-500 rounded transition-colors"><Filter className="w-4 h-4" /></button>
                  <button className="p-1.5 hover:bg-slate-50 text-slate-500 rounded transition-colors"><MoreVertical className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-5 py-4">Employee Name</th>
                      <th className="px-5 py-4">Consent Type</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Last Updated</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=f1f5f9" className="w-8 h-8 rounded-full border border-slate-200" />
                          <div>
                            <div className="font-bold text-slate-900 text-[13px]">Sarah Jenkins</div>
                            <div className="text-[10px] font-medium text-slate-500">Product Design</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[13px] font-medium text-slate-600">Biometric Data</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded border border-emerald-100">Active</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-[12px] font-semibold text-slate-700">Oct 24, 2023</div>
                        <div className="text-[10px] font-medium text-slate-400">14:22 PM</div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700">View</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Marcus&backgroundColor=f1f5f9" className="w-8 h-8 rounded-full border border-slate-200" />
                          <div>
                            <div className="font-bold text-slate-900 text-[13px]">Marcus Chen</div>
                            <div className="text-[10px] font-medium text-slate-500">Engineering</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[13px] font-medium text-slate-600">PII Processing</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase rounded border border-amber-100">Expired</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-[12px] font-semibold text-slate-700">Aug 12, 2023</div>
                        <div className="text-[10px] font-medium text-slate-400">09:15 AM</div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Renew</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">LR</div>
                          <div>
                            <div className="font-bold text-slate-900 text-[13px]">Lina Rodriguez</div>
                            <div className="text-[10px] font-medium text-slate-500">Legal Operations</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[13px] font-medium text-slate-600">Marketing Consent</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold uppercase rounded border border-rose-100">Revoked</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-[12px] font-semibold text-slate-700">Jan 05, 2024</div>
                        <div className="text-[10px] font-medium text-slate-400">11:40 AM</div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Audit</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Data Access & Deletion Requests */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Data Access & Deletion Requests</h3>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
                  <button className="px-3 py-1 bg-white text-slate-900 shadow-sm rounded-md text-[10px] font-bold tracking-wide">PENDING</button>
                  <button className="px-3 py-1 text-slate-500 hover:text-slate-700 rounded-md text-[10px] font-bold tracking-wide">APPROVED</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Request 1 */}
                <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Access Request #9921</span>
                      <span className="text-[10px] font-semibold text-slate-400">2h ago</span>
                    </div>
                    <h4 className="text-[13px] font-bold text-slate-900 mb-1">Full Data Export Request</h4>
                    <p className="text-[11px] font-medium text-slate-500 mb-4">Requested by: James McAvoy (Ops)</p>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button className="flex-1 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white text-[11px] font-bold rounded-md transition-colors">REVIEW</button>
                    <button className="flex-1 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-md transition-colors">DISMISS</button>
                  </div>
                </div>

                {/* Request 2 */}
                <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Deletion Request #8812</span>
                      <span className="text-[10px] font-semibold text-slate-400">5h ago</span>
                    </div>
                    <h4 className="text-[13px] font-bold text-slate-900 mb-1">PII Purge Request (Employee Exit)</h4>
                    <p className="text-[11px] font-medium text-slate-500 mb-4">Requested by: HR System Auto Trigger</p>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button className="flex-1 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white text-[11px] font-bold rounded-md transition-colors">EXECUTE</button>
                    <button className="flex-1 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-md transition-colors">HOLD</button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Span 1) */}
          <div className="space-y-6">
            
            {/* Policy Compliance Status */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6">Policy Compliance Status</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-bold text-slate-800">DPDPA Privacy Policy 2024</span>
                    <span className="text-xs font-bold text-blue-600">92%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-blue-600 w-[92%] rounded-full"></div>
                  </div>
                  <p className="text-[10px] font-medium text-slate-500">112 pending acknowledgments</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-bold text-slate-800">Remote Work SOP v2.1</span>
                    <span className="text-xs font-bold text-emerald-600">100%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-emerald-500 w-[100%] rounded-full"></div>
                  </div>
                  <p className="text-[10px] font-medium text-slate-500">All employees compliant</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-bold text-slate-800">Biometric Attendance Consent</span>
                    <span className="text-xs font-bold text-amber-500">74%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-amber-500 w-[74%] rounded-full"></div>
                  </div>
                  <p className="text-[10px] font-medium text-slate-500">324 pending acknowledgments</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-bold text-slate-800">Cybersecurity Awareness</span>
                    <span className="text-xs font-bold text-blue-600">88%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-blue-600 w-[88%] rounded-full"></div>
                  </div>
                  <p className="text-[10px] font-medium text-slate-500">142 pending acknowledgments</p>
                </div>
              </div>
            </div>

            {/* Compliance Activity Feed */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-5">Compliance Activity Feed</h3>
              
              <div className="relative border-l border-slate-200 ml-2 space-y-6">
                
                <div className="relative pl-5">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500 border-2 border-white ring-1 ring-blue-100"></div>
                  <p className="text-[13px] text-slate-700 leading-snug">
                    <span className="font-bold text-slate-900">System Audit</span> completed for Q1 Readiness. No critical failures detected.
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">Today, 08:30 AM</p>
                </div>

                <div className="relative pl-5">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-300 border-2 border-white"></div>
                  <p className="text-[13px] text-slate-700 leading-snug">
                    <span className="font-bold text-slate-900">Privacy Policy update</span> broadcasted to 1,248 employees.
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">Yesterday, 04:15 PM</p>
                </div>

                <div className="relative pl-5">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-amber-500 border-2 border-white ring-1 ring-amber-100"></div>
                  <p className="text-[13px] text-slate-700 leading-snug">
                    <span className="font-bold text-slate-900">Marcus Chen's</span> PII Processing consent expired. Renewal notification sent.
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">Jan 28, 2024</p>
                </div>

              </div>
            </div>

            {/* Executive Alerts */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="text-sm font-bold">Executive Alerts</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Policy Violation
                  </div>
                  <div className="text-[13px] font-bold text-rose-900">Unencrypted Data Transfer</div>
                  <div className="text-[10px] font-medium text-rose-700 mt-0.5">Incident ID: #INC-882 · High Priority</div>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">
                    <Clock className="w-3.5 h-3.5" /> Consent Expiry
                  </div>
                  <div className="text-[13px] font-bold text-rose-900">12 Critical Consents Expiring</div>
                  <div className="text-[10px] font-medium text-rose-700 mt-0.5">Automatic lockout in 24 hours</div>
                </div>
              </div>
              <div className="p-4 pt-0">
                <button className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors">
                  VIEW ALL ALERTS
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
