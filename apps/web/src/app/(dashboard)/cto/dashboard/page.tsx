"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { Users, CalendarCheck, TrendingUp, Clock, ArrowRight, CheckCircle2, Code2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function CtoDashboardPage() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["cto-dashboard-metrics"],
    queryFn: async () => {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${url}/dashboard/metrics`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    retry: false,
  });

  const kpiCards = [
    {
      label: "Tech Team Headcount",
      icon: Users,
      value: isLoading ? "..." : (metrics?.kpiData?.find((k: any) => k.title === "Total Employees")?.value ?? "--"),
      sub: "Engineering & Product",
      color: "text-slate-900",
    },
    {
      label: "Team Attendance Today",
      icon: CalendarCheck,
      value: isLoading ? "..." : (metrics?.kpiData?.find((k: any) => k.title === "Attendance Rate")?.value ?? "--%"),
      sub: "Present today",
      color: "text-emerald-600",
    },
    {
      label: "Pending Leave Approvals",
      icon: Clock,
      value: isLoading ? "..." : (metrics?.kpiData?.find((k: any) => k.title === "Pending Leaves")?.value ?? "--"),
      sub: "Requires your action",
      color: "text-amber-600",
    },
    {
      label: "Performance Reviews",
      icon: TrendingUp,
      value: "--",
      sub: "Q2 2026 in progress",
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Technology Operations</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">CTO Dashboard — Engineering & Product Overview</p>
        </div>
        <Link href="/leaves/approvals" className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
          Review Team Leave Queue
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                  <p className={`text-2xl font-extrabold mt-1 ${card.color}`}>{card.value}</p>
                  <p className="text-[10px] font-semibold text-slate-500 mt-1">{card.sub}</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Attendance Summary */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-slate-600" />
              Team Attendance Summary
            </h3>
            <Link href="/attendance" className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1">
              Full Report <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-8 text-center">
            <CalendarCheck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">Attendance data loads from the backend.</p>
            <p className="text-xs text-slate-400 mt-1">View the full Attendance module for detailed reports.</p>
            <Link href="/attendance" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">
              Go to Attendance <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">CTO Quick Actions</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: "View Team Members", href: "/employees", icon: Users },
                { label: "Leave Approvals", href: "/leaves/approvals", icon: CheckCircle2 },
                { label: "Team Attendance", href: "/attendance", icon: CalendarCheck },
                { label: "Performance Reviews", href: "/performance", icon: TrendingUp },
                { label: "Org Chart", href: "/org-chart", icon: Code2 },
              ].map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href} className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    {link.label}
                    <ArrowRight className="w-3 h-3 ml-auto text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
