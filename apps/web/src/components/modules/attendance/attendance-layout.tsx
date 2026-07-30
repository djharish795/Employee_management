"use client";

import React from "react";
import { usePermissions } from "@/hooks/use-permissions";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, CheckSquare, BarChart3, Clock } from "lucide-react";

type AttendanceRole = "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";

interface AttendanceLayoutProps {
  children: React.ReactNode;
  
}

export default function AttendanceLayout({ children }: AttendanceLayoutProps) {
  const { role } = usePermissions();
  const activeRole = role as any;
  const isEmployeeView = true; // Individual workspace is always employee view
  const pathname = usePathname();

  const navItems = React.useMemo(() => {
    const items = [
      { title: "Dashboard", href: "/attendance", icon: LayoutDashboard },
      { title: "History", href: "/attendance/history", icon: History },
      { title: "Regularization", href: "/attendance/regularization", icon: CheckSquare },
    ];

    // Team Leads have this in Team Workspace. CEO/CTO/HR will have this in Attendance Summary.
    if (["OM", "SUPER_ADMIN", "ADMIN", "IT"].includes(activeRole)) {
      items.push({ title: "Overtime Approvals", href: "/attendance/overtime", icon: Clock });
    }

    return items;
  }, [activeRole]);

  const roleLabel: Record<AttendanceRole, string> = {
    ADMIN: "Administrator",
    HR: "HR",
    CEO: "Executive",
    MANAGER: "Manager",
    EMPLOYEE: "Employee",
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      <div className="p-8 max-w-[1400px] mx-auto w-full flex-1 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 bg-white/40 p-4 rounded-xl backdrop-blur-sm shadow-sm">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Management</h1>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full border border-slate-200 uppercase tracking-wide">
                {roleLabel[activeRole as AttendanceRole] || "Employee"}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {isEmployeeView
                ? "Track your hours, daily logs and submit corrections."
                : "Monitor shift metrics, team punches and generate reports."}
            </p>
          </div>

          {/* Sub-route tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 w-full">{children}</div>
      </div>
    </div>
  );
}
