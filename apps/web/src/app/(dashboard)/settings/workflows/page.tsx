"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import WorkflowsPanel from "@/components/modules/settings/workflows-panel";
import { useSettingsTestStore } from "@/store/settings-test";

export default function SettingsWorkflowsPage() {
  const { activeRole, setActiveRole } = useSettingsTestStore();

  return (
    <SettingsLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <WorkflowsPanel activeRole={activeRole} />
    </SettingsLayout>
  );
}
