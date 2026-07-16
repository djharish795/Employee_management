"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Inbox, CalendarDays, Settings } from "lucide-react";

export default function ConnectLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { title: "Find Someone", href: "/connect", icon: Search },
    { title: "My Requests", href: "/connect/requests", icon: Inbox },
    { title: "Upcoming Meetings", href: "/connect/meetings", icon: CalendarDays },
    { title: "Connect Settings", href: "/connect/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      <div className="p-8 max-w-[1400px] mx-auto w-full flex-1 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 bg-white/40 p-4 rounded-xl backdrop-blur-sm shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Connect Workspace</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Discover colleague availability and book meetings seamlessly.</p>
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
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : ''}`} />
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
