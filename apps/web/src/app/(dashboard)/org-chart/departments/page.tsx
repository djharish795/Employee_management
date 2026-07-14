"use client";

import React from "react";
import OrgLayout from "@/components/modules/org-chart/org-layout";
import DepartmentsPanel from "@/components/modules/org-chart/departments-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function OrgDepartmentsPage() {
  const { role: activeRole } = usePermissions();

  return (
    <OrgLayout  >
      <DepartmentsPanel  />
    </OrgLayout>
  );
}
