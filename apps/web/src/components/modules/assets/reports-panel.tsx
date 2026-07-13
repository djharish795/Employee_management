import { usePermissions } from "@/hooks/use-permissions";
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertCircle,
  Download,
  BarChart3,
} from "lucide-react";
import { AssetRole } from "@/types/assets";

interface ReportsPanelProps {
  
}

const DEPT_ASSET_DATA = [
  { dept: "Engineering", count: 132, value: "₹68.4L", percent: 90 },
  { dept: "Design", count: 48, value: "₹22.1L", percent: 62 },
  { dept: "Sales", count: 76, value: "₹31.5L", percent: 80 },
  { dept: "HR", count: 24, value: "₹9.8L", percent: 55 },
  { dept: "Finance", count: 22, value: "₹8.4L", percent: 50 },
  { dept: "Leadership", count: 18, value: "₹15.2L", percent: 40 },
];

const MONTHLY_ADDITIONS = [
  { month: "Jan", count: 12 },
  { month: "Feb", count: 8 },
  { month: "Mar", count: 22 },
  { month: "Apr", count: 5 },
  { month: "May", count: 18 },
  { month: "Jun", count: 7 },
];

const maxCount = Math.max(...MONTHLY_ADDITIONS.map((m) => m.count));

const CATEGORY_BREAKDOWN = [
  { category: "Laptops", total: 154, assigned: 130, available: 18, maintenance: 6, color: "bg-violet-600" },
  { category: "Monitors", total: 98, assigned: 82, available: 12, maintenance: 4, color: "bg-slate-700" },
  { category: "Phones", total: 76, assigned: 72, available: 3, maintenance: 1, color: "bg-emerald-500" },
  { category: "Tablets", total: 24, assigned: 18, available: 5, maintenance: 1, color: "bg-amber-500" },
  { category: "Headsets", total: 44, assigned: 38, available: 5, maintenance: 1, color: "bg-pink-500" },
  { category: "Other", total: 16, assigned: 10, available: 5, maintenance: 1, color: "bg-slate-400" },
];

export default function ReportsPanel() {
  const { data: reportData } = useQuery({
    queryKey: ["assetReports"],
    queryFn: async () => ({
      totalAssets: 412,
      totalValue: 18200000,
      bookValue: 12600000,
      depreciation: 30.8,
      newThisMonth: 7,
      retiredThisMonth: 3,
    }),
  });

  const data = reportData ?? {
    totalAssets: 412,
    totalValue: 18200000,
    bookValue: 12600000,
    depreciation: 30.8,
    newThisMonth: 7,
    retiredThisMonth: 3,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Asset Reports & Analytics</h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Organizational overview — June 2026
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm">
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
              <Package className="w-4.5 h-4.5" />
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{data.totalAssets}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Total Assets</div>
          <div className="text-[10px] font-bold text-emerald-600 mt-1">
            +{data.newThisMonth} this month
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">₹1.82 Cr</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Original Cost Value</div>
          <div className="text-[10px] font-bold text-slate-400 mt-1">Across all assets</div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">₹1.26 Cr</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Current Book Value</div>
          <div className="text-[10px] font-bold text-amber-600 mt-1">
            {data.depreciation}% depreciated
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{data.retiredThisMonth}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Retired This Month</div>
          <div className="text-[10px] font-bold text-slate-400 mt-1">Disposed or archived</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Category Breakdown Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Breakdown by Category</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-2.5">Category</th>
                  <th className="px-5 py-2.5 text-center">Total</th>
                  <th className="px-5 py-2.5 text-center">Assigned</th>
                  <th className="px-5 py-2.5 text-center">Available</th>
                  <th className="px-5 py-2.5 text-center">Maint.</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-600 divide-y divide-slate-100">
                {CATEGORY_BREAKDOWN.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${row.color}`} />
                        <span className="font-bold text-slate-900">{row.category}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-slate-900">{row.total}</td>
                    <td className="px-5 py-3 text-center text-emerald-700 font-bold">{row.assigned}</td>
                    <td className="px-5 py-3 text-center text-slate-900 font-bold">{row.available}</td>
                    <td className="px-5 py-3 text-center text-amber-700 font-bold">{row.maintenance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Asset Addition Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-5">Monthly Asset Additions (H1 2026)</h3>
          <div className="h-44 flex items-end justify-between gap-3 px-2">
            {MONTHLY_ADDITIONS.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded mb-1">
                  {item.count}
                </div>
                <div className="w-full bg-slate-100 rounded-t-lg h-32 flex items-end">
                  <div
                    className="w-full rounded-t-lg bg-violet-600 transition-all duration-500 hover:bg-violet-700"
                    style={{ height: `${Math.round((item.count / maxCount) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-900">Assets by Department</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Utilization Rate
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DEPT_ASSET_DATA.map((dept, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{dept.dept}</div>
                    <div className="text-[10px] font-semibold text-slate-400">{dept.count} assets · {dept.value}</div>
                  </div>
                  <div className="text-xs font-bold text-violet-700">{dept.percent}%</div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-600 rounded-full transition-all duration-700"
                    style={{ width: `${dept.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
