"use client";

import React, { useState, useRef } from "react";
import { Calendar as CalendarIcon, CheckCircle2, Clock, CalendarX, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchTeamAttendanceView } from "@/lib/api/attendance";
import { toast } from "react-hot-toast";
import { format, subDays, addDays } from "date-fns";
import { PendingOvertimeTable } from "@/components/modules/team-lead/pending-overtime-table";
import RegularizationPanel from "@/components/modules/attendance/regularization-panel";

export default function TeamAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"overtime" | "regularization">("overtime");
  const dateInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['teamAttendanceView', format(selectedDate, "yyyy-MM-dd")],
    queryFn: () => fetchTeamAttendanceView(format(selectedDate, "yyyy-MM-dd"))
  });

  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">Present</span>;
      case 'Half Day':
        return <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100">Half Day</span>;
      case 'Late':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100">Late</span>;
      case 'On leave':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-100">On leave</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">{status || 'Absent'}</span>;
    }
  };

  const getHeatmapColor = (status: string, isToday: boolean) => {
    let baseClasses = "w-full rounded-sm shadow-sm border transition-all ";
    // Use slightly taller block for today to highlight it
    const height = isToday ? "h-5" : "h-4";
    
    switch (status) {
      case 'PRESENT':
        return baseClasses + height + (isToday ? " bg-emerald-600/90 border-2 border-slate-700" : " bg-emerald-600/90 border-emerald-700/20");
      case 'HALF_DAY':
        return baseClasses + height + (isToday ? " bg-indigo-500/90 border-2 border-slate-700" : " bg-indigo-500/90 border-indigo-600/20");
      case 'LATE':
        return baseClasses + height + (isToday ? " bg-amber-500/90 border-2 border-slate-700" : " bg-amber-500/90 border-amber-600/20 mt-1 mb-1");
      case 'LEAVE':
        return baseClasses + height + (isToday ? " bg-rose-500/90 border-2 border-slate-700" : " bg-rose-500/90 border-rose-600/20");
      case 'WEEKEND':
        return baseClasses + height + " bg-slate-200/50 border-slate-300/30";
      case 'FUTURE':
        return baseClasses + height + " bg-slate-100/30 border-dashed border-slate-200/50";
      default: // ABSENT
        return baseClasses + height + (isToday ? " bg-slate-300 border-2 border-slate-700" : " bg-slate-100 border-slate-200");
    }
  };

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-screen flex flex-col font-sans overflow-x-hidden">
      <main className="p-8 max-w-5xl mx-auto w-full space-y-6 mt-4">
        
        {/* Date & Direct Reports Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={handlePrevDay} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="relative">
              <button 
                onClick={() => {
                  if (dateInputRef.current) {
                    if (typeof dateInputRef.current.showPicker === 'function') {
                      dateInputRef.current.showPicker();
                    } else {
                      dateInputRef.current.click();
                    }
                  }
                }}
                className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <CalendarIcon className="w-4 h-4 text-slate-500" />
                {format(selectedDate, "dd MMMM yyyy")}
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={format(selectedDate, "yyyy-MM-dd")}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    setSelectedDate(new Date(y, m - 1, d));
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
              />
            </div>
            <button onClick={handleNextDay} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-slate-600">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            {data?.kpis?.directReportsCount || 0} team members
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex justify-between items-start">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">PRESENT</div>
              <div className="text-4xl font-extrabold text-slate-900">{data?.kpis?.presentCount ?? "-"}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex justify-between items-start">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">LATE</div>
              <div className="text-4xl font-extrabold text-slate-900">{data?.kpis?.lateCount ?? "-"}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex justify-between items-start">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">ON LEAVE</div>
              <div className="text-4xl font-extrabold text-slate-900">{data?.kpis?.leaveCount ?? "-"}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
              <CalendarX className="w-6 h-6 text-rose-400" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
            Error fetching data: {String(error)}
          </div>
        ) : (
          <>
            {/* Approvals Toggle */}
            <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm mb-6 inline-flex w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("overtime")}
                className={`flex-1 sm:w-48 py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'overtime' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Overtime Approvals
              </button>
              <button
                onClick={() => setActiveTab("regularization")}
                className={`flex-1 sm:w-48 py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'regularization' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Regularizations
              </button>
            </div>

            <div className="mb-8 min-h-[300px]">
              {activeTab === "overtime" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <PendingOvertimeTable />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <RegularizationPanel mode="org" />
                </div>
              )}
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
                      <th className="px-6 py-4">OVERTIME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data?.realTimeStatus?.map((member: any) => (
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
                        <td className="px-6 py-4">
                          {member.overtime && Number(member.overtime) > 0 ? (
                            member.isOvertimeApproved ? (
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                Approved (+{member.overtime}h)
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                                Pending (+{member.overtime}h)
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!data?.realTimeStatus || data.realTimeStatus.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No team members found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Attendance Chart */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-base font-extrabold text-slate-900">Monthly Attendance - {format(selectedDate, "MMMM yyyy")}</h2>
                
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
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div> Absent
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {data?.heatmapData?.map((member: any) => (
                  <div key={member.id} className="flex items-start gap-4">
                    <div className="w-24 flex-shrink-0 pt-2">
                      <span className="text-xs font-bold text-slate-900 truncate block" title={member.name}>{member.name}</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      {member.days.map((status: string, i: number) => {
                        // The index + 1 is the day of the month
                        const isSelectedDay = (i + 1) === selectedDate.getDate();
                        return (
                          <div 
                            key={i} 
                            className={getHeatmapColor(status, isSelectedDay)}
                            title={`${format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1), "dd MMM")} - ${status}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
            </div>
          </>
        )}
      </main>
    </div>
  );
}
