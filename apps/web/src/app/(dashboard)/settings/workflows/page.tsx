"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import WorkflowsPanel from "@/components/modules/settings/workflows-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function SettingsWorkflowsPage() {
  const { role: activeRole } = usePermissions();

  return (
    <SettingsLayout  >
      <WorkflowsPanel  />
    </SettingsLayout>
  );
}
