"use client";

import React from 'react';
import { Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function LeavesPage() {
  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      <div className="p-8 max-w-[1200px] w-full mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Management</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Overview of your leave balances and team status.</p>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Casual leave</div>
              <div className="text-2xl font-bold text-slate-900 mb-1">8 days</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 mb-2">4 used · 0 lapsed</div>
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 w-1/3"></div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sick leave</div>
              <div className="text-2xl font-bold text-slate-900 mb-1">6 days</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 mb-2">2 used</div>
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 w-1/4"></div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Earned leave</div>
              <div className="text-2xl font-bold text-slate-900 mb-1">12 days</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 mb-2">5 used</div>
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 w-[40%]"></div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Compensatory</div>
              <div className="text-2xl font-bold text-slate-900 mb-1">2 days</div>
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                pending approval
              </span>
            </div>
          </div>

        </div>

        {/* Middle Section: Leave History & Team on Leave */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: My Leave History */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">My leave history</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                <Plus className="w-3.5 h-3.5" /> Apply for leave
              </button>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-[20%]">Type</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">From</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">To</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Days</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                    <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applied On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {/* Row 1 */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-700">Casual<br/>Leave</td>
                    <td className="px-5 py-3 text-slate-600">Jan<br/>05</td>
                    <td className="px-5 py-3 text-slate-600">Jan<br/>06</td>
                    <td className="px-5 py-3 text-center text-slate-900 font-bold">2</td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-bold">Approved</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">Dec<br/>28</td>
                  </tr>
                  {/* Row 2 */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-700">Sick<br/>Leave</td>
                    <td className="px-5 py-3 text-slate-600">Feb<br/>12</td>
                    <td className="px-5 py-3 text-slate-600">Feb<br/>12</td>
                    <td className="px-5 py-3 text-center text-slate-900 font-bold">1</td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-bold">Approved</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">Feb 11</td>
                  </tr>
                  {/* Row 3 */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-700">Earned<br/>Leave</td>
                    <td className="px-5 py-3 text-slate-600">Mar<br/>20</td>
                    <td className="px-5 py-3 text-slate-600">Mar<br/>22</td>
                    <td className="px-5 py-3 text-center text-slate-900 font-bold">3</td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-2 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded text-[10px] font-bold">Pending</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">Mar 15</td>
                  </tr>
                  {/* Row 4 */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-700">Casual<br/>Leave</td>
                    <td className="px-5 py-3 text-slate-600">Apr<br/>02</td>
                    <td className="px-5 py-3 text-slate-600">Apr<br/>02</td>
                    <td className="px-5 py-3 text-center text-slate-900 font-bold">1</td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[10px] font-bold">Rejected</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">Mar<br/>28</td>
                  </tr>
                  {/* Row 5 */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-700">Sick<br/>Leave</td>
                    <td className="px-5 py-3 text-slate-600">May<br/>10</td>
                    <td className="px-5 py-3 text-slate-600">May<br/>10</td>
                    <td className="px-5 py-3 text-center text-slate-900 font-bold">1</td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-bold">Cancelled</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">May<br/>09</td>
                  </tr>
                  {/* Row 6 */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-700">Casual<br/>Leave</td>
                    <td className="px-5 py-3 text-slate-600">Jun<br/>15</td>
                    <td className="px-5 py-3 text-slate-600">Jan<br/>16</td>
                    <td className="px-5 py-3 text-center text-slate-900 font-bold">2</td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-bold">Approved</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">Jun 10</td>
                  </tr>
                  {/* Row 7 */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-700">Earned<br/>Leave</td>
                    <td className="px-5 py-3 text-slate-600">Jul<br/>20</td>
                    <td className="px-5 py-3 text-slate-600">Jul<br/>25</td>
                    <td className="px-5 py-3 text-center text-slate-900 font-bold">5</td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-bold">Approved</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">Jun 30</td>
                  </tr>
                  {/* Row 8 */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-700">Casual<br/>Leave</td>
                    <td className="px-5 py-3 text-slate-600">Aug<br/>12</td>
                    <td className="px-5 py-3 text-slate-600">Aug<br/>12</td>
                    <td className="px-5 py-3 text-center text-slate-900 font-bold">1</td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-bold">Approved</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">Aug 10</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Team on Leave Today */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Team on leave today</h3>
            </div>
            <div className="flex-1 p-5 space-y-6">
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  AS
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Ameera Singh</h4>
                  <p className="text-xs text-slate-500 font-medium">Sick leave - returns Jan 16</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  RK
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Rahul Kumar</h4>
                  <p className="text-xs text-slate-500 font-medium">Casual leave - returns Jan 16</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  MP
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Maya Patel</h4>
                  <p className="text-xs text-slate-500 font-medium">Earned leave - returns Jan 20</p>
                </div>
              </div>

            </div>
            <div className="p-4 border-t border-slate-100 text-xs text-slate-400 font-semibold bg-slate-50/50 rounded-b-xl">
              Showing 3 of 12 team members.
            </div>
          </div>

        </div>

        {/* Bottom Section: Leave Calendar */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Leave calendar - January 2025</h3>
            <div className="flex gap-2 text-slate-500">
              <button className="p-1 hover:bg-slate-100 rounded transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1 hover:bg-slate-100 rounded transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="p-5">
            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 border-t border-l border-slate-200 bg-slate-50 rounded-t-lg">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, idx) => (
                <div key={day} className={`p-3 text-[10px] font-bold text-slate-500 text-center border-b border-r border-slate-200 ${idx === 0 ? 'rounded-tl-lg' : ''} ${idx === 6 ? 'rounded-tr-lg' : ''}`}>
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar Grid Body */}
            <div className="grid grid-cols-7 border-l border-slate-200 bg-white">
              
              {/* Row 1 */}
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-semibold text-slate-400">30</div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-semibold text-slate-400">31</div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700">1</div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700">2</div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700">3</div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700 bg-slate-50">4</div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700 bg-slate-50">5</div>

              {/* Row 2 */}
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700 relative">
                6
                <div className="absolute top-8 left-2 right-2 bg-[#2563EB] text-white text-[10px] font-bold px-1.5 py-0.5 rounded truncate">You (casual)</div>
              </div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700 relative">
                7
                <div className="absolute top-8 left-2 right-2 bg-[#2563EB] text-white text-[10px] font-bold px-1.5 py-0.5 rounded truncate">You (casual)</div>
              </div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700">8</div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700">9</div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700">10</div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700 bg-slate-50">11</div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700 bg-slate-50">12</div>

              {/* Row 3 */}
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700 relative">
                13
                <div className="absolute top-8 left-2 right-2 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded truncate z-10">Team: Rahul, Ameera</div>
              </div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700 relative">
                14
                <div className="absolute top-8 left-0 right-0 h-5 bg-slate-100 border-y border-slate-200 -mx-[1px] z-0"></div>
              </div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700 relative">
                15
                <div className="absolute top-8 left-0 right-2 h-5 bg-slate-100 border border-r-0 border-slate-200 -mx-[1px] rounded-r z-0"></div>
              </div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700">16</div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700">17</div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700 bg-slate-50">18</div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700 bg-slate-50">19</div>

              {/* Row 4 */}
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700">20</div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700">21</div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700">22</div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700">23</div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700 relative">
                24
                <div className="absolute top-8 left-2 right-2 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded truncate z-10">Ameera, Maya</div>
              </div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 relative">
                25
                <div className="absolute top-8 left-0 right-0 h-5 bg-slate-100 border-y border-slate-200 -mx-[1px] z-0"></div>
              </div>
              <div className="h-24 p-2 border-b border-r border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 relative">
                26
                <div className="absolute top-8 left-0 right-2 h-5 bg-slate-100 border border-r-0 border-slate-200 -mx-[1px] rounded-r z-0"></div>
              </div>

            </div>
            
            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#2563EB] rounded-sm"></div>
                Your leaves
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-white border border-slate-300 rounded-sm"></div>
                Team leaves
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
