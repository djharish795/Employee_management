"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { Users, Calendar, CheckCircle2, Clock, AlertTriangle, UserPlus, FileCheck, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
});
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth-storage");
    if (token) {
      const parsed = JSON.parse(token);
      if (parsed?.state?.accessToken) {
        config.headers.Authorization = `Bearer ${parsed.state.accessToken}`;
      }
    }
  }
  return config;
});

const kpiCards = [
  { label: "Total Headcount", value: "--", sub: "Active employees", color: "text-slate-900", icon: Users },
  { label: "Pending Leave Approvals", value: "--", sub: "Requires action", color: "text-amber-600", icon: Calendar },
  { label: "Attendance Rate Today", value: "--%", sub: "Present / Total", color: "text-emerald-600", icon: CheckCircle2 },
  { label: "Pending Onboarding", value: "--", sub: "New joiners", color: "text-indigo-600", icon: UserPlus },
];

export default function HrDashboardPage() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["hr-dashboard-metrics"],
    queryFn: async () => {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${url}/dashboard/metrics`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load metrics");
      return res.json();
    },
    retry: false,
  });

  const pendingLeaves = useQuery({
    queryKey: ["hr-pending-leaves"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/v1/leaves?status=PENDING&limit=5");
      return data;
    },
    retry: false,
  });

  return (
    <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">HR Operations Centre</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">People & Workforce Management Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/leaves/approvals" className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
            <FileCheck className="w-3.5 h-3.5" />
            Review Leave Queue
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          const kpiValue = (() => {
            if (isLoading) return "...";
            if (!metrics?.kpiData) return card.value;
            const found = metrics.kpiData.find((k: any) =>
              card.label === "Total Headcount" ? k.title === "Total Employees" : false
            );
            return found?.value ?? card.value;
          })();
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                  <p className={`text-2xl font-extrabold mt-1 ${card.color}`}>{kpiValue}</p>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Pending Leave Approvals Queue */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Pending Leave Approvals
            </h3>
            <Link href="/leaves/approvals" className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {pendingLeaves.isLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading leave queue...</div>
          ) : pendingLeaves.error || !pendingLeaves.data?.data?.length ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Queue is clear!</p>
              <p className="text-xs text-slate-400 mt-1">No pending leave requests.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Days</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {pendingLeaves.data.data.slice(0, 5).map((req: any) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{req.employee?.firstName} {req.employee?.lastName}</td>
                    <td className="px-5 py-3.5 text-[9px] uppercase tracking-wide text-slate-500">{req.leaveType?.name ?? req.type}</td>
                    <td className="px-5 py-3.5">{new Date(req.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – {new Date(req.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{req.totalDays}</td>
                    <td className="px-5 py-3.5">
                      <Link href="/leaves/approvals" className="text-xs font-bold text-indigo-600 hover:underline">Review →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">HR Quick Actions</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: "Add New Employee", href: "/employees/add", icon: UserPlus },
                { label: "View All Employees", href: "/employees", icon: Users },
                { label: "Leave Approvals", href: "/leaves/approvals", icon: FileCheck },
                { label: "Attendance Reports", href: "/attendance/reports", icon: TrendingUp },
                { label: "Compliance Centre", href: "/compliance", icon: CheckCircle2 },
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
