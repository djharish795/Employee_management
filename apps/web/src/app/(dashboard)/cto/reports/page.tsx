"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { 
  FileSpreadsheet, BarChart2, Filter, MoreVertical, 
  CheckCircle2, FileText, MapPin, XCircle
} from 'lucide-react';
import { fetchFieldWorkApprovals } from '@/lib/api/field-work';
import { apiClient } from '@/lib/api/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

function CtoReportsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [workReports, setWorkReports] = useState<any[]>([]);
  const [fieldRequests, setFieldRequests] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const initialTeam = searchParams.get('team') === 'operations' ? 'operations' : 'tech';
  const [teamToggle, setTeamToggleState] = useState<'operations' | 'tech'>(initialTeam);
  const [reportSearch, setReportSearch] = useState('');

  // Synchronize state when searchParams changes (e.g. Back button)
  useEffect(() => {
    const teamParam = searchParams.get('team');
    if (teamParam === 'operations' && teamToggle !== 'operations') {
      setTeamToggleState('operations');
    } else if (teamParam !== 'operations' && teamToggle !== 'tech') {
      setTeamToggleState('tech');
    }
  }, [searchParams]);

  const setTeamToggle = (team: 'operations' | 'tech') => {
    setTeamToggleState(team);
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('team', team);
    router.replace(`${pathname}?${current.toString()}`);
  };

  const loadData = async () => {
    setIsDataLoading(true);
    setErrorMessage(null);
    try {
      // Fetch both simultaneously
      const [fieldWorkData, workReportsData] = await Promise.all([
        fetchFieldWorkApprovals().catch(err => { console.error('fetchTeamFieldWork error:', err); return []; }),
        apiClient.get(`/work-reports/cto?team=${teamToggle}`).then(r => r?.data?.data || r?.data || []).catch(err => { console.error('work-reports/cto error:', err); return []; })
      ]);

      const fWork = Array.isArray(fieldWorkData) ? fieldWorkData : [];
      const wReports = Array.isArray(workReportsData) ? workReportsData : [];

      setFieldRequests(fWork.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setWorkReports(wReports.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
    } catch (err: any) {
      console.error("Failed to load reports data", err);
      setErrorMessage(err.message || "Failed to load requests");
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [teamToggle]);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Draft';
      case 'PENDING': return 'Pending';
      case 'NEEDS_REVISION': return 'Needs Revision';
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'CANCELLED': return 'Cancelled';
      default: return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ') : 'Pending';
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'DRAFT':
      case 'Draft':
        return 'bg-slate-400';
      case 'APPROVED':
      case 'Approved':
        return 'bg-emerald-500';
      case 'REJECTED':
      case 'Rejected':
        return 'bg-rose-500';
      case 'NEEDS_REVISION':
      case 'Needs Revision':
      case 'Needs revision':
        return 'bg-amber-500';
      case 'PENDING':
      case 'Pending':
        return 'bg-purple-500';
      case 'CANCELLED':
      case 'Cancelled':
        return 'bg-slate-300';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-300">
      <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-[1600px] mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Organizational Reports</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">View access to work and field requests for {teamToggle} team.</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTeamToggle('tech')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                teamToggle === 'tech' 
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Tech Team
            </button>
            <button
              onClick={() => setTeamToggle('operations')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                teamToggle === 'operations' 
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Operations Team
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className={`grid grid-cols-1 ${teamToggle === 'operations' ? 'md:grid-cols-2' : ''} gap-4 mb-8`}>
          <div className="bg-slate-900 dark:bg-slate-900 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-center border border-slate-800">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <FileText className="w-16 h-16 text-white" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 z-10">Total Work Reports</p>
            <h3 className="text-3xl font-black text-white mb-1 z-10">
              {workReports.length}
            </h3>
          </div>
          {teamToggle === 'operations' && (
            <div className="bg-indigo-900 dark:bg-indigo-900 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-center border border-indigo-800">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <MapPin className="w-16 h-16 text-white" />
              </div>
              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1.5 z-10">Total Field Requests</p>
              <h3 className="text-3xl font-black text-white mb-1 z-10">
                {fieldRequests.length}
              </h3>
            </div>
          )}
        </div>

        {/* Main Content Layout - Dual Column */}
        <div className={`w-full grid grid-cols-1 ${teamToggle === 'operations' ? 'lg:grid-cols-2' : ''} gap-6`}>
          
          {/* Work Reports Column */}
          <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[600px]">
            <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Work Reports
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white w-48"
                  />
                  <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button onClick={loadData} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                  <tr className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="px-5 py-3 w-[40%]">EMPLOYEE / TITLE</th>
                    <th className="px-5 py-3 w-[25%]">DATE</th>
                    {teamToggle === 'operations' && <th className="px-5 py-3 w-[25%]">STATUS</th>}
                    <th className="px-5 py-3 w-[10%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {(() => {
                    if (isDataLoading) {
                      return <tr><td colSpan={4} className="px-5 py-8 text-center text-sm font-semibold text-slate-500">Loading reports...</td></tr>;
                    }
                    if (errorMessage) {
                      return <tr><td colSpan={4} className="px-5 py-8 text-center text-sm font-semibold text-rose-500">Error: {errorMessage}</td></tr>;
                    }
                    const filteredWorkReports = workReports.filter(req => {
                      const searchTerm = reportSearch.toLowerCase();
                      return (
                        req.employee?.firstName?.toLowerCase().includes(searchTerm) ||
                        req.employee?.lastName?.toLowerCase().includes(searchTerm) ||
                        req.title?.toLowerCase().includes(searchTerm) ||
                        req.status?.toLowerCase().includes(searchTerm)
                      );
                    });

                    if (filteredWorkReports.length === 0) {
                      return (
                        <tr>
                          <td colSpan={teamToggle === 'operations' ? 4 : 3} className="px-5 py-16 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <FileSpreadsheet className="w-8 h-8 text-slate-300" />
                              <p className="text-sm font-bold text-slate-900">No Work Reports Found</p>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    return filteredWorkReports.map((req, index) => (
                      <tr key={`wr-${req.id || index}`} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm">{req.employee?.firstName} {req.employee?.lastName}</span>
                            <span className="font-medium text-slate-500 text-xs">{req.title || "Untitled"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-600 font-medium">
                          {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>
                        {teamToggle === 'operations' && (
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold">
                              <div className={`w-1.5 h-1.5 rounded-full ${getStatusColorClass(req.status)}`}></div>
                              {getStatusDisplay(req.status)}
                            </div>
                          </td>
                        )}
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => router.push(`/om/work-reports/${req.id}`)} className="text-xs font-bold text-blue-600 hover:underline">
                            View
                          </button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Field Requests Column */}
          {teamToggle === 'operations' && (
            <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[600px]">
              <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  Field Requests
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={loadData} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                    Refresh
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                    <tr className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="px-5 py-3 w-[40%]">EMPLOYEE / DEST</th>
                      <th className="px-5 py-3 w-[25%]">DATE</th>
                      <th className="px-5 py-3 w-[25%]">STATUS</th>
                      <th className="px-5 py-3 w-[10%]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {(() => {
                      if (isDataLoading) {
                        return <tr><td colSpan={4} className="px-5 py-8 text-center text-sm font-semibold text-slate-500">Loading requests...</td></tr>;
                      }
                      if (errorMessage) {
                        return <tr><td colSpan={4} className="px-5 py-8 text-center text-sm font-semibold text-rose-500">Error: {errorMessage}</td></tr>;
                      }
                      if (fieldRequests.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="px-5 py-16 text-center">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <MapPin className="w-8 h-8 text-slate-300" />
                                <p className="text-sm font-bold text-slate-900">No Field Requests Found</p>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                      return fieldRequests.map((req, index) => (
                        <tr key={`fr-${req.id || index}`} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 text-sm">{req.employeeName || (req.employee?.firstName + " " + req.employee?.lastName)}</span>
                              <span className="font-medium text-slate-500 text-xs">{req.destination || "Unspecified"}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-600 font-medium">
                            {req.date ? new Date(req.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold">
                              <div className={`w-1.5 h-1.5 rounded-full ${getStatusColorClass(req.status)}`}></div>
                              {getStatusDisplay(req.status)}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => router.push(`/om/field-reports/${req.id}`)} className="text-xs font-bold text-blue-600 hover:underline">
                              View
                            </button>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function CtoReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading reports...</div>}>
      <CtoReportsContent />
    </Suspense>
  );
}
