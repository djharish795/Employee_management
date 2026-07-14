"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import SettingsDashboardPanel from "@/components/modules/settings/dashboard-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function SettingsDashboardPage() {
  const { role: activeRole } = usePermissions();

  return (
    <SettingsLayout  >
      <SettingsDashboardPanel  />
    </SettingsLayout>
  );
}
