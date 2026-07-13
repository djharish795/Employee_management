"use client";

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, 
  MoreVertical, Video, FileText, CheckCircle2, Clock, PlusCircle
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isSameDay, isToday } from 'date-fns';
import Image from "next/image";

export default function CamSchedulerPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2023, 8, 7)); // September 7, 2023 to match mockup
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const dateFormat = "d";
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Meeting Scheduler</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your client consultations and upcoming strategy sessions.</p>
        </div>
        
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button className="flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-slate-900 shadow-sm rounded-md text-sm font-semibold text-slate-900 dark:text-white">
            <CalendarIcon className="w-4 h-4" />
            Calendar
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md text-sm font-medium transition-colors">
            <List className="w-4 h-4" />
            List View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Main Content Area (Left) */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Calendar Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{format(currentDate, "MMMM yyyy")}</h2>
                <div className="flex items-center gap-1">
                  <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-600 dark:text-slate-400">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-600 dark:text-slate-400">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button className="px-3 py-1.5 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                Today
              </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-slate-400 tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 border-t border-l border-slate-200 dark:border-slate-800">
              {calendarDays.map((day, i) => {
                const isSelected = isSameDay(day, currentDate);
                const isCurrentMonth = isSameMonth(day, currentDate);
                
                return (
                  <div 
                    key={i} 
                    className={`min-h-[100px] border-r border-b border-slate-200 dark:border-slate-800 p-2 relative ${!isCurrentMonth ? 'bg-slate-50 dark:bg-slate-900/50' : 'bg-white dark:bg-slate-900'} ${isSelected ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <span className={`text-sm font-medium ${!isCurrentMonth ? 'text-slate-400 dark:text-slate-600' : isSelected ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                      {format(day, dateFormat)}
                    </span>
                    
                    {/* Render specific events based on the date to match mockup */}
                    {isSameDay(day, new Date(2023, 8, 4)) && (
                      <div className="mt-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded flex items-center gap-1 truncate w-full">
                        10:00 AM Discovery
                      </div>
                    )}
                    
                    {isSelected && (
                      <div className="mt-1 space-y-1">
                        <div className="px-1.5 py-0.5 bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-bold rounded flex items-center gap-1 truncate w-full">
                          09:30 AM Onboarding
                        </div>
                        <div className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded flex items-center gap-1 truncate w-full">
                          02:00 PM Follow-up
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Meetings</h3>
              <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">View All</button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-12 bg-blue-500 rounded-full mt-1"></div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Today, 09:30 AM</p>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Onboarding: NexaCorp</h4>
                    <button className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                      <Video className="w-3.5 h-3.5" />
                      Join Meeting
                    </button>
                  </div>
                </div>
                <div className="sm:text-right flex-1 sm:max-w-[250px]">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center sm:justify-end gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs overflow-hidden">
                      SJ
                    </span>
                    Sarah Jenkins, CTO
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                    "Discussing integration timeline for Q4 and resource allocation for the dev team."
                  </p>
                </div>
                <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-1.5 h-12 bg-slate-300 dark:bg-slate-700 rounded-full mt-1"></div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Tomorrow, 02:00 PM</p>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Discovery Call</h4>
                    <button className="mt-3 flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <Video className="w-3.5 h-3.5" />
                      G-Meet Link
                    </button>
                  </div>
                </div>
                <div className="sm:text-right flex-1 sm:max-w-[250px]">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center sm:justify-end gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs overflow-hidden">
                      MT
                    </span>
                    Markus Thorne, VP Sales
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                    "Initial pitch for global enterprise license. Focus on security compliance modules."
                  </p>
                </div>
                <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent History Table */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent History</h3>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Client / Title</th>
                    <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Date</th>
                    <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Status</th>
                    <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">Global Tech Solutions</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Strategic Review</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Sep 05, 2023</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full uppercase tracking-wider">Completed</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors">
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">Vortex Dynamics</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Technical Demo</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Sep 04, 2023</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full uppercase tracking-wider">Completed</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors">
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
        </div>

        {/* Sidebar Area (Right) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Meeting Requests */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Meeting Requests</h3>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">2</span>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                    <Image src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Elena" className="w-full h-full object-cover" fill style={{ objectFit: "cover" }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Elena Rodriguez</h4>
                    <p className="text-xs text-slate-500">CloudSync Ltd.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md transition-colors shadow-sm">
                    Accept
                  </button>
                  <button className="flex-1 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Reschedule
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                    <Image src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="David" className="w-full h-full object-cover" fill style={{ objectFit: "cover" }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">David Chen</h4>
                    <p className="text-xs text-slate-500">OmniRetail Global</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md transition-colors shadow-sm">
                    Accept
                  </button>
                  <button className="flex-1 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Agenda */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 p-4 flex items-center justify-between">
              <h3 className="font-bold text-white">Today's Agenda</h3>
              <span className="text-xs font-semibold text-slate-400">Sep 07, 2023</span>
            </div>
            <div className="p-5">
              <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                
                <div className="relative flex items-start gap-4">
                  <div className="absolute left-[-29px] top-1 w-3 h-3 bg-blue-600 rounded-full ring-4 ring-white dark:ring-slate-900"></div>
                  <div>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">09:30 AM</span>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">Onboarding Call: NexaCorp</h4>
                    <p className="text-xs text-slate-500 mt-1">Reviewing compliance checklist</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4 opacity-60">
                  <div className="absolute left-[-29px] top-1 w-3 h-3 bg-slate-400 rounded-full ring-4 ring-white dark:ring-slate-900"></div>
                  <div>
                    <span className="text-xs font-bold text-slate-500">12:00 PM</span>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">Lunch Break</h4>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="absolute left-[-29px] top-1 w-3 h-3 bg-slate-400 rounded-full ring-4 ring-white dark:ring-slate-900"></div>
                  <div>
                    <span className="text-xs font-bold text-slate-500">02:00 PM</span>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">Follow-up: Solar Systems</h4>
                    <p className="text-xs text-slate-500 mt-1">Pricing negotiation</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Action Items</h3>
              <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4 mt-0.5 rounded border border-slate-300 dark:border-slate-700 group-hover:border-blue-500 transition-colors">
                  <input type="checkbox" className="opacity-0 absolute inset-0 cursor-pointer" />
                </div>
                <span className="text-xs text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  Send NexaCorp agreement PDF
                </span>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4 mt-0.5 rounded border border-slate-300 dark:border-slate-700 group-hover:border-blue-500 transition-colors">
                  <input type="checkbox" className="opacity-0 absolute inset-0 cursor-pointer" />
                </div>
                <span className="text-xs text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  Draft follow-up for Solar Systems
                </span>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4 mt-0.5 rounded bg-blue-600 border border-blue-600">
                  <input type="checkbox" className="opacity-0 absolute inset-0 cursor-pointer" defaultChecked />
                  <CheckCircle2 className="w-3 h-3 text-white absolute inset-0 m-auto" />
                </div>
                <span className="text-xs text-slate-400 line-through">
                  Review Q3 sales targets
                </span>
              </label>
            </div>
          </div>

          {/* Schedule Insights */}
          <div className="rounded-xl overflow-hidden shadow-sm relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 z-0"></div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <div className="relative z-20 p-6 pt-16">
              <h3 className="text-white font-bold mb-1 shadow-sm">Schedule Insights</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                You are 15% more productive before noon. Try booking strategy calls then.
              </p>
            </div>
          </div>

        </div>
      </div>
      
      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-600/30 transition-transform hover:scale-105 active:scale-95">
        <CalendarIcon className="w-5 h-5" />
      </button>

    </div>
  );
}
