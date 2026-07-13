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
import { assetsApi } from "@/lib/api/assets";
import { AssetRole } from "@/types/assets";

interface ReportsPanelProps {
  
}

const DEPT_ASSET_DATA = [
  { dept: "Engineering", count: 132, value: "₹68.4L", percent: 90, bg: "bg-violet-500", text: "text-violet-700" },
  { dept: "Design", count: 48, value: "₹22.1L", percent: 62, bg: "bg-blue-500", text: "text-blue-700" },
  { dept: "Sales", count: 76, value: "₹31.5L", percent: 80, bg: "bg-emerald-500", text: "text-emerald-700" },
  { dept: "HR", count: 24, value: "₹9.8L", percent: 55, bg: "bg-amber-500", text: "text-amber-700" },
  { dept: "Finance", count: 22, value: "₹8.4L", percent: 50, bg: "bg-rose-500", text: "text-rose-700" },
  { dept: "Leadership", count: 18, value: "₹15.2L", percent: 40, bg: "bg-sky-500", text: "text-sky-700" },
];

const MONTHLY_ADDITIONS = [
  { month: "Jan", count: 12 },
  { month: "Feb", count: 8 },
  { month: "Mar", count: 22 },
  { month: "Apr", count: 5 },
  { month: "May", count: 18 },
  { month: "Jun", count: 7 },
];

const CATEGORY_COLORS: Record<string, string> = {
  LAPTOP: "bg-violet-600",
  DESKTOP: "bg-blue-500",
  MONITOR: "bg-slate-700",
  MOBILE_DEVICE: "bg-emerald-500",
  SIM: "bg-amber-500",
  ACCESS_CARD: "bg-pink-500",
  SOFTWARE_LICENCE: "bg-sky-500",
  CLOUD_ACCOUNT: "bg-indigo-500",
  OTHER: "bg-slate-400",
};

export default function ReportsPanel() {
  const { role } = usePermissions();
  const isEmployee = role === "EMPLOYEE";

  const { data: summaryKpis, isLoading: summaryLoading } = useQuery({
    queryKey: ["kpiSummary"],
    queryFn: async () => assetsApi.kpiSummary(),
    enabled: !isEmployee,
  });

  const { data: financialKpis, isLoading: financialLoading } = useQuery({
    queryKey: ["kpiFinancials"],
    queryFn: async () => assetsApi.kpiFinancials(),
    enabled: !isEmployee,
  });

  const { data: categoryKpis, isLoading: categoryLoading } = useQuery({
    queryKey: ["kpiCategories"],
    queryFn: async () => assetsApi.kpiCategories(),
    enabled: !isEmployee,
  });

  const { data: trendsKpis, isLoading: trendsLoading } = useQuery({
    queryKey: ["kpiTrends"],
    queryFn: async () => assetsApi.kpiTrends(),
    enabled: !isEmployee,
  });

  const isLoading = summaryLoading || financialLoading || categoryLoading || trendsLoading;

  const data = React.useMemo(() => {
    if (!summaryKpis || !financialKpis) {
      return {
        totalAssets: 0,
        totalValue: 0,
        bookValue: 0,
        depreciation: 0,
        newThisMonth: 0,
        retiredThisMonth: 0,
      };
    }

    const totalInvestment = financialKpis.totalInvestment || 0;
    const activeValuation = financialKpis.activeValuation || 0;
    const depreciation = totalInvestment > 0 ? ((totalInvestment - activeValuation) / totalInvestment) * 100 : 0;
    const retiredCount = summaryKpis.countsByStatus?.RETIRED || 0;
    const newThisMonth = trendsKpis && trendsKpis.length > 0 ? trendsKpis[trendsKpis.length - 1].assetsProcured : 0;

    return {
      totalAssets: summaryKpis.totalAssetsCount || 0,
      totalValue: totalInvestment,
      bookValue: activeValuation,
      depreciation: depreciation.toFixed(1),
      newThisMonth,
      retiredThisMonth: retiredCount,
    };
  }, [summaryKpis, financialKpis, trendsKpis]);

  const categories = React.useMemo(() => {
    if (!categoryKpis) return [];
    return categoryKpis.map((cat: any) => ({
      category: cat.category.replace(/_/g, " "),
      total: cat.totalCount,
      assigned: cat.assignedCount,
      available: cat.availableCount,
      maintenance: cat.damagedCount,
      color: CATEGORY_COLORS[cat.category] || "bg-slate-400",
    }));
  }, [categoryKpis]);

  const monthlyAdditions = React.useMemo(() => {
    if (!trendsKpis) return [];
    return trendsKpis.map((t: any) => {
      const date = new Date(t.period + "-01");
      const monthName = date.toLocaleString('default', { month: 'short' });
      return { month: monthName, count: t.assetsProcured };
    }).slice(-6); // last 6 months
  }, [trendsKpis]);

  const maxAdditionCount = monthlyAdditions.length > 0 ? Math.max(...monthlyAdditions.map((m: any) => m.count), 1) : 1;
  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading reports...</div>;
  }

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString()}`;
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
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(data.totalValue)}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Original Cost Value</div>
          <div className="text-[10px] font-bold text-slate-400 mt-1">Across all assets</div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(data.bookValue)}</div>
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
                {categories.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${row.color}`} />
                        <span className="font-bold text-slate-900 capitalize">{row.category.toLowerCase()}</span>
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
          <h3 className="text-sm font-bold text-slate-900 mb-5">Monthly Asset Additions (Last 6 Months)</h3>
          <div className="h-44 flex items-end justify-between gap-3 px-2">
            {monthlyAdditions.map((item: any, idx: number) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded mb-1">
                  {item.count}
                </div>
                <div className="w-full bg-slate-100 rounded-t-lg h-32 flex items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-indigo-400 transition-all duration-500 hover:from-violet-700 hover:to-indigo-500"
                    style={{ height: `${Math.round((item.count / maxAdditionCount) * 100)}%` }}
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
                  <div className={`text-xs font-bold ${dept.text}`}>{dept.percent}%</div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${dept.bg} rounded-full transition-all duration-700`}
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
