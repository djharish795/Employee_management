"use client";

import React from "react";
import OrgLayout from "@/components/modules/org-chart/org-layout";
import ReportingPanel from "@/components/modules/org-chart/reporting-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function OrgReportingPage() {
  const { role: activeRole } = usePermissions();

  return (
    <OrgLayout  >
      <ReportingPanel  />
    </OrgLayout>
  );
}
