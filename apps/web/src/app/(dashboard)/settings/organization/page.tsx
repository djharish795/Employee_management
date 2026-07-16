"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import OrgPanel from "@/components/modules/settings/org-panel";
import { useSettingsTestStore } from "@/store/settings-test";

export default function SettingsOrganizationPage() {
  const { activeRole, setActiveRole } = useSettingsTestStore();

  return (
    <SettingsLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <OrgPanel activeRole={activeRole} />
    </SettingsLayout>
  );
}
