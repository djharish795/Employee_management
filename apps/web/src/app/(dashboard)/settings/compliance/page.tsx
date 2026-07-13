"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import CompliancePanel from "@/components/modules/settings/compliance-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function SettingsCompliancePage() {
  const { role: activeRole } = usePermissions();

  return (
    <SettingsLayout  >
      <CompliancePanel  />
    </SettingsLayout>
  );
}
