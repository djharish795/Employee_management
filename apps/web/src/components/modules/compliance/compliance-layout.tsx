"use client";

import React from "react";
import { usePermissions } from "@/hooks/use-permissions";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, Activity, FileCheck, ScrollText, Inbox, PieChart, ChevronDown, Check } from "lucide-react";
import { ComplianceRole } from "@/types/compliance";

import { useAuthStore } from "@/store/auth";

interface ComplianceLayoutProps {
  children: React.ReactNode;
  
}

const ALL_ROLES: ComplianceRole[] = ["CEO", "HR", "COMPLIANCE_OFFICER", "ADMIN", "LEGAL"];

export default function ComplianceLayout({ children }: ComplianceLayoutProps) {
  const { role } = usePermissions();
  const activeRole = role as any;
  const pathname = usePathname();
  const currentUserRole = useAuthStore((state) => state.role) || "EMPLOYEE";
  const isActualEmployee = currentUserRole === "EMPLOYEE";

  const navItems = React.useMemo(() => {
    let items = [
      { title: "Dashboard", href: "/compliance", icon: Activity },
      { title: "Consents", href: "/compliance/consents", icon: FileCheck },
      { title: "Policies", href: "/compliance/policies", icon: ScrollText },
      { title: "Requests", href: "/compliance/requests", icon: Inbox },
      { title: "Reports", href: "/compliance/reports", icon: PieChart },
    ];

    // Role-based visibility logic
    if (activeRole === "CEO") {
      items = items.filter(item => item.href === "/compliance" || item.href === "/compliance/reports");
    }

    return items;
  }, [activeRole]);

  const subtitle = React.useMemo(() => {
    switch (activeRole) {
      case "CEO": return "Executive compliance overview and health metrics.";
      case "HR": return "Manage employee consents, track policies, and handle HR-related requests.";
      case "COMPLIANCE_OFFICER": return "Full regulatory oversight, governance, and audit operations.";
      case "LEGAL": return "Draft policies, review complex requests, and ensure regulatory adherence.";
      case "ADMIN": return "System-wide compliance configuration and monitoring.";
      default: return "Enterprise compliance and governance.";
    }
  }, [activeRole]);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      <div className="p-8 max-w-[1600px] mx-auto w-full flex-1 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 bg-white/40 p-4 rounded-xl backdrop-blur-sm shadow-sm">
          <div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Compliance & Governance
              </h1>


            </div>
            <p className="text-sm font-medium text-slate-500 mt-2">{subtitle}</p>
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
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600' : ''}`} />
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
