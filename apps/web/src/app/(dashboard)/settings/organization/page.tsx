"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import OrgPanel from "@/components/modules/settings/org-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function SettingsOrganizationPage() {
  const { role: activeRole } = usePermissions();

  return (
    <SettingsLayout  >
      <OrgPanel  />
    </SettingsLayout>
  );
}
