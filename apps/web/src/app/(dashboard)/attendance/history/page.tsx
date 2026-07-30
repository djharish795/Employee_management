"use client";

import React from "react";
import AttendanceLayout from "@/components/modules/attendance/attendance-layout";
import HistoryPanel from "@/components/modules/attendance/history-panel";
import { useAuthStore } from "@/store/auth";

export default function AttendanceHistoryPage() {
  const role = useAuthStore((state) => state.role) ?? "EMPLOYEE";
  const activeRole = role.toUpperCase() as "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";

  return (
    <AttendanceLayout >
      <HistoryPanel mode="personal" />
    </AttendanceLayout>
  );
}
