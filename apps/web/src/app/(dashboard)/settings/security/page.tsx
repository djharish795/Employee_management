"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import SecurityPanel from "@/components/modules/settings/security-panel";
import { useSettingsTestStore } from "@/store/settings-test";

export default function SettingsSecurityPage() {
  const { activeRole, setActiveRole } = useSettingsTestStore();

  return (
    <SettingsLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <SecurityPanel activeRole={activeRole} />
    </SettingsLayout>
  );
}
