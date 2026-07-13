"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Activity, Search, Users, ChevronDown, Check } from "lucide-react";
import { AuditRole } from "@/types/audit";

import { useAuthStore } from "@/store/auth";
import { usePermissions } from "@/hooks/use-permissions";

interface AuditLayoutProps {
  children: React.ReactNode;
  
}

const ALL_ROLES: AuditRole[] = ["ADMIN", "IT_ADMIN", "COMPLIANCE_OFFICER", "HR", "CEO"];

export default function AuditLayout({ children }: AuditLayoutProps) {
  const pathname = usePathname();
  const { role, isExecutive } = usePermissions();
  const activeRole = role as string;
  const currentUserRole = useAuthStore((state) => state.role) || "EMPLOYEE";
  const isActualEmployee = currentUserRole === "EMPLOYEE";

  const navItems = React.useMemo(() => {
    let items = [
      { title: "Dashboard", href: "/audit", icon: Activity },
      { title: "Events Explorer", href: "/audit/events", icon: Search },
      { title: "User Activity", href: "/audit/users", icon: Users },
      { title: "Security Events", href: "/audit/security", icon: ShieldCheck },
    ];

    // Filter out Security Events for HR and CEO to reduce noise
    if (activeRole === "HR" || activeRole === "CEO") {
      items = items.filter((item) => item.href !== "/audit/security");
    }

    return items;
  }, [activeRole]);

  const subtitle = React.useMemo(() => {
    switch (activeRole) {
      case "COMPLIANCE_OFFICER":
        return "Monitor regulatory compliance and data access events.";
      case "HR":
        return "Track employee record modifications and workflow approvals.";
      case "CEO":
        return "Executive overview of system integrity and critical actions.";
      case "ADMIN":
      case "IT_ADMIN":
        return "Comprehensive system tracking, security monitoring, and log investigation.";
      default:
        return "Enterprise audit and activity logging.";
    }
  }, [activeRole]);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      <div className="p-8 max-w-[1500px] mx-auto w-full flex-1 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 bg-white/40 p-4 rounded-xl backdrop-blur-sm shadow-sm">
          <div>
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Audit & Security Logs
              </h1>

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
                  <Icon className={`w-3.5 h-3.5 ${isActive && item.title === 'Security Events' ? 'text-red-500' : ''}`} />
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
