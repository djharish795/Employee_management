"use client";

import React from "react";
import AssetsLayout from "@/components/modules/assets/assets-layout";
import DashboardPanel from "@/components/modules/assets/dashboard-panel";

export default function MyAssetsPage() {
  return (
    <AssetsLayout>
      <DashboardPanel />
    </AssetsLayout>
  );
}
