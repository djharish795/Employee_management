"use client";

import React from "react";
import ComplianceLayout from "@/components/modules/compliance/compliance-layout";
import ReportsPanel from "@/components/modules/compliance/reports-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function ComplianceReportsPage() {
  const { role: activeRole } = usePermissions();

  return (
    <ComplianceLayout  >
      <ReportsPanel  />
    </ComplianceLayout>
  );
}
