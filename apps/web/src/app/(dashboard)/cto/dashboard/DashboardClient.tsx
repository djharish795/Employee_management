"use client";

import React, { useState } from 'react';
import { Search, Bell, Download, Lock, MoreHorizontal, Loader2, X, FileText, Network, Clock, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { fetchCtoDashboard } from '@/lib/api/cto';
import { fetchTodayStatus, submitPunch } from '@/lib/api/attendance';
import EarlyCheckoutModal from "@/components/shared/early-checkout-modal";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

// ─── Interfaces (No Hardcoded Mock Data) ─────────────────────────────────────────
interface MetricData {
  headcount: number;
  headcountGrowth: number;
  assetsAllocated: number;
  openPositions: number;
  avgTenure: number;
  industryAvgTenure: number;
}

interface OrgDiscipline {
  name: string;
  count: number;
  total: number;
}

interface AssetAllocation {
  id: string;
  employeeName: string;
  assetName: string;
  status: 'ALLOCATED' | 'LICENSED';
}

interface TechTeam {
  id: string;
  name: string;
  leadName: string;
  leadInitials: string;
  members: number;
  avgExperience: number;
  openRoles: number;
}

export default function CtoDashboardPage() {
  const role = useAuthStore((state) => state.role);
  const queryClient = useQueryClient();

  const todayQuery = useQuery({
    queryKey: ["attendanceStatus"],
    queryFn: fetchTodayStatus,
    refetchInterval: 60_000,
    retry: 1,
  });

  const punchMutation = useMutation({
    mutationFn: (action: "IN" | "OUT") => submitPunch(action),
    onSuccess: (newData) => {
      queryClient.setQueryData(["attendanceStatus"], newData);
    },
  });

  const todayState = todayQuery.data?.state ?? "OUT";
  const isPunchedIn = todayState === "IN" || todayState === "BREAK";

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const getSecondsElapsed = () => {
    let secs = todayQuery.data?.offset || 0;
    if ((todayState === "IN" || todayState === "BREAK") && todayQuery.data?.startTime) {
      secs += Math.floor((Date.now() - new Date(todayQuery.data.startTime).getTime()) / 1000);
    }
    return secs;
  };

  const handlePunch = () => {
    if (punchMutation.isPending) return;
    const nextAction = isPunchedIn ? "OUT" : "IN";
    if (nextAction === "OUT") {
      setShowCheckoutModal(true);
    } else {
      punchMutation.mutate(nextAction);
    }
  };

  const checkInTimeDisplay = (() => {
    if (!todayQuery.data?.startTime) return null;
    return new Date(todayQuery.data.startTime).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  })();

  // States waiting for backend population
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [orgBreakdown, setOrgBreakdown] = useState<OrgDiscipline[]>([]);
  const [recentAssets, setRecentAssets] = useState<AssetAllocation[]>([]);
  const [techTeams, setTechTeams] = useState<TechTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const orgMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (orgMenuRef.current && !orgMenuRef.current.contains(event.target as Node)) {
        setShowOrgMenu(false);
      }
    }
    if (showOrgMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOrgMenu]);

  // Filtered tech teams
  const filteredTeams = techTeams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.leadName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  React.useEffect(() => {
    if (role === 'CTO') {
      setIsLoading(true);
      fetchCtoDashboard()
        .then((data) => {
          setMetrics(data.metrics);
          setOrgBreakdown(data.orgBreakdown || []);
          setRecentAssets(data.recentAssets || []);
          setTechTeams(data.techTeams || []);
        })
        .catch((err) => console.error("Failed to fetch CTO dashboard", err))
        .finally(() => setIsLoading(false));
    }
  }, [role]);

  const handleExport = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL!;
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`${url}/dashboard/cto-export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to export report");
      
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.download = `engineering-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      setShowOrgMenu(false);
    } catch (e) {
      console.error("Export failed:", e);
      alert("Failed to export report. Please try again later.");
    }
  };

  // Protect route: Only CTO can access
  if (role !== "CTO") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <Lock className="w-10 h-10 text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm">Only the Chief Technology Officer can view this dashboard.</p>
      </div>
    );
  }

  // Get current date formatted like "Thursday, 15 January 2025"
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      <EarlyCheckoutModal
        isOpen={showCheckoutModal}
        secondsElapsed={getSecondsElapsed()}
        isPending={punchMutation.isPending}
        onClose={() => setShowCheckoutModal(false)}
        onConfirm={() => {
          setShowCheckoutModal(false);
          punchMutation.mutate("OUT");
        }}
      />
      
      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Engineering overview</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">{currentDate}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Download className="w-4 h-4" /> Export team report
            </button>
          </div>
        </div>

        {/* Today's Status Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Today's Status</p>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isPunchedIn ? 'bg-emerald-500' : (todayQuery.data?.offset && todayQuery.data.offset > 0 ? (todayQuery.data.offset < 32400 ? 'bg-orange-500' : 'bg-emerald-500') : 'bg-slate-300')}`}></span>
              <span className={`text-lg font-bold ${isPunchedIn ? 'text-emerald-600' : (todayQuery.data?.offset && todayQuery.data.offset > 0 ? (todayQuery.data.offset < 32400 ? 'text-orange-600' : 'text-emerald-600') : 'text-slate-700')}`}>
                {isPunchedIn ? 'Present' : (todayQuery.data?.offset && todayQuery.data.offset > 0 ? (todayQuery.data.offset < 32400 ? 'Early Checkout' : 'Checked Out') : 'Not checked in')}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1">
              {isPunchedIn && checkInTimeDisplay
                ? `Checked in ${checkInTimeDisplay}`
                : (todayQuery.data?.offset && todayQuery.data.offset > 0
                  ? (todayQuery.data.offset < 32400 ? 'Shift ended early today' : 'Shift completed today')
                  : 'No punch recorded today')}
            </p>
          </div>
          <button
            onClick={handlePunch}
            disabled={punchMutation.isPending || todayQuery.isLoading}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${
              isPunchedIn 
                ? "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200" 
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {punchMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPunchedIn ? (
              <><LogOut className="w-4 h-4" /> Check out</>
            ) : (
              <><Clock className="w-4 h-4" /> Check in</>
            )}
          </button>
        </div>

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Engineering Headcount</div>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-extrabold text-slate-900">{metrics?.headcount || '--'}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Assets Allocated</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900">{metrics?.assetsAllocated || '--'}</span>
              <span className="text-sm font-semibold text-slate-500">devices</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Open Tech Positions</div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
              <span className="text-4xl font-extrabold text-slate-900">{metrics?.openPositions || '--'}</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded border border-slate-200 w-fit">
              <Lock className="w-3 h-3" /> Locked - Phase 2
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Avg Tenure</div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-900">{metrics?.avgTenure || '--'}</span>
              <span className="text-sm font-semibold text-slate-500">yrs</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-2">
              Industry avg: {metrics?.industryAvgTenure || '--'}
            </div>
          </div>
        </div>

        {/* Middle Layout (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Org Breakdown */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-6 relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-base font-bold text-slate-900">Org breakdown</h3>
              <div className="relative" ref={orgMenuRef}>
                <button 
                  onClick={() => setShowOrgMenu(!showOrgMenu)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {showOrgMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                    <Link href="/org-chart" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      <Network className="w-4 h-4" /> View full Org Chart
                    </Link>
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left">
                      <FileText className="w-4 h-4" /> Export data
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              {isLoading ? (
                <div className="py-12 flex items-center justify-center text-sm font-medium text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading org data...
                </div>
              ) : orgBreakdown.length === 0 ? (
                <div className="py-12 text-center text-sm font-medium text-slate-400">Waiting for backend org data...</div>
              ) : (
                (() => {
                  const maxCount = Math.max(...orgBreakdown.map(o => o.count), 0);
                  return orgBreakdown.map(org => {
                    const percentage = maxCount === 0 ? 0 : (org.count / maxCount) * 100;
                    return (
                      <div key={org.name}>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-sm font-bold text-slate-700">{org.name}</span>
                          <span className="text-xs font-semibold text-slate-500">{org.count} Members</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>
          </div>

          {/* Recent Asset Allocations */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col">
            <h3 className="text-base font-bold text-slate-900 mb-6">Recent asset allocations</h3>
            
            <div className="flex-1 space-y-5 overflow-y-auto">
              {isLoading ? (
                <div className="py-12 flex items-center justify-center text-sm font-medium text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading assets...
                </div>
              ) : recentAssets.length === 0 ? (
                <div className="py-12 text-center text-sm font-medium text-slate-400">Waiting for backend asset data...</div>
              ) : (
                recentAssets.map(asset => (
                  <div key={asset.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{asset.employeeName}</div>
                      <div className="text-[11px] font-medium text-slate-500">{asset.assetName}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider rounded border border-slate-200">
                      {asset.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <Link href="/cto/assets" className="w-full mt-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition-colors border border-slate-200 text-center block">
              View All Assets
            </Link>
          </div>
        </div>

        {/* Bottom Layout (All Teams) */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">All teams</h3>
            {showSearch ? (
              <div className="flex items-center gap-2">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Search teams or leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-slate-900 transition-colors w-64"
                />
                <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowSearch(true)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Members</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Experience</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Open Roles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-slate-400">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading team data...
                      </div>
                    </td>
                  </tr>
                ) : filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-slate-400">
                      No teams matched your search...
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map(team => (
                    <tr key={team.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{team.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                            {team.leadInitials}
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{team.leadName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{team.members}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">{team.avgExperience} yrs</td>
                      <td className="px-6 py-4">
                        {team.openRoles > 0 ? (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100">
                            {team.openRoles} Open
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full border border-slate-200">
                            0 Roles
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
