"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import IntegrationsPanel from "@/components/modules/settings/integrations-panel";
import { useSettingsTestStore } from "@/store/settings-test";

export default function SettingsIntegrationsPage() {
  const { activeRole, setActiveRole } = useSettingsTestStore();

  return (
    <SettingsLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <IntegrationsPanel activeRole={activeRole} />
    </SettingsLayout>
  );
}
