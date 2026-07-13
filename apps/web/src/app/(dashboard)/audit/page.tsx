"use client";

import React from "react";
import AuditLayout from "@/components/modules/audit/audit-layout";
import AuditDashboardPanel from "@/components/modules/audit/dashboard-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function AuditDashboardPage() {
  const { role: activeRole } = usePermissions();

  return (
    <AuditLayout  >
      <AuditDashboardPanel  />
    </AuditLayout>
  );
}
