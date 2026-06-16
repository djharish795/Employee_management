"use client";

import React from "react";
import ComplianceLayout from "@/components/modules/compliance/compliance-layout";
import ComplianceDashboardPanel from "@/components/modules/compliance/dashboard-panel";
import { useComplianceTestStore } from "@/store/compliance-test";

export default function ComplianceDashboardPage() {
  const { activeRole, setActiveRole } = useComplianceTestStore();

  return (
    <ComplianceLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <ComplianceDashboardPanel activeRole={activeRole} />
    </ComplianceLayout>
  );
}
