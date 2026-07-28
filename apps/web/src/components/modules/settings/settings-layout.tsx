"use client";

import React from "react";
import { usePermissions } from "@/hooks/use-permissions";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Settings, Building2, Users, Shield, Lock, Bell, Workflow, FileCheck, Plug, ChevronDown, Check, ArrowLeft 
} from "lucide-react";
import { SettingsRole } from "@/types/settings";

interface SettingsLayoutProps {
  children: React.ReactNode;
  
}

const ALL_ROLES: SettingsRole[] = ["SUPER_ADMIN", "ADMIN", "HR_ADMIN", "IT_ADMIN", "COMPLIANCE_OFFICER"];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const { role } = usePermissions();
  const activeRole = role as any;
  const pathname = usePathname();

  const navItems = React.useMemo(() => {
    let items = [
      { title: "Overview", href: "/settings", icon: Settings },
      { title: "Organization", href: "/settings/organization", icon: Building2 },
      { title: "Users & Roles", href: "/settings/users", icon: Users },
      { title: "Security & Auth", href: "/settings/security", icon: Lock },
      { title: "Notifications", href: "/settings/notifications", icon: Bell },
      { title: "Workflows", href: "/settings/workflows", icon: Workflow },
      { title: "Compliance", href: "/settings/compliance", icon: FileCheck },
      { title: "Integrations", href: "/settings/integrations", icon: Plug },
    ];

    if (activeRole === "COMPLIANCE_OFFICER") {
      items = items.filter(item => ["/settings", "/settings/compliance", "/settings/organization"].includes(item.href));
    }
    if (activeRole === "HR_ADMIN") {
      items = items.filter(item => ["/settings", "/settings/organization", "/settings/users", "/settings/workflows", "/settings/notifications"].includes(item.href));
    }
    if (activeRole === "IT_ADMIN") {
      items = items.filter(item => ["/settings", "/settings/users", "/settings/security", "/settings/integrations", "/settings/notifications"].includes(item.href));
    }

    return items;
  }, [activeRole]);

  return (
    <div className="flex h-full bg-slate-50 font-sans overflow-hidden">
      
      {/* ── Left Admin Sidebar ─────────────────────────────────────────── */}
      <aside className="w-64 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 flex flex-col flex-shrink-0 z-20 border-r border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <h2 className="text-slate-900 dark:text-white text-lg font-black tracking-tight leading-tight">Enterprise Administration</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-1">Control Center</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Main Content Area ──────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-900 hidden sm:block">
              {navItems.find(i => i.href === pathname)?.title || "Settings"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8 relative">
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}
