"use client";

import React from "react";
import AssetsLayout from "@/components/modules/assets/assets-layout";
import DashboardPanel from "@/components/modules/assets/dashboard-panel";
import { useAssetsTestStore } from "@/store/assets-test";

export default function AssetsDashboardPage() {
  const { activeRole, setActiveRole } = useAssetsTestStore();

  return (
    <AssetsLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <DashboardPanel activeRole={activeRole} />
    </AssetsLayout>
  );
}
