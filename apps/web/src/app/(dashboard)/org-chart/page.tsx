"use client";

import { usePermissions } from "@/hooks/use-permissions";
import React from "react";
import OrgLayout from "@/components/modules/org-chart/org-layout";
import OrgDashboardPanel from "@/components/modules/org-chart/dashboard-panel";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export default function OrgChartDashboardPage() {
  const activeRole = useAuthStore((state) => state.role) || "EMPLOYEE";
  const router = useRouter();

  const { isExecutive, canManageOrg, role } = usePermissions();
  const isRestrictedRole = !(isExecutive || canManageOrg || role === "OM");

  useEffect(() => {
    if (isRestrictedRole) {
      router.push("/org-chart/hierarchy");
    }
  }, [activeRole, router, isRestrictedRole]);

  if (isRestrictedRole) return null;

  return (
    <OrgLayout >
      <OrgDashboardPanel  />
    </OrgLayout>
  );
}
