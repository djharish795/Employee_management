"use client";

import React, { useEffect } from "react";
import AssetsLayout from "@/components/modules/assets/assets-layout";
import DashboardPanel from "@/components/modules/assets/dashboard-panel";
import { useAssetsTestStore } from "@/store/assets-test";
import { useAuthStore } from "@/store/auth";

export default function AssetsDashboardPage() {
  const { activeRole, setActiveRole } = useAssetsTestStore();
  const currentUserRole = useAuthStore((state) => state.role) || "EMPLOYEE";
  const isEmployeeLevel = ["EMPLOYEE", "MANAGER", "TEAM_LEAD"].includes(currentUserRole);
  const effectiveRole = isEmployeeLevel ? "EMPLOYEE" : activeRole;

  return (
    <AssetsLayout activeRole={effectiveRole as any} onRoleChange={setActiveRole}>
      <DashboardPanel activeRole={effectiveRole as any} />
    </AssetsLayout>
  );
}
