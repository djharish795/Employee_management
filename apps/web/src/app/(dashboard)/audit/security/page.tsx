"use client";

import React from "react";
import AuditLayout from "@/components/modules/audit/audit-layout";
import SecurityEventsPanel from "@/components/modules/audit/security-panel";
import { useAuditTestStore } from "@/store/audit-test";

export default function AuditSecurityPage() {
  const { activeRole, setActiveRole } = useAuditTestStore();

  return (
    <AuditLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <SecurityEventsPanel activeRole={activeRole} />
    </AuditLayout>
  );
}
