"use client";

import React from "react";
import OrgLayout from "@/components/modules/org-chart/org-layout";
import HierarchyPanel from "@/components/modules/org-chart/hierarchy-panel";
import { usePermissions } from "@/hooks/use-permissions";

export default function OrgHierarchyPage() {
  const { role: activeRole } = usePermissions();

  return (
    <OrgLayout  >
      <HierarchyPanel  />
    </OrgLayout>
  );
}
