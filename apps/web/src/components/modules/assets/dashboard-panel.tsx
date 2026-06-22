"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Monitor,
  Package,
  Wrench,
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Laptop,
  Smartphone,
  Keyboard,
  Headphones,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { Asset, AssetActivity, AssetKPIs, AssetRole, AssetRequest } from "@/types/assets";

interface DashboardPanelProps {
  activeRole: AssetRole;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_MY_ASSETS: Asset[] = [
  {
    id: "a1",
    assetTag: "LAP-2024-0042",
    name: "MacBook Pro 14\"",
    category: "LAPTOP",
    brand: "Apple",
    model: "MacBook Pro M3 Pro",
    serialNumber: "C02ZG1XKMD6T",
    purchaseDate: "Jan 2024",
    purchaseValue: 185000,
    currentValue: 148000,
    status: "ASSIGNED",
    assignedTo: "You",
    assignedToAvatar: null,
    department: "Engineering",
    location: "Hyderabad HQ",
    warrantyExpiry: "Jan 2027",
    condition: "EXCELLENT",
    notes: "Primary work laptop",
  },
  {
    id: "a2",
    assetTag: "MON-2024-0011",
    name: "Dell UltraSharp 27\"",
    category: "MONITOR",
    brand: "Dell",
    model: "U2723QE",
    serialNumber: "CN0482C4",
    purchaseDate: "Feb 2024",
    purchaseValue: 48000,
    currentValue: 40000,
    status: "ASSIGNED",
    assignedTo: "You",
    assignedToAvatar: null,
    department: "Engineering",
    location: "Hyderabad HQ",
    warrantyExpiry: "Feb 2027",
    condition: "GOOD",
    notes: "Secondary display",
  },
  {
    id: "a3",
    assetTag: "HST-2023-0019",
    name: "Sony WH-1000XM5",
    category: "HEADSET",
    brand: "Sony",
    model: "WH-1000XM5",
    serialNumber: "5068281-00",
    purchaseDate: "Sep 2023",
    purchaseValue: 28000,
    currentValue: 20000,
    status: "ASSIGNED",
    assignedTo: "You",
    assignedToAvatar: null,
    department: "Engineering",
    location: "Hyderabad HQ",
    warrantyExpiry: "Sep 2025",
    condition: "GOOD",
    notes: "Noise-cancelling headset",
  },
];

const MOCK_RECENT_ACTIVITY: AssetActivity[] = [
  {
    id: "act1",
    action: "ASSIGNED",
    assetName: "MacBook Pro 14\"",
    assetTag: "LAP-2024-0072",
    performedBy: "Ravi Kumar (IT Admin)",
    performedByAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Ravi",
    targetEmployee: "Ananya Sharma",
    timestamp: "15 Jun 2026, 10:30 AM",
  },
  {
    id: "act2",
    action: "MAINTENANCE",
    assetName: "HP LaserJet Pro",
    assetTag: "PRN-2022-0003",
    performedBy: "Venkat IT (IT Admin)",
    performedByAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Venkat",
    targetEmployee: null,
    timestamp: "14 Jun 2026, 02:15 PM",
  },
  {
    id: "act3",
    action: "RETURNED",
    assetName: "iPad Pro 12.9\"",
    assetTag: "TAB-2023-0008",
    performedBy: "Priya HR",
    performedByAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Priya",
    targetEmployee: "Kiran Reddy",
    timestamp: "13 Jun 2026, 05:00 PM",
  },
  {
    id: "act4",
    action: "APPROVED",
    assetName: "Logitech MX Master 3",
    assetTag: "MOU-2026-0031",
    performedBy: "Ravi Kumar (IT Admin)",
    performedByAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Ravi",
    targetEmployee: "Suresh V.",
    timestamp: "12 Jun 2026, 11:00 AM",
  },
  {
    id: "act5",
    action: "REQUESTED",
    assetName: "External SSD 1TB",
    assetTag: "STO-REQ-0023",
    performedBy: "Divya Menon",
    performedByAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Divya",
    targetEmployee: null,
    timestamp: "11 Jun 2026, 09:45 AM",
  },
];

const MOCK_PENDING_REQUESTS: AssetRequest[] = [
  {
    id: "req1",
    requestedBy: "Akash Singh",
    requestedByAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Akash",
    department: "Sales",
    assetCategory: "LAPTOP",
    description: "New hire laptop request",
    justification: "Joining as Senior Sales Executive on July 1st",
    priority: "HIGH",
    status: "PENDING",
    requestDate: "14 Jun 2026",
    responseDate: null,
    respondedBy: null,
  },
  {
    id: "req2",
    requestedBy: "Meera Pillai",
    requestedByAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Meera",
    department: "Design",
    assetCategory: "MONITOR",
    description: "Extra monitor for design work",
    justification: "Need dual-monitor setup for UI/UX design workflows",
    priority: "MEDIUM",
    status: "PENDING",
    requestDate: "13 Jun 2026",
    responseDate: null,
    respondedBy: null,
  },
];

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  LAPTOP: Laptop,
  DESKTOP: Monitor,
  MONITOR: Monitor,
  PHONE: Smartphone,
  KEYBOARD: Keyboard,
  HEADSET: Headphones,
  ACCESS_CARD: Shield,
  OTHER: Package,
  TABLET: Smartphone,
  MOUSE: Package,
  FURNITURE: Package,
};

