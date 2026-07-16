"use client";

import React from "react";
import AuditLayout from "@/components/modules/audit/audit-layout";
import EventsExplorerPanel from "@/components/modules/audit/events-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function AuditEventsPage() {
  const { role: activeRole } = usePermissions();

  return (
    <AuditLayout  >
      <EventsExplorerPanel  />
    </AuditLayout>
  );
}
