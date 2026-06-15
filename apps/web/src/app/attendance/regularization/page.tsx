"use client";

import React from "react";
import AttendanceLayout from "@/components/modules/attendance/attendance-layout";
import RegularizationPanel from "@/components/modules/attendance/regularization-panel";
import { useAttendanceTestStore } from "@/store/attendance-test";

export default function AttendanceRegularizationPage() {
  const { activeRole, setActiveRole } = useAttendanceTestStore();

  return (
    <AttendanceLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <RegularizationPanel activeRole={activeRole} />
    </AttendanceLayout>
  );
}
