"use client";

import React from 'react';
import { Search, Lock, Plus, ArrowLeft, Star } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export default function CTORecruitmentPage() {
  const role = useAuthStore((state) => state.role);

  // Protect route
  if (role !== "CTO") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <Lock className="w-10 h-10 text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      <div className="p-8 max-w-[1200px] mx-auto w-full space-y-8">
        
        {/* Phase 2 Lock Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
          <Lock className="w-5 h-5 text-orange-500" />
          <p className="text-sm font-bold text-orange-700">
            This feature unlocks with Phase 2. Preview shown with sample data.
          </p>
        </div>

        {/* Open Positions Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">3 open engineering positions</h3>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
              <Plus className="w-4 h-4" /> Post new role
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Position 1 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative cursor-pointer hover:border-slate-300 hover:shadow transition-all">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold text-slate-900 max-w-[70%] leading-tight">Senior Backend Engineer</h3>
                <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[9px] font-bold uppercase tracking-widest rounded border border-orange-100">
                  URGENT
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mb-6 flex-wrap">
                <span>12 applicants</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>3 in interview</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-slate-900">1 offer sent</span>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-slate-600">RK</span>
                </div>
                <div className="text-[11px] font-medium text-slate-500">
                  Hiring manager: <span className="font-bold text-slate-700">Ravi Kumar</span>
                </div>
              </div>
            </div>

            {/* Position 2 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative cursor-pointer hover:border-slate-300 hover:shadow transition-all">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold text-slate-900 max-w-[70%] leading-tight">DevOps Engineer</h3>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-widest rounded border border-slate-200">
                  ACTIVE
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mb-6 flex-wrap">
                <span>15 applicants</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>4 in interview</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>0 offers</span>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 overflow-hidden flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold">SA</span>
                </div>
                <div className="text-[11px] font-medium text-slate-500">
                  Hiring manager: <span className="font-bold text-slate-700">Suresh A.</span>
                </div>
              </div>
            </div>

            {/* Position 3 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative cursor-pointer hover:border-slate-300 hover:shadow transition-all">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold text-slate-900 max-w-[70%] leading-tight">Mobile Engineer</h3>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-widest rounded border border-slate-200">
                  ACTIVE
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mb-6 flex-wrap">
                <span>6 applicants</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>1 in interview</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>0 offers</span>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 overflow-hidden flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold">NV</span>
                </div>
                <div className="text-[11px] font-medium text-slate-500">
                  Hiring manager: <span className="font-bold text-slate-700">Nikhil V.</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Pipeline Section */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mt-8">
          <div className="p-6 border-b border-slate-200 flex items-center gap-4">
            <button className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-lg font-bold text-slate-900">Senior Backend Engineer - Pipeline</h2>
          </div>
          
          <div className="p-6 overflow-x-auto">
            <div className="flex gap-6 min-w-max">
              {/* Applied Column */}
              <div className="w-[300px] shrink-0 bg-slate-50/50 rounded-lg border border-slate-100 p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">APPLIED (3)</h4>
                
                {/* Candidate Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm relative">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0">
                      AM
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Ankit Mishra</div>
                      <div className="text-[11px] font-medium text-slate-500">5 yrs exp</div>
                    </div>
                  </div>
                  <div className="mt-4 flex">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
