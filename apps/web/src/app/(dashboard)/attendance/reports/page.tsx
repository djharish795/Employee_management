"use client";

import React from "react";
import AttendanceLayout from "@/components/modules/attendance/attendance-layout";
import ReportsPanel from "@/components/modules/attendance/reports-panel";
import { useAttendanceTestStore } from "@/store/attendance-test";

export default function AttendanceReportsPage() {
  const { activeRole, setActiveRole } = useAttendanceTestStore();

  return (
    <AttendanceLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <ReportsPanel activeRole={activeRole} />
    </AttendanceLayout>
  );
}
