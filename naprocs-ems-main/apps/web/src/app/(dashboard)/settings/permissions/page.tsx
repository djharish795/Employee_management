"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import PermissionsPanel from "@/components/modules/settings/permissions-panel";
import { useSettingsTestStore } from "@/store/settings-test";

export default function SettingsPermissionsPage() {
  const { activeRole, setActiveRole } = useSettingsTestStore();

  return (
    <SettingsLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <PermissionsPanel activeRole={activeRole} />
    </SettingsLayout>
  );
}
