"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, FileText, RefreshCw, CheckCircle2, ChevronRight, Settings, Plus, Filter, SortDesc, Calendar, User, AlignLeft, Search, Bell, Monitor, BookOpen, MessageSquare, AlertCircle, Info } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export default function OnboardingPage() {
  const role = useAuthStore((state) => state.role);
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''});
  
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({show: false, message: ''}), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message: string) => {
    setToast({ show: true, message });
  };
  
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
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Employees / Onboarding</div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Onboarding</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Manage new joiners and track their integration lifecycle.</p>
          </div>
          <Link href="/onboarding/new" className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> New Onboarding
          </Link>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight w-20">Upcoming Joiners</div>
              <Users className="w-5 h-5 text-slate-700" />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-slate-900">24</div>
              <div className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full">+3 this week</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight w-20">Pending Documents</div>
              <FileText className="w-5 h-5 text-rose-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">12</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight w-20">In Progress</div>
              <RefreshCw className="w-5 h-5 text-slate-700" />
            </div>
            <div className="text-3xl font-bold text-slate-900">45</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight w-20">Completed (30D)</div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">18</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Onboarding Pipeline */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-8">Onboarding Pipeline</h3>
              <div className="flex items-center justify-between relative px-4">
                
                {/* Connecting Line */}
                <div className="absolute top-6 left-12 right-12 h-1 bg-slate-100 rounded-full z-0">
                  <div className="w-[60%] h-full bg-slate-200 rounded-full"></div>
                </div>

                {/* Steps */}
                <div className="flex flex-col items-center gap-2 relative z-10 w-20">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center border-4 border-white shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 text-center leading-tight">Offer Accepted</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">14</div>
                </div>

                <div className="flex flex-col items-center gap-2 relative z-10 w-20">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center border-4 border-white shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 text-center leading-tight">Documentation</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">08</div>
                </div>

                <div className="flex flex-col items-center gap-2 relative z-10 w-20">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white shadow-sm">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-500 text-center leading-tight">Asset Allocation</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">12</div>
                </div>

                <div className="flex flex-col items-center gap-2 relative z-10 w-20">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white shadow-sm">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-500 text-center leading-tight">Training</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">06</div>
                </div>

                <div className="flex flex-col items-center gap-2 relative z-10 w-20">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white shadow-sm">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-500 text-center leading-tight">Manager Intro</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">05</div>
                </div>

                <div className="flex flex-col items-center gap-2 relative z-10 w-20 opacity-50">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-400 text-center leading-tight">Completed</div>
                  <div className="text-sm font-bold text-slate-400 mt-1">--</div>
                </div>

              </div>
            </div>

            {/* Active Onboarding Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Active Onboarding <span className="text-slate-500 font-medium">(45 total)</span></h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => showToast("Filter functionality coming soon!")} className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600"><Filter className="w-4 h-4" /></button>
                  <button onClick={() => showToast("Sorting functionality coming soon!")} className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600"><SortDesc className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Card 1 */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Marcus&backgroundColor=f1f5f9" className="w-10 h-10 rounded-lg border border-slate-200" />
                      <div>
                        <div className="text-[13px] font-bold text-slate-900">Marcus Chen</div>
                        <div className="text-[11px] font-medium text-slate-500">Senior Product Designer</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-900 text-[9px] font-bold uppercase tracking-wider rounded border border-slate-200">Documentation</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] mb-5">
                    <div className="flex items-center gap-2 text-slate-600 font-medium"><AlignLeft className="w-3.5 h-3.5" /> Product Team</div>
                    <div className="flex items-center gap-2 text-slate-600 font-medium"><Calendar className="w-3.5 h-3.5" /> Oct 12, 2023</div>
                    <div className="flex items-center gap-2 text-slate-600 font-medium col-span-2"><User className="w-3.5 h-3.5" /> Sarah Jenkins</div>
                  </div>
                  <div className="mt-auto">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      <span>Checklist Progress</span>
                      <span className="text-slate-700">3/5 Steps</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-slate-900 w-[60%]"></div>
                    </div>
                    <button onClick={() => showToast("Employee details view coming soon!")} className="w-full text-right text-xs font-bold text-slate-900 hover:text-slate-900 flex justify-end items-center">
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Elena&backgroundColor=f1f5f9" className="w-10 h-10 rounded-lg border border-slate-200" />
                      <div>
                        <div className="text-[13px] font-bold text-slate-900">Elena Rodriguez</div>
                        <div className="text-[11px] font-medium text-slate-500">Full Stack Developer</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-[9px] font-bold uppercase tracking-wider rounded border border-orange-100">Training</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] mb-5">
                    <div className="flex items-center gap-2 text-slate-600 font-medium"><AlignLeft className="w-3.5 h-3.5" /> Engineering</div>
                    <div className="flex items-center gap-2 text-slate-600 font-medium"><Calendar className="w-3.5 h-3.5" /> Oct 15, 2023</div>
                    <div className="flex items-center gap-2 text-slate-600 font-medium col-span-2"><User className="w-3.5 h-3.5" /> Michael Ross</div>
                  </div>
                  <div className="mt-auto">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      <span>Checklist Progress</span>
                      <span className="text-slate-700">4/5 Steps</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-slate-900 w-[80%]"></div>
                    </div>
                    <button onClick={() => showToast("Employee details view coming soon!")} className="w-full text-right text-xs font-bold text-slate-900 hover:text-slate-900 flex justify-end items-center">
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Jordan&backgroundColor=f1f5f9" className="w-10 h-10 rounded-lg border border-slate-200" />
                      <div>
                        <div className="text-[13px] font-bold text-slate-900">Jordan Vance</div>
                        <div className="text-[11px] font-medium text-slate-500">Finance Analyst</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider rounded border border-slate-200 text-center leading-tight">Asset<br/>Allocation</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] mb-5">
                    <div className="flex items-center gap-2 text-slate-600 font-medium"><AlignLeft className="w-3.5 h-3.5" /> Operations</div>
                    <div className="flex items-center gap-2 text-slate-600 font-medium"><Calendar className="w-3.5 h-3.5" /> Oct 20, 2023</div>
                    <div className="flex items-center gap-2 text-slate-600 font-medium col-span-2"><User className="w-3.5 h-3.5" /> Anita Bhatia</div>
                  </div>
                  <div className="mt-auto">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      <span>Checklist Progress</span>
                      <span className="text-slate-700">2/5 Steps</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-slate-900 w-[40%]"></div>
                    </div>
                    <button onClick={() => showToast("Employee details view coming soon!")} className="w-full text-right text-xs font-bold text-slate-900 hover:text-slate-900 flex justify-end items-center">
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Sophie&backgroundColor=f1f5f9" className="w-10 h-10 rounded-lg border border-slate-200" />
                      <div>
                        <div className="text-[13px] font-bold text-slate-900">Sophie Taylor</div>
                        <div className="text-[11px] font-medium text-slate-500">Content Strategist</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-900 text-[9px] font-bold uppercase tracking-wider rounded border border-slate-200">Documentation</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] mb-5">
                    <div className="flex items-center gap-2 text-slate-600 font-medium"><AlignLeft className="w-3.5 h-3.5" /> Marketing</div>
                    <div className="flex items-center gap-2 text-slate-600 font-medium"><Calendar className="w-3.5 h-3.5" /> Oct 22, 2023</div>
                    <div className="flex items-center gap-2 text-slate-600 font-medium col-span-2"><User className="w-3.5 h-3.5" /> Greg Miller</div>
                  </div>
                  <div className="mt-auto">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      <span>Checklist Progress</span>
                      <span className="text-slate-700">1/5 Steps</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-slate-900 w-[20%]"></div>
                    </div>
                    <button onClick={() => showToast("Employee details view coming soon!")} className="w-full text-right text-xs font-bold text-slate-900 hover:text-slate-900 flex justify-end items-center">
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Column (Span 1) */}
          <div className="space-y-6">
            
            {/* Pending HR Tasks */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-900">Pending HR Tasks</h3>
                <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">3</div>
              </div>
              <div className="space-y-4 mb-4">
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 border-slate-300 rounded text-slate-900 focus:ring-slate-900" />
                  <div>
                    <div className="text-[13px] font-bold text-slate-900">Verify I-9 Documents</div>
                    <div className="text-[11px] font-medium text-slate-500">Sarah Jenkins • Due today</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 border-slate-300 rounded text-slate-900 focus:ring-slate-900" />
                  <div>
                    <div className="text-[13px] font-bold text-slate-900">Assign Work Laptop</div>
                    <div className="text-[11px] font-medium text-slate-500">Michael Ross • Due in 2 days</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 border-slate-300 rounded text-slate-900 focus:ring-slate-900" />
                  <div>
                    <div className="text-[13px] font-bold text-slate-900">Review Payroll Setup</div>
                    <div className="text-[11px] font-medium text-slate-500">Elena Rodriguez • Due in 3 days</div>
                  </div>
                </div>
              </div>
              <button onClick={() => showToast("Full task view coming soon!")} className="w-full text-center text-xs font-bold text-slate-900 hover:text-slate-900 uppercase tracking-wider pt-2 border-t border-slate-100">
                View All Tasks
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6">Recent Activity</h3>
              <div className="relative border-l border-slate-200 ml-2 space-y-6">
                
                <div className="relative pl-5">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  </div>
                  <p className="text-[13px] text-slate-700 leading-snug">
                    <span className="font-bold text-slate-900">Alex T.</span> signed the employment contract.
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">10 minutes ago</p>
                </div>

                <div className="relative pl-5">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center">
                    <Monitor className="w-2.5 h-2.5 text-slate-900" />
                  </div>
                  <p className="text-[13px] text-slate-700 leading-snug">
                    <span className="font-bold text-slate-900">IT Team</span> assigned MacBook Pro to <span className="font-bold text-slate-900">Jane D.</span>
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">2 hours ago</p>
                </div>

                <div className="relative pl-5">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center">
                    <BookOpen className="w-2.5 h-2.5 text-orange-600" />
                  </div>
                  <p className="text-[13px] text-slate-700 leading-snug">
                    <span className="font-bold text-slate-900">Marcus Chen</span> completed compliance training.
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">5 hours ago</p>
                </div>

                <div className="relative pl-5">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center">
                    <User className="w-2.5 h-2.5 text-slate-600" />
                  </div>
                  <p className="text-[13px] text-slate-700 leading-snug">
                    New onboarding started for <span className="font-bold text-slate-900">Sophie Taylor</span>.
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">Yesterday</p>
                </div>

              </div>
            </div>

            {/* Onboarding Health */}
            <div className="bg-slate-900 rounded-xl p-6 shadow-md text-white">
              <h3 className="text-sm font-bold text-blue-100 mb-2">Onboarding Health</h3>
              <p className="text-[13px] font-medium leading-relaxed mb-6">
                94% of new joiners are satisfied with their first week experience.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">JD</div>
                  <div className="w-8 h-8 rounded-full bg-blue-300 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-950">MK</div>
                  <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-950">ER</div>
                </div>
                <span className="text-[11px] font-bold text-blue-200">+12 more this month</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Custom Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 z-50">
          <Info className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
