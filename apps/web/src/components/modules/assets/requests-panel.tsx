"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Laptop,
  Monitor,
  Smartphone,
  Headphones,
  ChevronDown,
  Send,
  AlertCircle,
} from "lucide-react";
import { AssetCategory, AssetRequest, AssetRole } from "@/types/assets";

interface RequestsPanelProps {
  activeRole: AssetRole;
}

// ─── Mock Requests ────────────────────────────────────────────────────────────

const INITIAL_REQUESTS: AssetRequest[] = [
  {
    id: "req1",
    requestedBy: "Akash Singh",
    requestedByAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Akash",
    department: "Sales",
    assetCategory: "LAPTOP",
    description: "New hire laptop request",
    justification: "Joining as Senior Sales Executive on July 1st. Need a laptop from day one.",
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
    justification: "Need dual-monitor setup for UI/UX design workflows to improve productivity.",
    priority: "MEDIUM",
    status: "PENDING",
    requestDate: "13 Jun 2026",
    responseDate: null,
    respondedBy: null,
  },
  {
    id: "req3",
    requestedBy: "Divya Menon",
    requestedByAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Divya",
    department: "Engineering",
    assetCategory: "HEADSET",
    description: "Noise-cancelling headset",
    justification: "Open office environment is causing distractions during coding sessions.",
    priority: "LOW",
    status: "APPROVED",
    requestDate: "10 Jun 2026",
    responseDate: "12 Jun 2026",
    respondedBy: "Ravi Kumar (IT Admin)",
  },
  {
    id: "req4",
    requestedBy: "Suresh V.",
    requestedByAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Suresh",
    department: "HR",
    assetCategory: "PHONE",
    description: "Office mobile for HR communication",
    justification: "Need a dedicated office phone for candidate communications and HR ops.",
    priority: "MEDIUM",
    status: "REJECTED",
    requestDate: "08 Jun 2026",
    responseDate: "09 Jun 2026",
    respondedBy: "Ravi Kumar (IT Admin)",
  },
];

const CATEGORY_OPTIONS: { value: AssetCategory; label: string; icon: React.ElementType }[] = [
  { value: "LAPTOP", label: "Laptop", icon: Laptop },
  { value: "MONITOR", label: "Monitor", icon: Monitor },
  { value: "PHONE", label: "Mobile Phone", icon: Smartphone },
  { value: "HEADSET", label: "Headset", icon: Headphones },
  { value: "KEYBOARD", label: "Keyboard", icon: Package },
  { value: "TABLET", label: "Tablet", icon: Smartphone },
  { value: "OTHER", label: "Other", icon: Package },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-amber-700 bg-amber-50 border border-amber-100",
  APPROVED: "text-emerald-700 bg-emerald-50 border border-emerald-100",
  REJECTED: "text-rose-700 bg-rose-50 border border-rose-100",
  FULFILLED: "text-slate-900 bg-slate-100 border border-slate-200",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  PENDING: Clock,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
  FULFILLED: CheckCircle2,
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-slate-600 bg-slate-100",
  MEDIUM: "text-amber-700 bg-amber-50 border border-amber-100",
  HIGH: "text-orange-700 bg-orange-50 border border-orange-100",
  URGENT: "text-rose-700 bg-rose-50 border border-rose-100",
};

const STORAGE_KEY = "naprocs_asset_requests";

export default function RequestsPanel({ activeRole }: RequestsPanelProps) {
  const queryClient = useQueryClient();
  const isEmployee = activeRole === "EMPLOYEE";
  const canApprove = ["IT_ADMIN", "ADMIN"].includes(activeRole);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: "",
    assetCategory: "LAPTOP" as AssetCategory,
    justification: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  });

  const { data: requests = [] } = useQuery<AssetRequest[]>({
    queryKey: ["assetRequests"],
    queryFn: async () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
      }
      return INITIAL_REQUESTS;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (newReq: Omit<AssetRequest, "id">) => {
      const withId: AssetRequest = { ...newReq, id: `req-${Date.now()}` };
      const updated = [withId, ...requests];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["assetRequests"], updated);
      setShowForm(false);
      setForm({ description: "", assetCategory: "LAPTOP", justification: "", priority: "MEDIUM" });
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) => {
      const updated = requests.map((r) =>
        r.id === id
          ? { ...r, status, responseDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), respondedBy: "Ravi Kumar (IT Admin)" }
          : r
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["assetRequests"], updated);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      requestedBy: "You",
      requestedByAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=You",
      department: "Engineering",
      assetCategory: form.assetCategory,
      description: form.description,
      justification: form.justification,
      priority: form.priority,
      status: "PENDING",
      requestDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      responseDate: null,
      respondedBy: null,
    });
  };

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            {canApprove ? "Asset Requests" : "My Requests"}
          </h2>
          {pendingCount > 0 && (
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {pendingCount} request{pendingCount !== 1 ? "s" : ""} awaiting review
            </p>
          )}
        </div>
        {(isEmployee || ["MANAGER", "HR"].includes(activeRole)) && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Request
          </button>
        )}
      </div>

      {/* Request Form */}
      {showForm && (
        <div className="bg-white border border-violet-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">New Asset Request</h3>
              <p className="text-[11px] font-medium text-slate-500">Your request will be reviewed by IT Admin</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Asset Category *
                </label>
                <div className="relative">
                  <select
                    value={form.assetCategory}
                    onChange={(e) => setForm((f) => ({ ...f, assetCategory: e.target.value as AssetCategory }))}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                    required
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              {/* Priority */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Priority *
                </label>
                <div className="relative">
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as typeof form.priority }))}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Brief Description *
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Dual monitor setup for design work"
                className="w-full px-3.5 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                required
              />
            </div>
            {/* Justification */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Business Justification *
              </label>
              <textarea
                value={form.justification}
                onChange={(e) => setForm((f) => ({ ...f, justification: e.target.value }))}
                placeholder="Explain why this asset is needed for your work…"
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-none"
                required
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 sm:flex-initial px-5 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />
                {submitMutation.isPending ? "Submitting…" : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-3">
        {requests.map((req) => {
          const StatusIcon = STATUS_ICONS[req.status] || Clock;
          return (
            <div
              key={req.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Avatar + Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    <img
                      src={req.requestedByAvatar}
                      alt={req.requestedBy}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{req.requestedBy}</span>
                      <span className="text-[10px] font-semibold text-slate-400">{req.department}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${PRIORITY_COLORS[req.priority]}`}>
                        {req.priority}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-700 mt-1">{req.description}</div>
                    <div className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-2">
                      {req.justification}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2.5">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Package className="w-3 h-3" />
                        {req.assetCategory}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Clock className="w-3 h-3" />
                        {req.requestDate}
                      </div>
                      {req.respondedBy && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <AlertCircle className="w-3 h-3" />
                          {req.respondedBy} · {req.responseDate}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status + Actions */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_COLORS[req.status]}`}>
                    <StatusIcon className="w-3 h-3" />
                    {req.status}
                  </div>
                  {canApprove && req.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => respondMutation.mutate({ id: req.id, status: "REJECTED" })}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600 text-[10px] font-bold rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => respondMutation.mutate({ id: req.id, status: "APPROVED" })}
                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {requests.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">No asset requests yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
