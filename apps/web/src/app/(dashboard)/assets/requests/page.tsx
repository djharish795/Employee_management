"use client";

import React from "react";
import AssetsLayout from "@/components/modules/assets/assets-layout";
import RequestsPanel from "@/components/modules/assets/requests-panel";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuthStore } from "@/store/auth";

export default function AssetsRequestsPage() {
  const { role: testRole } = usePermissions();
  const currentUserRole = useAuthStore((state) => state.role) || "EMPLOYEE";
  const isEmployeeLevel = ["EMPLOYEE", "MANAGER", "TEAM_LEAD"].includes(currentUserRole);
  const effectiveRole = isEmployeeLevel ? "EMPLOYEE" : testRole;

  return (
    <AssetsLayout  >
      <RequestsPanel  />
    </AssetsLayout>
  );
}
