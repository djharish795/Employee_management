"use client";

import React from "react";
import ComplianceLayout from "@/components/modules/compliance/compliance-layout";
import ConsentsPanel from "@/components/modules/compliance/consents-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function ComplianceConsentsPage() {
  const { role: activeRole } = usePermissions();

  return (
    <ComplianceLayout  >
      <ConsentsPanel  />
    </ComplianceLayout>
  );
}
