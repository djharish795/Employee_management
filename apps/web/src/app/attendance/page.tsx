"use client";

import React from "react";
import AttendanceLayout from "@/components/modules/attendance/attendance-layout";
import DashboardPanel from "@/components/modules/attendance/dashboard-panel";
import { useAttendanceTestStore } from "@/store/attendance-test";

export default function AttendanceDashboardPage() {
  const { activeRole, setActiveRole } = useAttendanceTestStore();

  return (
    <AttendanceLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <DashboardPanel activeRole={activeRole} />
    </AttendanceLayout>
  );
}
