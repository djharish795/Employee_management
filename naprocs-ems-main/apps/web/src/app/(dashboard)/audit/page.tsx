"use client";

import React from "react";
import AuditLayout from "@/components/modules/audit/audit-layout";
import AuditDashboardPanel from "@/components/modules/audit/dashboard-panel";
import { useAuditTestStore } from "@/store/audit-test";

export default function AuditDashboardPage() {
  const { activeRole, setActiveRole } = useAuditTestStore();

  return (
    <AuditLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <AuditDashboardPanel activeRole={activeRole} />
    </AuditLayout>
  );
}
