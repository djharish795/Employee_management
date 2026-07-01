"use client";

import React from "react";
import { Download, MoreVertical, Check, X as CloseIcon, Lock } from "lucide-react";

export default function HrDashboardPage() {
  // Mock Date
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">HR Overview</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Today is {dateString}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-semibold rounded-md shadow-sm transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Total Headcount */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">TOTAL HEADCOUNT</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-slate-900">87</span>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-md">+2</span>
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">PRESENT TODAY</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600">74</span>
            <span className="text-emerald-500 text-xs font-bold">85% Rate</span>
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">ON LEAVE</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-500">8</span>
            <span className="text-slate-400 text-xs font-semibold">Planned</span>
          </div>
        </div>

        {/* Open Positions */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">OPEN POSITIONS</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-slate-500">5</span>
            <Lock className="w-4 h-4 text-slate-300" />
          </div>
        </div>

        {/* New Joins */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">NEW JOINS</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-600">3</span>
            <span className="text-slate-400 text-xs font-semibold">This Month</span>
          </div>
        </div>
      </div>

      {/* Middle Row Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Attendance snapshot */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800">Attendance snapshot</h3>
            <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* SVG Donut Chart */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                {/* Absent (17%) */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 17) / 100} className="transition-all duration-1000 ease-in-out" />
                {/* WFH (9%) */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563eb" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 9) / 100} strokeDasharray="251.2" style={{ strokeDashoffset: 251.2 - (251.2 * 9) / 100, strokeDasharray: "251.2 251.2", transformOrigin: "center", transform: `rotate(${(17/100) * 360}deg)` }} className="transition-all duration-1000 ease-in-out" />
                {/* Present (74%) */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#16a34a" strokeWidth="12" strokeDasharray="251.2" style={{ strokeDashoffset: 251.2 - (251.2 * 74) / 100, strokeDasharray: "251.2 251.2", transformOrigin: "center", transform: `rotate(${((17+9)/100) * 360}deg)` }} className="transition-all duration-1000 ease-in-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-900">87</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">TOTAL</span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-green-600"></div>
                  <span className="text-slate-600 font-medium">Present (74%)</span>
                </div>
                <span className="font-bold text-slate-900">64</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-blue-600"></div>
                  <span className="text-slate-600 font-medium">WFH (9%)</span>
                </div>
                <span className="font-bold text-slate-900">8</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-slate-200"></div>
                  <span className="text-slate-500 font-medium">Absent (17%)</span>
                </div>
                <span className="font-bold text-red-600">15</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leave requests pending */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800">Leave requests pending</h3>
            <span className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-700">View all</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded">4</span>
          </div>
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
            {/* Request 1 */}
            <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-9 h-9 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">PS</div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">Priya Sharma</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">Sick Leave • 2 days</p>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <button className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 bg-white shadow-sm">
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 shadow-sm">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Request 2 */}
            <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-9 h-9 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">AM</div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">Anita Menon</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">Casual • 1 day</p>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <button className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 bg-white shadow-sm">
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 shadow-sm">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Request 3 */}
            <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-9 h-9 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs shrink-0">RK</div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">Ravi Kumar</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">Annual • 5 days</p>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <button className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 bg-white shadow-sm">
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 shadow-sm">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Request 4 */}
            <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-9 h-9 rounded-md bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">SK</div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">Suresh Kumar</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">Sick Leave • 1 day</p>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <button className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 bg-white shadow-sm">
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
                <button className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 shadow-sm">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* New joiner checklist */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800">New joiner checklist</h3>
          </div>
          <div className="flex-1 flex flex-col gap-6">
            {/* Item 1 */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-900">Ravi Kumar</span>
                <span className="text-slate-500 font-semibold">60%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-800 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 italic">Pending: IT Asset Allocation</p>
            </div>
            {/* Item 2 */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-900">Neha Patel</span>
                <span className="text-slate-500 font-semibold">40%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 italic">Pending: Bank Account Verification</p>
            </div>
            {/* Item 3 */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-900">Arjun Thomas</span>
                <span className="text-slate-500 font-semibold">20%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-800 rounded-full" style={{ width: '20%' }}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 italic">Pending: ID Card Printing</p>
            </div>
          </div>
          <button className="w-full py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-md mt-6 shadow-sm transition-colors">
            Manage Pipeline
          </button>
        </div>

      </div>

      {/* Bottom Row Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent activity */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6">Recent activity</h3>
          <div className="relative border-l border-slate-200 ml-3 space-y-8 pb-4">
            {/* Activity 1 */}
            <div className="relative pl-6">
              <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-green-600 ring-4 ring-white"></div>
              <p className="text-sm font-bold text-slate-800">Anita Menon's leave request was approved by Sarah J.</p>
              <p className="text-xs font-medium text-slate-400 mt-1">2 hours ago</p>
            </div>
            {/* Activity 2 */}
            <div className="relative pl-6">
              <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-slate-900 ring-4 ring-white"></div>
              <p className="text-sm font-bold text-slate-800">New document "FY24 Policy Update" uploaded to Knowledge Base.</p>
              <p className="text-xs font-medium text-slate-400 mt-1">4 hours ago</p>
            </div>
            {/* Activity 3 */}
            <div className="relative pl-6">
              <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white"></div>
              <p className="text-sm font-bold text-slate-800">Ravi Kumar completed "Workplace Safety" onboarding module.</p>
              <p className="text-xs font-medium text-slate-400 mt-1">Yesterday</p>
            </div>
            {/* Activity 4 */}
            <div className="relative pl-6">
              <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-red-600 ring-4 ring-white"></div>
              <p className="text-sm font-bold text-slate-800">Compliance Alert: 3 employees have expired certification.</p>
              <p className="text-xs font-medium text-slate-400 mt-1">Yesterday</p>
            </div>
            {/* Activity 5 */}
            <div className="relative pl-6">
              <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-slate-400 ring-4 ring-white"></div>
              <p className="text-sm font-bold text-slate-800">Meeting scheduled: Weekly HR Sync with Directors.</p>
              <p className="text-xs font-medium text-slate-400 mt-1">2 days ago</p>
            </div>
          </div>
        </div>

        {/* Upcoming events */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6">Upcoming events</h3>
          <div className="space-y-4">
            {/* Event 1 */}
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 w-14 flex flex-col items-center justify-center shrink-0 border-r border-slate-200 p-2">
                <span className="text-[10px] font-bold text-blue-800 uppercase leading-none">OCT</span>
                <span className="text-lg font-extrabold text-blue-900 leading-tight mt-1">24</span>
              </div>
              <div className="p-3 bg-white flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">Priya's Birthday</p>
                <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5">Design Team • Office Celebration</p>
              </div>
            </div>
            {/* Event 2 */}
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-100 w-14 flex flex-col items-center justify-center shrink-0 border-r border-slate-200 p-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase leading-none">OCT</span>
                <span className="text-lg font-extrabold text-slate-700 leading-tight mt-1">27</span>
              </div>
              <div className="p-3 bg-white flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">Ravi's 1st Anniversary</p>
                <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5">Software Engineer • Work Anniversary</p>
              </div>
            </div>
            {/* Event 3 */}
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-orange-50 w-14 flex flex-col items-center justify-center shrink-0 border-r border-slate-200 p-2">
                <span className="text-[10px] font-bold text-orange-800 uppercase leading-none">NOV</span>
                <span className="text-lg font-extrabold text-orange-900 leading-tight mt-1">01</span>
              </div>
              <div className="p-3 bg-white flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">Leave Balance Reset</p>
                <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5">Annual Update • Global System</p>
              </div>
            </div>
            {/* Event 4 */}
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-100 w-14 flex flex-col items-center justify-center shrink-0 border-r border-slate-200 p-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase leading-none">NOV</span>
                <span className="text-lg font-extrabold text-slate-700 leading-tight mt-1">05</span>
              </div>
              <div className="p-3 bg-white flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">Probation Ends</p>
                <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5">Arjun Thomas • Performance Review</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
