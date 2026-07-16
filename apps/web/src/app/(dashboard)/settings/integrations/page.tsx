"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import IntegrationsPanel from "@/components/modules/settings/integrations-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function SettingsIntegrationsPage() {
  const { role: activeRole } = usePermissions();

  return (
    <SettingsLayout  >
      <IntegrationsPanel  />
    </SettingsLayout>
  );
}
