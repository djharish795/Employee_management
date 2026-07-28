"use client";
import toast from "react-hot-toast";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Download, FileSpreadsheet, BarChart2, ShoppingCart, 
  DollarSign, TrendingUp, Filter, MoreVertical, 
  Clock, Calendar, PenSquare, Trash2, CheckCircle2, Users,
  FileText, Plus, MapPin
} from 'lucide-react';
import { useRbac } from '@/hooks/use-rbac';
import { Permission } from '@naprocs/types';
import { fetchMyFieldWork, fetchFieldWorkApprovals } from '@/lib/api/field-work';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api/client';
import { reportsApi } from '@/lib/api/reports';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

export default function CamReportsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname.split('/')[1] || 'cem';
  const { hasPermission } = useRbac();
  const canApprove = hasPermission(Permission.APPROVE_FIELD_REQUESTS);

  const [activeTab, setActiveTab] = useState<'my-requests' | 'approvals'>('my-requests');
  const [localRequests, setLocalRequests] = useState<any[]>([]);
  const [teamRequests, setTeamRequests] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const handleGenerateReport = async (type: string, format: 'PDF' | 'XLSX') => {
    setIsGenerating(true);
    const toastId = toast.loading(`Generating ${type} report as ${format}...`);
    try {
      const response = await reportsApi.generateReport(type, format);
      // Wait briefly as it generates async in background 
      // (The endpoint returns a download ID usually, or directly a stream. 
      // Based on typical architecture, we might just need to navigate to the download URL)
      if (response?.data?.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
        toast.success(`Report downloaded successfully`, { id: toastId });
      } else if (response?.data?.id) {
        // Fallback: Use the explicit download endpoint if the API returns an ID
        const downloadRes = await reportsApi.getDownloadUrl(response.data.id);
        if (downloadRes?.data?.url) {
          window.open(downloadRes.data.url, '_blank');
          toast.success(`Report downloaded successfully`, { id: toastId });
        } else {
          toast.error("Could not retrieve download URL", { id: toastId });
        }
      } else {
        toast.success(`${type} report generated. Check your downloads or email.`, { id: toastId });
      }
    } catch (error) {
      console.error("Failed to generate report", error);
      toast.error("Failed to generate report", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const loadData = async () => {
    setIsDataLoading(true);
    setErrorMessage(null);
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 10000));
      const dataPromise = Promise.all([
        fetchMyFieldWork().catch(err => { console.error('fetchMyFieldWork error:', err); return []; }),
        apiClient.get('/work-reports/me').then(r => r?.data?.data || r?.data || []).catch(err => { console.error('work-reports/me error:', err); return []; })
      ]);

      const [fieldWork, myWorkReports] = await Promise.race([dataPromise, timeoutPromise]) as [any[], any[]];

      const mappedWorkReports = (Array.isArray(myWorkReports) ? myWorkReports : []).map((wr: any) => ({
        ...wr,
        type: 'WORK_REPORT',
        destination: wr.title,
        date: wr.submittedAt,
      }));

      setLocalRequests([...(Array.isArray(fieldWork) ? fieldWork : []), ...mappedWorkReports].sort((a: any, b: any) => 
        new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
      ));
    } catch (err: any) {
      console.error("Failed to load reports data", err);
      setErrorMessage(err.message || "Failed to load requests");
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [canApprove]);

  const handleDeleteRequest = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this request? This action cannot be undone.")) {
      try {
        await apiClient.delete(`/field-work-requests/${id}`);
        toast.success("Request deleted successfully.");
        // Re-fetch requests
        const own = await fetchMyFieldWork();
        setLocalRequests(own);
        if (canApprove) {
          const team = await fetchFieldWorkApprovals();
          setTeamRequests(team);
        }
      } catch (error: any) {
        console.error("Failed to delete request", error);
        toast.error(error?.response?.data?.message || "Failed to delete request.");
      }
    }
  };

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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Submissions</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Track and manage your personal reports and requests.</p>
          </div>
        </div>

        {/* Quick Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          {/* Submit Work Report */}
          <div 
            onClick={() => {
              router.push(`/${basePath}/work-reports/new`);
            }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-900/50 p-4 shadow-sm relative group overflow-hidden cursor-pointer hover:border-blue-400 dark:hover:border-blue-700 transition-colors"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 rounded-l-xl"></div>
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <button className="text-blue-400 group-hover:text-blue-600 transition-colors bg-blue-50 dark:bg-blue-900/30 w-7 h-7 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Submit Work Report</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Draft and submit your daily or weekly progress update to your manager.
            </p>
          </div>

          {/* Request Field Work */}          
          <div 
            onClick={() => {
              router.push(`/${basePath}/reports/field-request`);
            }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-purple-200 dark:border-purple-900/50 p-4 shadow-sm relative group overflow-hidden cursor-pointer hover:border-purple-400 dark:hover:border-purple-700 transition-colors"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-600 rounded-l-xl"></div>
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <button className="text-purple-400 group-hover:text-purple-600 transition-colors bg-purple-50 dark:bg-purple-900/30 w-7 h-7 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Request Field Work</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Submit a formal request for upcoming on-site field visits or travel.
            </p>
          </div>

          {/* Stats Summary */}
          <div className="bg-slate-950 dark:bg-slate-900 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <BarChart2 className="w-16 h-16 text-white" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 z-10">Pending Approvals</p>
            <h3 className="text-3xl font-black text-white mb-1 z-10">
              {localRequests.filter(r => r.status === 'PENDING' || r.status === 'Pending').length}
            </h3>
            <p className="text-[11px] text-slate-400 z-10">Waiting on review.</p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Work Reports Table */}
          <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[550px]">
            <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Work Reports
              </h3>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors relative">
                      <Filter className="w-4 h-4" />
                      {statusFilter !== 'ALL' && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full border border-white dark:border-slate-900"></span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setStatusFilter('ALL')} className="cursor-pointer">
                      <span className={statusFilter === 'ALL' ? 'font-bold' : ''}>All Requests</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('DRAFT')} className="cursor-pointer">
                      <span className={statusFilter === 'DRAFT' ? 'font-bold' : ''}>Drafts</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('PENDING')} className="cursor-pointer">
                      <span className={statusFilter === 'PENDING' ? 'font-bold' : ''}>Under Review</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('APPROVED')} className="cursor-pointer">
                      <span className={statusFilter === 'APPROVED' ? 'font-bold text-emerald-600' : 'text-emerald-600'}>Approved</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('REJECTED')} className="cursor-pointer">
                      <span className={statusFilter === 'REJECTED' ? 'font-bold text-rose-600' : 'text-rose-600'}>Rejected</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('CANCELLED')} className="cursor-pointer">
                      <span className={statusFilter === 'CANCELLED' ? 'font-bold' : ''}>Cancelled</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <DropdownMenuItem onClick={loadData} className="cursor-pointer">
                      Refresh Data
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
                  <tr className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="px-5 py-4 w-[40%]">REPORT NAME</th>
                    <th className="px-5 py-4 w-[20%]">DATE</th>
                    <th className="px-5 py-4 w-[20%]">STATUS</th>
                    <th className="px-5 py-4 w-[20%]">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {(() => {
                    if (isDataLoading) {
                      return (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center text-sm font-semibold text-slate-500">
                            Loading reports...
                          </td>
                        </tr>
                      );
                    }

                    if (errorMessage) {
                      return (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center text-sm font-semibold text-rose-500">
                            Error: {errorMessage}
                          </td>
                        </tr>
                      );
                    }
                    
                    const currentList = localRequests;
                    const filteredList = statusFilter === 'ALL' ? currentList : currentList.filter(req => req.status === statusFilter);
                    const workReportsList = filteredList.filter(req => req.type === 'WORK_REPORT');

                    if (workReportsList.length === 0) {
                      return (
                        <tr>
                          <td colSpan={4} className="px-5 py-16 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <FileSpreadsheet className="w-8 h-8 text-slate-300 dark:text-slate-700 animate-pulse" />
                              <p className="text-sm font-bold text-slate-900 dark:text-white">No Work Reports Found</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your submitted work reports will appear here.</p>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return workReportsList.map((req, index) => (
                      <tr key={`wr-${req.id || index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors animate-in fade-in duration-300">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-900 dark:text-white text-sm">
                              {req.destination || "Unspecified"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {req.date && !isNaN(new Date(req.date).getTime()) ? new Date(req.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-slate-650 dark:text-slate-350 text-xs font-semibold">
                            <div className={`w-1.5 h-1.5 rounded-full ${getStatusColorClass(req.status)}`}></div>
                            {getStatusDisplay(req.status)}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => router.push(`/${basePath}/work-reports/${req.id}`)}
                              className="text-sm font-bold text-slate-900 dark:text-white hover:underline"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            
            {(() => {
              const currentList = localRequests;
              const filteredList = statusFilter === 'ALL' ? currentList : currentList.filter(req => req.status === statusFilter);
              const workReportsList = filteredList.filter(req => req.type === 'WORK_REPORT');

              return !isDataLoading && workReportsList.length > 0 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Showing {workReportsList.length} report{workReportsList.length !== 1 ? 's' : ''} {statusFilter !== 'ALL' && `(${statusFilter.toLowerCase()})`}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Field Requests Table */}
          <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[550px]">
            <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-500" />
                Field Requests
              </h3>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors relative">
                      <Filter className="w-4 h-4" />
                      {statusFilter !== 'ALL' && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full border border-white dark:border-slate-900"></span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setStatusFilter('ALL')} className="cursor-pointer">
                      <span className={statusFilter === 'ALL' ? 'font-bold' : ''}>All Requests</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('DRAFT')} className="cursor-pointer">
                      <span className={statusFilter === 'DRAFT' ? 'font-bold' : ''}>Drafts</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('PENDING')} className="cursor-pointer">
                      <span className={statusFilter === 'PENDING' ? 'font-bold' : ''}>Under Review</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('APPROVED')} className="cursor-pointer">
                      <span className={statusFilter === 'APPROVED' ? 'font-bold text-emerald-600' : 'text-emerald-600'}>Approved</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('REJECTED')} className="cursor-pointer">
                      <span className={statusFilter === 'REJECTED' ? 'font-bold text-rose-600' : 'text-rose-600'}>Rejected</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('CANCELLED')} className="cursor-pointer">
                      <span className={statusFilter === 'CANCELLED' ? 'font-bold' : ''}>Cancelled</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <DropdownMenuItem onClick={loadData} className="cursor-pointer">
                      Refresh Data
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
                  <tr className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="px-5 py-4 w-[40%]">DESTINATION</th>
                    <th className="px-5 py-4 w-[20%]">DATE</th>
                    <th className="px-5 py-4 w-[20%]">STATUS</th>
                    <th className="px-5 py-4 w-[20%]">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {(() => {
                    if (isDataLoading) {
                      return (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center text-sm font-semibold text-slate-500">
                            Loading requests...
                          </td>
                        </tr>
                      );
                    }

                    if (errorMessage) {
                      return (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center text-sm font-semibold text-rose-500">
                            Error: {errorMessage}
                          </td>
                        </tr>
                      );
                    }
                    
                    const currentList = localRequests;
                    const filteredList = statusFilter === 'ALL' ? currentList : currentList.filter(req => req.status === statusFilter);
                    const fieldRequestsList = filteredList.filter(req => req.type !== 'WORK_REPORT');

                    if (fieldRequestsList.length === 0) {
                      return (
                        <tr>
                          <td colSpan={4} className="px-5 py-16 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <MapPin className="w-8 h-8 text-slate-300 dark:text-slate-700 animate-pulse" />
                              <p className="text-sm font-bold text-slate-900 dark:text-white">No Field Requests Found</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your submitted field requests will appear here.</p>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return fieldRequestsList.map((req, index) => (
                      <tr key={`fr-${req.id || index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors animate-in fade-in duration-300">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-900 dark:text-white text-sm">
                              {req.destination || "Unspecified"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {req.date && !isNaN(new Date(req.date).getTime()) ? new Date(req.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-slate-650 dark:text-slate-350 text-xs font-semibold">
                            <div className={`w-1.5 h-1.5 rounded-full ${getStatusColorClass(req.status)}`}></div>
                            {getStatusDisplay(req.status)}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {req.status === 'DRAFT' || req.status === 'Draft' ? (
                              <>
                                <button 
                                  onClick={() => router.push(`/${basePath}/reports/field-request?id=${req.id}`)}
                                  className="text-sm font-bold text-slate-900 dark:text-white hover:underline"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteRequest(req.id)}
                                  className="text-sm font-bold text-rose-600 hover:text-rose-700 hover:underline"
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => router.push(`/${basePath}/reports/${req.id}`)}
                                  className="text-sm font-bold text-slate-900 dark:text-white hover:underline"
                                >
                                  View
                                </button>
                                {(req.status === 'CANCELLED' || req.status === 'Cancelled') && (
                                  <button 
                                    onClick={() => handleDeleteRequest(req.id)}
                                    className="text-sm font-bold text-rose-600 hover:text-rose-700 hover:underline"
                                    title="Delete from list"
                                  >
                                    Delete
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            
            {(() => {
              const currentList = localRequests;
              const filteredList = statusFilter === 'ALL' ? currentList : currentList.filter(req => req.status === statusFilter);
              const fieldRequestsList = filteredList.filter(req => req.type !== 'WORK_REPORT');

              return !isDataLoading && fieldRequestsList.length > 0 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Showing {fieldRequestsList.length} request{fieldRequestsList.length !== 1 ? 's' : ''} {statusFilter !== 'ALL' && `(${statusFilter.toLowerCase()})`}
                  </span>
                </div>
              );
            })()}
          </div>
          
        </div>
      </div>



    </div>
  );
}
