"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft, Search, Bell, CheckCircle2, Circle, Clock, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

// ─── Mock Data (to be replaced by API) ──────────────────────────────────────────
const mockData = {
  id: "EMP-0087",
  name: "Ravi Kumar",
  department: "Engineering",
  designation: "Software Engineer",
  reportingManager: "Anita Menon",
  workLocation: "Hyderabad office",
  probationEnds: "9 Jul 2025",
  startedDate: "10 Jan 2025",
  avatarInitials: "RK",
  progress: {
    completed: 9,
    total: 15,
    percentage: 60,
  },
  checklists: {
    accountSetup: [
      { id: 1, label: "Create employee record", status: "completed" },
      { id: 2, label: "Assign employee ID (EMP-0087)", status: "completed" },
      { id: 3, label: "Create official email", status: "completed" },
      { id: 4, label: "Add to payroll system", status: "locked", lockedReason: "PHASE 2 LOCKED" },
    ],
    accessProvisioning: [
      { id: 5, label: "Office access card issued", status: "completed" },
      { id: 6, label: "GitHub access", status: "pending_it", text: "Pending IT" },
      { id: 7, label: "AWS access", status: "pending_it", text: "Pending IT" },
      { id: 8, label: "Slack workspace added", status: "completed" },
    ],
    assets: [
      { id: 9, label: "Laptop assigned (MacBook Air)", status: "completed" },
      { id: 10, label: "Mobile device assigned", status: "pending", text: "Pending" },
    ]
  },
  activities: [
    { id: 1, title: "Slack workspace added", time: "Yesterday, 4:30 PM", status: "completed" },
    { id: 2, title: "NDA signed by Ravi Kumar", time: "Yesterday, 2:15 PM", status: "completed" },
    { id: 3, title: "Laptop assigned", time: "13 Jan, 11:00 AM", status: "completed" },
    { id: 4, title: "Office access card issued", time: "13 Jan, 10:30 AM", status: "completed" },
    { id: 5, title: "Official email created", time: "10 Jan, 9:00 AM", status: "grey" },
  ]
};

export default function OnboardingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
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

  const data = mockData; // Replace with API query based on params.id

  const renderChecklistItem = (item: any) => {
    let icon = <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />;
    let textNode = null;
    let textClass = "text-[13px] font-medium text-slate-700";

    if (item.status === "completed") {
      icon = <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    } else if (item.status === "locked") {
      textClass = "text-[13px] font-medium text-slate-400";
      textNode = (
        <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-wider rounded">
          PENDING — {item.lockedReason}
        </span>
      );
    } else if (item.status === "pending_it") {
      textNode = <span className="ml-auto text-[11px] font-semibold text-rose-500">{item.text}</span>;
    } else if (item.status === "pending") {
      textNode = <span className="ml-auto text-[11px] font-semibold text-slate-400">{item.text}</span>;
    }

    return (
      <div key={item.id} className="flex items-center gap-3 py-2.5">
        {icon}
        <span className={textClass}>{item.label}</span>
        {textNode}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-slate-600">
          <Link href="/onboarding" className="hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold text-slate-900">
            <Link href="/onboarding" className="text-slate-500 hover:text-slate-900">Onboarding</Link> — {data.name}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <button className="hover:text-slate-900"><Search className="w-5 h-5" /></button>
          <button className="hover:text-slate-900"><Bell className="w-5 h-5" /></button>
          <div className="w-px h-6 bg-slate-200 mx-2"></div>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">TK</div>
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold">
                {data.avatarInitials}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{data.name}</h1>
                <div className="text-xs font-medium text-slate-500 mt-1 flex flex-wrap gap-x-2 gap-y-1 items-center">
                  <span>{data.designation}</span>
                  <span className="text-slate-300">•</span>
                  <span>{data.department}</span>
                  <span className="text-slate-300">•</span>
                  <span>Started {data.startedDate}</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{data.id}</div>
              </div>
            </div>
            <button className="px-5 py-2 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              View profile
            </button>
          </div>
          
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-slate-900">Profile Completion</span>
            <span className="text-xs font-semibold text-slate-500">{data.progress.percentage}% complete — {data.progress.completed} of {data.progress.total} tasks done</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${data.progress.percentage}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Checklists) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-8">
            
            {/* Account Setup */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center text-slate-500 text-[10px]">
                  <Check className="w-3 h-3" />
                </div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Account Setup</h3>
              </div>
              <div className="border-t border-slate-100 mb-2"></div>
              <div className="space-y-1">
                {data.checklists.accountSetup.map(renderChecklistItem)}
              </div>
            </div>

            {/* Access Provisioning */}
            <div className="mb-8 mt-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center text-slate-500 text-[10px]">
                  <Check className="w-3 h-3" />
                </div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Access Provisioning</h3>
              </div>
              <div className="border-t border-slate-100 mb-2"></div>
              <div className="space-y-1">
                {data.checklists.accessProvisioning.map(renderChecklistItem)}
              </div>
            </div>

            {/* Assets */}
            <div className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 flex items-center justify-center text-slate-500">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Assets</h3>
              </div>
              <div className="border-t border-slate-100 mb-2"></div>
              <div className="space-y-1">
                {data.checklists.assets.map(renderChecklistItem)}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Employee Details */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6">Employee details</h3>
              <div className="space-y-5">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department</div>
                  <div className="text-[13px] font-semibold text-slate-900">{data.department}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Designation</div>
                  <div className="text-[13px] font-semibold text-slate-900">{data.designation}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reporting Manager</div>
                  <div className="text-[13px] font-semibold text-slate-900">{data.reportingManager}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Work Location</div>
                  <div className="text-[13px] font-semibold text-slate-900">{data.workLocation}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Probation Ends</div>
                  <div className="text-[13px] font-semibold text-slate-900">{data.probationEnds}</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6">Recent activity</h3>
              <div className="relative border-l border-slate-200 ml-2 space-y-6">
                {data.activities.map((act, idx) => (
                  <div key={act.id} className="relative pl-5">
                    <div 
                      className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full border-2 border-white ${
                        act.status === "completed" ? "bg-blue-600" : "bg-slate-400"
                      }`}
                    ></div>
                    <div className="text-[13px] font-medium text-slate-900">{act.title}</div>
                    <div className="text-[11px] font-medium text-slate-500 mt-0.5">{act.time}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
