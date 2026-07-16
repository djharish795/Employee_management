"use client";

import React from "react";
import LeavesLayout from "@/components/modules/leaves/leaves-layout";
import PoliciesPanel from "@/components/modules/leaves/policies-panel";
import { useLeavesTestStore } from "@/store/leaves-test";

export default function LeavePoliciesPage() {
  const { activeRole, setActiveRole } = useLeavesTestStore();

  return (
    <LeavesLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <PoliciesPanel />
    </LeavesLayout>
  );
}
