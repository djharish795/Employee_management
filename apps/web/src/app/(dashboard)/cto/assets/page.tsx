"use client";

import React, { useState } from 'react';
import { Search, Filter, Monitor, FileCode2, RefreshCw, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

// ─── Interfaces (No Hardcoded Mock Data) ─────────────────────────────────────────
interface AssetMetrics {
  totalDevices: number;
  softwareLicenses: number;
  dueForRefresh: number;
}

interface AssetRecord {
  id: string;
  assetName: string;
  category: 'Laptop' | 'Monitor' | 'Software' | 'Accessory';
  assignedToName: string;
  assignedToInitials: string;
  assignedDate: string;
  status: 'Active' | 'Due for refresh' | 'Inactive';
}

export default function CTOAssetsPage() {
  const role = useAuthStore((state) => state.role);

  // States waiting for backend population
  const [metrics, setMetrics] = useState<AssetMetrics | null>(null);
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Protect route
  if (role !== "CTO") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <Lock className="w-10 h-10 text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-6">
        
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total Devices</div>
              <Monitor className="w-5 h-5 text-slate-300" />
            </div>
            <div className="text-5xl font-extrabold text-slate-900">{metrics?.totalDevices || '--'}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Software Licences</div>
              <FileCode2 className="w-5 h-5 text-slate-300" />
            </div>
            <div className="text-5xl font-extrabold text-slate-900">{metrics?.softwareLicenses || '--'}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            {/* Orange side border accent */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500"></div>
            
            <div className="flex items-center justify-between mb-4 pl-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Due for Refresh</div>
              <RefreshCw className="w-5 h-5 text-orange-400" />
            </div>
            <div className="pl-2 flex flex-col gap-1">
              <div className="text-5xl font-extrabold text-orange-600">{metrics?.dueForRefresh || '--'}</div>
              <div className="text-sm font-medium text-slate-500">next 6 months</div>
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Asset Inventory</h3>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Asset</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Assigned To</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Assigned Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-sm font-medium text-slate-400">
                      Waiting for backend asset inventory data...
                    </td>
                  </tr>
                ) : (
                  assets.map(asset => (
                    <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{asset.assetName}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{asset.category}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                            {asset.assignedToInitials}
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{asset.assignedToName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{asset.assignedDate}</td>
                      <td className="px-6 py-4">
                        {asset.status === 'Active' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        ) : asset.status === 'Due for refresh' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-full border border-orange-100 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            Due for refresh
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            {asset.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="text-sm font-medium text-slate-500">
              Showing 1-8 of {totalCount}
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
              <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                8
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
