"use client";

import React, { useState } from 'react';
import { Search, Lock, Users, Calendar, Network, FileText, Download, Banknote, UserMinus, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

// ─── Interfaces ─────────────────────────────────────────────────────────────
interface ReportHistory {
  id: string;
  name: string;
  date: string;
  format: 'PDF' | 'XLSX';
  size: string;
}

export default function CEOReportsPage() {
  const role = useAuthStore((state) => state.role);

  // Static mock data to perfectly match the requested visual state
  const [recentReports] = useState<ReportHistory[]>([
    { id: '1', name: 'Headcount Dec 2024', date: 'Dec 15, 2024', format: 'PDF', size: '2.4 MB' },
    { id: '2', name: 'Attendance Q4', date: 'Dec 10, 2024', format: 'XLSX', size: '1.8 MB' },
    { id: '3', name: 'Org Structure 2024', date: 'Dec 01, 2024', format: 'PDF', size: '5.1 MB' },
    { id: '4', name: 'Headcount Nov 2024', date: 'Nov 15, 2024', format: 'PDF', size: '2.3 MB' },
  ]);

  // Protect route
  if (role !== "CEO") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <Lock className="w-10 h-10 text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm font-medium">Only the CEO can access Executive Reporting.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      <div className="p-8 max-w-[1200px] mx-auto w-full space-y-8">
        
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Reporting</h1>
          <p className="text-sm text-slate-500 font-medium mt-2 max-w-3xl">
            Generate executive reports for board meetings and strategic reviews. Access real-time organizational data tailored for high-level decision making.
          </p>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Active Card 1: Headcount */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col items-center text-center transition-shadow hover:shadow-md">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-3">Headcount summary</h3>
            <p className="text-xs font-medium text-slate-500 mb-8 flex-1 px-4 leading-relaxed">
              Detailed breakdown of total employee count by department, location, and seniority level.
            </p>
            <button className="w-full py-2.5 rounded-lg border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              Generate report
            </button>
          </div>

          {/* Active Card 2: Attendance */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col items-center text-center transition-shadow hover:shadow-md">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-3">Attendance summary</h3>
            <p className="text-xs font-medium text-slate-500 mb-8 flex-1 px-4 leading-relaxed">
              Quarterly analysis of organizational attendance, leave patterns, and productivity hours.
            </p>
            <button className="w-full py-2.5 rounded-lg border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              Generate report
            </button>
          </div>

          {/* Active Card 3: Org Structure */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col items-center text-center transition-shadow hover:shadow-md">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-3">Organisation structure</h3>
            <p className="text-xs font-medium text-slate-500 mb-8 flex-1 px-4 leading-relaxed">
              Visual and data-driven report of the current hierarchical structure and reporting lines.
            </p>
            <button className="w-full py-2.5 rounded-lg border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              Generate report
            </button>
          </div>

          {/* Locked Card 1: Cost analysis */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-8 flex flex-col items-center text-center relative opacity-70">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-6">
              <Banknote className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-400 mb-3">Cost analysis</h3>
            <p className="text-xs font-medium text-slate-400 mb-8 flex-1 px-4 leading-relaxed">
              Comprehensive financial report on labor costs, benefits, and payroll expenses.
            </p>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-200/60 rounded-full text-[11px] font-bold text-slate-500">
              <Lock className="w-3 h-3" /> Phase 2
            </div>
          </div>

          {/* Locked Card 2: Attrition analysis */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-8 flex flex-col items-center text-center relative opacity-70">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-6">
              <UserMinus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-400 mb-3">Attrition analysis</h3>
            <p className="text-xs font-medium text-slate-400 mb-8 flex-1 px-4 leading-relaxed">
              Insightful data on turnover rates, exit reasons, and retention risk levels.
            </p>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-200/60 rounded-full text-[11px] font-bold text-slate-500">
              <Lock className="w-3 h-3" /> Phase 2
            </div>
          </div>

          {/* Locked Card 3: Performance summary */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-8 flex flex-col items-center text-center relative opacity-70">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-400 mb-3">Performance summary</h3>
            <p className="text-xs font-medium text-slate-400 mb-8 flex-1 px-4 leading-relaxed">
              Aggregate view of performance ratings and goal achievement across the company.
            </p>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-200/60 rounded-full text-[11px] font-bold text-slate-500">
              <Lock className="w-3 h-3" /> Phase 2
            </div>
          </div>

        </div>

        {/* Recent Reports Table Section */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-8">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <h2 className="text-base font-bold text-slate-900">Recent reports</h2>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
              View all history
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500">Report Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500">Date Generated</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500">Format</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500">Size</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentReports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700">{report.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-500">{report.date}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-extrabold uppercase rounded shadow-sm">
                        {report.format}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-500">{report.size}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                        <Download className="w-4 h-4" /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
