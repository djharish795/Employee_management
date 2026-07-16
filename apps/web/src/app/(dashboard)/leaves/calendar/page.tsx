"use client";

import React from "react";
import LeavesLayout from "@/components/modules/leaves/leaves-layout";
import CalendarPanel from "@/components/modules/leaves/calendar-panel";
import { useAuthStore } from "@/store/auth";

export default function LeaveCalendarPage() {
  const role = useAuthStore((state) => state.role) ?? "EMPLOYEE";
  const activeRole = role.toUpperCase() as "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";

  return (
    <LeavesLayout >
      <CalendarPanel  />
    </LeavesLayout>
  );
}
