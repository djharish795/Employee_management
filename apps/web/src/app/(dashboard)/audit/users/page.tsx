"use client";

import React from "react";
import AuditLayout from "@/components/modules/audit/audit-layout";
import UserActivityPanel from "@/components/modules/audit/user-activity-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function AuditUsersPage() {
  const { role: activeRole } = usePermissions();

  return (
    <AuditLayout  >
      <UserActivityPanel  />
    </AuditLayout>
  );
}
