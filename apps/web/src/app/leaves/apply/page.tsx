"use client";

import React from "react";
import LeavesLayout from "@/components/modules/leaves/leaves-layout";
import ApplyPanel from "@/components/modules/leaves/apply-panel";
import { useLeavesTestStore } from "@/store/leaves-test";

export default function ApplyLeavePage() {
  const { activeRole, setActiveRole } = useLeavesTestStore();

  return (
    <LeavesLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <ApplyPanel activeRole={activeRole} />
    </LeavesLayout>
  );
}
