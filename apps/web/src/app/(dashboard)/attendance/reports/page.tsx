"use client";

import React from "react";
import AttendanceLayout from "@/components/modules/attendance/attendance-layout";
import ReportsPanel from "@/components/modules/attendance/reports-panel";
import { useAuthStore } from "@/store/auth";

export default function AttendanceReportsPage() {
  const role = useAuthStore((state) => state.role) ?? "EMPLOYEE";
  const activeRole = role.toUpperCase() as "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";

  return (
    <AttendanceLayout activeRole={activeRole}>
      <ReportsPanel activeRole={activeRole} />
    </AttendanceLayout>
  );
}
