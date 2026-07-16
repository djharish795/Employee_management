"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import UsersPanel from "@/components/modules/settings/users-panel";
import { useSettingsTestStore } from "@/store/settings-test";

export default function SettingsUsersPage() {
  const { activeRole, setActiveRole } = useSettingsTestStore();

  return (
    <SettingsLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <UsersPanel activeRole={activeRole} />
    </SettingsLayout>
  );
}
