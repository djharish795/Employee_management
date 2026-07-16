"use client";

import React, { useEffect } from "react";
import AttendanceLayout from "@/components/modules/attendance/attendance-layout";
import DashboardPanel from "@/components/modules/attendance/dashboard-panel";
import { useAttendanceTestStore } from "@/store/attendance-test";
import { useAuthStore } from "@/store/auth";

export default function AttendanceDashboardPage() {
  const { activeRole, setActiveRole } = useAttendanceTestStore();
  const authRole = useAuthStore((state) => state.role);

  useEffect(() => {
    if (authRole) {
      setActiveRole(authRole as any);
    }
  }, [authRole, setActiveRole]);

  return (
    <AttendanceLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <DashboardPanel activeRole={activeRole} />
    </AttendanceLayout>
  );
}
