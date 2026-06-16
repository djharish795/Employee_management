"use client";

import React from "react";
import LeavesLayout from "@/components/modules/leaves/leaves-layout";
import DashboardPanel from "@/components/modules/leaves/dashboard-panel";
import { useLeavesTestStore } from "@/store/leaves-test";

export default function LeavesDashboardPage() {
  const { activeRole, setActiveRole } = useLeavesTestStore();

  return (
    <LeavesLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <DashboardPanel activeRole={activeRole} />
    </LeavesLayout>
  );
}
