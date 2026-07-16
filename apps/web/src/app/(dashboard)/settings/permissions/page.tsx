"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import PermissionsPanel from "@/components/modules/settings/permissions-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function SettingsPermissionsPage() {
  const { role: activeRole } = usePermissions();

  return (
    <SettingsLayout  >
      <PermissionsPanel  />
    </SettingsLayout>
  );
}
