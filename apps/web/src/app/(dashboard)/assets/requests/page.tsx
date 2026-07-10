"use client";

import React from "react";
import AssetsLayout from "@/components/modules/assets/assets-layout";
import RequestsPanel from "@/components/modules/assets/requests-panel";
import { useAssetsTestStore } from "@/store/assets-test";
import { useAuthStore } from "@/store/auth";

export default function AssetsRequestsPage() {
  const { activeRole: testRole, setActiveRole } = useAssetsTestStore();
  const currentUserRole = useAuthStore((state) => state.role) || "EMPLOYEE";
  const isEmployeeLevel = ["EMPLOYEE", "MANAGER", "TEAM_LEAD"].includes(currentUserRole);
  const effectiveRole = isEmployeeLevel ? "EMPLOYEE" : testRole;

  return (
    <AssetsLayout activeRole={testRole} onRoleChange={setActiveRole}>
      <RequestsPanel activeRole={effectiveRole as any} />
    </AssetsLayout>
  );
}
