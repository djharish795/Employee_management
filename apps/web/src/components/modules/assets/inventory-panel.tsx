"use client";

import { usePermissions } from "@/hooks/use-permissions";
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { assetsApi } from "@/lib/api/assets";
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
  UserPlus,
  CornerDownLeft,
  Trash2,
} from "lucide-react";
import { Asset, AssetCategory, AssetRole, AssetStatus } from "@/types/assets";
import { AssetFormSheet } from "./asset-form-sheet";
import { AssignAssetDialog, ReturnAssetDialog, ViewAssetDialog, DeleteAssetDialog } from "./asset-action-dialogs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InventoryPanelProps {
  
}


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

export default function InventoryPanel() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | "ALL">("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [assetToView, setAssetToView] = useState<Asset | null>(null);
  const [assetToAssign, setAssetToAssign] = useState<Asset | null>(null);
  const [assetToReturn, setAssetToReturn] = useState<Asset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  const { data: apiData, isLoading } = useQuery({
    queryKey: ["assets", statusFilter, categoryFilter, search],
    queryFn: () =>
      assetsApi.list({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        category: categoryFilter !== "ALL" ? categoryFilter : undefined,
        search: search || undefined,
      }),
    staleTime: 30_000,
  });

  // Map API response shape → local Asset shape
  const assets: Asset[] = useMemo(() => {
    const raw: any[] = apiData?.assets ?? [];
    return raw.map((a) => ({
      id: a.id,
      assetTag: a.assetTag,
      name: a.name,
      category: a.category as AssetCategory,
      brand: a.brand ?? "",
      model: a.model ?? "",
      serialNumber: a.serialNumber ?? "",
      purchaseDate: a.purchaseDate
        ? new Date(a.purchaseDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
        : "—",
      purchaseValue: a.purchaseCost ? Number(a.purchaseCost) : 0,
      currentValue: a.purchaseCost ? Number(a.purchaseCost) : 0,
      status: a.status as AssetStatus,
      assignedTo: a.currentHolder
        ? `${a.currentHolder.firstName} ${a.currentHolder.lastName}`
        : null,
      assignedToAvatar: a.currentHolder
        ? `https://api.dicebear.com/7.x/notionists/svg?seed=${a.currentHolder.firstName}`
        : null,
      department: a.currentHolder?.department ?? null,
      location: a.notes ?? "—",
      warrantyExpiry: null,
      condition: "GOOD" as const,
      notes: a.notes ?? "",
    }));
  }, [apiData]);

  const filtered = assets;

  const { isAdmin: canEdit } = usePermissions();

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
            <button
              onClick={() => setIsAddSheetOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
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
                          <button 
                            className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-md transition-colors" 
                            title="View"
                            onClick={() => setAssetToView(asset)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors" 
                            title="Edit"
                            onClick={() => setAssetToEdit(asset)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {asset.status === "AVAILABLE" && (
                            <button 
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" 
                              title="Assign"
                              onClick={() => setAssetToAssign(asset)}
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {asset.status === "ASSIGNED" && (
                            <button 
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" 
                              title="Return"
                              onClick={() => setAssetToReturn(asset)}
                            >
                              <CornerDownLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors" title="More">
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setAssetToDelete(asset)}
                                className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 font-bold text-xs"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Delete Asset
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {isLoading && (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="px-5 py-12 text-center text-sm text-slate-400 font-medium">
                    Loading assets…
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
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
      <AssetFormSheet 
        open={isAddSheetOpen || !!assetToEdit} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddSheetOpen(false);
            setAssetToEdit(null);
          }
        }} 
        initialAsset={assetToEdit}
      />
      
      <ViewAssetDialog asset={assetToView} onClose={() => setAssetToView(null)} />
      <AssignAssetDialog asset={assetToAssign} onClose={() => setAssetToAssign(null)} />
      <ReturnAssetDialog asset={assetToReturn} onClose={() => setAssetToReturn(null)} />
      <DeleteAssetDialog asset={assetToDelete} onClose={() => setAssetToDelete(null)} />
    </div>
  );
}
