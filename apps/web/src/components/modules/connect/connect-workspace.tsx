"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { QuickContacts } from "./quick-contacts";
import { MeetingsList } from "./meetings-list";

export function ConnectWorkspace() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  return (
    <div className="w-full flex flex-col gap-10">
      {/* Hero Section */}
      <div className="text-center pt-8 pb-4 max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Who do you want to meet?
        </h2>
        <p className="text-base text-slate-500 font-medium mb-8">
          Find a colleague's availability and book a time that works for both of you.
        </p>

        {/* Large Search Bar */}
        <div className="relative max-w-xl mx-auto shadow-sm rounded-2xl group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full h-14 pl-14 pr-6 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-base shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:border-slate-300"
            placeholder="Search by name, role, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Access Contacts */}
      <div className="w-full">
        <QuickContacts onSelectContact={(id) => router.push(`/connect/${id}`)} />
      </div>

      {/* Lower Content Area */}
      <div className="w-full pb-8">
        <MeetingsList />
      </div>
    </div>
  );
}
