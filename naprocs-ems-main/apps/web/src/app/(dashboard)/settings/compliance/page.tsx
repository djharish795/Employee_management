"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import CompliancePanel from "@/components/modules/settings/compliance-panel";
import { useSettingsTestStore } from "@/store/settings-test";

export default function SettingsCompliancePage() {
  const { activeRole, setActiveRole } = useSettingsTestStore();

  return (
    <SettingsLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <CompliancePanel activeRole={activeRole} />
    </SettingsLayout>
  );
}
