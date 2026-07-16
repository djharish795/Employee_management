"use client";

import React from "react";
import AuditLayout from "@/components/modules/audit/audit-layout";
import UserActivityPanel from "@/components/modules/audit/user-activity-panel";
import { useAuditTestStore } from "@/store/audit-test";

export default function AuditUsersPage() {
  const { activeRole, setActiveRole } = useAuditTestStore();

  return (
    <AuditLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <UserActivityPanel activeRole={activeRole} />
    </AuditLayout>
  );
}
