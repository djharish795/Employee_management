"use client";

import React, { useState, useEffect } from 'react';
import { LogOut, Clock, MonitorSmartphone, MessageSquare, Plus, AlertTriangle, Monitor, FileText, Lock, Filter, Download, ChevronRight, CheckCircle2, RefreshCw, Archive, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';

export default function OffboardingPage() {
  const role = useAuthStore((state) => state.role);
  
  // State for data
  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for query params
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [exitType, setExitType] = useState('');

  // Fetch data
  useEffect(() => {
    if (role !== "HR") return;

    const fetchOffboardings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query string
        const params = new URLSearchParams();
        params.append("page", String(page));
        params.append("limit", String(limit));
        if (search) params.append("search", search);
        if (status) params.append("status", status);
        if (exitType) params.append("exitType", exitType);

        const response = await apiClient.get(`/lifecycle/offboarding?${params.toString()}`);
        
        if (response.data && Array.isArray(response.data.data)) {
          setRecords(response.data.data);
          setTotal(response.data.meta?.total || response.data.data.length);
          setTotalPages(response.data.meta?.totalPages || 1);
        } else if (Array.isArray(response.data)) {
          setRecords(response.data);
          setTotal(response.data.length);
          setTotalPages(1);
        }
      } catch (err: any) {
        console.error("Failed to fetch offboardings", err);
        setError("Failed to load offboarding records. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchOffboardings();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [page, limit, search, status, exitType, role]);

  // Protect route: Only HR can access
  if (role !== "HR") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm">Only HR personnel can view this page.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
          <div>
            <div className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="text-slate-500">EMS</span> / <span className="text-slate-500">OFFBOARDING</span> / OVERVIEW
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Employee Offboarding</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/offboarding/new" className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Initiate Offboarding
            </Link>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Pending Exits</div>
              <div className="p-1.5 bg-slate-100 text-slate-900 rounded-md"><LogOut className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {records.filter(r => r.status === "IN_PROGRESS").length}
            </div>
            <div className="text-[11px] font-semibold text-slate-500">Currently in notice period</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Avg. Notice Period</div>
              <div className="p-1.5 bg-orange-50 text-orange-600 rounded-md"><Clock className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">30 <span className="text-sm font-semibold text-slate-500">Days</span></div>
            <div className="text-[11px] font-semibold text-slate-500">Standardized across depts</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Completed Exits</div>
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md"><CheckCircle2 className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {records.filter(r => r.status === "COMPLETED").length}
            </div>
            <div className="text-[11px] font-semibold text-slate-500">Fully offboarded accounts</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Total Actions</div>
              <div className="p-1.5 bg-slate-100 text-slate-600 rounded-md"><MessageSquare className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{total}</div>
            <div className="text-[11px] font-semibold text-slate-500">Overall history count</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search by name or employee ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors text-slate-700"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
            <select
              value={exitType}
              onChange={(e) => { setExitType(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors text-slate-700"
            >
              <option value="">All Exit Types</option>
              <option value="Voluntary / Resignation">Voluntary / Resignation</option>
              <option value="Involuntary / Termination">Involuntary / Termination</option>
              <option value="End of Contract">End of Contract</option>
              <option value="Retirement">Retirement</option>
            </select>
          </div>
        </div>

        {/* Pipeline */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 pt-5">
          <h3 className="text-sm font-bold text-slate-900 mb-8">Offboarding Workflow Pipeline</h3>
          <div className="flex items-center justify-between relative px-8">

            {/* Connecting Line */}
            <div className="absolute top-6 left-16 right-16 h-1 bg-slate-200 rounded-full z-0">
              <div className="w-[45%] h-full bg-slate-900 rounded-full"></div>
            </div>

            {/* Steps */}
            <div className="flex flex-col items-center gap-2 relative z-10 w-24">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center border-4 border-white shadow-sm">
                <Check className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 text-center leading-tight">Resignation</div>
              <div className="text-[10px] font-medium text-slate-500">Initiated</div>
            </div>

            <div className="flex flex-col items-center gap-2 relative z-10 w-24">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center border-4 border-white shadow-sm">
                <Check className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 text-center leading-tight">Approval</div>
              <div className="text-[10px] font-medium text-slate-500">Notice Registered</div>
            </div>

            <div className="flex flex-col items-center gap-2 relative z-10 w-24">
              <div className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center border-4 border-white shadow-[0_0_0_2px_#2563EB] relative">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 text-center leading-tight mt-1">KT Session</div>
              <div className="text-[10px] font-medium text-slate-900">Task Assigned</div>
            </div>

            <div className="flex flex-col items-center gap-2 relative z-10 w-24">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white shadow-sm">
                <Archive className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-500 text-center leading-tight">Asset Return</div>
              <div className="text-[10px] font-medium text-slate-400">Inventory Handover</div>
            </div>

            <div className="flex flex-col items-center gap-2 relative z-10 w-24">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-500 text-center leading-tight">Settlement</div>
              <div className="text-[10px] font-medium text-slate-400">Full & Final</div>
            </div>

            <div className="flex flex-col items-center gap-2 relative z-10 w-24 opacity-50">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-400 text-center leading-tight">Completed</div>
              <div className="text-[10px] font-medium text-slate-400">Archived</div>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column (Span 1) */}
          <div className="space-y-6">

            {/* Risk Alerts */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-[0_4px_20px_-10px_rgba(37,99,235,0.1)] p-5 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-slate-900">Risk Alerts</h3>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="border border-rose-100 rounded-lg p-3 bg-rose-50/30">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-slate-900">Asset Recovery</h4>
                    <span className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">Crucial</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-600 mb-2">Check details tab for outstanding laptops & badges</p>
                </div>

                <div className="border border-amber-100 rounded-lg p-3 bg-amber-50/30">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-slate-900">Knowledge Transfer</h4>
                    <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Active</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-600 mb-2">Ensure KT document sign-offs are submitted before LWD</p>
                </div>
              </div>
            </div>

            {/* Global Checklist Status */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6">Workflow Milestones</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                      <Monitor className="w-4 h-4 text-slate-700" /> IT Asset Recovery
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-700 w-full rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                      <FileText className="w-4 h-4 text-slate-700" /> Document Sign-off
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 w-full rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                      <Lock className="w-4 h-4 text-slate-700" /> Access Revocation
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-full rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Span 2) */}
          <div className="lg:col-span-2">

            {/* Exit Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full min-h-[450px]">
              <div className="p-5 border-b border-slate-200 flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pending Exit Table</h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Live view of employees in offboarding lifecycle</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-x-auto">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
                    <span className="text-sm font-semibold">Loading offboarding records...</span>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20 text-rose-500 gap-2">
                    <AlertCircle className="w-8 h-8 text-rose-400" />
                    <span className="text-sm font-semibold">{error}</span>
                  </div>
                ) : records.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
                    <LogOut className="w-10 h-10 text-slate-300" />
                    <span className="text-sm font-bold text-slate-800">No records found</span>
                    <span className="text-xs text-slate-400">Try modifying search tags or status filters</span>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[35%]">Employee</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resignation</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Day</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[13px] font-medium text-slate-700">
                      {records.map((record) => {
                        const employee = record.employee || {};
                        const employeeName = employee.preferredName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown';
                        const avatarInitials = employeeName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'EE';
                        
                        return (
                          <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                                  {avatarInitials}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">{employeeName}</div>
                                  <div className="text-[10px] text-slate-500 leading-tight">
                                    {employee.designation?.title || 'Employee'} <br />
                                    <span className="font-semibold text-slate-400">ID: {record.employeeId}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              {employee.department?.name || 'N/A'}
                            </td>
                            <td className="px-5 py-4 text-slate-500">
                              {formatDate(record.resignationDate)}
                            </td>
                            <td className="px-5 py-4 text-slate-900 font-bold">
                              {formatDate(record.lastWorkingDay)}
                            </td>
                            <td className="px-5 py-4">
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider rounded">
                                {record.exitType ? record.exitType.split(' ')[0] : 'Other'}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              {record.status === "COMPLETED" ? (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> COMPLETED
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> IN PROGRESS
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <Link 
                                href={`/offboarding/${record.employeeId}`} 
                                className="text-slate-950 hover:bg-slate-100 p-1.5 rounded transition-colors inline-block"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination Footer */}
              {!isLoading && !error && records.length > 0 && (
                <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500 mt-auto bg-slate-50/50">
                  <span>Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total} records</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPage(prev => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 border border-slate-200 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      Previous
                    </button>
                    <button 
                      onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 border border-slate-200 rounded hover:bg-white transition-colors text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
