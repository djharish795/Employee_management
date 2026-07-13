"use client";

import React, { useState } from 'react';
import { Search, Bell, Download, Calendar, ChevronDown, Lock, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { fetchSummaryToday } from '@/lib/api/attendance';
import HistoryPanel from "@/components/modules/attendance/history-panel";
import ReportsPanel from "@/components/modules/attendance/reports-panel";

// ─── Interfaces (No Hardcoded Mock Data) ─────────────────────────────────────────
interface AttendanceMetrics {
  totalEmployees: number;
  present: number;
  presentPercentage: number;
  onLeave: number;
  lateArrivals: number;
  notPunchedIn: number;
}

interface DepartmentAttendance {
  id: string;
  name: string;
  present: number;
  total: number;
}

interface ExceptionRecord {
  id: string;
  name: string;
  department: string;
  status: 'LATE' | 'ABSENT';
  initials?: string;
}

interface TrendPoint {
  month: string;
  percentage: number;
}

export default function AttendanceSummaryPage() {
  const role = useAuthStore((state) => state.role);

  // States waiting for backend population
  const [metrics, setMetrics] = useState<AttendanceMetrics | null>(null);
  const [departmentStats, setDepartmentStats] = useState<DepartmentAttendance[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionRecord[]>([]);
  const [presentEmployees, setPresentEmployees] = useState<ExceptionRecord[]>([]);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New interactive states
  const searchParams = useSearchParams();
  const [listTab, setListTab] = useState<'exceptions' | 'present'>('exceptions');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'logs'>(
    (searchParams.get('tab') as 'overview' | 'analytics' | 'logs') || 'overview'
  );
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [allDepts, setAllDepts] = useState<{ id: string, name: string }[]>([]);

  React.useEffect(() => {
    if (role && ['HR', 'CEO', 'CTO'].includes(role)) {
      setIsLoading(true);
      fetchSummaryToday(selectedDate, selectedDept)
        .then((data) => {
          setMetrics(data.metrics);
          setDepartmentStats(data.departmentStats);
          setExceptions(data.exceptions);
          setPresentEmployees(data.presentEmployees || []);
          setTrendData(data.trendData);
          if (allDepts.length === 0 && data.departmentStats.length > 0) {
            setAllDepts(data.departmentStats.map((d: any) => ({ id: d.id, name: d.name })));
          }
        })
        .catch((err) => console.error("Failed to fetch summary data", err))
        .finally(() => setIsLoading(false));
    }
  }, [role, selectedDate, selectedDept]);

  // Protect route: Only HR, CEO, CTO can access
  if (!role || !['HR', 'CEO', 'CTO'].includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors">
        <Lock className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Access Restricted</h2>
        <p className="mt-2 text-sm">Only authorized personnel can view the Attendance Summary.</p>
      </div>
    );
  }

  // Filter lists
  const safeSearch = searchQuery.toLowerCase().trim();
  const filteredExceptions = exceptions.filter(ex =>
    (ex.name && ex.name.toLowerCase().includes(safeSearch)) ||
    (ex.initials && ex.initials.toLowerCase().includes(safeSearch))
  );

  const filteredPresent = presentEmployees.filter(ex =>
    (ex.name && ex.name.toLowerCase().includes(safeSearch)) ||
    (ex.initials && ex.initials.toLowerCase().includes(safeSearch))
  );

  React.useEffect(() => {
    if (searchQuery.trim()) {
      if (filteredExceptions.length === 0 && filteredPresent.length > 0 && listTab !== 'present') {
        setListTab('present');
      } else if (filteredPresent.length === 0 && filteredExceptions.length > 0 && listTab !== 'exceptions') {
        setListTab('exceptions');
      }
    }
  }, [searchQuery, filteredExceptions.length, filteredPresent.length, listTab]);

  const handleExport = () => {
    if (!metrics) return;
    let csv = "Metrics\n";
    csv += `Total Employees,Present,Present %,On Leave,Late Arrivals\n`;
    csv += `${metrics.totalEmployees},${metrics.present},${metrics.presentPercentage}%,${metrics.onLeave},${metrics.lateArrivals}\n\n`;

    csv += "Department Stats\n";
    csv += `Department,Present,Total\n`;
    departmentStats.forEach(d => {
      csv += `${d.name},${d.present},${d.total}\n`;
    });

    csv += "\nExceptions\n";
    csv += `Name,Department,Status\n`;
    filteredExceptions.forEach(e => {
      csv += `${e.name},${e.department},${e.status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_summary_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 dark:bg-slate-900 overflow-y-auto transition-colors">

      {/* Top Header */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-8 pt-6 flex flex-col gap-6 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Attendance Summary</h1>

          <div className="flex items-center gap-4">
            {activeTab === 'overview' && (
              <div className="relative w-64 hidden md:block">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search exceptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-slate-500 focus:bg-white dark:focus:bg-slate-950 transition-colors"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'overview' ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            Today's Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'analytics' ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            Analytics & Trends
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'logs' ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            Organization Logs
          </button>
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-6">

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Controls Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500 transition-colors"
                  />
                  <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative">
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500 cursor-pointer shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <option value="all">All departments</option>
                    {allDepts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" /> Export report
                </button>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Total employees</div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{metrics?.totalEmployees ?? '--'}</div>
              </div>

              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Present</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{metrics?.present ?? '--'}</span>
                  <span className="text-sm font-bold text-slate-400 dark:text-slate-500">{metrics?.presentPercentage ?? '--'}%</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">On leave</div>
                <div className="text-3xl font-extrabold text-orange-500 dark:text-orange-400">{metrics?.onLeave ?? '--'}</div>
              </div>

              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Late arrivals</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-orange-500 dark:text-orange-400">{metrics?.lateArrivals ?? '--'}</span>
                  <span className="text-sm font-bold text-slate-400 dark:text-slate-500">today</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Not Punched In</div>
                <div className="text-3xl font-extrabold text-rose-500 dark:text-rose-400">{metrics?.notPunchedIn ?? '--'}</div>
              </div>
            </div>

            {/* Middle Layout (2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Department-wise attendance */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 transition-colors">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8">Department-wise attendance today</h3>

                <div className="space-y-6">
                  {departmentStats.length === 0 ? (
                    <div className="py-12 text-center text-sm font-medium text-slate-400 dark:text-slate-500">Waiting for backend department data...</div>
                  ) : (
                    departmentStats.map(dept => {
                      const percentage = dept.total > 0 ? (dept.present / dept.total) * 100 : 0;
                      return (
                        <div key={dept.id}>
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{dept.name}</span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{dept.present}/{dept.total}</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Employee Lists (Exceptions / Present) */}
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex flex-col transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 w-full">
                    <button
                      onClick={() => setListTab('exceptions')}
                      className={`pb-2 text-sm font-bold border-b-2 transition-colors ${listTab === 'exceptions' ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                      Exceptions <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">{filteredExceptions.length}</span>
                    </button>
                    <button
                      onClick={() => setListTab('present')}
                      className={`pb-2 text-sm font-bold border-b-2 transition-colors ${listTab === 'present' ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                      Present <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">{filteredPresent.length}</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-[350px]">
                  {listTab === 'exceptions' ? (
                    filteredExceptions.length === 0 ? (
                      <div className="py-12 text-center text-sm font-medium text-slate-400 dark:text-slate-500">No exceptions found.</div>
                    ) : (
                      filteredExceptions.map(record => (
                        <div key={record.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                              {record.initials || record.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 dark:text-slate-200">{record.name}</div>
                              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{record.department}</div>
                            </div>
                          </div>
                          {record.status === 'LATE' ? (
                            <span className="px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[9px] font-bold uppercase tracking-wider rounded border border-orange-100 dark:border-orange-800/50">
                              LATE
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[9px] font-bold uppercase tracking-wider rounded border border-rose-100 dark:border-rose-800/50">
                              ABSENT
                            </span>
                          )}
                        </div>
                      ))
                    )
                  ) : (
                    filteredPresent.length === 0 ? (
                      <div className="py-12 text-center text-sm font-medium text-slate-400 dark:text-slate-500">No one is present.</div>
                    ) : (
                      filteredPresent.map(record => (
                        <div key={record.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                              {record.initials || record.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 dark:text-slate-200">{record.name}</div>
                              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{record.department}</div>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider rounded border border-emerald-100 dark:border-emerald-800/50">
                            PRESENT
                          </span>
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Bottom Chart Layout */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 transition-colors">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Monthly attendance trend</h3>

              <div className="relative w-full h-[250px]">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Fetching backend trend data...
                  </div>
                ) : trendData.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    No trend data available.
                  </div>
                ) : (
                  <div className="w-full h-full relative z-10 flex items-end justify-between px-8 pb-10">
                    {trendData.map((d, i) => (
                      <div key={i} className="relative flex flex-col items-center justify-end h-full w-12 group cursor-pointer">
                        <div
                          className="w-full bg-slate-900 dark:bg-slate-700 rounded-t-sm transition-all duration-300 ease-out group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 shadow-sm"
                          style={{ height: `${d.percentage}%` }}
                        ></div>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold py-1 px-2 rounded transition-opacity pointer-events-none shadow-md">
                          {d.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Y-axis placeholders for structure */}
                <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-[10px] font-medium text-slate-400 dark:text-slate-500">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                </div>

                {/* X-axis placeholders */}
                <div className="absolute left-8 right-0 bottom-0 h-8 flex justify-between items-end text-[10px] font-medium text-slate-400 dark:text-slate-500 px-8">
                  {trendData.length > 0 ? trendData.map((d, i) => (
                    <span key={i} className="w-12 text-center">{d.month}</span>
                  )) : (
                    <>
                      <span>Aug</span>
                      <span>Sep</span>
                      <span>Oct</span>
                      <span>Nov</span>
                      <span>Dec</span>
                      <span>Jan</span>
                    </>
                  )}
                </div>

                {/* Grid lines */}
                <div className="absolute left-8 right-0 top-2 bottom-8 flex flex-col justify-between pointer-events-none">
                  <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                  <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                  <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                  <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                </div>
              </div>

              {/* Analytics & Reports */}
              <div className="pt-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Detailed Analytics</h3>
                <ReportsPanel activeRole="HR" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Organization History Logs */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Organization Attendance Logs</h3>
            <HistoryPanel mode="org" />
          </div>
        )}

      </div>
    </div>
  );
}
