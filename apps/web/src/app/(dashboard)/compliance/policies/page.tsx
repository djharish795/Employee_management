"use client";

import React from "react";
import ComplianceLayout from "@/components/modules/compliance/compliance-layout";
import PoliciesPanel from "@/components/modules/compliance/policies-panel";
import { useComplianceTestStore } from "@/store/compliance-test";

export default function CompliancePoliciesPage() {
  const { activeRole, setActiveRole } = useComplianceTestStore();

  return (
    <ComplianceLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <PoliciesPanel activeRole={activeRole} />
    </ComplianceLayout>
  );
}
