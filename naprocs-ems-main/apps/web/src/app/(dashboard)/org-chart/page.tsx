"use client";

import React from "react";
import OrgLayout from "@/components/modules/org-chart/org-layout";
import OrgDashboardPanel from "@/components/modules/org-chart/dashboard-panel";
import { useOrgTestStore } from "@/store/org-test";

export default function OrgChartDashboardPage() {
  const { activeRole, setActiveRole } = useOrgTestStore();

  return (
    <OrgLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <OrgDashboardPanel activeRole={activeRole} />
    </OrgLayout>
  );
}
