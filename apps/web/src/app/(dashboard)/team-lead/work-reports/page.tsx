'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { FileText, Eye, X } from 'lucide-react';

export default function TeamLeadWorkReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  
  // View State
  const [viewingReport, setViewingReport] = useState<any | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/work-reports/team');
      setReports(res.data?.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load team reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = filterType === 'all' 
    ? reports 
    : reports.filter(r => r.reportType?.toLowerCase() === filterType.toLowerCase());

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Work Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Review work reports submitted by your direct reports.</p>
        </div>
        <div className="flex space-x-2">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-slate-300 rounded-md text-sm px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Report Types</option>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </div>
      </div>

      {/* VIEW MODAL */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  {viewingReport.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Submitted by {viewingReport.employee?.firstName} {viewingReport.employee?.lastName}
                </p>
              </div>
              <button onClick={() => setViewingReport(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="bg-slate-100 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-700">
                  {viewingReport.reportType}
                </div>
                <div className="bg-slate-100 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-700">
                  {new Date(viewingReport.submittedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                {viewingReport.content?.text || "No content provided."}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setViewingReport(null)} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Title & Type</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-slate-500" colSpan={4}>Loading team reports...</td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-slate-500" colSpan={4}>
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <FileText className="w-8 h-8" />
                      <p>No reports found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setViewingReport(report)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                          {report.employee?.firstName?.charAt(0)}{report.employee?.lastName?.charAt(0)}
                        </div>
                        <div className="text-sm font-medium text-slate-900">
                          {report.employee?.firstName} {report.employee?.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      {new Date(report.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{report.title}</div>
                      <div className="text-xs text-slate-500">{report.reportType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setViewingReport(report); }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Read Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
