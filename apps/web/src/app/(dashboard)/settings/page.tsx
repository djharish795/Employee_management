"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import SettingsDashboardPanel from "@/components/modules/settings/dashboard-panel";
import { useSettingsTestStore } from "@/store/settings-test";

export default function SettingsDashboardPage() {
  const { activeRole, setActiveRole } = useSettingsTestStore();

  return (
    <SettingsLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <SettingsDashboardPanel activeRole={activeRole} />
    </SettingsLayout>
  );
}
