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

interface RequestAssetDialogProps {
  employeeId: string;
  employeeName: string;
  onClose: () => void;
}

export function RequestAssetDialog({ employeeId, employeeName, onClose }: RequestAssetDialogProps) {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("LAPTOP");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [description, setDescription] = useState("");
  const [justification, setJustification] = useState("");

  const requestMutation = useMutation({
    mutationFn: () => assetsApi.createRequest({
      employeeId: employeeId,
      type: "GENERAL",
      reason: justification,
      requestedItems: [
        {
          category,
          priority,
          description,
        }
      ]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assetRequests"] });
      queryClient.invalidateQueries({ queryKey: ["kpiSummary"] });
      onClose();
      toast.success("Asset request submitted successfully!");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to submit request";
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  });

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Asset</DialogTitle>
          <DialogDescription>
            Submit an asset request on behalf of {employeeName}. This request will require approval from Operations and CEO.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none transition-all bg-white text-slate-900"
              >
                <option value="LAPTOP">Laptop</option>
                <option value="DESKTOP">Desktop</option>
                <option value="MONITOR">Monitor</option>
                <option value="PHONE">Phone</option>
                <option value="TABLET">Tablet</option>
                <option value="PERIPHERAL">Peripheral</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none transition-all bg-white text-slate-900"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. MacBook Pro M3 16GB"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none transition-all text-slate-900"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Justification (Why is this needed?)</label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Provide reason for request..."
              rows={3}
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
            onClick={() => requestMutation.mutate()}
            disabled={!description || !justification || requestMutation.isPending}
            className="px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {requestMutation.isPending ? "Submitting..." : "Submit Request"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
