"use client";

import React from "react";
import AttendanceLayout from "@/components/modules/attendance/attendance-layout";
import HistoryPanel from "@/components/modules/attendance/history-panel";
import { useAttendanceTestStore } from "@/store/attendance-test";

export default function AttendanceHistoryPage() {
  const { activeRole, setActiveRole } = useAttendanceTestStore();

  return (
    <AttendanceLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <HistoryPanel activeRole={activeRole} />
    </AttendanceLayout>
  );
}
