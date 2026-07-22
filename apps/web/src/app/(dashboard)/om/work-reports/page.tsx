"use client";

import React, { useState } from "react";
import { 
  Download, Plus, Search, Filter,
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

export default function OmWorkReportsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [reportTypeFilter, setReportTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  
  const { data: apiReports, error, isLoading, mutate } = useSWR('/work-reports/team', fetcher);

  const displayReports = Array.isArray(apiReports) 
    ? apiReports.map((r: any) => {
        let dateStr = 'N/A N/A N/A';
        const dateVal = r.submittedAt || r.createdAt || r.date;
        if (dateVal) {
          const dateObj = new Date(dateVal);
          if (!isNaN(dateObj.getTime())) {
            const parts = dateObj.toDateString().split(" ");
            // e.g. "Tue Jul 21 2026" -> parts: ["Tue", "Jul", "21", "2026"]
            // We want "Jul 21 2026"
            if (parts.length === 4) {
              dateStr = `${parts[1]} ${parts[2]} ${parts[3]}`;
            } else {
              dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '');
            }
          }
        }
        return {
          id: r.id,
          employee: { 
            name: `${r.employee?.firstName} ${r.employee?.lastName}`, 
            avatar: r.employee?.photoUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${r.employee?.firstName}` 
          },
          department: r.department || 'Unassigned',
          reportType: r.reportType || 'N/A',
          title: r.title || 'N/A',
          date: dateStr,
          priority: r.priority || 'MEDIUM',
          status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase().replace('_', ' ') : 'Pending',
        };
      })
    : [];

  const filteredReports = displayReports.filter(r => {
    if (searchQuery && !r.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (departmentFilter !== "All Departments" && r.department !== departmentFilter) return false;
    if (reportTypeFilter !== "All Types" && r.reportType !== reportTypeFilter) return false;
    if (statusFilter !== "All Status" && r.status !== statusFilter) return false;
    return true;
  });

  const handleExportCSV = async () => {
    try {
      const response = await apiClient.get('/work-reports/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `team_work_reports_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Exported successfully');
    } catch {
      toast.error('Export failed. Please try again.');
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await apiClient.patch(`/work-reports/${id}/review`, { status: newStatus });
      toast.success("Report status updated successfully");
      mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const pendingCount = displayReports.filter(r => r.status === 'Pending').length;
  const approvedCount = displayReports.filter(r => r.status === 'Approved').length;
  const rejectedCount = displayReports.filter(r => r.status === 'Rejected').length;
  const needsRevisionCount = displayReports.filter(r => r.status === 'Needs revision').length;

  const statCards = [
    { label: "PENDING", value: pendingCount.toString().padStart(2, '0'), icon: FileText, color: "text-purple-600", bgColor: "bg-purple-50" },
    { label: "APPROVED", value: approvedCount.toString().padStart(2, '0'), icon: CheckCircle2, color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { label: "REJECTED", value: rejectedCount.toString().padStart(2, '0'), icon: XCircle, color: "text-rose-600", bgColor: "bg-rose-50" },
    { label: "NEEDS REVISION", value: needsRevisionCount.toString().padStart(2, '0'), icon: Clock, color: "text-amber-600", bgColor: "bg-amber-50" },
  ];



  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return "bg-rose-100 text-rose-700";
      case "HIGH": return "bg-amber-100 text-amber-700";
      case "MEDIUM": return "bg-blue-100 text-blue-700";
      case "LOW": return "bg-slate-100 text-slate-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "text-emerald-600";
      case "Rejected": return "text-rose-600";
      case "Needs revision": return "text-amber-600";
      case "Pending": return "text-purple-600";
      default: return "text-slate-600";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-emerald-500";
      case "Rejected": return "bg-rose-500";
      case "Needs revision": return "bg-amber-500";
      case "Pending": return "bg-purple-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <PremiumDashboardLayout className="p-0 bg-transparent min-h-0 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Reports</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage and review operational submissions from all departments.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-lg transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <PremiumCard key={idx} className="p-5 flex items-center justify-between shadow-sm border border-slate-200">
            <div className="text-left">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 leading-none">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgColor} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </PremiumCard>
        ))}
      </div>

      {/* Main Table Container */}
      <PremiumCard className="p-0 overflow-hidden border border-slate-200 shadow-sm">
        {/* Filters */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 w-full relative">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Employee, title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
            </div>
            <div className="w-full lg:w-48">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Department</label>
              <select 
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all">
                <option>All Departments</option>
                <option>Digital Marketing</option>
                <option>CRM</option>
                <option>Operations</option>
                <option>Unassigned</option>
              </select>
            </div>
            <div className="w-full lg:w-48">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Report Type</label>
              <select 
                value={reportTypeFilter}
                onChange={(e) => setReportTypeFilter(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all">
                <option>All Types</option>
                <option>Daily Standup</option>
                <option>Weekly Sync</option>
                <option>Incident Report</option>
              </select>
            </div>
            <div className="w-full lg:w-48">
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all">
                <option>All Status</option>
                <option>Approved</option>
                <option>Pending</option>
                <option>Rejected</option>
                <option>Needs revision</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Report Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Priority</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={8} className="p-8 text-center text-slate-500 font-medium">Loading reports...</td></tr>
              ) : filteredReports.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-slate-500 font-medium">No team reports found</td></tr>
              ) : filteredReports.map((report: any) => (
                <tr key={report.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                        <img src={report.employee.avatar} alt={report.employee.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{report.employee.name?.split(' ')[0]}</div>
                        <div className="text-sm font-bold text-slate-500">{report.employee.name?.split(' ').slice(1).join(' ')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">{report.department}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">{report.reportType}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{report.title}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                    <div>{report.date.split(" ")[0]} {report.date.split(" ")[1]}</div>
                    <div className="text-[11px] font-medium text-slate-400">{report.date.split(" ")[2]}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wide ${getPriorityColor(report.priority)}`}>
                      {report.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(report.status)}`}></span>
                      <span className={`text-sm font-bold ${getStatusColor(report.status)}`}>{report.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => {
                          const role = window.location.pathname.split('/')[1];
                          router.push(`/${role}/work-reports/${report.id}`);
                        }}
                        className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-white shadow-lg border border-slate-200 z-[100]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusUpdate(report.id, 'APPROVED')} className="text-emerald-600 font-medium cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50 transition-colors duration-150">
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(report.id, 'NEEDS_REVISION')} className="text-amber-600 font-medium cursor-pointer hover:bg-amber-50 focus:bg-amber-50 transition-colors duration-150">
                            Needs Revision
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(report.id, 'REJECTED')} className="text-rose-600 font-medium cursor-pointer hover:bg-rose-50 focus:bg-rose-50 transition-colors duration-150">
                            Reject
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

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white">
          <div className="text-sm font-medium text-slate-500">
            Showing 1-{filteredReports.length} of {filteredReports.length} reports
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center justify-center">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </PremiumCard>
    </PremiumDashboardLayout>
  );
}
