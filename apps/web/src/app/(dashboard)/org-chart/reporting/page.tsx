"use client";

import React from "react";
import OrgLayout from "@/components/modules/org-chart/org-layout";
import ReportingPanel from "@/components/modules/org-chart/reporting-panel";
import { useOrgTestStore } from "@/store/org-test";

export default function OrgReportingPage() {
  const { activeRole, setActiveRole } = useOrgTestStore();

  return (
    <OrgLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <ReportingPanel activeRole={activeRole} />
    </OrgLayout>
  );
}
