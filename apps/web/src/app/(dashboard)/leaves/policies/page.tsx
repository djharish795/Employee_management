"use client";

import React from "react";
import LeavesLayout from "@/components/modules/leaves/leaves-layout";
import PoliciesPanel from "@/components/modules/leaves/policies-panel";
import { useAuthStore } from "@/store/auth";

export default function LeavePoliciesPage() {
  const role = useAuthStore((state) => state.role) ?? "EMPLOYEE";
  const activeRole = role.toUpperCase() as "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";

  return (
    <LeavesLayout >
      <PoliciesPanel />
    </LeavesLayout>
  );
}
