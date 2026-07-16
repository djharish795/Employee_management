"use client";

import React from "react";
import ComplianceLayout from "@/components/modules/compliance/compliance-layout";
import ConsentsPanel from "@/components/modules/compliance/consents-panel";
import { useComplianceTestStore } from "@/store/compliance-test";

export default function ComplianceConsentsPage() {
  const { activeRole, setActiveRole } = useComplianceTestStore();

  return (
    <ComplianceLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <ConsentsPanel activeRole={activeRole} />
    </ComplianceLayout>
  );
}
