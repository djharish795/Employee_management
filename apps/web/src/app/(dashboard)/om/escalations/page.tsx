"use client";

import React, { useState } from 'react';
import { 
  AlertTriangle, Filter, Search, ChevronRight, Eye, AlertOctagon, Clock 
} from 'lucide-react';
import { PremiumDashboardLayout, PremiumCard } from '@/components/shared/premium-dashboard';
import useSWR from 'swr';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export default function OmEscalationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch team reports and field requests
  const { data: reportsRes, isLoading: loadingReports } = useSWR('/work-reports/team', fetcher);
  const { data: fieldRes, isLoading: loadingFields } = useSWR('/field-work-requests/team', fetcher);

  const workReports = Array.isArray(reportsRes?.data || reportsRes) ? (reportsRes?.data || reportsRes) : [];
  const fieldRequests = Array.isArray(fieldRes?.data || fieldRes) ? (fieldRes?.data || fieldRes) : [];

  // Define what makes an "escalation"
  // For Work Reports: Priority is CRITICAL or HIGH, or Status is PENDING. We will just use CRITICAL and HIGH for escalations.
  const escalatedReports = workReports.filter((r: any) => r.priority === 'CRITICAL' || r.priority === 'HIGH')
    .map((r: any) => ({
      id: r.id,
      type: 'Work Report',
      title: r.title,
      employee: `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`,
      date: new Date(r.submittedAt || r.createdAt).toLocaleDateString(),
      severity: r.priority,
      status: r.status,
      link: `/om/reports/${r.id}`
    }));

  // For Field Requests: Status is PENDING
  const escalatedFields = fieldRequests.filter((r: any) => r.status === 'PENDING')
    .map((r: any) => ({
      id: r.id,
      type: 'Field Request',
      title: r.destination || 'Site Visit',
      employee: `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`,
      date: new Date(r.date || r.createdAt).toLocaleDateString(),
      severity: 'HIGH',
      status: r.status,
      link: `/om/field-requests/${r.id}`
    }));

  const allEscalations = [...escalatedReports, ...escalatedFields];

  const filteredEscalations = allEscalations.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.employee.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'HIGH': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <PremiumDashboardLayout className="p-0 bg-transparent min-h-0 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            Operations Escalations
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">High priority tasks, critical reports, and pending requests needing immediate OM attention.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PremiumCard className="p-5 flex items-center justify-between shadow-sm border border-rose-200 bg-rose-50/50">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-rose-100 text-rose-600">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Critical Reports</p>
            <h3 className="text-3xl font-black text-rose-900 leading-none">{escalatedReports.filter((r: any) => r.severity === 'CRITICAL').length}</h3>
          </div>
        </PremiumCard>
        
        <PremiumCard className="p-5 flex items-center justify-between shadow-sm border border-amber-200 bg-amber-50/50">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">High Priority</p>
            <h3 className="text-3xl font-black text-amber-900 leading-none">{escalatedReports.filter((r: any) => r.severity === 'HIGH').length}</h3>
          </div>
        </PremiumCard>

        <PremiumCard className="p-5 flex items-center justify-between shadow-sm border border-blue-200 bg-blue-50/50">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Pending Requests</p>
            <h3 className="text-3xl font-black text-blue-900 leading-none">{escalatedFields.length}</h3>
          </div>
        </PremiumCard>
      </div>

      {/* Table Container */}
      <PremiumCard className="p-0 overflow-hidden border border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="w-full relative max-w-md">
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Search Escalations</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by title or employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Title / Destination</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date Submitted</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Severity</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loadingReports || loadingFields ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-medium">Loading escalations...</td></tr>
              ) : filteredEscalations.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-medium">No active escalations.</td></tr>
              ) : filteredEscalations.map((esc: any) => (
                <tr key={esc.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">{esc.type}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{esc.title}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">{esc.employee}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{esc.date}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded border uppercase tracking-wide ${getSeverityColor(esc.severity)}`}>
                      {esc.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => router.push(esc.link)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PremiumCard>
    </PremiumDashboardLayout>
  );
}
