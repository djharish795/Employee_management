"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import NotificationsPanel from "@/components/modules/settings/notifications-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function SettingsNotificationsPage() {
  const { role: activeRole } = usePermissions();

  return (
    <SettingsLayout  >
      <NotificationsPanel  />
    </SettingsLayout>
  );
}
