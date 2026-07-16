"use client";

import React from "react";
import LeavesLayout from "@/components/modules/leaves/leaves-layout";
import CalendarPanel from "@/components/modules/leaves/calendar-panel";
import { useLeavesTestStore } from "@/store/leaves-test";

export default function LeaveCalendarPage() {
  const { activeRole, setActiveRole } = useLeavesTestStore();

  return (
    <LeavesLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <CalendarPanel activeRole={activeRole} />
    </LeavesLayout>
  );
}
