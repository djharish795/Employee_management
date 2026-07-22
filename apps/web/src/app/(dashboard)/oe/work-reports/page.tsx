"use client";

import React, { useState } from "react";
import { 
  Plus, Search, Filter,
  FileText, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, Eye
} from "lucide-react";
import { PremiumDashboardLayout, PremiumCard } from '@/components/shared/premium-dashboard';
import useSWR from 'swr';
import { apiClient } from '@/lib/api/client';
import { useRouter } from "next/navigation";

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export default function OeWorkReportsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  
  const { data: apiReports, error, isLoading } = useSWR('/work-reports/me', fetcher);

  const actualData = Array.isArray(apiReports) ? apiReports : (apiReports?.data || []);

  const displayReports = Array.isArray(actualData) 
    ? actualData.map((r: any) => {
        let dateStr = 'N/A';
        const dateVal = r.submittedAt || r.createdAt || r.date;
        if (dateVal) {
          const dateObj = new Date(dateVal);
          if (!isNaN(dateObj.getTime())) {
            dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '');
          }
        }
        return {
          id: r.id,
          reportType: r.reportType || 'N/A',
          title: r.title || 'N/A',
          date: dateStr,
          priority: r.priority || 'MEDIUM',
          status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase().replace('_', ' ') : 'Pending',
          reviewerName: r.reviewer ? `${r.reviewer.firstName} ${r.reviewer.lastName}` : 'N/A'
        };
      })
    : [];

  const filteredReports = displayReports.filter(r => {
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== "All Status" && r.status !== statusFilter) return false;
    return true;
  });

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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Work Reports</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">View and track your submitted operational reports.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push('/oe/work-reports/new')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-lg text-xs font-black transition-all shadow-sm">
            <Plus className="w-3.5 h-3.5" /> New Report
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <PremiumCard key={idx} className="p-4 flex items-center justify-between shadow-sm border border-slate-200">
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 leading-none">{stat.value}</h3>
            </div>
            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${stat.bgColor} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
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
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
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
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Report Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reviewer</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Priority</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500 font-medium">Loading reports...</td></tr>
              ) : filteredReports.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500 font-medium">No work reports found</td></tr>
              ) : filteredReports.map((report: any) => (
                <tr key={report.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">{report.reportType}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{report.title}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-500">{report.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{report.reviewerName}</td>
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
                    <button 
                      onClick={() => router.push(`/oe/work-reports/${report.id}`)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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
