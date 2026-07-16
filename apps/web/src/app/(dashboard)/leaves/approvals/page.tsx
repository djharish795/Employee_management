"use client";

import React from "react";
import LeavesLayout from "@/components/modules/leaves/leaves-layout";
import ApprovalsPanel from "@/components/modules/leaves/approvals-panel";
import { useLeavesTestStore } from "@/store/leaves-test";

export default function LeaveApprovalsPage() {
  const { activeRole, setActiveRole } = useLeavesTestStore();

  return (
    <LeavesLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <ApprovalsPanel activeRole={activeRole} />
    </LeavesLayout>
  );
}
