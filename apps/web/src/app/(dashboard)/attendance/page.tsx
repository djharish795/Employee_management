"use client";

import React, { useEffect } from "react";
import AttendanceLayout from "@/components/modules/attendance/attendance-layout";
import DashboardPanel from "@/components/modules/attendance/dashboard-panel";
import { useAuthStore } from "@/store/auth";

export default function AttendanceDashboardPage() {
  const role = useAuthStore((state) => state.role) ?? "EMPLOYEE";

  const effectiveRole = (() => {
    if (role) return role.toUpperCase();
    if (typeof document !== "undefined") {
      const match = document.cookie.match(new RegExp("(^| )role=([^;]+)"));
      return match ? decodeURIComponent(match[2]).toUpperCase() : "EMPLOYEE";
    }
    return "EMPLOYEE";
  })();

  // Map backend roles to attendance panel roles
  const attendancePanelRole = ((): "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE" => {
    if (["SUPER_ADMIN", "IT"].includes(effectiveRole)) return "ADMIN";
    if (["HR", "CHRO"].includes(effectiveRole)) return "HR";
    if (["CEO", "COO"].includes(effectiveRole)) return "CEO";
    if (["CTO", "CFO", "FINANCE", "MANAGER", "TEAM_LEAD"].includes(effectiveRole)) return "MANAGER";
    return "EMPLOYEE";
  })();

  return (
    <AttendanceLayout >
      <DashboardPanel  />
    </AttendanceLayout>
  );
}
