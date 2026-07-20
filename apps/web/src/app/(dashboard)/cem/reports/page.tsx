"use client";
import toast from "react-hot-toast";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Download, FileSpreadsheet, BarChart2, ShoppingCart, 
  DollarSign, TrendingUp, Filter, MoreVertical, 
  Clock, Calendar, PenSquare, Trash2, CheckCircle2, Users
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
  const { hasPermission } = useRbac();
  const canApprove = hasPermission(Permission.APPROVE_FIELD_REQUESTS);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [activeTab, setActiveTab] = useState<'my-requests' | 'approvals'>('my-requests');
  const [localRequests, setLocalRequests] = useState<any[]>([]);
  const [teamRequests, setTeamRequests] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
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

  useEffect(() => {
    async function loadData() {
      if (!accessToken) return;
      setIsDataLoading(true);
      try {
        const own = await fetchMyFieldWork();
        setLocalRequests(own);

        if (canApprove) {
          const team = await fetchFieldWorkApprovals();
          setTeamRequests(team);
        }
      } catch (err) {
        console.error("Failed to load reports data", err);
      } finally {
        setIsDataLoading(false);
      }
    }
    loadData();
  }, [canApprove, accessToken]);

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
      case 'PENDING': return 'Under Review';
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'CANCELLED': return 'Cancelled';
      default: return status || 'Pending';
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
      case 'CANCELLED':
      case 'Cancelled':
        return 'bg-slate-300';
      default:
        return 'bg-slate-950 dark:bg-white animate-pulse';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-300">
      <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-[1600px] mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Reporting Suite</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Analyze performance, lead distribution, and revenue forecasts.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/cem/reports/field-request')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              Field Work Request
            </button>
            <button 
              onClick={() => handleGenerateReport('FIELD_WORK', 'PDF')}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button 
              onClick={() => handleGenerateReport('FIELD_WORK', 'XLSX')}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50">
              <FileSpreadsheet className="w-4 h-4" />
              CSV / Excel
            </button>
          </div>
        </div>

        {/* Reports Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Lead Reports */}
          <div 
            onClick={() => handleGenerateReport('LEAD', 'PDF')}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative group overflow-hidden cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-950 dark:bg-white rounded-l-xl"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg flex items-center justify-center">
                <BarChart2 className="w-6 h-6" />
              </div>
              <button className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                <span className="text-xl leading-none">→</span>
              </button>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Lead Reports</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Source tracking, conversion rates, and churn metrics.
            </p>
          </div>

          {/* Sales Reports */}          <div 
            onClick={() => handleGenerateReport('SALES', 'PDF')}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative group overflow-hidden cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-700 rounded-l-xl"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <button className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                <span className="text-xl leading-none">→</span>
              </button>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Sales Reports</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Individual quotas, team performance, and cycle time.
            </p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="w-full">
          
          {/* Recently Generated Table */}
          <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[550px]">
            <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              {canApprove ? (
                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab('my-requests')}
                    className={`pb-1 text-sm font-bold border-b-2 transition-all ${
                      activeTab === 'my-requests' 
                        ? 'border-slate-950 text-slate-950 dark:border-white dark:text-white' 
                        : 'border-transparent text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    My Requests
                  </button>
                  <button 
                    onClick={() => setActiveTab('approvals')}
                    className={`pb-1 text-sm font-bold border-b-2 transition-all ${
                      activeTab === 'approvals' 
                        ? 'border-slate-950 text-slate-950 dark:border-white dark:text-white' 
                        : 'border-transparent text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    Team Approvals
                  </button>
                </div>
              ) : (
                <h3 className="font-bold text-slate-900 dark:text-white">My Requests</h3>
              )}
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
                    <DropdownMenuItem onClick={async () => {
                      setIsDataLoading(true);
                      try {
                        const own = await fetchMyFieldWork();
                        setLocalRequests(own);
                        if (canApprove) {
                          const team = await fetchFieldWorkApprovals();
                          setTeamRequests(team);
                        }
                      } finally {
                        setIsDataLoading(false);
                      }
                    }} className="cursor-pointer">
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
                    <th className="px-5 py-4 w-[15%]">CATEGORY</th>
                    <th className="px-5 py-4 w-[15%]">DATE</th>
                    <th className="px-5 py-4 w-[15%]">STATUS</th>
                    <th className="px-5 py-4 w-[15%]">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {/* Local / Team Requests depending on tab */}
                  {(() => {
                    if (isDataLoading) {
                      return (
                        <tr>
                          <td colSpan={5} className="px-5 py-8 text-center text-sm font-semibold text-slate-500">
                            Loading requests...
                          </td>
                        </tr>
                      );
                    }
                    
                    const currentList = activeTab === 'my-requests' ? localRequests : teamRequests;
                    const filteredList = statusFilter === 'ALL' ? currentList : currentList.filter(req => req.status === statusFilter);

                    if (filteredList.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="px-5 py-16 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <FileSpreadsheet className="w-8 h-8 text-slate-300 dark:text-slate-700 animate-pulse" />
                              <p className="text-sm font-bold text-slate-900 dark:text-white">No Field Work Requests Found</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your submitted field work requests and drafts will appear here.</p>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return filteredList.map((req, index) => (
                      <tr key={`${activeTab}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors animate-in fade-in duration-300">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-900 dark:text-white text-sm">
                              {activeTab === 'my-requests' ? 'Field Work' : `Field Work (${req.employeeName})`}: {req.destination || "Unspecified"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded uppercase">FIELD</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {req.date ? new Date(req.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A'}
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
                                  onClick={() => router.push(`/cem/reports/field-request?id=${req.id}`)}
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
                                  onClick={() => router.push(`/cem/reports/${req.id}`)}
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
              const currentList = activeTab === 'my-requests' ? localRequests : teamRequests;
              const filteredList = statusFilter === 'ALL' ? currentList : currentList.filter(req => req.status === statusFilter);

              return !isDataLoading && filteredList.length > 0 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Showing {filteredList.length} request{filteredList.length !== 1 ? 's' : ''} {statusFilter !== 'ALL' && `(${statusFilter.toLowerCase()})`}
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
