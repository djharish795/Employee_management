"use client";

import React, { useState } from "react";
import { 
  Clock, Calendar, LogIn, LogOut, CheckCircle2, 
  ChevronRight, CalendarDays, Bell, Coffee
} from "lucide-react";
import Link from "next/link";

export default function EmployeeDashboardPanel() {
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState<string | null>(null);

  const handlePunch = () => {
    if (!isPunchedIn) {
      setPunchTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setIsPunchedIn(true);
    } else {
      setIsPunchedIn(false);
      setPunchTime(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Hours Worked */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Hours</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">4h 30m</h3>
            <p className="text-[10px] font-semibold text-emerald-600 mt-1">On track for 8 hours</p>
          </div>
        </div>

        {/* Leave Balance */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Balance</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">12 Days</h3>
            <p className="text-[10px] font-semibold text-slate-500 mt-1">8 Casual • 4 Sick</p>
          </div>
        </div>

        {/* Next Holiday */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Holiday</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">Dec 25</h3>
            <p className="text-[10px] font-semibold text-slate-500 mt-1">Christmas Day (in 9 days)</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column: Tasks & Actions ───────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Punch Widget */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-left w-full md:w-auto">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isPunchedIn ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isPunchedIn ? <CheckCircle2 className="w-8 h-8" /> : <Coffee className="w-8 h-8" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {isPunchedIn ? "You're checked in!" : "Good Morning!"}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">
                    {isPunchedIn ? `Punched in at ${punchTime}` : "Ready to start your day?"}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handlePunch}
                className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
                  isPunchedIn 
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isPunchedIn ? (
                  <><LogOut className="w-4 h-4" /> Clock Out</>
                ) : (
                  <><LogIn className="w-4 h-4" /> Clock In</>
                )}
              </button>
            </div>
          </div>

          {/* Pending Tasks / Empty State */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-[300px] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Pending Tasks</h3>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">0</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h4 className="text-base font-bold text-slate-900">You're all caught up!</h4>
              <p className="text-xs text-slate-500 max-w-[250px] mt-2">
                No pending compliance signatures or approvals required today.
              </p>
            </div>
          </div>
          
        </div>

        {/* ── Right Column: Announcements & Quick Links ────────────────── */}
        <div className="space-y-6">
          
          {/* Announcements */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Bell className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30">
                  Announcement
                </span>
              </div>
              <h3 className="text-lg font-bold leading-tight mb-2">Annual Townhall Meeting</h3>
              <p className="text-xs text-indigo-100/80 mb-6 line-clamp-2">
                Join us this Friday at 3:00 PM IST for our annual townhall. The CEO will discuss our Q4 roadmap and Phase 2 implementations.
              </p>
              <button className="text-xs font-bold text-white flex items-center gap-1 hover:text-indigo-200 transition-colors">
                Read full memo <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link href="/leaves" className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-between group">
                Apply for Leave 
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </Link>
              <Link href="/attendance" className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-between group">
                View Timesheet 
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </Link>
              <Link href="/compliance" className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-between group">
                Company Policies 
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
