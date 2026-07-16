"use client";

import React, { useEffect } from "react";
import LeavesLayout from "@/components/modules/leaves/leaves-layout";
import DashboardPanel from "@/components/modules/leaves/dashboard-panel";
import { useLeavesTestStore } from "@/store/leaves-test";
import { useAuthStore } from "@/store/auth";

export default function LeavesDashboardPage() {
  const { activeRole, setActiveRole } = useLeavesTestStore();
  const authRole = useAuthStore((state) => state.role);

  useEffect(() => {
    if (authRole) {
      setActiveRole(authRole as any);
    }
  }, [authRole, setActiveRole]);

  return (
    <LeavesLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <DashboardPanel activeRole={activeRole} />
    </LeavesLayout>
  );
}
