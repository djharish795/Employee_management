"use client";

import React from "react";
import AssetsLayout from "@/components/modules/assets/assets-layout";
import RequestsPanel from "@/components/modules/assets/requests-panel";

export default function MyRequestsPage() {
  return (
    <AssetsLayout>
      <RequestsPanel />
    </AssetsLayout>
  );
}
