"use client";

import React from "react";
import { usePermissions } from "@/hooks/use-permissions";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  BarChart3,
  ChevronDown,
  Check,
} from "lucide-react";
import { AssetRole } from "@/types/assets";

import { useAuthStore } from "@/store/auth";

interface AssetsLayoutProps {
  children: React.ReactNode;
  
}

const ALL_ROLES: AssetRole[] = ["IT_ADMIN", "ADMIN", "HR", "CEO", "MANAGER", "EMPLOYEE"];

export default function AssetsLayout({ children }: AssetsLayoutProps) {
  const { role } = usePermissions();
  const activeRole = role as any;
  const pathname = usePathname();
  const currentUserRole = useAuthStore((state) => state.role) || "EMPLOYEE";
  const isEmployeeLevel = ["EMPLOYEE", "MANAGER", "TEAM_LEAD"].includes(currentUserRole);
  const effectiveRole = isEmployeeLevel ? "EMPLOYEE" : activeRole;

  const navItems = React.useMemo(() => {
    const items = [
      { title: "Dashboard", href: "/assets", icon: LayoutDashboard },
      { title: "Inventory", href: "/assets/inventory", icon: Package },
      { title: "Requests", href: "/assets/requests", icon: ClipboardList },
      { title: "Reports", href: "/assets/reports", icon: BarChart3 },
    ];

    return items.filter((item) => {
      // Only IT_ADMIN and ADMIN can see full inventory and reports
      if (item.href === "/assets/inventory") {
        return ["IT_ADMIN", "ADMIN", "HR", "CEO"].includes(effectiveRole);
      }
      if (item.href === "/assets/reports") {
        return ["IT_ADMIN", "ADMIN", "CEO"].includes(effectiveRole);
      }
      return true;
    });
  }, [effectiveRole]);

  const subtitle = React.useMemo(() => {
    switch (effectiveRole) {
      case "EMPLOYEE":
        return "View your assigned assets and raise new asset requests.";
      case "MANAGER":
        return "Track team assets and approve or review asset requests.";
      case "HR":
        return "Monitor employee asset allocations across the organization.";
      case "IT_ADMIN":
        return "Full asset lifecycle management — provisioning, maintenance and audits.";
      case "CEO":
        return "Executive overview of organizational asset portfolio and utilization.";
      default:
        return "Manage the entire asset registry with full administrative control.";
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
                Asset Management
              </h1>


            </div>
            <p className="text-sm font-medium text-slate-500 mt-1">{subtitle}</p>
          </div>

          {/* Sub-nav Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg flex-shrink-0">
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
