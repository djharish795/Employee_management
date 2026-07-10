"use client";

import React from "react";
import AssetsLayout from "@/components/modules/assets/assets-layout";
import ReportsPanel from "@/components/modules/assets/reports-panel";
import { useAssetsTestStore } from "@/store/assets-test";
import { useAuthStore } from "@/store/auth";

export default function AssetsReportsPage() {
  const { activeRole: testRole, setActiveRole } = useAssetsTestStore();
  const currentUserRole = useAuthStore((state) => state.role) || "EMPLOYEE";
  const isEmployeeLevel = ["EMPLOYEE", "MANAGER", "TEAM_LEAD"].includes(currentUserRole);
  const effectiveRole = isEmployeeLevel ? "EMPLOYEE" : testRole;

  return (
    <AssetsLayout activeRole={effectiveRole as any} onRoleChange={setActiveRole}>
      <ReportsPanel activeRole={effectiveRole as any} />
    </AssetsLayout>
  );
}
