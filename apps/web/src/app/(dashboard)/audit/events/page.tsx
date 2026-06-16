"use client";

import React from "react";
import AuditLayout from "@/components/modules/audit/audit-layout";
import EventsExplorerPanel from "@/components/modules/audit/events-panel";
import { useAuditTestStore } from "@/store/audit-test";

export default function AuditEventsPage() {
  const { activeRole, setActiveRole } = useAuditTestStore();

  return (
    <AuditLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <EventsExplorerPanel activeRole={activeRole} />
    </AuditLayout>
  );
}
