"use client";
import toast from "react-hot-toast";

import React, { useState } from 'react';
import { Search, Lock, Users, Calendar, Network, FileText, Download, Banknote, UserMinus, BarChart3, Loader2, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VdrTracking } from '@/components/modules/ceo/vdr-tracking';

interface ReportHistory {
  id: string;
  name: string;
  generatedAt: string;
  format: 'PDF' | 'XLSX';
  sizeBytes: number;
}

export default function CEOReportsPage() {
  const role = useAuthStore((state) => state.role);
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const [formats, setFormats] = useState<{ [key: string]: string }>({
    HEADCOUNT: 'PDF',
    ATTENDANCE: 'XLSX',
    ORG_STRUCTURE: 'PDF',
  });
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'VDR'>('REPORTS');

  const handleFormatChange = (type: string, format: string) => {
    setFormats(prev => ({ ...prev, [type]: format }));
  };

  const { data: recentReports, isLoading: isFetchingReports } = useQuery<ReportHistory[]>({
    queryKey: ['recent-reports'],
    queryFn: async () => {
      const url = process.env.NEXT_PUBLIC_API_URL!;
      const res = await fetch(`${url}/reports`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch reports');
      return res.json();
    }
  });

  const generateReport = useMutation({
    mutationFn: async ({ type, format }: { type: string, format: string }) => {
      const url = process.env.NEXT_PUBLIC_API_URL!;
      const res = await fetch(`${url}/reports/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'include',
        body: JSON.stringify({ type, format })
      });
      if (!res.ok) throw new Error('Failed to generate report');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-reports'] });
    }
  });

  const handleDownload = async (id: string, name: string, format: string) => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL!;
      const res = await fetch(`${url}/reports/${id}/download`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to get download URL');
      const data = await res.json();
      
      const a = document.createElement('a');
      a.href = data.url;
      a.download = `${name.replace(/\s+/g, '_')}_${new Date().getTime()}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error(error);
      toast.error('Failed to download report.');
    }
  };

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

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      <div className="p-8 max-w-[1200px] mx-auto w-full space-y-8">
        
        {/* Page Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Reporting</h1>
            <p className="text-sm text-slate-500 font-medium mt-2 max-w-3xl">
              Generate executive reports for board meetings and strategic reviews. Access real-time organizational data tailored for high-level decision making.
            </p>
          </div>
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('REPORTS')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'REPORTS' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              General Reports
            </button>
            <button
              onClick={() => setActiveTab('VDR')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'VDR' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ShieldAlert className={`w-4 h-4 ${activeTab === 'VDR' ? 'text-rose-500' : 'text-slate-400'}`} />
              VDR Vaults
            </button>
          </div>
        </div>

        {activeTab === 'VDR' ? (
          <VdrTracking />
        ) : (
          <>
            {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Active Card 1: Headcount */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col items-center text-center transition-shadow hover:shadow-md">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-3">Headcount summary</h3>
            <p className="text-xs font-medium text-slate-500 mb-4 flex-1 px-4 leading-relaxed">
              Detailed breakdown of total employee count by department, location, and seniority level.
            </p>
            <div className="w-full flex gap-2 mb-4">
              <select 
                value={formats['HEADCOUNT']}
                onChange={(e) => handleFormatChange('HEADCOUNT', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-600 shadow-sm"
              >
                <option value="PDF">Format: PDF</option>
                <option value="XLSX">Format: XLSX</option>
              </select>
            </div>
            <button 
              onClick={() => generateReport.mutate({ type: 'HEADCOUNT', format: formats['HEADCOUNT'] })}
              disabled={generateReport.isPending}
              className="w-full py-2.5 rounded-lg border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              {generateReport.isPending && generateReport.variables?.type === 'HEADCOUNT' && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate report
            </button>
          </div>

          {/* Active Card 2: Attendance */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col items-center text-center transition-shadow hover:shadow-md">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-3">Attendance summary</h3>
            <p className="text-xs font-medium text-slate-500 mb-4 flex-1 px-4 leading-relaxed">
              Quarterly analysis of organizational attendance, leave patterns, and productivity hours.
            </p>
            <div className="w-full flex gap-2 mb-4">
              <select 
                value={formats['ATTENDANCE']}
                onChange={(e) => handleFormatChange('ATTENDANCE', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-600 shadow-sm"
              >
                <option value="PDF">Format: PDF</option>
                <option value="XLSX">Format: XLSX</option>
              </select>
            </div>
            <button 
              onClick={() => generateReport.mutate({ type: 'ATTENDANCE', format: formats['ATTENDANCE'] })}
              disabled={generateReport.isPending}
              className="w-full py-2.5 rounded-lg border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              {generateReport.isPending && generateReport.variables?.type === 'ATTENDANCE' && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate report
            </button>
          </div>

          {/* Active Card 3: Org Structure */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col items-center text-center transition-shadow hover:shadow-md">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-3">Organisation structure</h3>
            <p className="text-xs font-medium text-slate-500 mb-4 flex-1 px-4 leading-relaxed">
              Visual and data-driven report of the current hierarchical structure and reporting lines.
            </p>
            <div className="w-full flex gap-2 mb-4">
              <select 
                value={formats['ORG_STRUCTURE']}
                onChange={(e) => handleFormatChange('ORG_STRUCTURE', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-600 shadow-sm"
              >
                <option value="PDF">Format: PDF</option>
                <option value="XLSX">Format: XLSX</option>
              </select>
            </div>
            <button 
              onClick={() => generateReport.mutate({ type: 'ORG_STRUCTURE', format: formats['ORG_STRUCTURE'] })}
              disabled={generateReport.isPending}
              className="w-full py-2.5 rounded-lg border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              {generateReport.isPending && generateReport.variables?.type === 'ORG_STRUCTURE' && <Loader2 className="w-4 h-4 animate-spin" />}
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
                {isFetchingReports ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm font-medium text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading reports...
                    </td>
                  </tr>
                ) : !recentReports || recentReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm font-medium text-slate-500">
                      No reports generated yet.
                    </td>
                  </tr>
                ) : recentReports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700">{report.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-500">{new Date(report.generatedAt).toLocaleDateString()} {new Date(report.generatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-extrabold uppercase rounded shadow-sm">
                        {report.format}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-500">{formatBytes(report.sizeBytes)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDownload(report.id, report.name, report.format)}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
