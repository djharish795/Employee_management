"use client";

import React from "react";
import AuditLayout from "@/components/modules/audit/audit-layout";
import SecurityEventsPanel from "@/components/modules/audit/security-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function AuditSecurityPage() {
  const { role: activeRole } = usePermissions();

  return (
    <AuditLayout  >
      <SecurityEventsPanel  />
    </AuditLayout>
  );
}
