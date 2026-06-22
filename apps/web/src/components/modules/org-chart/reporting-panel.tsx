"use client";

import React from "react";
import { GitFork, ArrowUp, UserCircle, Search, HelpCircle } from "lucide-react";
import { OrgRole } from "@/types/org-chart";

interface ReportingPanelProps {
  activeRole: OrgRole;
}

// Flat timeline representing the upward reporting chain for the current user
const UPWARD_CHAIN = [
  {
    id: "EMP-100",
    name: "Pradeep Chandra",
    designation: "Chief Executive Officer",
    avatarBg: "bg-indigo-100 text-indigo-600",
    initials: "PC",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Pradeep",
    isCurrentUser: false,
    level: 1
  },
  {
    id: "EMP-101",
    name: "Lokesh Kumar",
    designation: "Chief Technology Officer",
    avatarBg: "bg-slate-200 text-slate-900",
    initials: "LK",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Lokesh",
    isCurrentUser: false,
    level: 2
  },
  {
    id: "EMP-103",
    name: "Alex Thompson",
    designation: "VP of Engineering",
    avatarBg: "bg-emerald-100 text-emerald-600",
    initials: "AT",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex",
    isCurrentUser: false,
    level: 3
  },
  {
    id: "EMP-105",
    name: "Arjun Mehta",
    designation: "Staff Software Engineer",
    avatarBg: "bg-slate-200 text-slate-900",
    initials: "AM",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Arjun",
    isCurrentUser: true,
    level: 4
  }
];

// Direct reports (if the current user is a manager)
const DIRECT_REPORTS = [
  {
    id: "EMP-106",
    name: "Anita M.",
    designation: "Frontend Developer",
    avatarBg: "bg-pink-100 text-pink-600",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Anita"
  },
  {
    id: "EMP-107",
    name: "Ravi Kumar",
    designation: "DevOps Engineer",
    avatarBg: "bg-teal-100 text-teal-600",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Ravi"
  }
];

export default function ReportingPanel({ activeRole }: ReportingPanelProps) {
  // If activeRole is Admin/HR, they can search for anyone's chain.
  // If Employee/Manager, they see their own chain.
  const isPrivileged = activeRole === "ADMIN" || activeRole === "HR" || activeRole === "CEO";

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
      
      {/* ── Left Column: Search & Upward Chain ───────────────────────── */}
      <div className="flex-1 space-y-6">
        
        {isPrivileged ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Lookup Employee Chain</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                defaultValue="Arjun Mehta"
                className="w-full h-10 pl-9 pr-3 text-sm font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Reporting Structure</h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                View your chain of command for escalation and approvals.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upward Chain</h3>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              <ArrowUp className="w-3.5 h-3.5" /> Approvals Flow Up
            </div>
          </div>
          
          <div className="p-6">
            <div className="relative border-l-2 border-slate-200 ml-6 space-y-8 py-2">
              {UPWARD_CHAIN.map((emp, index) => (
                <div key={emp.id} className="relative pl-8">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[17px] top-4 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${emp.isCurrentUser ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                    <UserCircle className="w-4 h-4 text-white" />
                  </div>
                  
                  {/* Card */}
                  <div className={`p-4 rounded-xl border ${emp.isCurrentUser ? 'border-indigo-200 bg-indigo-50/30 shadow-sm' : 'border-slate-200 bg-white shadow-sm hover:border-indigo-200 transition-colors cursor-pointer'} flex items-center gap-4`}>
                    <div className={`w-12 h-12 rounded-full overflow-hidden border border-slate-200 ${emp.avatarBg} flex items-center justify-center flex-shrink-0 font-bold text-sm`}>
                      <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{emp.name}</h4>
                        {emp.isCurrentUser && <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Target</span>}
                      </div>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{emp.designation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Column: Direct Reports & Peers ─────────────────────── */}
      <div className="w-full lg:w-80 space-y-6">
        
        {/* Direct Reports (Only relevant if they are a manager/admin, or if Arjun has reports) */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Direct Reports</h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{DIRECT_REPORTS.length}</span>
          </div>
          <div className="p-5 space-y-4">
            {DIRECT_REPORTS.map((report) => (
              <div key={report.id} className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                  <img src={report.photoUrl} alt={report.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{report.name}</div>
                  <div className="text-[10px] font-medium text-slate-500 mt-0.5">{report.designation}</div>
                </div>
              </div>
            ))}
            
            <button className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors mt-2">
              View Entire Sub-tree
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            How routing works
          </h3>
          <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
            Leave requests and expense approvals follow the upward chain. If a manager is on leave, the request auto-escalates to the next level in the hierarchy after 48 hours.
          </p>
        </div>

      </div>

    </div>
  );
}
