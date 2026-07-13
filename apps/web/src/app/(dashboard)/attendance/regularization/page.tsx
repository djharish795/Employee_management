"use client";

import React from "react";
import AttendanceLayout from "@/components/modules/attendance/attendance-layout";
import RegularizationPanel from "@/components/modules/attendance/regularization-panel";
import { useAuthStore } from "@/store/auth";

export default function AttendanceRegularizationPage() {
  const role = useAuthStore((state) => state.role) ?? "EMPLOYEE";
  const activeRole = role.toUpperCase() as "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";

  return (
    <AttendanceLayout >
      <RegularizationPanel  />
    </AttendanceLayout>
  );
}
