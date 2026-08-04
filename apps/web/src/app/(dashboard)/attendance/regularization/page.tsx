"use client";

import React from "react";
import AttendanceLayout from "@/components/modules/attendance/attendance-layout";
import RegularizationPanel from "@/components/modules/attendance/regularization-panel";
import { useAuthStore } from "@/store/auth";

export default function AttendanceRegularizationPage() {
  const role = useAuthStore((state) => state.role) ?? "EMPLOYEE";
  const activeRole = role.toUpperCase() as "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";

  const isManagerOrAbove = ["OM", "MANAGER", "CEO", "CTO", "HR", "CHRO", "TEAM_LEAD"].includes(activeRole);

  return (
    <AttendanceLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">My Regularization Requests</h2>
          <RegularizationPanel />
        </div>
      </div>
    </AttendanceLayout>
  );
}
