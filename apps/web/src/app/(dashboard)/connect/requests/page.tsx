"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, Check, X } from "lucide-react";
import { connectApi } from "@/lib/api/connect";
import { useAuthStore } from "@/store/auth";

export default function MyRequestsPage() {
  const [activeTab, setActiveTab] = useState("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const myEmployeeId = useAuthStore(state => state.employeeId);

  const tabs = ["Pending", "Approved", "Declined"];

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const res = await connectApi.getMyMeetings();
      setMeetings(res.data || []);
    } catch (error) {
      console.error("Failed to load meetings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await connectApi.acceptMeet(id);
      loadMeetings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await connectApi.rejectMeet(id);
      loadMeetings();
    } catch (err) {
      console.error(err);
    }
  };

  // Map backend status to UI tabs
  const getTabStatus = (status: string) => {
    if (status === "ACCEPTED") return "Approved";
    if (status === "REJECTED") return "Declined";
    return "Pending"; // PENDING or RESCHEDULED
  };

  const filteredRequests = meetings.filter(r => {
    if (getTabStatus(r.status) !== activeTab) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const isRequester = r.requesterId === myEmployeeId;
      const otherPerson = isRequester ? r.assignee : r.requester;
      let otherName = "Unknown";
      if (otherPerson) {
        otherName = `${otherPerson.firstName || ""} ${otherPerson.lastName || ""}`.trim();
      } else if (isRequester && r.type === "DEPARTMENT") {
        otherName = "Department Team";
      }

      return (
        r.title?.toLowerCase().includes(q) ||
        otherName.toLowerCase().includes(q) ||
        r.type?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getDuration = (start: string, end: string) => {
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    return `${Math.round(diffMs / 60000)}m`;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Requests</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Track and manage your meeting requests.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">

        {/* Top Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          {/* Tabs */}
          <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-2 lg:pb-0">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search meetings..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Meeting</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-500">Loading requests...</td>
                </tr>
              ) : filteredRequests.map(req => {
                const isPending = req.status === "PENDING" || req.status === "RESCHEDULED";
                const isRequester = req.requesterId === myEmployeeId;

                // Show other person: if I sent the request → show assignee, if I received → show requester
                const otherPerson = isRequester ? req.assignee : req.requester;
                let otherName = "Unknown";
                if (otherPerson) {
                  otherName = `${otherPerson.firstName || ""} ${otherPerson.lastName || ""}`.trim();
                } else if (isRequester && req.type === "DEPARTMENT") {
                  otherName = "Department Team";
                }

                const otherInitials = otherName === "Department Team" ? "DT" : otherName.substring(0, 2).toUpperCase();
                const directionLabel = isRequester ? "Sent to" : "From";

                return (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm flex-shrink-0">
                          {otherInitials}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{otherName}</p>
                          <p className="text-[11px] font-medium text-slate-500">{directionLabel}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-slate-900">{req.title}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">Type: {req.type}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-slate-900">{formatDate(req.startTime)}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{formatTime(req.startTime)} <span className="mx-1">•</span> {getDuration(req.startTime, req.endTime)}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${req.status === 'PENDING' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isPending && !isRequester && (
                          <>
                            <button onClick={() => handleAccept(req.id)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Accept">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleReject(req.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {req.meetLink && (
                          <button onClick={() => window.open(req.meetLink, '_blank')} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Join Meet">
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {!loading && filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-6 h-6 text-slate-300" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">No requests found</h3>
                    <p className="text-xs text-slate-500 mt-1">There are no {activeTab.toLowerCase()} requests matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
