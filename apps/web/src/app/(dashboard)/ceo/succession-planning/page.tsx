"use client";

import React from 'react';
import { Lock, MoreVertical, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export default function CEOSuccessionPlanningPage() {
  const role = useAuthStore((state) => state.role);

  // Protect route
  if (role !== "CEO") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <Lock className="w-10 h-10 text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm font-medium">Only the CEO can access Succession Planning.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      
      {/* Phase 2 Preview Banner */}
      <div className="bg-yellow-50 border-b border-yellow-100 p-3 flex justify-center items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-600" />
        <p className="text-sm font-bold text-yellow-700">
          This feature unlocks with Phase 2. Preview shown with sample data.
        </p>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Succession Overview</h1>
            <div className="flex items-center gap-4 mt-3">
              <span className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-full">
                8 critical positions tracked
              </span>
              <span className="text-xs font-medium text-slate-400">
                ⟳ Last updated: 14 Oct 2023
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
              Export PDF
            </button>
            <button className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
              Compare Roles
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Technology */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">TECHNOLOGY</h4>
                <h3 className="text-base font-bold text-slate-900">Chief Technology Officer</h3>
              </div>
              <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  LO
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Lokesh</div>
                  <div className="text-[11px] font-medium text-slate-500">Incumbent • 4 yrs tenure</div>
                </div>
              </div>
              <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded shadow-sm flex items-center gap-1.5">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
                STABLE
              </span>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">SUCCESSION PIPELINE</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">RK</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Ravi Kumar</div>
                      <div className="text-[10px] font-medium text-slate-500">VP Engineering</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-widest rounded border border-emerald-100">
                    READY NOW
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">VK</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Vikram K.</div>
                      <div className="text-[10px] font-medium text-slate-500">Cloud Architecture Lead</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-[9px] font-bold uppercase tracking-widest rounded border border-yellow-100">
                    READY IN 1 YEAR
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">SA</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Suresh A.</div>
                      <div className="text-[10px] font-medium text-slate-500">Senior Manager</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-widest rounded border border-slate-200">
                    DEVELOPING
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Product & Engineering */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">PRODUCT & ENGINEERING</h4>
                <h3 className="text-base font-bold text-slate-900">Head of Engineering</h3>
              </div>
              <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
                  RK
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Ravi Kumar</div>
                  <div className="text-[11px] font-medium text-slate-500">Incumbent • 2 yrs tenure</div>
                </div>
              </div>
              <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[9px] font-bold uppercase tracking-widest rounded border border-orange-100 flex items-center gap-1.5">
                ! POTENTIAL PROMOTION
              </span>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">SUCCESSION PIPELINE (2 SUCCESSORS)</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50/50 border border-yellow-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">JD</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Janani D.</div>
                      <div className="text-[10px] font-medium text-slate-500">Backend Team Lead</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-[9px] font-bold uppercase tracking-widest rounded border border-yellow-200">
                    READY IN 1 YEAR
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">ML</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">M. Lakshman</div>
                      <div className="text-[10px] font-medium text-slate-500">DevOps Manager</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-widest rounded border border-slate-200">
                    DEVELOPING
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Human Resources */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">HUMAN RESOURCES</h4>
                <h3 className="text-base font-bold text-slate-900">Head of HR</h3>
              </div>
              <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold shrink-0">
                  TK
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Tejesh Kumar</div>
                  <div className="text-[11px] font-medium text-slate-500">Incumbent • 3 yrs tenure</div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">SUCCESSION PIPELINE</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">SM</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Sanya Mirza</div>
                      <div className="text-[10px] font-medium text-slate-500">HR Operations Manager</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-widest rounded border border-slate-200">
                    DEVELOPING
                  </span>
                </div>

                <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-rose-700 leading-snug">
                    Skill gap: Financial forecasting. Candidate requires specialized training module completion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Commercial */}
          <div className="bg-white border border-rose-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
            {/* Subtle red indicator border effect */}
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">COMMERCIAL</h4>
                <h3 className="text-base font-bold text-slate-900">Sales Director</h3>
              </div>
              <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold shrink-0">
                  RP
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Ramesh P.</div>
                  <div className="text-[11px] font-medium text-slate-500">Incumbent • 5 yrs tenure</div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <div className="border border-dashed border-rose-300 bg-rose-50/50 rounded-lg p-6 flex flex-col items-center justify-center text-center mb-4">
                <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[9px] font-bold uppercase tracking-widest rounded mb-3">
                  NO SUCCESSION PLAN IDENTIFIED
                </span>
                <p className="text-xs font-medium text-slate-500">
                  Critical risk: No ready or developing successors currently logged for this position.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-bold italic text-slate-700 mb-3 leading-relaxed">
                  "Recommend identifying 1-2 candidates from the regional sales management tier for leadership track training."
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                    ?
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">ADDED BY CEO</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
