"use client";

import React from "react";
import AttendanceLayout from "@/components/modules/attendance/attendance-layout";
import { PendingOvertimeTable } from "@/components/modules/team-lead/pending-overtime-table";

export default function OvertimeApprovalsPage() {
  return (
    <AttendanceLayout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Overtime Approvals</h2>
            <p className="text-sm text-slate-500 mt-1">
              Review and approve pending overtime requests from your direct reports.
            </p>
          </div>
        </div>
        
        <PendingOvertimeTable />
      </div>
    </AttendanceLayout>
  );
}
