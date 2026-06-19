"use client";

import React, { useEffect } from "react";
import AssetsLayout from "@/components/modules/assets/assets-layout";
import DashboardPanel from "@/components/modules/assets/dashboard-panel";
import { useAssetsTestStore } from "@/store/assets-test";
import { useAuthStore } from "@/store/auth";

export default function AssetsDashboardPage() {
  const { activeRole, setActiveRole } = useAssetsTestStore();
  const authRole = useAuthStore((state) => state.role);

  useEffect(() => {
    if (authRole) {
      setActiveRole(authRole as any);
    }
  }, [authRole, setActiveRole]);

  return (
    <AssetsLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <DashboardPanel activeRole={activeRole} />
    </AssetsLayout>
  );
}
