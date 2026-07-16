"use client";

import React from "react";
import SettingsLayout from "@/components/modules/settings/settings-layout";
import NotificationsPanel from "@/components/modules/settings/notifications-panel";
import { useSettingsTestStore } from "@/store/settings-test";

export default function SettingsNotificationsPage() {
  const { activeRole, setActiveRole } = useSettingsTestStore();

  return (
    <SettingsLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <NotificationsPanel activeRole={activeRole} />
    </SettingsLayout>
  );
}
