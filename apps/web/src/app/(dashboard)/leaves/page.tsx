"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import LeavesLayout from "@/components/modules/leaves/leaves-layout";
import DashboardPanel from "@/components/modules/leaves/dashboard-panel";
import { useAuthStore } from "@/store/auth";

export default function LeavesDashboardPage() {
  const role = useAuthStore((state) => state.role) ?? "EMPLOYEE";
  const router = useRouter();

  // Cookie fallback for SSR hydration delay
  const effectiveRole = (() => {
    if (role) return role.toUpperCase();
    if (typeof document !== "undefined") {
      const match = document.cookie.match(new RegExp("(^| )role=([^;]+)"));
      return match ? decodeURIComponent(match[2]).toUpperCase() : "EMPLOYEE";
    }
    return "EMPLOYEE";
  })();

  // Map backend roles to the leave panel roles
  const leavePanelRole = ((): "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE" => {
    if (["SUPER_ADMIN", "IT"].includes(effectiveRole)) return "ADMIN";
    if (["HR", "CHRO"].includes(effectiveRole)) return "HR";
    if (["CEO", "COO"].includes(effectiveRole)) return "CEO";
    if (["CTO", "CFO", "FINANCE", "MANAGER", "TEAM_LEAD"].includes(effectiveRole)) return "MANAGER";
    return "EMPLOYEE";
  })();

  return (
    <LeavesLayout activeRole={leavePanelRole}>
      <DashboardPanel activeRole={leavePanelRole} />
    </LeavesLayout>
  );
}
