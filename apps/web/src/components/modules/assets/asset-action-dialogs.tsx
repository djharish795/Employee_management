"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific assignment notes..."
              rows={2}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all resize-none"
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
            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all bg-white"
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
            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
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

export function FulfillRequestDialog({ request, onClose }: { request: any, onClose: () => void }) {
  const queryClient = useQueryClient();
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");

  const { data: availableAssetsObj, isLoading } = useQuery({
    queryKey: ["assets", "AVAILABLE", request?.assetCategory],
    queryFn: () => assetsApi.list({ status: "AVAILABLE", category: request?.assetCategory }),
    enabled: !!request,
  });

  const availableAssets = (availableAssetsObj?.assets || []) as Asset[];

  React.useEffect(() => {
    if (availableAssets.length > 0 && !selectedAssetId) {
      setSelectedAssetId(availableAssets[0].id);
    }
  }, [availableAssets, selectedAssetId]);

  const fulfillMutation = useMutation({
    mutationFn: async () => {
      // 1. Mark request as APPROVED
      await assetsApi.respondToRequest(request!.id, { status: "APPROVED" });
      
      // 2. If an asset is selected, assign it
      if (selectedAssetId) {
        await assetsApi.assign(selectedAssetId, {
          employeeId: request!.initiatorId,
          assignedById: "system", // The backend controller injects the actual user
          notes: `Fulfilled request ${request!.id}`
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assetRequests"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["kpiSummary"] });
      queryClient.invalidateQueries({ queryKey: ["assetActivity"] });
      onClose();
      toast.success(selectedAssetId ? "Request Approved & Asset Assigned!" : "Request Approved without assignment.");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to fulfill request";
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  });

  if (!request) return null;

  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve & Assign Asset</DialogTitle>
          <DialogDescription>
            Fulfill {request.requestedBy}'s request for a {request.assetCategory}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Select Available Asset</label>
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading inventory...</p>
            ) : availableAssets.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-sm">
                No available assets found in category <strong>{request.assetCategory}</strong>. 
                You can still approve the request now and assign an asset later.
              </div>
            ) : (
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all bg-white"
              >
                <option value="">-- Do not assign right now --</option>
                {availableAssets.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.assetTag})
                  </option>
                ))}
              </select>
            )}
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
            onClick={() => fulfillMutation.mutate()}
            disabled={fulfillMutation.isPending}
            className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {fulfillMutation.isPending ? "Processing..." : (selectedAssetId ? "Approve & Assign" : "Approve Only")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteAssetDialog({ asset, onClose }: { asset: Asset | null, onClose: () => void }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => assetsApi.delete(asset!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["kpiSummary"] });
      queryClient.invalidateQueries({ queryKey: ["kpiCategories"] });
      queryClient.invalidateQueries({ queryKey: ["kpiFinancials"] });
      onClose();
      toast.success("Asset deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete asset");
    },
  });

  return (
    <Dialog open={!!asset} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Asset</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{asset?.name}</strong> ({asset?.assetTag})? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
            className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Asset"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
