"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { Search } from "lucide-react";
import { QuickContacts } from "./quick-contacts";
import { MeetingsList } from "./meetings-list";

export function ConnectWorkspace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await apiClient.get('/employees/org-chart');
        if (res.data) setEmployees(res.data);
      } catch (err) {
        console.error("Failed to fetch employees for search:", err);
      }
    };
    fetchEmployees();
  }, []);

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
        <div className="relative max-w-xl mx-auto shadow-sm rounded-2xl group z-10">
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
          
          {/* Search Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-200 max-h-64 overflow-y-auto">
              {employees
                .filter(e => {
                  const fullName = `${e.firstName || ""} ${e.lastName || ""}`.toLowerCase();
                  const role = e.designation?.title?.toLowerCase() || "";
                  const dept = e.department?.name?.toLowerCase() || "";
                  const query = searchQuery.toLowerCase();
                  const isCurrentUser = typeof window !== 'undefined' && localStorage.getItem('employeeId') === e.id;
                  if (isCurrentUser) return false;
                  return fullName.includes(query) || role.includes(query) || dept.includes(query);
                })
                .map((emp) => (
                  <button 
                    key={emp.id}
                    onClick={() => router.push(`/connect/${emp.id}`)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex flex-col transition-colors"
                  >
                    <span className="text-sm font-bold text-slate-900">{emp.firstName} {emp.lastName}</span>
                    <span className="text-xs font-medium text-slate-500">{emp.designation?.title || "Employee"} • {emp.department?.name || "Naprocs"}</span>
                  </button>
                ))}
              {/* Empty state */}
              {employees.filter(e => {
                  const fullName = `${e.firstName || ""} ${e.lastName || ""}`.toLowerCase();
                  const role = e.designation?.title?.toLowerCase() || "";
                  const dept = e.department?.name?.toLowerCase() || "";
                  const query = searchQuery.toLowerCase();
                  const isCurrentUser = typeof window !== 'undefined' && localStorage.getItem('employeeId') === e.id;
                  if (isCurrentUser) return false;
                  return fullName.includes(query) || role.includes(query) || dept.includes(query);
                }).length === 0 && (
                <div className="px-4 py-4 text-center text-sm font-medium text-slate-500">
                  No colleagues found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Contacts */}
      <div className="w-full">
        <QuickContacts onSelectContact={(id) => router.push(`/connect/${id}`)} employees={employees} />
      </div>

      {/* Lower Content Area */}
      <div className="w-full pb-8">
        <MeetingsList />
      </div>
    </div>
  );
}
