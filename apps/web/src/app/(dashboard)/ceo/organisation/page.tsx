"use client";

import React from 'react';
import { Lock, Search, Bell, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';

export default function CEOOrganisationPage() {
  const role = useAuthStore((state) => state.role);
  const accessToken = useAuthStore((state) => state.accessToken);

  // Protect route
  const allowedRoles = ["CEO", "COO", "CTO", "CHRO", "OPERATIONS_HEAD", "CFO", "SUPER_ADMIN"];
  if (!allowedRoles.includes(role || "")) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <Lock className="w-10 h-10 text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm font-medium">Only executives can access this section.</p>
      </div>
    );
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['organisation-dashboard-stats'],
    queryFn: async () => {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${url}/departments/dashboard`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch organisation stats');
      return res.json();
    },
    retry: false
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-slate-50">
        <div className="text-red-500 flex items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          <span className="font-semibold">Failed to load organisation data.</span>
        </div>
      </div>
    );
  }

  const { summary, departments, chartData } = data;

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      <div className="p-8 max-w-[1200px] mx-auto w-full space-y-8">
        
        {/* Header Section (The topbar contains the Search and Bell, but for the page we render the title here) */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organisation</h1>
          <p className="text-sm font-medium text-slate-400">
            Department-level headcount and organisational structure
          </p>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">DEPARTMENTS</h4>
            <div className="text-4xl font-extrabold text-slate-900">{summary.totalDepartments}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">TOTAL HEADCOUNT</h4>
            <div className="text-4xl font-extrabold text-slate-900">{summary.totalHeadcount}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">LARGEST DEPARTMENT</h4>
            <div className="text-xl font-bold text-slate-800">{summary.largestDepartment || 'N/A'}</div>
            <div className="text-xs font-medium text-slate-400 mt-1">{summary.largestDepartmentCount} people</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">AVG DEPARTMENT SIZE</h4>
            <div className="text-4xl font-extrabold text-slate-900">{summary.avgDepartmentSize}</div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">DEPARTMENT</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">HEAD</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">HEADCOUNT</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">GROWTH (VS LY)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right flex items-center justify-end gap-1.5">
                    MONTHLY COST <Lock className="w-3 h-3" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((dept: any, index: number) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 text-sm font-bold text-slate-700">{dept.name}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${dept.headColor}`}>
                          {dept.headInitials}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{dept.headName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-700 text-center">{dept.count}</td>
                    <td className="px-6 py-5 text-center">
                      {dept.growthType === 'growing' ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded border border-emerald-100">Growing</span>
                          <span className="text-xs font-bold text-emerald-500">{dept.growth}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded border border-slate-200">Stable</span>
                          <span className="text-xs font-bold text-slate-400">{dept.growth}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-100 text-center text-xs font-semibold text-slate-400 bg-slate-50/50">
            All cost figures unlock with Phase 2 payroll module
          </div>
        </div>

        {/* Headcount Distribution Chart */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-12">
          <h3 className="text-base font-bold text-slate-800 mb-6">Headcount distribution</h3>
          
          {/* Stacked Bar */}
          <div className="w-full h-8 flex rounded-md overflow-hidden mb-6">
            {chartData.map((item: any) => (
              <div key={item.name} className="h-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }}></div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-500">
            {chartData.map((item: any) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                <span className="font-bold text-slate-700">{item.name}</span> <span className="text-slate-400">{item.percentage}%</span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
