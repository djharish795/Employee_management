"use client";

import React from "react";
import ComplianceLayout from "@/components/modules/compliance/compliance-layout";
import RequestsPanel from "@/components/modules/compliance/requests-panel";
import { useComplianceTestStore } from "@/store/compliance-test";

export default function ComplianceRequestsPage() {
  const { activeRole, setActiveRole } = useComplianceTestStore();

  return (
    <ComplianceLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <RequestsPanel activeRole={activeRole} />
    </ComplianceLayout>
  );
}
