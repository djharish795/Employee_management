"use client";

import React from "react";
import OrgLayout from "@/components/modules/org-chart/org-layout";
import DepartmentsPanel from "@/components/modules/org-chart/departments-panel";
import { useOrgTestStore } from "@/store/org-test";

export default function OrgDepartmentsPage() {
  const { activeRole, setActiveRole } = useOrgTestStore();

  return (
    <OrgLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <DepartmentsPanel activeRole={activeRole} />
    </OrgLayout>
  );
}
