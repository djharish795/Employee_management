"use client";

import React, { useState } from "react";
import { 
  Download, Target, Search, Filter,
  FileText, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, MoreVertical
} from "lucide-react";
import { PremiumDashboardLayout, PremiumCard } from '@/components/shared/premium-dashboard';
import useSWR from 'swr';
import { apiClient } from '@/lib/api/client';
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export default function OmFieldReportsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  
  const { data: apiReports, error, isLoading, mutate } = useSWR('/field-work-requests/team', fetcher);

  const displayReports = Array.isArray(apiReports) 
    ? apiReports.map((r: any) => {
        let dateStr = 'N/A';
        const dateVal = r.date;
        if (dateVal) {
          const dateObj = new Date(dateVal);
          if (!isNaN(dateObj.getTime())) {
            dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '');
          }
        }
        return {
          id: r.id,
          employee: { 
            name: r.employeeName || 'Unknown Employee', 
            avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${r.employeeName}` 
          },
          client: r.client || 'N/A',
          purpose: r.purpose || 'N/A',
          date: dateStr,
          destination: r.destination || 'N/A',
          status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase().replace('_', ' ') : 'Pending',
        };
      })
    : [];

  const filteredReports = displayReports.filter(r => {
    if (searchQuery && !r.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) && !r.client.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== "All Status" && r.status !== statusFilter) return false;
    return true;
  });

  const handleExportCSV = async () => {
    try {
      const response = await apiClient.get('/field-work-requests/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `field_reports_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Exported successfully');
    } catch {
      toast.error('Export failed. Please try again.');
    }
  };

  const handleStatusUpdate = async (id: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await apiClient.post(`/field-work-requests/${id}/approve`);
      } else {
        await apiClient.post(`/field-work-requests/${id}/reject`, { reason: 'Rejected by OM' });
      }
      toast.success(`Field report ${action}d successfully`);
      mutate();
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const pendingCount = displayReports.filter(r => r.status === 'Pending').length;
  const approvedCount = displayReports.filter(r => r.status === 'Approved').length;
  const rejectedCount = displayReports.filter(r => r.status === 'Rejected').length;

  const statCards = [
    { label: "PENDING", value: pendingCount.toString().padStart(2, '0'), icon: Target, color: "text-purple-600", bgColor: "bg-purple-50" },
    { label: "APPROVED", value: approvedCount.toString().padStart(2, '0'), icon: CheckCircle2, color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { label: "REJECTED", value: rejectedCount.toString().padStart(2, '0'), icon: XCircle, color: "text-rose-600", bgColor: "bg-rose-50" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "text-emerald-600";
      case "Rejected": return "text-rose-600";
      case "Pending": return "text-purple-600";
      default: return "text-slate-600";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-emerald-500";
      case "Rejected": return "bg-rose-500";
      case "Pending": return "bg-purple-500";
      default: return "bg-slate-400";
    }
  };

  return (
    <PremiumDashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Field Reports</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Review and manage field visit requests from your team.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportCSV} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <PremiumCard key={i} className="p-5 flex items-center justify-between gap-4 border-l-4" style={{ borderLeftColor: 'currentColor' }}>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </PremiumCard>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by employee or client..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium focus:outline-none"
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      {/* Table Area */}
      <PremiumCard className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Loading field reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-medium">No field reports found matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Client & Destination</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={report.employee.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-slate-100" />
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{report.employee.name}</p>
                          <p className="text-[11px] font-medium text-slate-500">{report.purpose}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{report.client}</p>
                      <p className="text-[11px] font-medium text-slate-500">{report.destination}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{report.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusDotColor(report.status)} shadow-sm`}></span>
                        <span className={`text-xs font-bold ${getStatusColor(report.status)}`}>{report.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 transition-opacity">
                        <button 
                          onClick={() => router.push(`/om/field-reports/${report.id}`)}
                          className="text-[11px] font-bold text-slate-500 hover:text-blue-600 px-2 py-1 bg-white border border-slate-200 rounded transition-colors"
                        >
                          VIEW
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-white shadow-lg border border-slate-200 z-[100]">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusUpdate(report.id, 'approve')} className="text-emerald-600 font-medium cursor-pointer hover:bg-emerald-50">
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(report.id, 'reject')} className="text-rose-600 font-medium cursor-pointer hover:bg-rose-50">
                              <XCircle className="w-4 h-4 mr-2" /> Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PremiumCard>
    </PremiumDashboardLayout>
  );
}
