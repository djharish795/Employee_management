"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import UsersPanel from "@/components/modules/settings/users-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function SettingsUsersPage() {
  const { role: activeRole } = usePermissions();

  return (
    <SettingsLayout  >
      <UsersPanel  />
    </SettingsLayout>
  );
}
