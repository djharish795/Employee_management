"use client";

import React, { useState } from 'react';
import { Search, Bell, Download, Calendar, ChevronDown, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

// ─── Interfaces (No Hardcoded Mock Data) ─────────────────────────────────────────
interface AttendanceMetrics {
  totalEmployees: number;
  present: number;
  presentPercentage: number;
  onLeave: number;
  lateArrivals: number;
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
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);

  // Protect route: Only HR can access
  if (role !== "HR") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <Lock className="w-10 h-10 text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm">Only HR personnel can view the Attendance Summary.</p>
      </div>
    );
  }

  // Get current date formatted like "15 January 2025"
  const currentDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      
      {/* Top Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Attendance</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64 hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search data..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
            />
          </div>
          <button className="text-slate-400 hover:text-slate-900 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm">TK</div>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-6">
        
        {/* Controls Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-semibold text-slate-700 min-w-[200px] cursor-pointer hover:bg-slate-50">
                <Calendar className="w-4 h-4 text-slate-500" />
                {currentDate}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <select className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-slate-900 cursor-pointer shadow-sm hover:bg-slate-50">
                <option>All departments</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Download className="w-4 h-4" /> Export report
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Total employees</div>
            <div className="text-3xl font-extrabold text-slate-900">{metrics?.totalEmployees || '--'}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Present</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600">{metrics?.present || '--'}</span>
              <span className="text-sm font-bold text-slate-400">{metrics?.presentPercentage || '--'}%</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">On leave</div>
            <div className="text-3xl font-extrabold text-orange-500">{metrics?.onLeave || '--'}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Late arrivals</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-orange-500">{metrics?.lateArrivals || '--'}</span>
              <span className="text-sm font-bold text-slate-400">today</span>
            </div>
          </div>
        </div>

        {/* Middle Layout (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Department-wise attendance */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-8">Department-wise attendance today</h3>
            
            <div className="space-y-6">
              {departmentStats.length === 0 ? (
                <div className="py-12 text-center text-sm font-medium text-slate-400">Waiting for backend department data...</div>
              ) : (
                departmentStats.map(dept => {
                  const percentage = dept.total > 0 ? (dept.present / dept.total) * 100 : 0;
                  return (
                    <div key={dept.id}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-slate-900">{dept.name}</span>
                        <span className="text-xs font-semibold text-slate-500">{dept.present}/{dept.total}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Exceptions today */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-900">Exceptions today</h3>
              <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold">
                {exceptions.length}
              </div>
            </div>
            
            <div className="flex-1 space-y-4 overflow-y-auto">
              {exceptions.length === 0 ? (
                <div className="py-12 text-center text-sm font-medium text-slate-400">Waiting for backend exception data...</div>
              ) : (
                exceptions.map(record => (
                  <div key={record.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                        {record.initials || record.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{record.name}</div>
                        <div className="text-[11px] font-medium text-slate-500">{record.department}</div>
                      </div>
                    </div>
                    {record.status === 'LATE' ? (
                      <span className="px-2 py-1 bg-orange-50 text-orange-600 text-[9px] font-bold uppercase tracking-wider rounded border border-orange-100">
                        LATE
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-rose-50 text-rose-600 text-[9px] font-bold uppercase tracking-wider rounded border border-rose-100">
                        ABSENT
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom Chart Layout */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900 mb-6">Monthly attendance trend</h3>
          
          <div className="relative w-full h-[250px]">
            {trendData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-400 border border-dashed border-slate-200 rounded-lg">
                Waiting for backend trend data to render chart...
              </div>
            ) : (
              <div className="w-full h-full border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                Chart Component Here
              </div>
            )}
            
            {/* Y-axis placeholders for structure (if we were rendering static SVG) */}
            <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-[10px] font-medium text-slate-400">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
            </div>
            
            {/* X-axis placeholders */}
            <div className="absolute left-8 right-0 bottom-0 h-8 flex justify-between items-end text-[10px] font-medium text-slate-400">
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
              <span>Jan</span>
            </div>
            
            {/* Grid lines */}
            <div className="absolute left-8 right-0 top-2 bottom-8 flex flex-col justify-between pointer-events-none">
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full border-t border-slate-100"></div>
              <div className="w-full border-t border-slate-100"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
