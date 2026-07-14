"use client";

import { usePermissions } from "@/hooks/use-permissions";
import React from "react";
import { Workflow, ArrowRight, FileCheck, Save, Clock, Trash2 } from "lucide-react";
import { SettingsRole } from "@/types/settings";

interface WorkflowsPanelProps {
  
}

export default function WorkflowsPanel() {
  const { canManageSettings: canManage } = usePermissions();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Workflow Configurations</h2>
          <p className="text-xs font-semibold text-slate-500">Design approval chains for HR and operational processes.</p>
        </div>
      </div>

      {/* Leave Approval Workflow */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Leave Approval Chain</h3>
          </div>
          {canManage && (
            <button className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline">Edit Workflow</button>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white border border-slate-300 rounded-full flex items-center justify-center text-slate-600 shadow-sm z-10">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="mt-2 text-xs font-bold text-slate-900">Employee</div>
              <div className="text-[10px] text-slate-500">Initiates Request</div>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-300 hidden md:block" />
            <div className="w-0.5 h-6 bg-slate-300 md:hidden"></div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-teal-50 border-2 border-teal-500 text-teal-600 rounded-full flex items-center justify-center shadow-sm z-10">
                1
              </div>
              <div className="mt-2 text-xs font-bold text-slate-900">Direct Manager</div>
              <div className="text-[10px] text-slate-500">L1 Approval</div>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-300 hidden md:block" />
            <div className="w-0.5 h-6 bg-slate-300 md:hidden"></div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-indigo-50 border-2 border-indigo-500 text-indigo-600 rounded-full flex items-center justify-center shadow-sm z-10">
                2
              </div>
              <div className="mt-2 text-xs font-bold text-slate-900">HR Department</div>
              <div className="text-[10px] text-slate-500">Final Verification</div>
            </div>

          </div>

          <div className="mt-6 flex flex-col gap-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked disabled={!canManage} className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-600 disabled:opacity-50" />
              <span className="text-xs font-medium text-slate-700">Auto-approve if L1 manager does not respond within 48 hours</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" disabled={!canManage} className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-600 disabled:opacity-50" />
              <span className="text-xs font-medium text-slate-700">Require CEO approval for leaves &gt; 15 days</span>
            </label>
          </div>
        </div>
      </div>
      
    </div>
  );
}
