"use client";

import React from "react";
import AssetsLayout from "@/components/modules/assets/assets-layout";
import RequestsPanel from "@/components/modules/assets/requests-panel";
import { useAssetsTestStore } from "@/store/assets-test";

export default function AssetsRequestsPage() {
  const { activeRole, setActiveRole } = useAssetsTestStore();

  return (
    <AssetsLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <RequestsPanel activeRole={activeRole} />
    </AssetsLayout>
  );
}
