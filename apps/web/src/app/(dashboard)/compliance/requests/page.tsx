"use client";

import React from "react";
import ComplianceLayout from "@/components/modules/compliance/compliance-layout";
import RequestsPanel from "@/components/modules/compliance/requests-panel";
import { useComplianceTestStore } from "@/store/compliance-test";
import { useAuthStore } from "@/store/auth";

export default function ComplianceRequestsPage() {
  const { activeRole: testRole, setActiveRole } = useComplianceTestStore();
  const currentUserRole = useAuthStore((state) => state.role) || "EMPLOYEE";
  const isEmployeeLevel = ["EMPLOYEE", "MANAGER", "TEAM_LEAD", "IT"].includes(currentUserRole);
  const effectiveRole = isEmployeeLevel ? "EMPLOYEE" : testRole;

  return (
    <ComplianceLayout activeRole={testRole} onRoleChange={setActiveRole}>
      <RequestsPanel activeRole={effectiveRole as any} />
    </ComplianceLayout>
  );
}
