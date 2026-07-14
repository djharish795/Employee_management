"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";

interface AddConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddConsentModal({ isOpen, onClose, onSuccess }: AddConsentModalProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);

  // Fetch employees to populate the dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ["employees-list", accessToken],
    queryFn: async () => {
      const url = process.env.NEXT_PUBLIC_API_URL!;
      const res = await fetch(`${url}/employees?page=1&limit=500`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    enabled: isOpen && !!accessToken,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !purpose) return;
    setIsSubmitting(true);

    try {
      const url = process.env.NEXT_PUBLIC_API_URL!;
      const res = await fetch(`${url}/compliance/consents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ employeeId, purpose }),
      });

      if (!res.ok) throw new Error("Failed to add consent");

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error adding consent log");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Add Consent Record</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</label>
            <select
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Employee...</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purpose of Data Processing</label>
            <textarea
              required
              rows={3}
              placeholder="E.g., Payroll processing, background verification..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
