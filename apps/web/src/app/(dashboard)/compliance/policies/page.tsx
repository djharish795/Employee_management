"use client";

import React from "react";
import ComplianceLayout from "@/components/modules/compliance/compliance-layout";
import PoliciesPanel from "@/components/modules/compliance/policies-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function CompliancePoliciesPage() {
  const { role: activeRole } = usePermissions();

  return (
    <ComplianceLayout  >
      <PoliciesPanel  />
    </ComplianceLayout>
  );
}
