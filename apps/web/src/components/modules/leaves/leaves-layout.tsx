"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Send, FileCheck, Calendar, BookOpen, ChevronDown, Check } from "lucide-react";

type LeavesRole = "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";

interface LeavesLayoutProps {
  children: React.ReactNode;
  activeRole: LeavesRole;
  onRoleChange: (role: LeavesRole) => void;
}

export default function LeavesLayout({ children, activeRole, onRoleChange }: LeavesLayoutProps) {
  const pathname = usePathname();

  // Navigation sub-tabs filtered by active role
  const navItems = React.useMemo(() => {
    const items = [
      { title: "Dashboard", href: "/leaves", icon: LayoutDashboard },
      { title: "Apply Leave", href: "/leaves/apply", icon: Send },
      { title: "Leave Approvals", href: "/leaves/approvals", icon: FileCheck },
      { title: "Leave Calendar", href: "/leaves/calendar", icon: Calendar },
      { title: "Leave Policies", href: "/leaves/policies", icon: BookOpen },
    ];

    return items.filter((item) => {
      // Regular employees cannot see the approvals review subtab
      if (item.href === "/leaves/approvals") {
        return activeRole !== "EMPLOYEE";
      }
      return true;
    });
  }, [activeRole]);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      <div className="p-8 max-w-[1400px] mx-auto w-full flex-1 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 bg-white/40 p-4 rounded-xl backdrop-blur-sm shadow-sm">
          <div>
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Management</h1>
              
              {/* Dynamic Staging Active Role Switcher */}
              <div className="relative inline-block text-left group">
                <button className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-full transition-all shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse" />
                  View Config: <span className="text-slate-900 font-bold">{activeRole}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                <div className="absolute left-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 hidden group-hover:block z-50">
                  <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase border-b border-slate-100">Toggle Role View</div>
                  {(["ADMIN", "HR", "CEO", "MANAGER", "EMPLOYEE"] as LeavesRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => onRoleChange(role)}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-slate-50 flex items-center justify-between ${
                        activeRole === role ? "text-slate-900 bg-slate-100/50 font-bold" : "text-slate-600"
                      }`}
                    >
                      {role}
                      {activeRole === role && <Check className="w-3.5 h-3.5 text-slate-900" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {activeRole === "EMPLOYEE" ? "Track your vacation entitlements, apply for absences, and view holidays." : "Monitor department rosters, review timesheets, and approve time-off requests."}
            </p>
          </div>

          {/* Subnavigation Segment Tabs */}
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
