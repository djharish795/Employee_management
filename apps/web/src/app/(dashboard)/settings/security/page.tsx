"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import SecurityPanel from "@/components/modules/settings/security-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function SettingsSecurityPage() {
  const { role: activeRole } = usePermissions();

  return (
    <SettingsLayout  >
      <SecurityPanel  />
    </SettingsLayout>
  );
}
