"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { assetsApi } from "@/lib/api/assets";
import { Asset } from "@/types/assets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/auth";

interface AssignAssetToEmployeeDialogProps {
  employeeId: string;
  employeeName: string;
  onClose: () => void;
}

export function AssignAssetToEmployeeDialog({ employeeId, employeeName, onClose }: AssignAssetToEmployeeDialogProps) {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.employeeId) || "system";
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [notes, setNotes] = useState("");

  const { data: availableAssetsObj, isLoading } = useQuery({
    queryKey: ["assets", "AVAILABLE"],
    queryFn: () => assetsApi.list({ status: "AVAILABLE", limit: 500 }),
  });

  const availableAssets = (availableAssetsObj?.assets || []) as Asset[];

  const assignMutation = useMutation({
    mutationFn: () => assetsApi.assign(selectedAssetId, { employeeId, assignedById: currentUserId, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["kpiSummary"] });
      onClose();
      toast.success("Asset assigned successfully!");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to assign asset";
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  });

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Asset</DialogTitle>
          <DialogDescription>
            Directly assign an available asset to {employeeName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Select Available Asset</label>
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading inventory...</p>
            ) : availableAssets.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-sm">
                No available assets found. You need to procure or free up assets first.
              </div>
            ) : (
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none transition-all bg-white text-slate-900"
              >
                <option value="" disabled>-- Select an asset --</option>
                {availableAssets.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.assetTag}) - {a.category}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific assignment notes..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none transition-all resize-none text-slate-900"
            />
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => assignMutation.mutate()}
            disabled={!selectedAssetId || assignMutation.isPending}
            className="px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {assignMutation.isPending ? "Assigning..." : "Assign Asset"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
