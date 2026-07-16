"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Download, FileSpreadsheet, BarChart2, ShoppingCart, 
  DollarSign, TrendingUp, Filter, MoreVertical, 
  Clock, Calendar, PenSquare, Trash2, CheckCircle2, Users
} from 'lucide-react';
import { useRbac } from '@/hooks/use-rbac';
import { Permission } from '@naprocs/types';

export default function CamReportsPage() {
  const router = useRouter();
  const { hasPermission } = useRbac();
  const canApprove = hasPermission(Permission.APPROVE_FIELD_REQUESTS);

  const [activeTab, setActiveTab] = useState<'my-requests' | 'approvals'>('my-requests');
  const [localRequests, setLocalRequests] = useState<any[]>([]);
  const [teamRequests, setTeamRequests] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Seed mock team requests if they do not exist
      const existingTeam = localStorage.getItem('team_field_requests');
      const mockApprovals = [
        {
          id: 'REQ-2023-0101',
          employeeName: 'Sweetha',
          employeeId: 'EMS-77490',
          department: 'Client Management',
          reportingManager: 'Junaid',
          client: 'Apex International Ltd.',
          destination: 'Corporate Office, Block C, Mumbai',
          purpose: 'Client coordination and monthly operational sync-up.',
          date: '2023-10-24',
          startTime: '10:00',
          endTime: '15:00',
          description: 'Meet client stakeholders, review performance metrics, and plan project scope expansion.',
          transportation: 'personal',
          returnTime: '16:00',
          contact: '+91 98765 43210',
          remarks: 'Awaiting site pass.',
          status: 'Under Review',
          fileName: 'Agenda_Doc.pdf',
          createdAt: '2023-10-18T10:15:00.000Z'
        },
        {
          id: 'REQ-2023-0102',
          employeeName: 'Rohan Sharma',
          employeeId: 'EMS-77495',
          department: 'Operations Support',
          reportingManager: 'Junaid',
          client: 'Global Logistics Corp.',
          destination: 'Warehouse Hub, Sector 4, Chennai',
          purpose: 'Audit of standard storage operations and logistics flow.',
          date: '2023-10-25',
          startTime: '09:00',
          endTime: '18:00',
          description: 'Inspect physical space, assess pick-and-pack workflow efficiency, and address staff feedback.',
          transportation: 'public',
          returnTime: '19:30',
          contact: '+91 87654 32109',
          remarks: 'Safety gear requested.',
          status: 'Approved',
          fileName: 'Warehouse_Guidelines.pdf',
          createdAt: '2023-10-17T09:00:00.000Z'
        }
      ];

      if (!existingTeam) {
        localStorage.setItem('team_field_requests', JSON.stringify(mockApprovals));
        setTeamRequests(mockApprovals);
      } else {
        setTeamRequests(JSON.parse(existingTeam));
      }

      // Load own requests
      const stored = localStorage.getItem('field_work_requests');
      if (stored) {
        setLocalRequests(JSON.parse(stored));
      }
    }
  }, []);

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
              onClick={() => router.push('/cam/reports/field-request')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              Field Work Request
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
              <FileSpreadsheet className="w-4 h-4" />
              CSV / Excel
            </button>
          </div>
        </div>

        {/* Reports Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Lead Reports */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative group overflow-hidden cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
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

          {/* Sales Reports */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative group overflow-hidden cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
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
                <h3 className="font-bold text-slate-900 dark:text-white">Recently Generated</h3>
              )}
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
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
                  {(activeTab === 'my-requests' ? localRequests : teamRequests).map((req, index) => (
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
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            req.status === 'Draft' 
                              ? 'bg-slate-400' 
                              : req.status === 'Approved' 
                              ? 'bg-emerald-500' 
                              : req.status === 'Rejected' 
                              ? 'bg-rose-500' 
                              : 'bg-slate-950 dark:bg-white animate-pulse'
                          }`}></div>
                          {req.status || 'Pending'}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button 
                          onClick={() => router.push(`/cam/reports/${req.id}`)}
                          className="text-sm font-bold text-slate-900 dark:text-white hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-white text-sm">Q3 Regional Lead Audit</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded uppercase">LEAD</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 12,<br/>2023</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 text-xs font-semibold">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        Ready
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button className="text-sm font-bold text-slate-900 dark:text-white hover:underline">Download</button>
                    </td>
                  </tr>
                  
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <BarChart2 className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-white text-sm">Monthly Revenue Reconciliation</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded uppercase">REVENUE</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 10,<br/>2023</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 text-xs font-semibold">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        Ready
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button className="text-sm font-bold text-slate-900 dark:text-white hover:underline">Download</button>
                    </td>
                  </tr>
                  
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-white text-sm">Pipeline Forecast 2024</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded uppercase">FORECAST</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 08,<br/>2023</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                        Processing
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:underline">Cancel</button>
                    </td>
                  </tr>
                  
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-white text-sm">AE Performance Dashboard</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded uppercase">SALES</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 05,<br/>2023</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 text-xs font-semibold">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        Ready
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button className="text-sm font-bold text-slate-900 dark:text-white hover:underline">Download</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Showing 1-10 of 42 reports</span>
              <div className="flex items-center gap-1 text-sm">
                <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium">&lt;</button>
                <button className="w-8 h-8 flex items-center justify-center bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded font-bold">1</button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-medium">2</button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-medium">3</button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-medium">&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>



    </div>
  );
}