const CONDITION_COLORS: Record<string, string> = {
  EXCELLENT: "text-emerald-700 bg-emerald-50 border border-emerald-100",
  GOOD: "text-slate-900 bg-slate-100 border border-slate-200",
  FAIR: "text-amber-700 bg-amber-50 border border-amber-100",
  POOR: "text-rose-700 bg-rose-50 border border-rose-100",
};

const ACTION_COLORS: Record<string, string> = {
  ASSIGNED: "text-emerald-700 bg-emerald-50",
  RETURNED: "text-amber-700 bg-amber-50",
  MAINTENANCE: "text-violet-700 bg-violet-50",
  RETIRED: "text-slate-600 bg-slate-100",
  REQUESTED: "text-slate-900 bg-slate-100",
  APPROVED: "text-teal-700 bg-teal-50",
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  ASSIGNED: CheckCircle2,
  RETURNED: RefreshCw,
  MAINTENANCE: Wrench,
  RETIRED: XCircle,
  REQUESTED: Clock,
  APPROVED: CheckCircle2,
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-slate-600 bg-slate-100",
  MEDIUM: "text-amber-700 bg-amber-50 border border-amber-100",
  HIGH: "text-orange-700 bg-orange-50 border border-orange-100",
  URGENT: "text-rose-700 bg-rose-50 border border-rose-100",
};

// ─── KPI Data by Role ─────────────────────────────────────────────────────────

function getKPIs(role: AssetRole): AssetKPIs {
  if (role === "EMPLOYEE") {
    return {
      totalAssets: 3,
      assignedAssets: 3,
      availableAssets: 0,
      maintenanceAssets: 0,
      totalValue: "₹2,08,000",
      pendingRequests: 0,
    };
  }
  return {
    totalAssets: 412,
    assignedAssets: 298,
    availableAssets: 84,
    maintenanceAssets: 23,
    totalValue: "₹1.8 Cr",
    pendingRequests: 7,
  };
}

// ─── Category Distribution ───────────────────────────────────────────────────

