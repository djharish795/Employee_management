"use client";
import { usePermissions } from "@/hooks/use-permissions";

import React, { useState, useEffect } from "react";
import { Search, History, MousePointerClick, ShieldCheck, UserCog, Briefcase, FileText, Loader2, User } from "lucide-react";
import { AuditRole, AuditEvent } from "@/types/audit";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { fetchAuditEvents, searchAuditUsers } from "@/lib/api/audit";

interface UserActivityPanelProps {

}

// Mock timeline removed in favor of API

function getIconForAction(action: string) {
  switch (action) {
    case "PERMISSION_GRANTED": return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    case "LEAVE_APPROVED": return <Briefcase className="w-4 h-4 text-indigo-600" />;
    case "PROFILE_UPDATED": return <UserCog className="w-4 h-4 text-slate-900" />;
    case "DATA_EXPORTED": return <FileText className="w-4 h-4 text-amber-600" />;
    case "LOGIN_SUCCESS": return <MousePointerClick className="w-4 h-4 text-teal-600" />;
    default: return <History className="w-4 h-4 text-slate-600" />;
  }
}

export default function UserActivityPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["auditUsersSearch", debouncedQuery],
    queryFn: () => searchAuditUsers(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  const { data: events, isLoading: isLoadingTimeline } = useQuery<AuditEvent[]>({
    queryKey: ["auditTimeline", selectedUser?.id],
    queryFn: () => fetchAuditEvents(100, 0, { actorId: selectedUser.id }),
    enabled: !!selectedUser?.id,
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ── Left Sidebar (Search User) ─────────────────────────────────── */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Target User</h2>
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Search by name or email..."
              className="w-full h-10 pl-9 pr-3 text-sm font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
            )}
          </div>
          
          {isSearchFocused && searchResults && searchResults.length > 0 && (
            <div className="absolute z-20 left-5 right-5 top-24 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {searchResults.map((user: any) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user);
                    setSearchQuery(user.preferredName || user.firstName);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden relative">
                    {user.avatar ? (
                      <Image src={user.avatar} alt="Avatar" fill style={{ objectFit: "cover" }} />
                    ) : (
                      <User className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{user.preferredName || user.firstName} {user.lastName}</div>
                    <div className="text-[10px] text-slate-500">{user.personalEmail}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedUser ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm border border-slate-200 overflow-hidden">
                {selectedUser.avatar ? (
                  <Image src={selectedUser.avatar} alt="Avatar" fill style={{ objectFit: "cover" }} />
                ) : (
                  <User className="w-5 h-5 text-slate-500" />
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{selectedUser.preferredName || selectedUser.firstName} {selectedUser.lastName}</div>
                <div className="text-[10px] font-semibold text-slate-500">{selectedUser.designation?.title || "Employee"}</div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <span className="text-xs text-slate-500 font-medium">Search for a user to view activity</span>
            </div>
          )}
        </div>

        {selectedUser && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">User Profile Metadata</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[10px] font-bold text-slate-400">EMP ID</span>
                <span className="text-[10px] font-mono font-bold text-slate-900">{selectedUser.employeeId || selectedUser.id.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-bold text-slate-400">LAST LOGIN</span>
                <span className="text-[10px] font-mono font-bold text-slate-900">Unknown</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-bold text-slate-400">ACCOUNT STATUS</span>
                <span className="text-[10px] font-bold text-emerald-600">{selectedUser.status || "ACTIVE"}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Right Column (Timeline) ────────────────────────────────────── */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[700px]">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Activity Timeline</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Chronological record of user actions across all modules.</p>
          </div>
          <button className="text-xs font-bold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
            Download Timeline
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative border-l-2 border-slate-200 ml-6 space-y-8 py-2">
            {!selectedUser ? (
              <div className="text-center py-10 text-sm font-medium text-slate-500">
                Please select a user to view their activity.
              </div>
            ) : isLoadingTimeline ? (
              <div className="text-center py-10 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-2" />
                <span className="text-sm font-medium text-slate-500">Loading timeline...</span>
              </div>
            ) : !events || events.length === 0 ? (
              <div className="text-center py-10 text-sm font-medium text-slate-500">
                No activity logs found for this user.
              </div>
            ) : (
              events.map((event) => {
                const d = new Date(event.timestamp!);
                const dateStr = d.toLocaleDateString();
                const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={event.id} className="relative pl-8 group">
                    {/* Timeline Dot with Icon */}
                    <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${event.action === "DATA_EXPORTED" ? "bg-amber-100" :
                        event.action === "PERMISSION_GRANTED" ? "bg-emerald-100" :
                          "bg-slate-100"
                      }`}>
                      {getIconForAction(event.action!)}
                    </div>

                    {/* Content */}
                    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-indigo-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {event.module}
                          </span>
                          <span className="text-xs font-bold text-slate-900 font-mono tracking-tight">
                            {event.action}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-900">{dateStr}</div>
                          <div className="text-[10px] font-mono text-slate-500">{timeStr}</div>
                        </div>
                      </div>

                      <p className="text-sm font-medium text-slate-700 leading-relaxed">
                        {event.details}
                        {event.target && (
                          <> Target entity: <span className="font-bold text-indigo-700">{event.target.name}</span></>
                        )}
                      </p>

                      {event.status === "WARNING" && (
                        <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold px-3 py-2 rounded-lg flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5" /> High volume data export flagged by automated policy.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-8 text-center">
            <button className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
              Load Older Activity
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
