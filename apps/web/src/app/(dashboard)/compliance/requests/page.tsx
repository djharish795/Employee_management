"use client";

import React from "react";
import ComplianceLayout from "@/components/modules/compliance/compliance-layout";
import RequestsPanel from "@/components/modules/compliance/requests-panel";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuthStore } from "@/store/auth";

export default function ComplianceRequestsPage() {
  const { role: testRole } = usePermissions();
  const currentUserRole = useAuthStore((state) => state.role) || "EMPLOYEE";
  const isEmployeeLevel = ["EMPLOYEE", "MANAGER", "TEAM_LEAD", "IT"].includes(currentUserRole);
  const effectiveRole = isEmployeeLevel ? "EMPLOYEE" : testRole;

  return (
    <ComplianceLayout  >
      <RequestsPanel  />
    </ComplianceLayout>
  );
}
