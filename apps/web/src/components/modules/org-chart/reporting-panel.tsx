"use client";

import React, { useState, useMemo } from "react";
import { GitFork, ArrowUp, UserCircle, Search, HelpCircle, Loader2 } from "lucide-react";
import { OrgRole, OrgEmployee } from "@/types/org-chart";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

interface ReportingPanelProps {
  activeRole: string;
}

export default function ReportingPanel({ activeRole }: ReportingPanelProps) {
  const isPrivileged = ["ADMIN", "HR", "CEO", "CTO", "SUPER_ADMIN"].includes(activeRole);

  const { data: employees = [], isLoading } = useQuery<OrgEmployee[]>({
    queryKey: ["org-chart-flat-reporting"],
    queryFn: async () => {
      const { data } = await apiClient.get("/employees/org-chart");
      const emps = Array.isArray(data) ? data : (data.employees || []);
      const colors = [
        "bg-rose-100 text-rose-700",
        "bg-amber-100 text-amber-700",
        "bg-blue-100 text-blue-700",
        "bg-emerald-100 text-emerald-700",
        "bg-violet-100 text-violet-700",
        "bg-cyan-100 text-cyan-700"
      ];

      return emps.map((e: any, index: number) => {
        const nameStr = e.name ? String(e.name) : `${e.firstName || ""} ${e.lastName || ""}`.trim();
        return {
          ...e,
          designation: typeof e.designation === 'object' && e.designation ? e.designation.title || "" : String(e.designation || ""),
          name: nameStr,
          initials: `${e.firstName?.[0] || nameStr?.[0] || "U"}${e.lastName?.[0] || ""}`.toUpperCase(),
          avatarBg: colors[index % colors.length],
          gender: e.gender || 'UNKNOWN',
          managerId: e.reportingManagerId || e.managerId || null
        };
      });
    }
  });

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Default to a relevant employee if none selected
  const targetId = useMemo(() => {
    if (selectedId) return selectedId;
    if (employees.length === 0) return null;

    // Try to find an employee matching the active role, otherwise just use the first employee
    const fallback = employees.find(e => String(e.designation || "").toUpperCase().includes(activeRole)) || employees[0];
    return fallback?.id || null;
  }, [selectedId, employees, activeRole]);

  // Build upward chain recursively
  const upwardChain = useMemo(() => {
    if (!targetId || !employees.length) return [];

    const chain: (OrgEmployee & { level: number; isCurrentUser: boolean })[] = [];
    let currentId: string | null = targetId;

    // Safeguard against infinite loops in circular references
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const emp = employees.find(e => e.id === currentId);
      if (!emp) break;

      chain.unshift({ ...emp, level: 0, isCurrentUser: emp.id === targetId });
      currentId = emp.managerId;
    }

    // Assign top-down levels (CEO is level 1)
    return chain.map((e, index) => ({ ...e, level: index + 1 }));
  }, [targetId, employees]);

  // Direct reports
  const directReports = useMemo(() => {
    if (!targetId || !employees.length) return [];
    return employees.filter(e => e.managerId === targetId);
  }, [targetId, employees]);

  // Filter for search
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const term = search.toLowerCase();
    return employees.filter(e =>
      String(e.name || "").toLowerCase().includes(term) ||
      String(e.designation || "").toLowerCase().includes(term)
    ).slice(0, 5);
  }, [search, employees]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSearch("");
    setShowDropdown(false);
  };

  const getAvatarContent = (emp: OrgEmployee, className: string = "w-full h-full object-cover") => {
    if (emp.photoUrl) {
      return <img src={emp.photoUrl} alt={emp.name} className={className} />;
    }
    return <span>{emp.initials}</span>;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">

      {/* ── Left Column: Search & Upward Chain ───────────────────────── */}
      <div className="flex-1 space-y-6">

        {isPrivileged ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Lookup Employee Chain</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="Search by name or designation..."
                className="w-full h-10 pl-9 pr-3 text-sm font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />

              {/* Search Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                  {searchResults.map(emp => (
                    <div
                      key={emp.id}
                      onMouseDown={(e) => {
                        e.preventDefault(); // prevent onBlur from firing before click
                        handleSelect(emp.id);
                      }}
                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-100 last:border-0"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden text-xs font-bold border border-slate-200 ${emp.avatarBg || 'bg-slate-100 text-slate-700'}`}>
                        {getAvatarContent(emp)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{emp.name}</div>
                        <div className="text-xs text-slate-500">{emp.designation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Reporting Structure</h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                View your chain of command for escalation and approvals.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upward Chain</h3>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              <ArrowUp className="w-3.5 h-3.5" /> Approvals Flow Up
            </div>
          </div>

          <div className="p-6">
            {upwardChain.length === 0 ? (
              <div className="text-sm text-slate-500 py-10 text-center">No reporting chain found.</div>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-6 space-y-8 py-2">
                {upwardChain.map((emp, index) => (
                  <div key={emp.id} className="relative pl-8">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[17px] top-4 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${emp.isCurrentUser ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                      <UserCircle className="w-4 h-4 text-white" />
                    </div>

                    {/* Card */}
                    <div className={`p-4 rounded-xl border ${emp.isCurrentUser ? 'border-indigo-200 bg-indigo-50/30 shadow-sm' : 'border-slate-200 bg-white shadow-sm hover:border-indigo-200 transition-colors cursor-pointer'} flex items-center gap-4`}>
                      <div className={`w-12 h-12 rounded-full overflow-hidden border border-slate-200 ${emp.avatarBg || 'bg-slate-100 text-slate-700'} flex items-center justify-center flex-shrink-0 font-bold text-sm`}>
                        {getAvatarContent(emp)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{emp.name}</h4>
                          {emp.isCurrentUser && <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Target</span>}
                        </div>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{emp.designation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right Column: Direct Reports & Peers ─────────────────────── */}
      <div className="w-full lg:w-80 space-y-6">

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Direct Reports</h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{directReports.length}</span>
          </div>
          <div className="p-5 space-y-4">
            {directReports.length === 0 ? (
              <div className="text-xs font-medium text-slate-500 text-center py-4">No direct reports</div>
            ) : (
              directReports.map((report) => (
                <div key={report.id} onClick={() => handleSelect(report.id)} className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold flex-shrink-0 border border-slate-200 ${report.avatarBg || 'bg-slate-100 text-slate-700'}`}>
                    {getAvatarContent(report)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{report.name}</div>
                    <div className="text-[10px] font-medium text-slate-500 mt-0.5">{report.designation}</div>
                  </div>
                </div>
              ))
            )}

            {directReports.length > 0 && (
              <button className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors mt-2">
                View Entire Sub-tree
              </button>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            How routing works
          </h3>
          <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
            Leave requests and expense approvals follow the upward chain. If a manager is on leave, the request auto-escalates to the next level in the hierarchy after 48 hours.
          </p>
        </div>

      </div>

    </div>
  );
}
