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
import { Asset } from "@/types/assets";

interface ActionDialogProps {
  asset: Asset | null;
  onClose: () => void;
  currentUserRole?: string;
  currentUserId?: string; // We'd usually get this from auth context
}

export function AssignAssetDialog({ asset, onClose, currentUserId = "current-user-id" }: ActionDialogProps) {
  const queryClient = useQueryClient();
  const [employeeId, setEmployeeId] = useState("");
  const [notes, setNotes] = useState("");

  const assignMutation = useMutation({
    mutationFn: () => assetsApi.assign(asset!.id, { employeeId, assignedById: currentUserId, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["kpiSummary"] });
      queryClient.invalidateQueries({ queryKey: ["kpiCategories"] });
      onClose();
      setEmployeeId("");
      setNotes("");
      toast.success("Asset assigned successfully!");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to assign asset";
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  });

  if (!asset) return null;

  return (
    <Dialog open={!!asset} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Asset</DialogTitle>
          <DialogDescription>
            Assign {asset.name} ({asset.assetTag}) to an employee.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Employee ID</label>
            <input
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. EMP-1234"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific assignment notes..."
              rows={2}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 border rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => assignMutation.mutate()}
            disabled={!employeeId || assignMutation.isPending}
            className="px-4 py-2 text-sm font-bold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50"
          >
            {assignMutation.isPending ? "Assigning..." : "Assign"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ReturnAssetDialog({ asset, onClose }: ActionDialogProps) {
  const queryClient = useQueryClient();
  const [condition, setCondition] = useState("GOOD");

  const returnMutation = useMutation({
    mutationFn: () => assetsApi.returnAsset(asset!.id, condition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["kpiSummary"] });
      queryClient.invalidateQueries({ queryKey: ["kpiCategories"] });
      onClose();
      setCondition("GOOD");
      toast.success("Asset returned successfully!");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to return asset";
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  });

  if (!asset) return null;

  return (
    <Dialog open={!!asset} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return Asset</DialogTitle>
          <DialogDescription>
            Process the return of {asset.name} from {asset.assignedTo}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Return Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all bg-white"
            >
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
              <option value="DAMAGED">Damaged</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 border rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => returnMutation.mutate()}
            disabled={returnMutation.isPending}
            className="px-4 py-2 text-sm font-bold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50"
          >
            {returnMutation.isPending ? "Processing..." : "Process Return"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ViewAssetDialog({ asset, onClose }: ActionDialogProps) {
  if (!asset) return null;

  return (
    <Dialog open={!!asset} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asset Details</DialogTitle>
          <DialogDescription>
            Detailed view of {asset.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-slate-500 font-medium text-xs">Asset Tag</span>
              <span className="font-bold text-slate-900">{asset.assetTag}</span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium text-xs">Category</span>
              <span className="font-bold text-slate-900">{asset.category}</span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium text-xs">Brand & Model</span>
              <span className="font-bold text-slate-900">{asset.brand || "—"} {asset.model || ""}</span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium text-xs">Serial Number</span>
              <span className="font-bold text-slate-900">{asset.serialNumber || "—"}</span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium text-xs">Status</span>
              <span className="font-bold text-slate-900">{asset.status}</span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium text-xs">Assigned To</span>
              <span className="font-bold text-slate-900">{asset.assignedTo || "—"}</span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium text-xs">Purchase Value</span>
              <span className="font-bold text-slate-900">₹{(asset.purchaseValue / 1000).toFixed(0)}K</span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium text-xs">Purchase Date</span>
              <span className="font-bold text-slate-900">{asset.purchaseDate}</span>
            </div>
          </div>
          {asset.notes && (
            <div className="pt-2 border-t text-sm">
              <span className="block text-slate-500 font-medium text-xs mb-1">Notes</span>
              <p className="text-slate-800">{asset.notes}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-white bg-slate-800 rounded-lg hover:bg-slate-900"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
