"use client";

import React from "react";
import AssetsLayout from "@/components/modules/assets/assets-layout";
import ReportsPanel from "@/components/modules/assets/reports-panel";
import { useAssetsTestStore } from "@/store/assets-test";

export default function AssetsReportsPage() {
  const { activeRole, setActiveRole } = useAssetsTestStore();

  return (
    <AssetsLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <ReportsPanel activeRole={activeRole} />
    </AssetsLayout>
  );
}
