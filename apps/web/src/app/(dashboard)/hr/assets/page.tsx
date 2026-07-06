"use client";

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Lock, Monitor, Laptop, Smartphone, Printer, Box } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

// ─── Interfaces (No Hardcoded Mock Data) ─────────────────────────────────────────
interface AssetMetrics {
  total: number;
  assigned: number;
  available: number;
  maintenance: number;
}

interface AssetRecord {
  id: string;
  assetId: string;
  name: string;
  category: string;
  assignedTo: string;
  location: string;
  status: 'Assigned' | 'Available' | 'Under Maintenance' | 'Retired';
  purchaseDate: string;
}

interface CategoryStats {
  laptop: number;
  monitor: number;
  mobile: number;
  printer: number;
  accessory: number;
  others: number;
}

export default function HRAssetsPage() {
  const role = useAuthStore((state) => state.role);

  // States waiting for backend population
  const [metrics, setMetrics] = useState<AssetMetrics | null>(null);
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Protect route
  if (role !== "HR") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <Lock className="w-10 h-10 text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm">Only HR personnel can view the Asset Management page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-6">
        
        {/* Page Header Area */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Asset Management</h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            Manage and track all company assets.
          </p>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
              <Box className="w-7 h-7 text-rose-600" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Assets</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{metrics?.total || '--'}</span>
              </div>
              <div className="text-xs font-medium text-slate-400 mt-0.5">All company assets</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Monitor className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Assigned Assets</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{metrics?.assigned || '--'}</span>
              </div>
              <div className="text-xs font-medium text-slate-400 mt-0.5">Currently assigned</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Box className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Available Assets</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{metrics?.available || '--'}</span>
              </div>
              <div className="text-xs font-medium text-slate-400 mt-0.5">Ready to assign</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <Box className="w-7 h-7 text-orange-500" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Under Maintenance</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{metrics?.maintenance || '--'}</span>
              </div>
              <div className="text-xs font-medium text-slate-400 mt-0.5">Being serviced</div>
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto flex-1">
            <div className="relative flex-1 md:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search by asset name or ID..." 
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 shadow-sm"
              />
            </div>
            
            <div className="relative">
              <select className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-slate-900 cursor-pointer shadow-sm">
                <option>All Categories</option>
                <option>Laptop</option>
                <option>Monitor</option>
                <option>Mobile</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-slate-900 cursor-pointer shadow-sm">
                <option>All Status</option>
                <option>Assigned</option>
                <option>Available</option>
                <option>Maintenance</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#850b29] hover:bg-[#660920] rounded-lg shadow-sm transition-colors shrink-0">
            <span className="text-lg leading-none mb-0.5">+</span> Add Asset
          </button>
        </div>

        {/* Main Content Split */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Asset Table */}
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-900">Asset ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-900">Asset Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-900">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-900">Assigned To</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-900">Location</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-900">Purchase Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-900 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center text-sm font-medium text-slate-400">
                        Waiting for backend asset inventory data...
                      </td>
                    </tr>
                  ) : (
                    assets.map(asset => (
                      <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">{asset.assetId}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{asset.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{asset.category}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{asset.assignedTo || '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{asset.location}</td>
                        <td className="px-6 py-4">
                          {asset.status === 'Assigned' ? (
                            <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded">
                              Assigned
                            </span>
                          ) : asset.status === 'Available' ? (
                            <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded">
                              Available
                            </span>
                          ) : asset.status === 'Under Maintenance' ? (
                            <span className="inline-flex items-center px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded">
                              Under Maintenance
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded">
                              Retired
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{asset.purchaseDate}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                            <button className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </button>
                            <button className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-sm font-medium text-slate-500">
                Showing 1 to 8 of {totalCount} assets
              </div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-900 text-white font-bold text-sm shadow-sm">
                  1
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                  2
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                  3
                </button>
                <span className="px-2 text-slate-400">...</span>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                  32
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Chart Area */}
          <div className="w-full lg:w-80 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col shrink-0 h-fit">
            <h3 className="text-base font-bold text-slate-900 mb-8">Asset Categories</h3>
            
            <div className="relative w-48 h-48 mx-auto mb-8">
              {/* Doughnut Chart Placeholder */}
              {categoryStats ? (
                <div className="w-full h-full rounded-full border-[16px] border-slate-100 border-t-rose-700 border-r-orange-400 border-b-blue-600 border-l-emerald-400 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{metrics?.total || 0}</div>
                    <div className="text-xs font-medium text-slate-500">Total</div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-400 border-4 border-dashed border-slate-200 rounded-full text-center p-4">
                  Waiting for backend chart data...
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                  Laptop
                </div>
                <span className="font-bold text-slate-900">{categoryStats?.laptop || '--'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  Monitor
                </div>
                <span className="font-bold text-slate-900">{categoryStats?.monitor || '--'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  Mobile
                </div>
                <span className="font-bold text-slate-900">{categoryStats?.mobile || '--'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                  Printer
                </div>
                <span className="font-bold text-slate-900">{categoryStats?.printer || '--'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  Accessory
                </div>
                <span className="font-bold text-slate-900">{categoryStats?.accessory || '--'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Others
                </div>
                <span className="font-bold text-slate-900">{categoryStats?.others || '--'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
