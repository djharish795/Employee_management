"use client";

import React, { useEffect } from "react";
import AssetsLayout from "@/components/modules/assets/assets-layout";
import DashboardPanel from "@/components/modules/assets/dashboard-panel";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuthStore } from "@/store/auth";

export default function AssetsDashboardPage() {
  const { role: activeRole } = usePermissions();
  const currentUserRole = useAuthStore((state) => state.role) || "EMPLOYEE";
  const isEmployeeLevel = ["EMPLOYEE", "MANAGER", "TEAM_LEAD"].includes(currentUserRole);
  const effectiveRole = isEmployeeLevel ? "EMPLOYEE" : activeRole;


  return (
    <AssetsLayout  >
      <DashboardPanel  />
    </AssetsLayout>
  );
}
