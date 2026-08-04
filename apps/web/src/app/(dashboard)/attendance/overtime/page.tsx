"use client";

import React, { useState } from "react";
import AttendanceLayout from "@/components/modules/attendance/attendance-layout";
import { PendingOvertimeTable } from "@/components/modules/team-lead/pending-overtime-table";
import RegularizationPanel from "@/components/modules/attendance/regularization-panel";

export default function OvertimeApprovalsPage() {
  const [activeTab, setActiveTab] = useState<"overtime" | "regularization">("overtime");

  return (
    <AttendanceLayout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Team Approvals</h2>
            <p className="text-sm text-slate-500 mt-1">
              Review and approve pending requests from your team.
            </p>
          </div>
          
          {/* Approvals Toggle */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 shadow-sm inline-flex w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("overtime")}
              className={`flex-1 sm:w-48 py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'overtime' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
            >
              Overtime Approvals
            </button>
            <button
              onClick={() => setActiveTab("regularization")}
              className={`flex-1 sm:w-48 py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'regularization' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
            >
              Regularizations
            </button>
          </div>
        </div>
        
        <div className="min-h-[300px]">
          {activeTab === "overtime" ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <PendingOvertimeTable />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <RegularizationPanel mode="org" />
            </div>
          )}
        </div>
      </div>
    </AttendanceLayout>
  );
}
