"use client";

import React from "react";
import OrgLayout from "@/components/modules/org-chart/org-layout";
import OrgDashboardPanel from "@/components/modules/org-chart/dashboard-panel";
import { useOrgTestStore } from "@/store/org-test";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/store/auth";
import { OrgRole } from "@/types/org-chart";

export default function OrgChartDashboardPage() {
  const { activeRole, setActiveRole } = useOrgTestStore();
  const router = useRouter();

  useEffect(() => {
    if (activeRole === "EMPLOYEE") {
      router.push("/org-chart/hierarchy");
    }
  }, [activeRole, router]);

  if (activeRole === "EMPLOYEE") return null;

  return (
    <OrgLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <OrgDashboardPanel activeRole={activeRole} />
    </OrgLayout>
  );
}
