"use client";

import React from "react";
import OrgLayout from "@/components/modules/org-chart/org-layout";
import HierarchyPanel from "@/components/modules/org-chart/hierarchy-panel";
import { useOrgTestStore } from "@/store/org-test";

export default function OrgHierarchyPage() {
  const { activeRole, setActiveRole } = useOrgTestStore();

  return (
    <OrgLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <HierarchyPanel activeRole={activeRole} />
    </OrgLayout>
  );
}
