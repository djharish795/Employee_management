"use client";

import React from "react";
import ComplianceLayout from "@/components/modules/compliance/compliance-layout";
import ReportsPanel from "@/components/modules/compliance/reports-panel";
import { useComplianceTestStore } from "@/store/compliance-test";

export default function ComplianceReportsPage() {
  const { activeRole, setActiveRole } = useComplianceTestStore();

  return (
    <ComplianceLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <ReportsPanel activeRole={activeRole} />
    </ComplianceLayout>
  );
}
