"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, CheckCircle2, Clock, CalendarX, ChevronDown } from "lucide-react";

export default function TeamAttendancePage() {
  const [selectedDate, setSelectedDate] = useState("15 January 2025");

  const mockTeamMembers = [
    { id: '1', name: 'Pooja J.', initials: 'PJ', status: 'Present', checkIn: '9:10 AM', checkOut: '-', hours: '5h 20m so far' },
    { id: '2', name: 'Karthik R.', initials: 'KR', status: 'Present', checkIn: '9:25 AM', checkOut: '-', hours: '5h 05m so far' },
    { id: '3', name: 'Divya N.', initials: 'DN', status: 'Late', checkIn: '10:45 AM', checkOut: '-', hours: '3h 45m so far' },
    { id: '4', name: 'Sameer K.', initials: 'SK', status: 'On leave', checkIn: '-', checkOut: '-', hours: '-' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">Present</span>;
      case 'Late':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100">Late</span>;
      case 'On leave':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-100">On leave</span>;
      default:
        return null;
    }
  };

  // Generate a mock array of 31 days for the heatmap
  // Pooja: mostly green, one orange
  const mockMonthlyData = Array.from({ length: 31 }, (_, i) => {
    if (i === 4) return 'LATE';
    return 'PRESENT';
  });

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-screen flex flex-col font-sans overflow-x-hidden">
      {/* Top Header - Matches other pages slightly or we can just make it part of main */}
      
      {/* Main Content Area */}
      <main className="p-8 max-w-5xl mx-auto w-full space-y-6 mt-4">
        
        {/* Date & Direct Reports Header */}
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            {selectedDate}
            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          </button>
          
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-slate-600">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            4 direct reports
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex justify-between items-start">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">PRESENT</div>
              <div className="text-4xl font-extrabold text-slate-900">3</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex justify-between items-start">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">LATE</div>
              <div className="text-4xl font-extrabold text-slate-900">1</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex justify-between items-start">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">ON LEAVE</div>
              <div className="text-4xl font-extrabold text-slate-900">1</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
              <CalendarX className="w-6 h-6 text-rose-400" />
            </div>
          </div>
        </div>

        {/* Real-time Status Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900">Real-time Status</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">MEMBER</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4">CHECK-IN</th>
                  <th className="px-6 py-4">CHECK-OUT</th>
                  <th className="px-6 py-4">HOURS TODAY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockTeamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {member.initials}
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(member.status)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">
                      {member.checkIn}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">
                      {member.checkOut}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {member.hours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Attendance Chart */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-base font-extrabold text-slate-900">Monthly Attendance - January 2025</h2>
            
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div> Present
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Late
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-600"></div> Leave
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-24 flex-shrink-0 pt-2">
              <span className="text-xs font-bold text-slate-900">Pooja J.</span>
            </div>
            
            <div className="flex-1 flex flex-col gap-1.5">
              {/* As seen in the screenshot, it looks like a stacked series of horizontal bars. 
                  We will render 12 horizontal bars (weeks/days) just like the screenshot's visual.
                  The screenshot shows a giant stack of bars for one person. It's a bit odd for a UI, 
                  but we will mimic it using flex rows. */}
              
              {/* Block 1 - mostly green */}
              <div className="w-full h-4 bg-emerald-600/90 rounded-sm shadow-sm border border-emerald-700/20"></div>
              <div className="w-full h-4 bg-emerald-600/90 rounded-sm shadow-sm border border-emerald-700/20"></div>
              <div className="w-full h-4 bg-emerald-600/90 rounded-sm shadow-sm border border-emerald-700/20"></div>
              <div className="w-full h-4 bg-emerald-600/90 rounded-sm shadow-sm border border-emerald-700/20"></div>
              <div className="w-full h-4 bg-emerald-600/90 rounded-sm shadow-sm border border-emerald-700/20"></div>
              <div className="w-full h-4 bg-emerald-600/90 rounded-sm shadow-sm border border-emerald-700/20"></div>
              <div className="w-full h-4 bg-emerald-600/90 rounded-sm shadow-sm border border-emerald-700/20"></div>
              <div className="w-full h-4 bg-emerald-600/90 rounded-sm shadow-sm border border-emerald-700/20"></div>
              
              {/* The Orange Bar */}
              <div className="w-full h-4 bg-amber-500/90 rounded-sm shadow-sm border border-amber-600/20 mt-1 mb-1"></div>
              
              {/* More Green Bars */}
              <div className="w-full h-4 bg-emerald-600/90 rounded-sm shadow-sm border border-emerald-700/20"></div>
              <div className="w-full h-4 bg-emerald-600/90 rounded-sm shadow-sm border border-emerald-700/20"></div>
              <div className="w-full h-4 bg-emerald-600/90 rounded-sm shadow-sm border border-emerald-700/20"></div>
              <div className="w-full h-4 bg-emerald-600/90 rounded-sm shadow-sm border border-emerald-700/20"></div>
              <div className="w-full h-4 bg-emerald-600/90 rounded-sm shadow-sm border border-emerald-700/20"></div>
              
              {/* The thick outlined green bar at the bottom */}
              <div className="w-full h-5 bg-emerald-600/90 rounded-sm shadow-sm border-2 border-slate-700 mt-1"></div>
              
              <div className="w-full h-4 bg-emerald-600/90 rounded-sm shadow-sm border border-emerald-700/20 mt-2"></div>
              <div className="w-full h-4 bg-emerald-600/90 rounded-sm shadow-sm border border-emerald-700/20"></div>
              <div className="w-full h-4 bg-emerald-600/90 rounded-sm shadow-sm border border-emerald-700/20"></div>

            </div>
          </div>
          
        </div>

      </main>
    </div>
  );
}
