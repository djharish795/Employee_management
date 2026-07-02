"use client";

import React from 'react';
import { LogOut, Clock, MonitorSmartphone, MessageSquare, Plus, AlertTriangle, Monitor, FileText, Lock, Filter, Download, ChevronRight, CheckCircle2, RefreshCw, Archive, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

export default function OffboardingPage() {
  const role = useAuthStore((state) => state.role);
  
  // Protect route: Only HR can access
  if (role !== "HR") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm">Only HR personnel can view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
          <div>
            <div className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="text-slate-500">EMS</span> / <span className="text-slate-500">OFFBOARDING</span> / OVERVIEW
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Employee Offboarding</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              Export Report
            </button>
            <Link href="/offboarding/new" className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Initiate Offboarding
            </Link>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Pending Exits</div>
              <div className="p-1.5 bg-slate-100 text-slate-900 rounded-md"><LogOut className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">14</div>
            <div className="text-[11px] font-semibold text-slate-500"><span className="text-rose-600">+2</span> from last week</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Avg. Notice Period</div>
              <div className="p-1.5 bg-orange-50 text-orange-600 rounded-md"><Clock className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">30 <span className="text-sm font-semibold text-slate-500">Days</span></div>
            <div className="text-[11px] font-semibold text-slate-500">Standardized across depts</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Assets Pending</div>
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md"><MonitorSmartphone className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">28</div>
            <div className="text-[11px] font-semibold text-slate-500"><span className="text-slate-900 font-bold">85%</span> recovery rate</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Exit Interviews</div>
              <div className="p-1.5 bg-slate-100 text-slate-600 rounded-md"><MessageSquare className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">05</div>
            <div className="text-[11px] font-semibold text-slate-500">Scheduled this week</div>
          </div>
        </div>

        {/* Pipeline */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 pt-5">
          <h3 className="text-sm font-bold text-slate-900 mb-8">Offboarding Workflow Pipeline</h3>
          <div className="flex items-center justify-between relative px-8">
            
            {/* Connecting Line */}
            <div className="absolute top-6 left-16 right-16 h-1 bg-slate-200 rounded-full z-0">
              <div className="w-[45%] h-full bg-slate-900 rounded-full"></div>
            </div>

            {/* Steps */}
            <div className="flex flex-col items-center gap-2 relative z-10 w-24">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center border-4 border-white shadow-sm">
                <Check className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 text-center leading-tight">Resignation</div>
              <div className="text-[10px] font-medium text-slate-500">14 Active</div>
            </div>

            <div className="flex flex-col items-center gap-2 relative z-10 w-24">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center border-4 border-white shadow-sm">
                <Check className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 text-center leading-tight">Approval</div>
              <div className="text-[10px] font-medium text-slate-500">08 Pending</div>
            </div>

            <div className="flex flex-col items-center gap-2 relative z-10 w-24">
              <div className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center border-4 border-white shadow-[0_0_0_2px_#2563EB] relative">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 text-center leading-tight mt-1">KT Session</div>
              <div className="text-[10px] font-medium text-slate-900">06 In Progress</div>
            </div>

            <div className="flex flex-col items-center gap-2 relative z-10 w-24">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white shadow-sm">
                <Archive className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-500 text-center leading-tight">Asset Return</div>
              <div className="text-[10px] font-medium text-slate-400">03 Ready</div>
            </div>

            <div className="flex flex-col items-center gap-2 relative z-10 w-24">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-500 text-center leading-tight">Settlement</div>
              <div className="text-[10px] font-medium text-slate-400">02 Pending</div>
            </div>

            <div className="flex flex-col items-center gap-2 relative z-10 w-24 opacity-50">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-400 text-center leading-tight">Completed</div>
              <div className="text-[10px] font-medium text-slate-400">--</div>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Span 1) */}
          <div className="space-y-6">
            
            {/* Risk Alerts */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-[0_4px_20px_-10px_rgba(37,99,235,0.1)] p-5 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-slate-900">Risk Alerts</h3>
                </div>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded">02 Urgent</span>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="border border-rose-100 rounded-lg p-3 bg-rose-50/30">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-slate-900">Pending Asset: MacBook Pro</h4>
                    <span className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">Overdue</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-600 mb-2">John Doe (Product Design)</p>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                    <Clock className="w-3.5 h-3.5" /> 2 days overdue
                  </div>
                </div>

                <div className="border border-amber-100 rounded-lg p-3 bg-amber-50/30">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-slate-900">Missed Task: KT Session</h4>
                    <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Pending</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-600 mb-2">Sarah Smith (Engineering)</p>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                    <Clock className="w-3.5 h-3.5" /> Scheduled: 10:00 AM Today
                  </div>
                </div>
              </div>

              <button className="w-full text-center text-xs font-bold text-slate-900 hover:text-slate-900 uppercase tracking-widest mt-auto">
                View All Alerts
              </button>
            </div>

            {/* Global Checklist Status */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6">Global Checklist Status</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                      <Monitor className="w-4 h-4 text-slate-700" /> IT Asset Recovery
                    </div>
                    <span className="text-xs font-bold text-slate-900">78%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-700 w-[78%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                      <FileText className="w-4 h-4 text-slate-700" /> Document Sign-off
                    </div>
                    <span className="text-xs font-bold text-orange-500">45%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 w-[45%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                      <Lock className="w-4 h-4 text-slate-700" /> Access Revocation
                    </div>
                    <span className="text-xs font-bold text-rose-500">12%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[12%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Span 2) */}
          <div className="lg:col-span-2">
            
            {/* Pending Exit Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full">
              <div className="p-5 border-b border-slate-200 flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pending Exit Table</h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Live view of employees in notice period</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 border border-slate-200 rounded hover:bg-slate-50 text-slate-600 transition-colors"><Filter className="w-4 h-4" /></button>
                  <button className="p-2 border border-slate-200 rounded hover:bg-slate-50 text-slate-600 transition-colors"><Download className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[25%]">Employee</th>
                      <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department</th>
                      <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Day</th>
                      <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13px] font-medium text-slate-700">
                    
                    <tr className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=John&backgroundColor=f1f5f9" className="w-8 h-8 rounded-full border border-slate-200" />
                          <div>
                            <div className="font-bold text-slate-900">John Doe</div>
                            <div className="text-[10px] text-slate-500 leading-tight">Sr. Product<br/>Designer</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">Design</td>
                      <td className="px-5 py-4">Oct<br/>24,<br/>2023</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider rounded">Voluntary</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> AT RISK
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="text-slate-900 hover:bg-slate-100 p-1.5 rounded transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=f1f5f9" className="w-8 h-8 rounded-full border border-slate-200" />
                          <div>
                            <div className="font-bold text-slate-900">Sarah Smith</div>
                            <div className="text-[10px] text-slate-500 leading-tight">Lead<br/>Engineer</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">Engineering</td>
                      <td className="px-5 py-4">Oct<br/>30,<br/>2023</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider rounded">Voluntary</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-900 uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div> IN PROGRESS
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="text-slate-900 hover:bg-slate-100 p-1.5 rounded transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-[10px] font-bold border border-orange-200">MK</div>
                          <div>
                            <div className="font-bold text-slate-900">Michael Klein</div>
                            <div className="text-[10px] text-slate-500 leading-tight">Legal<br/>Counsel</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">Legal</td>
                      <td className="px-5 py-4">Nov<br/>02,<br/>2023</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 bg-orange-50 text-orange-700 text-[9px] font-bold uppercase tracking-wider rounded border border-orange-100">Involuntary</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-900 uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div> IN PROGRESS
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="text-slate-900 hover:bg-slate-100 p-1.5 rounded transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=David&backgroundColor=f1f5f9" className="w-8 h-8 rounded-full border border-slate-200" />
                          <div>
                            <div className="font-bold text-slate-900">David Chen</div>
                            <div className="text-[10px] text-slate-500 leading-tight">Marketing<br/>Lead</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">Marketing</td>
                      <td className="px-5 py-4">Oct<br/>15,<br/>2023</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider rounded">Voluntary</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> COMPLETED
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="text-slate-900 hover:bg-slate-100 p-1.5 rounded transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500 mt-auto bg-slate-50/50">
                <span>Showing 1-4 of 14 records</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 border border-slate-200 rounded hover:bg-white transition-colors">Previous</button>
                  <button className="px-3 py-1.5 border border-slate-200 rounded hover:bg-white transition-colors text-slate-900">Next</button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