const CATEGORY_DISTRIBUTION = [
  { label: "Laptops", count: 154, percent: 82, color: "bg-violet-600" },
  { label: "Monitors", count: 98, percent: 65, color: "bg-slate-700" },
  { label: "Phones", count: 76, percent: 53, color: "bg-emerald-500" },
  { label: "Headsets", count: 44, percent: 38, color: "bg-amber-500" },
  { label: "Other", count: 40, percent: 30, color: "bg-slate-400" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPanel({ activeRole }: DashboardPanelProps) {
  const isEmployee = activeRole === "EMPLOYEE";
  const isITOrAdmin = ["IT_ADMIN", "ADMIN"].includes(activeRole);
  const kpis = useMemo(() => getKPIs(activeRole), [activeRole]);

  const { data: myAssets = [] } = useQuery<Asset[]>({
    queryKey: ["myAssets"],
    queryFn: async () => MOCK_MY_ASSETS,
  });

  const { data: recentActivity = [] } = useQuery<AssetActivity[]>({
    queryKey: ["assetActivity"],
    queryFn: async () => MOCK_RECENT_ACTIVITY,
  });

  const { data: pendingRequests = [] } = useQuery<AssetRequest[]>({
    queryKey: ["pendingRequests"],
    queryFn: async () => MOCK_PENDING_REQUESTS,
  });

  return (
    <div className="space-y-6">

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {isEmployee ? "My Assets" : "Total Assets"}
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {kpis.totalAssets}
          </div>
          <div className="text-[10px] font-semibold text-slate-500 mt-1">
            {isEmployee ? "Currently assigned" : "In registry"}
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {isEmployee ? "Total Value" : "Assigned"}
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {isEmployee ? kpis.totalValue : kpis.assignedAssets}
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-violet-600 rounded-full"
              style={{
                width: isEmployee
                  ? "100%"
                  : `${Math.round((kpis.assignedAssets / kpis.totalAssets) * 100)}%`,
              }}
            />
          </div>
        </div>
        {!isEmployee && (
          <>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Available
              </div>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {kpis.availableAssets}
              </div>
              <div className="text-[10px] font-semibold text-emerald-600 mt-1">
                Ready to assign
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Maintenance
              </div>
              <div className="text-xl font-bold text-amber-600 mt-1">
                {kpis.maintenanceAssets}
              </div>
              <div className="text-[10px] font-semibold text-amber-600 mt-1">
                Under servicing
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Value
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {kpis.totalValue}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 mt-1">
                Depreciated book value
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pending Requests
              </div>
              <div className="text-xl font-bold text-rose-600 mt-1">
                {kpis.pendingRequests}
              </div>
              <div className="text-[10px] font-semibold text-rose-600 mt-1">
                Awaiting approval
              </div>
            </div>
          </>
        )}
        {isEmployee && (
          <>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm col-span-2 md:col-span-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Warranty Status
              </div>
              <div className="text-xl font-bold text-emerald-600 mt-1">Active</div>
              <div className="text-[10px] font-semibold text-emerald-600 mt-1">
                Expires Jan 2027
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm col-span-2 md:col-span-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                My Requests
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">0</div>
              <div className="text-[10px] font-semibold text-slate-900 mt-1">
                No pending requests
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm col-span-2 md:col-span-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Condition
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">Good</div>
              <div className="text-[10px] font-semibold text-slate-500 mt-1">
                Last audit: Mar 2026
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Main Content Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">

          {/* My Assigned Assets (Employee) OR Asset Distribution (Admin/IT) */}
          {isEmployee ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">My Assigned Assets</h3>
                <Link
                  href="/assets/requests"
                  className="text-xs font-bold text-violet-600 hover:underline flex items-center gap-1"
                >
                  Request New <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {myAssets.map((asset) => {
                  const Icon = CATEGORY_ICON_MAP[asset.category] || Package;
                  return (
                    <div
                      key={asset.id}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-900">{asset.name}</div>
                        <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                          {asset.assetTag} · {asset.brand} {asset.model}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${CONDITION_COLORS[asset.condition]}`}
                        >
                          {asset.condition}
                        </span>
                        <div className="text-[10px] font-semibold text-slate-400 mt-1">
                          Warranty: {asset.warrantyExpiry}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold text-slate-900">Asset Distribution by Category</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Utilization %
                </span>
              </div>
              <div className="space-y-4">
                {CATEGORY_DISTRIBUTION.map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="text-xs font-bold text-slate-700 w-20 flex-shrink-0">
                      {cat.label}
                    </div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cat.color} rounded-full transition-all duration-700`}
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                    <div className="text-xs font-bold text-slate-900 w-8 text-right">
                      {cat.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity Feed */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
              {isITOrAdmin && (
                <Link
                  href="/assets/inventory"
                  className="text-xs font-bold text-violet-600 hover:underline flex items-center gap-1"
                >
                  Full Inventory <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {recentActivity.map((event) => {
                const ActionIcon = ACTION_ICONS[event.action] || Clock;
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${ACTION_COLORS[event.action]}`}
                    >
                      <ActionIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900">
                        {event.assetName}{" "}
                        <span className="text-[10px] font-semibold text-slate-400">
                          ({event.assetTag})
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase mr-1 ${ACTION_COLORS[event.action]}`}
                        >
                          {event.action}
                        </span>
                        by {event.performedBy}
                        {event.targetEmployee && (
                          <span> → {event.targetEmployee}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 flex-shrink-0 mt-0.5">
                      {event.timestamp}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/assets/requests"
                className="flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                <Package className="w-3.5 h-3.5" />
                {isEmployee ? "Request an Asset" : "View All Requests"}
              </Link>
              {isITOrAdmin && (
                <Link
                  href="/assets/inventory"
                  className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Manage Inventory
                </Link>
              )}
              {isITOrAdmin && (
                <Link
                  href="/assets/reports"
                  className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Asset Reports
                </Link>
              )}
            </div>
          </div>

          {/* Pending Requests (IT Admin / Admin / Manager) */}
          {!isEmployee && pendingRequests.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-900">Pending Requests</h3>
                <span className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-bold rounded">
                  {pendingRequests.length} Pending
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mb-4">
                Awaiting IT admin review
              </p>
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col gap-2.5"
                  >
                    <div className="flex gap-2.5 items-start">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                        <img
                          src={req.requestedByAvatar}
                          alt={req.requestedBy}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900">{req.requestedBy}</div>
                        <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          {req.department} · {req.requestDate}
                        </div>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase flex-shrink-0 ${PRIORITY_COLORS[req.priority]}`}
                      >
                        {req.priority}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-600">
                      {req.description}
                    </div>
                    {isITOrAdmin && (
                      <div className="flex gap-2">
                        <button className="flex-1 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold rounded-md transition-colors">
                          Reject
                        </button>
                        <button className="flex-1 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold rounded-md transition-colors">
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warranty Alerts */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900">Warranty Alerts</h3>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="space-y-2.5">
              {[
                { name: "Sony WH-1000XM5", tag: "HST-2023-0019", expiry: "Sep 2025", days: 90 },
                { name: "Dell Latitude 7420", tag: "LAP-2021-0008", expiry: "Dec 2025", days: 180 },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-amber-50 border border-amber-100 rounded-lg"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{item.name}</div>
                    <div className="text-[10px] font-semibold text-slate-400">{item.tag}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-amber-700">Expires {item.expiry}</div>
                    <div className="text-[9px] font-semibold text-amber-600">{item.days} days left</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
