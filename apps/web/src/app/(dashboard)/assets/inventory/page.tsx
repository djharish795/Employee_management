"use client";

import React from "react";
import AssetsLayout from "@/components/modules/assets/assets-layout";
import InventoryPanel from "@/components/modules/assets/inventory-panel";
import { useAssetsTestStore } from "@/store/assets-test";

export default function AssetsInventoryPage() {
  const { activeRole, setActiveRole } = useAssetsTestStore();

  return (
    <AssetsLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <InventoryPanel activeRole={activeRole} />
    </AssetsLayout>
  );
}
