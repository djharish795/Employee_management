"use client";

import React from "react";
import { useRouter } from "next/navigation";
import LeavesLayout from "@/components/modules/leaves/leaves-layout";
import ApprovalsPanel from "@/components/modules/leaves/approvals-panel";
import { useAuthStore } from "@/store/auth";

export default function LeaveApprovalsPage() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role) ?? "EMPLOYEE";

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
    if (["CTO", "CFO", "FINANCE", "MANAGER", "TEAM_LEAD", "OM"].includes(effectiveRole)) return "MANAGER";
    return "EMPLOYEE";
  })();

  // Client-side guard: employees and CEO must NOT access this page
  // Middleware covers the server path — this covers the client-side navigation path
  const isApprover = ["ADMIN", "HR", "MANAGER"].includes(leavePanelRole);
  React.useEffect(() => {
    if (!isApprover) {
      router.replace("/access-restricted");
    }
  }, [isApprover, router]);

  if (!isApprover) return null;

  return (
    <LeavesLayout >
      <ApprovalsPanel  />
    </LeavesLayout>
  );
}
