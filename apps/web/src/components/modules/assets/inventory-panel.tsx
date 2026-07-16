"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Plus,
  Laptop,
  Monitor,
  Smartphone,
  Keyboard,
  Headphones,
  Package,
  Shield,
  ChevronDown,
  Eye,
  Edit2,
  Wrench,
  MoreHorizontal,
} from "lucide-react";
import { Asset, AssetCategory, AssetRole, AssetStatus } from "@/types/assets";

interface InventoryPanelProps {
  activeRole: AssetRole;
}

// ─── Mock Assets ────────────────────────────────────────────────────────────

const MOCK_ASSETS: Asset[] = [
  {
    id: "a1",
    assetTag: "LAP-2024-0042",
    name: 'MacBook Pro 14"',
    category: "LAPTOP",
    brand: "Apple",
    model: "MacBook Pro M3 Pro",
    serialNumber: "C02ZG1XKMD6T",
    purchaseDate: "Jan 2024",
    purchaseValue: 185000,
    currentValue: 148000,
    status: "ASSIGNED",
    assignedTo: "Ranjith Kumar",
    assignedToAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Ranjith",
    department: "Engineering",
    location: "Hyderabad HQ",
    warrantyExpiry: "Jan 2027",
    condition: "EXCELLENT",
    notes: "Primary work laptop",
  },
  {
    id: "a2",
    assetTag: "MON-2024-0011",
    name: 'Dell UltraSharp 27"',
    category: "MONITOR",
    brand: "Dell",
    model: "U2723QE",
    serialNumber: "CN0482C4",
    purchaseDate: "Feb 2024",
    purchaseValue: 48000,
    currentValue: 40000,
    status: "ASSIGNED",
    assignedTo: "Ananya Sharma",
    assignedToAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Ananya",
    department: "Design",
    location: "Hyderabad HQ",
    warrantyExpiry: "Feb 2027",
    condition: "GOOD",
    notes: "Secondary display",
  },
  {
    id: "a3",
    assetTag: "LAP-2023-0021",
    name: "Dell Latitude 7430",
    category: "LAPTOP",
    brand: "Dell",
    model: "Latitude 7430",
    serialNumber: "5MV3N12",
    purchaseDate: "Mar 2023",
    purchaseValue: 95000,
    currentValue: 64000,
    status: "AVAILABLE",
    assignedTo: null,
    assignedToAvatar: null,
    department: null,
    location: "IT Store Room",
    warrantyExpiry: "Mar 2026",
    condition: "GOOD",
    notes: "Available for assignment",
  },
  {
    id: "a4",
    assetTag: "PHN-2024-0007",
    name: "iPhone 15 Pro",
    category: "PHONE",
    brand: "Apple",
    model: "iPhone 15 Pro 256GB",
    serialNumber: "F2LMR5QP0X",
    purchaseDate: "Sep 2024",
    purchaseValue: 135000,
    currentValue: 105000,
    status: "ASSIGNED",
    assignedTo: "Pradeep Chandra",
    assignedToAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Pradeep",
    department: "Leadership",
    location: "Hyderabad HQ",
    warrantyExpiry: "Sep 2026",
    condition: "EXCELLENT",
    notes: "CEO device",
  },
  {
    id: "a5",
    assetTag: "LAP-2022-0005",
    name: "HP EliteBook 850",
    category: "LAPTOP",
    brand: "HP",
    model: "EliteBook 850 G8",
    serialNumber: "5CG2178CLV",
    purchaseDate: "Jun 2022",
    purchaseValue: 88000,
    currentValue: 40000,
    status: "MAINTENANCE",
    assignedTo: null,
    assignedToAvatar: null,
    department: "Sales",
    location: "IT Repair Bay",
    warrantyExpiry: "Jun 2025",
    condition: "FAIR",
    notes: "Screen replacement in progress",
  },
  {
    id: "a6",
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
    assignedTo: "Meera Pillai",
    assignedToAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Meera",
    department: "Design",
    location: "Hyderabad HQ",
    warrantyExpiry: "Sep 2025",
    condition: "GOOD",
    notes: "Noise-cancelling headset",
  },
  {
    id: "a7",
    assetTag: "TAB-2023-0004",
    name: 'iPad Pro 12.9"',
    category: "TABLET",
    brand: "Apple",
    model: "iPad Pro M2",
    serialNumber: "DLXJM2WY0G",
    purchaseDate: "Apr 2023",
    purchaseValue: 120000,
    currentValue: 85000,
    status: "AVAILABLE",
    assignedTo: null,
    assignedToAvatar: null,
    department: null,
    location: "IT Store Room",
    warrantyExpiry: "Apr 2026",
    condition: "EXCELLENT",
    notes: "Recently returned",
  },
  {
    id: "a8",
    assetTag: "LAP-2020-0002",
    name: "Lenovo ThinkPad X1",
    category: "LAPTOP",
    brand: "Lenovo",
    model: "ThinkPad X1 Carbon Gen 8",
    serialNumber: "PF2QV8DN",
    purchaseDate: "Jan 2020",
    purchaseValue: 110000,
    currentValue: 22000,
    status: "RETIRED",
    assignedTo: null,
    assignedToAvatar: null,
    department: null,
    location: "Archive",
    warrantyExpiry: "Jan 2023",
    condition: "POOR",
    notes: "End of life — to be disposed",
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
  TABLET: Smartphone,
  MOUSE: Package,
  FURNITURE: Package,
  OTHER: Package,
};

const STATUS_COLORS: Record<AssetStatus, string> = {
  ASSIGNED: "text-emerald-700 bg-emerald-50 border border-emerald-100",
  AVAILABLE: "text-slate-900 bg-slate-100 border border-slate-200",
  MAINTENANCE: "text-amber-700 bg-amber-50 border border-amber-100",
  RETIRED: "text-slate-600 bg-slate-100",
  LOST: "text-rose-700 bg-rose-50 border border-rose-100",
};

const CONDITION_COLORS: Record<string, string> = {
  EXCELLENT: "text-emerald-700",
  GOOD: "text-slate-900",
  FAIR: "text-amber-700",
  POOR: "text-rose-700",
};

const ALL_CATEGORIES: AssetCategory[] = [
  "LAPTOP", "DESKTOP", "MONITOR", "PHONE", "HEADSET", "KEYBOARD", "TABLET", "OTHER",
];

const ALL_STATUSES: AssetStatus[] = [
  "ASSIGNED", "AVAILABLE", "MAINTENANCE", "RETIRED", "LOST",
];

export default function InventoryPanel({ activeRole }: InventoryPanelProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | "ALL">("ALL");
  const [showFilters, setShowFilters] = useState(false);

  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: async () => MOCK_ASSETS,
  });

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.assetTag.toLowerCase().includes(q) ||
        (a.assignedTo?.toLowerCase() ?? "").includes(q) ||
        a.brand.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
      const matchesCat = categoryFilter === "ALL" || a.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [assets, search, statusFilter, categoryFilter]);

  const canEdit = ["IT_ADMIN", "ADMIN"].includes(activeRole);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assets, tags, employees…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-3.5 py-2.5 border text-xs font-bold rounded-lg transition-all ${
              showFilters
                ? "bg-violet-50 border-violet-200 text-violet-700"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
          {canEdit && (
            <button className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" />
              Add Asset
            </button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AssetStatus | "ALL")}
                className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-violet-400 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as AssetCategory | "ALL")}
                className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-violet-400 cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setStatusFilter("ALL"); setCategoryFilter("ALL"); setSearch(""); }}
              className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500">
          {filtered.length} asset{filtered.length !== 1 ? "s" : ""} found
        </span>
        <div className="flex gap-2">
          {(statusFilter !== "ALL" || categoryFilter !== "ALL" || search) && (
            <span className="px-2 py-0.5 bg-violet-50 border border-violet-100 text-violet-700 text-[10px] font-bold rounded-full">
              Filtered
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3">Asset</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Assigned To</th>
                <th className="px-5 py-3">Condition</th>
                <th className="px-5 py-3">Value</th>
                <th className="px-5 py-3">Warranty</th>
                {canEdit && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="text-xs font-medium text-slate-600 divide-y divide-slate-100">
              {filtered.map((asset) => {
                const Icon = CATEGORY_ICON_MAP[asset.category] || Package;
                return (
                  <tr key={asset.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Asset */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{asset.name}</div>
                          <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                            {asset.assetTag}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-5 py-3.5 font-semibold text-slate-500">
                      {asset.category}
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${STATUS_COLORS[asset.status]}`}>
                        {asset.status}
                      </span>
                    </td>
                    {/* Assigned To */}
                    <td className="px-5 py-3.5">
                      {asset.assignedTo ? (
                        <div className="flex items-center gap-2">
                          {asset.assignedToAvatar && (
                            <img
                              src={asset.assignedToAvatar}
                              alt={asset.assignedTo}
                              className="w-6 h-6 rounded-full object-cover bg-slate-200"
                            />
                          )}
                          <span className="font-bold text-slate-900">{asset.assignedTo}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    {/* Condition */}
                    <td className="px-5 py-3.5">
                      <span className={`font-bold ${CONDITION_COLORS[asset.condition]}`}>
                        {asset.condition}
                      </span>
                    </td>
                    {/* Value */}
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      ₹{(asset.currentValue / 1000).toFixed(0)}K
                    </td>
                    {/* Warranty */}
                    <td className="px-5 py-3.5 text-slate-500">
                      {asset.warrantyExpiry ?? "—"}
                    </td>
                    {/* Actions */}
                    {canEdit && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-md transition-colors" title="View">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors" title="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" title="Maintenance">
                            <Wrench className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors" title="More">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={canEdit ? 8 : 7}
                    className="px-5 py-12 text-center text-sm text-slate-400 font-medium"
                  >
                    No assets found matching your search.
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
