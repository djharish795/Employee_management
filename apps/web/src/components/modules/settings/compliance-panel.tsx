"use client";

import { usePermissions } from "@/hooks/use-permissions";
import React from "react";
import { Database, ShieldCheck, Save, Trash2 } from "lucide-react";
import { SettingsRole } from "@/types/settings";

interface CompliancePanelProps {
  
}

export default function CompliancePanel() {
  const { canManageCompliance: canManage } = usePermissions();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Data Retention & Compliance</h2>
          <p className="text-xs font-semibold text-slate-500">Configure global privacy rules and data retention timelines.</p>
        </div>
        {canManage && (
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
            <Save className="w-4 h-4" /> Save Compliance Settings
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Retention Policies */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Data Retention Timelines</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block">Ex-Employee Records</label>
                <div className="text-[10px] text-slate-500 mt-0.5">Years to retain PII after termination.</div>
              </div>
              <select disabled={!canManage} defaultValue="7" className="h-8 px-2 text-xs border border-slate-200 rounded focus:outline-none focus:border-indigo-500 disabled:bg-slate-50 bg-white font-medium">
                <option value="1">1 Year</option>
                <option value="3">3 Years</option>
                <option value="5">5 Years</option>
                <option value="7">7 Years</option>
                <option value="infinite">Indefinite</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block">System Audit Logs</label>
                <div className="text-[10px] text-slate-500 mt-0.5">Duration to retain immutable activity logs.</div>
              </div>
              <select disabled={!canManage} defaultValue="1" className="h-8 px-2 text-xs border border-slate-200 rounded focus:outline-none focus:border-indigo-500 disabled:bg-slate-50 bg-white font-medium">
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
                <option value="1">1 Year</option>
                <option value="3">3 Years</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy Controls */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Privacy & Consent Enforcements</h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Strict DPDPA Mode</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Enforce explicit consent checks before reading PII via API.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked disabled={!canManage} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Auto-Mask PII in UI</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Mask Aadhaar/PAN across all admin screens by default.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked disabled={!canManage} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 mt-4">
              <Trash2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">Data Deletion Policy</h4>
                <p className="text-[10px] text-amber-700 mt-0.5">When an employee invokes Right to Erasure, automatically scrub PII but retain anonymized payroll histories for tax compliance.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
