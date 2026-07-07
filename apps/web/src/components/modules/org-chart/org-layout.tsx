"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Network, Building2, GitFork, ChevronDown, Check } from "lucide-react";
import { OrgRole } from "@/types/org-chart";

import { useAuthStore } from "@/store/auth";

interface OrgLayoutProps {
  children: React.ReactNode;
  activeRole: OrgRole;
  onRoleChange: (role: OrgRole) => void;
}
const ALL_ROLES: OrgRole[] = ["ADMIN", "HR", "CEO", "CTO", "MANAGER", "EMPLOYEE"];
export default function OrgLayout({ children, activeRole, onRoleChange }: OrgLayoutProps) {
  const pathname = usePathname();
  const currentUserRole = useAuthStore((state) => state.role) || "EMPLOYEE";
  const effectiveRole = currentUserRole;

  const navItems = React.useMemo(() => {
    const items = [
      { title: "Dashboard", href: "/org-chart", icon: LayoutDashboard },
      { title: "Hierarchy", href: "/org-chart/hierarchy", icon: Network },
      { title: "Departments", href: "/org-chart/departments", icon: Building2 },
      { title: "Reporting Structure", href: "/org-chart/reporting", icon: GitFork },
    ];

    if (effectiveRole === "EMPLOYEE") {
      return items.filter((i) => i.title !== "Dashboard" && i.title !== "Departments");
    }

    return items;
  }, [effectiveRole]);

  const subtitle = React.useMemo(() => {
    switch (effectiveRole) {
      case "EMPLOYEE":
        return "Find colleagues and view the organization's structure.";
      case "MANAGER":
        return "View your reporting tree and manage team analytics.";
      case "HR":
        return "Manage departments, structure, and succession plans.";
      case "CEO":
      case "CTO":
        return "Executive overview of spans of control and headcount.";
      default:
        return "Organizational directory and structural management.";
    }
  }, [effectiveRole]);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      <div className="p-8 max-w-[1400px] mx-auto w-full flex-1 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 bg-white/40 p-4 rounded-xl backdrop-blur-sm shadow-sm">
          <div>
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Organization Management
              </h1>

              {/* Removed Dev Role Switcher */}
            </div>
            <p className="text-sm font-medium text-slate-500 mt-1">{subtitle}</p>
          </div>

          {/* Sub-nav Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg flex-shrink-0">
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
