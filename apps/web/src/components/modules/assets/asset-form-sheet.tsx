"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { assetsApi } from "@/lib/api/assets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Asset, AssetCategory } from "@/types/assets";

interface AssetFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAsset?: Asset | null;
}

const CATEGORY_OPTIONS: { value: AssetCategory; label: string }[] = [
  { value: "LAPTOP", label: "Laptop" },
  { value: "DESKTOP", label: "Desktop" },
  { value: "MONITOR", label: "Monitor" },
  { value: "MOBILE_DEVICE", label: "Mobile Device" },
  { value: "SIM", label: "SIM Card" },
  { value: "ACCESS_CARD", label: "Access Card" },
  { value: "SOFTWARE_LICENCE", label: "Software Licence" },
  { value: "CLOUD_ACCOUNT", label: "Cloud Account" },
  { value: "OTHER", label: "Other" },
];

export function AssetFormSheet({ open, onOpenChange, initialAsset }: AssetFormSheetProps) {
  const queryClient = useQueryClient();
  const isEditing = !!initialAsset;

  const defaultForm = {
    name: "",
    assetTag: "",
    category: "LAPTOP" as AssetCategory,
    brand: "",
    model: "",
    serialNumber: "",
    purchaseCost: "",
    purchaseDate: "",
    notes: "",
    status: "AVAILABLE",
  };

  const [form, setForm] = React.useState(defaultForm);

  React.useEffect(() => {
    if (initialAsset && open) {
      setForm({
        name: initialAsset.name,
        assetTag: initialAsset.assetTag,
        category: initialAsset.category,
        brand: initialAsset.brand || "",
        model: initialAsset.model || "",
        serialNumber: initialAsset.serialNumber || "",
        purchaseCost: initialAsset.purchaseValue ? String(initialAsset.purchaseValue) : "",
        purchaseDate: initialAsset.purchaseDate !== "—" ? new Date(initialAsset.purchaseDate).toISOString().split('T')[0] : "",
        notes: initialAsset.notes || "",
        status: initialAsset.status,
      });
    } else if (!open) {
      setForm(defaultForm);
    }
  }, [initialAsset, open]);

  const createMutation = useMutation({
    mutationFn: (payload: any) =>
      isEditing && initialAsset
        ? assetsApi.update(initialAsset.id, payload)
        : assetsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["kpiSummary"] });
      queryClient.invalidateQueries({ queryKey: ["kpiCategories"] });
      onOpenChange(false);
      toast.success(isEditing ? "Asset updated successfully!" : "Asset added successfully!");
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || err.message || "Failed to save asset";
      toast.error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      brand: form.brand || undefined,
      model: form.model || undefined,
      serialNumber: form.serialNumber || undefined,
      notes: form.notes || undefined,
      purchaseCost: form.purchaseCost !== "" ? Number(form.purchaseCost) : undefined,
      purchaseDate: form.purchaseDate ? new Date(form.purchaseDate).toISOString() : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh] bg-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Asset" : "Add New Asset"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of the asset."
              : "Enter the details of the new asset to add it to the inventory."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Asset Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
              placeholder="e.g. MacBook Pro 16"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Asset Tag *</label>
            <input
              required
              value={form.assetTag}
              onChange={(e) => setForm({ ...form, assetTag: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
              placeholder="e.g. AST-2023-001"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as AssetCategory })}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all bg-white"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Brand</label>
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="e.g. Apple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Model</label>
              <input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="e.g. M2 Max"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Serial Number</label>
            <input
              value={form.serialNumber}
              onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              placeholder="e.g. C02X..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Purchase Cost (₹)</label>
              <input
                type="number"
                value={form.purchaseCost}
                onChange={(e) => setForm({ ...form, purchaseCost: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Purchase Date</label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Notes / Location</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
              placeholder="Optional notes..."
            />
          </div>

          <DialogFooter className="mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-bold text-slate-600 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Asset"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
