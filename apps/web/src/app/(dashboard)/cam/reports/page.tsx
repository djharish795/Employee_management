"use client";

import React from 'react';
import { 
  Download, FileSpreadsheet, BarChart2, ShoppingCart, 
  DollarSign, TrendingUp, Filter, MoreVertical, 
  Clock, Calendar, PenSquare, Trash2, CheckCircle2
} from 'lucide-react';

export default function CamReportsPage() {
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

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Lead Reports */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative group overflow-hidden cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 rounded-l-xl"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
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
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative group overflow-hidden cursor-pointer hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-400 rounded-l-xl"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-lg flex items-center justify-center">
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

          {/* Revenue Reports */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative group overflow-hidden cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 rounded-l-xl"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <button className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                <span className="text-xl leading-none">→</span>
              </button>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Revenue Reports</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              MRR, ARR, expansion revenue, and billing cycles.
            </p>
          </div>

          {/* Forecast Reports */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative group overflow-hidden cursor-pointer hover:border-rose-300 dark:hover:border-rose-700 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-400 rounded-l-xl"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <button className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                <span className="text-xl leading-none">→</span>
              </button>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Forecast Reports</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Predictive pipeline modeling and expected deal closures.
            </p>
          </div>

        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Recently Generated Table */}
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[500px]">
            <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Recently Generated</h3>
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
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-white text-sm">Q3 Regional Lead Audit</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded uppercase">LEAD</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 12,<br/>2023</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 text-xs font-semibold">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        Ready
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Download</button>
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
                      <span className="px-2 py-1 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded uppercase">REVENUE</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 10,<br/>2023</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 text-xs font-semibold">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        Ready
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Download</button>
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
                      <span className="px-2 py-1 text-[10px] font-bold bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded uppercase">FORECAST</span>
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
                      <span className="px-2 py-1 text-[10px] font-bold bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded uppercase">SALES</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 05,<br/>2023</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 text-xs font-semibold">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        Ready
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Download</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Showing 1-10 of 42 reports</span>
              <div className="flex items-center gap-1 text-sm">
                <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium">&lt;</button>
                <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded font-bold">1</button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-medium">2</button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-medium">3</button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-medium">&gt;</button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-6">
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Scheduled Jobs</h3>
                <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  New Schedule
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Revenue Sync</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Every Monday at 08:00 AM</p>
                    </div>
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white dark:border-slate-950 flex items-center justify-center text-[8px] font-bold text-blue-700">JE</div>
                      <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white dark:border-slate-950 flex items-center justify-center text-[8px] font-bold text-emerald-700">AL</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><PenSquare className="w-3.5 h-3.5" /></button>
                      <button className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Lead Attribution</h4>
                      <p className="text-xs text-slate-500 mt-0.5">1st of every month</p>
                    </div>
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-orange-100 border-2 border-white dark:border-slate-950 flex items-center justify-center text-[8px] font-bold text-orange-700">RH</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><PenSquare className="w-3.5 h-3.5" /></button>
                      <button className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0B152B] p-6 rounded-xl relative overflow-hidden text-center shadow-lg border border-slate-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
              <h3 className="text-white font-bold mb-1">Advanced Insights</h3>
              <p className="text-xs text-slate-400 tracking-wider mb-4 uppercase">ENTERPRISE PRO</p>
              <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-colors shadow-sm">
                Upgrade Suite
              </button>
            </div>
            
          </div>
        </div>

      </div>

      {/* Bottom Footer/Action Bar */}
      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shrink-0 sticky bottom-0 z-10 w-full">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">System Status: Operational</span>
          </div>
          <span className="text-xs text-slate-500">Last data sync: 2 mins ago</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            Cancel
          </button>
          <button className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-sm font-bold shadow-sm transition-colors">
            Generate New Report
          </button>
        </div>
      </div>

    </div>
  );
}
