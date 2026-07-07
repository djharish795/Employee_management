"use client";

import React from "react";
import OrgLayout from "@/components/modules/org-chart/org-layout";
import OrgDashboardPanel from "@/components/modules/org-chart/dashboard-panel";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export default function OrgChartDashboardPage() {
  const activeRole = useAuthStore((state) => state.role) || "EMPLOYEE";
  const router = useRouter();

  useEffect(() => {
    if (activeRole === "EMPLOYEE") {
      router.push("/org-chart/hierarchy");
    }
  }, [activeRole, router]);

  if (activeRole === "EMPLOYEE") return null;

  return (
    <OrgLayout activeRole={activeRole as any} onRoleChange={() => {}}>
      <OrgDashboardPanel activeRole={activeRole as any} />
    </OrgLayout>
  );
}
