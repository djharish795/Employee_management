"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Send, FileCheck, Calendar, BookOpen } from "lucide-react";

type LeavesRole = "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";

interface LeavesLayoutProps {
  children: React.ReactNode;
  activeRole: LeavesRole;
}

export default function LeavesLayout({ children, activeRole }: LeavesLayoutProps) {
  const pathname = usePathname();

  const navItems = React.useMemo(() => {
    const items = [
      { title: "Dashboard", href: "/leaves", icon: LayoutDashboard },
      { title: "Apply Leave", href: "/leaves/apply", icon: Send },
      { title: "My Requests", href: "/leaves/history", icon: FileCheck },
      { title: "Leave Approvals", href: "/leaves/approvals", icon: FileCheck },
      { title: "Leave Calendar", href: "/leaves/calendar", icon: Calendar },
      { title: "Leave Policies", href: "/leaves/policies", icon: BookOpen },
    ];

    return items.filter((item) => {
      // Employees and CEO cannot see the approval review tab
      // CEO has read-only access on their Executive Dashboard instead
      if (item.href === "/leaves/approvals") {
        return !["EMPLOYEE", "CEO"].includes(activeRole);
      }
      // Employee cannot apply leave for others — only for themselves
      return true;
    });
  }, [activeRole]);

  const roleLabel: Record<LeavesRole, string> = {
    ADMIN: "Administrator",
    HR: "HR & People Ops",
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
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Management</h1>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full border border-slate-200 uppercase tracking-wide">
                {roleLabel[activeRole]}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {activeRole === "EMPLOYEE"
                ? "Track your vacation entitlements, apply for absences, and view holidays."
                : "Monitor department rosters, review timesheets, and approve time-off requests."}
            </p>
          </div>

          {/* Sub-navigation tabs */}
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

        {/* Content Body */}
        <div className="flex-1 w-full">{children}</div>
      </div>
    </div>
  );
}
